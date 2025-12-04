package services

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/transcribestreaming"
	"github.com/aws/aws-sdk-go-v2/service/transcribestreaming/types"
)

type AWSTranscribeService struct {
	accessKey string
	secretKey string
	region    string
}

func NewAWSTranscribeService() *AWSTranscribeService {
	return &AWSTranscribeService{
		accessKey: os.Getenv("AWS_ACCESS_KEY_ID"),
		secretKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
		region:    os.Getenv("AWS_REGION"),
	}
}

func (s *AWSTranscribeService) IsConfigured() bool {
	return s.accessKey != "" && s.secretKey != ""
}

func (s *AWSTranscribeService) TranscribeAudio(audioData []byte) (string, error) {
	if !s.IsConfigured() {
		return "", fmt.Errorf("AWS credentials not configured")
	}

	if len(audioData) < 1000 {
		return "", fmt.Errorf("audio too short")
	}

	// Convert webm to PCM WAV (16kHz, mono, 16-bit)
	pcmData, err := s.convertToPCM(audioData)
	if err != nil {
		return "", fmt.Errorf("conversion failed: %w", err)
	}

	if len(pcmData) < 3200 {
		return "", fmt.Errorf("no audio after conversion")
	}

	// Save for debugging
	os.WriteFile("/tmp/last_audio.webm", audioData, 0644)
	os.WriteFile("/tmp/last_pcm.raw", pcmData, 0644)

	// Check if audio has actual content
	hasSound := false
	for i := 0; i < len(pcmData)-1; i += 2 {
		sample := int16(pcmData[i]) | int16(pcmData[i+1])<<8
		if sample > 1000 || sample < -1000 {
			hasSound = true
			break
		}
	}
	fmt.Printf("[AWS] PCM: %d bytes, hasSound: %v\n", len(pcmData), hasSound)

	region := s.region
	if region == "" {
		region = "us-east-1"
	}

	cfg, err := config.LoadDefaultConfig(context.Background(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			s.accessKey,
			s.secretKey,
			"",
		)),
	)
	if err != nil {
		return "", fmt.Errorf("AWS config error: %w", err)
	}

	client := transcribestreaming.NewFromConfig(cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	resp, err := client.StartStreamTranscription(ctx, &transcribestreaming.StartStreamTranscriptionInput{
		LanguageCode:         types.LanguageCodeEnUs,
		MediaEncoding:        types.MediaEncodingPcm,
		MediaSampleRateHertz: aws.Int32(16000),
	})
	if err != nil {
		return "", fmt.Errorf("start stream error: %w", err)
	}

	stream := resp.GetStream()

	// Start reading events BEFORE sending audio
	var wg sync.WaitGroup
	var finalTranscript strings.Builder
	var eventCount int
	var streamErr error

	wg.Add(1)
	go func() {
		defer wg.Done()
		for event := range stream.Events() {
			eventCount++
			switch v := event.(type) {
			case *types.TranscriptResultStreamMemberTranscriptEvent:
				for _, result := range v.Value.Transcript.Results {
					if len(result.Alternatives) > 0 {
						text := aws.ToString(result.Alternatives[0].Transcript)
						fmt.Printf("[AWS] Event %d: '%s' (partial=%v)\n", eventCount, text, result.IsPartial)
						if !result.IsPartial && text != "" {
							finalTranscript.WriteString(text)
							finalTranscript.WriteString(" ")
						}
					}
				}
			}
		}
		streamErr = stream.Err()
	}()

	// Send audio in chunks
	chunkSize := 8000
	for i := 0; i < len(pcmData); i += chunkSize {
		end := i + chunkSize
		if end > len(pcmData) {
			end = len(pcmData)
		}
		err = stream.Send(ctx, &types.AudioStreamMemberAudioEvent{
			Value: types.AudioEvent{AudioChunk: pcmData[i:end]},
		})
		if err != nil {
			stream.Close()
			return "", fmt.Errorf("send error: %w", err)
		}
	}

	fmt.Printf("[AWS] Sent %d bytes\n", len(pcmData))

	// Close to signal end of audio
	stream.Close()

	// Wait for event reading to complete
	wg.Wait()

	if streamErr != nil {
		fmt.Printf("[AWS] Stream error: %v\n", streamErr)
		return "", streamErr
	}

	transcript := strings.TrimSpace(finalTranscript.String())
	fmt.Printf("[AWS] Events: %d, Result: '%s'\n", eventCount, transcript)

	return transcript, nil
}

func (s *AWSTranscribeService) convertToPCM(audioData []byte) ([]byte, error) {
	cmd := exec.Command("ffmpeg",
		"-i", "pipe:0",
		"-ar", "16000",
		"-ac", "1",
		"-f", "s16le",
		"-acodec", "pcm_s16le",
		"-y",
		"pipe:1",
	)
	cmd.Stdin = bytes.NewReader(audioData)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("ffmpeg: %v - %s", err, stderr.String())
	}

	return stdout.Bytes(), nil
}
