package services

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"nexus-ai/config"
)

const anthropicAPIURL = "https://api.anthropic.com/v1/messages"

// AnthropicClient is a custom client for Anthropic API compatible with Go 1.18
type AnthropicClient struct {
	apiKey     string
	httpClient *http.Client
}

// NewAnthropicClient creates a new Anthropic client
func NewAnthropicClient() *AnthropicClient {
	cfg := config.GetConfig()
	return &AnthropicClient{
		apiKey: cfg.AnthropicAPIKey,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

// MessageRequest represents a request to the messages API
type MessageRequest struct {
	Model     string          `json:"model"`
	MaxTokens int             `json:"max_tokens"`
	System    string          `json:"system,omitempty"`
	Messages  []MessageInput  `json:"messages"`
	Stream    bool            `json:"stream,omitempty"`
}

// MessageInput represents an input message
type MessageInput struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// MessageResponse represents a response from the messages API
type MessageResponse struct {
	ID      string          `json:"id"`
	Type    string          `json:"type"`
	Role    string          `json:"role"`
	Content []ContentBlock  `json:"content"`
	Model   string          `json:"model"`
	Usage   UsageInfo       `json:"usage"`
}

// ContentBlock represents a content block in the response
type ContentBlock struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

// UsageInfo represents token usage
type UsageInfo struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
}

// StreamEvent represents a streaming event
type StreamEvent struct {
	Type         string       `json:"type"`
	Index        int          `json:"index,omitempty"`
	ContentBlock *ContentBlock `json:"content_block,omitempty"`
	Delta        *DeltaBlock  `json:"delta,omitempty"`
}

// DeltaBlock represents a delta in streaming
type DeltaBlock struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

// CreateMessage sends a non-streaming message request
func (c *AnthropicClient) CreateMessage(req MessageRequest) (*MessageResponse, error) {
	req.Stream = false
	
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", anthropicAPIURL, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setHeaders(httpReq)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(respBody))
	}

	var result MessageResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &result, nil
}

// CreateMessageStream sends a streaming message request
func (c *AnthropicClient) CreateMessageStream(
	req MessageRequest,
	onText func(text string),
	onDone func(),
	onError func(err error),
) {
	req.Stream = true

	body, err := json.Marshal(req)
	if err != nil {
		onError(fmt.Errorf("failed to marshal request: %w", err))
		return
	}

	httpReq, err := http.NewRequest("POST", anthropicAPIURL, bytes.NewReader(body))
	if err != nil {
		onError(fmt.Errorf("failed to create request: %w", err))
		return
	}

	c.setHeaders(httpReq)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		onError(fmt.Errorf("request failed: %w", err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		onError(fmt.Errorf("API error %d: %s", resp.StatusCode, string(body)))
		return
	}

	// Parse SSE stream
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			
			if data == "[DONE]" {
				onDone()
				return
			}

			var event StreamEvent
			if err := json.Unmarshal([]byte(data), &event); err != nil {
				continue
			}

			switch event.Type {
			case "content_block_delta":
				if event.Delta != nil && event.Delta.Text != "" {
					onText(event.Delta.Text)
				}
			case "message_stop":
				onDone()
				return
			}
		}
	}

	if err := scanner.Err(); err != nil {
		onError(fmt.Errorf("stream read error: %w", err))
		return
	}

	onDone()
}

func (c *AnthropicClient) setHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", c.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")
}

// GetText extracts text from response
func (r *MessageResponse) GetText() string {
	var text strings.Builder
	for _, block := range r.Content {
		if block.Type == "text" {
			text.WriteString(block.Text)
		}
	}
	return text.String()
}

