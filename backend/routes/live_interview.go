package routes

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"

	"nexus-ai/models"
	"nexus-ai/services"

	"github.com/gin-gonic/gin"
)

var (
	memory     = make(map[string]*models.SessionMemory)
	memoryLock sync.RWMutex
)

// RegisterLiveInterviewRoutes registers all live interview routes
func RegisterLiveInterviewRoutes(r *gin.RouterGroup) {
	live := r.Group("/live")
	{
		live.POST("/stream-answer", streamAnswer)
		live.POST("/transcribe-chunk", transcribeChunk)
		live.GET("/memory-status", memoryStatus)
		live.POST("/clear-memory", clearMemory)
		live.GET("/health", liveHealth)
	}
}

// streamAnswer handles SSE streaming for live interview answers
func streamAnswer(c *gin.Context) {
	var req models.AnswerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	question := strings.TrimSpace(req.Question)
	if question == "" {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Question required"})
		return
	}

	sessionID := req.SessionID
	if sessionID == "" {
		sessionID = "default"
	}

	// Build system prompt
	systemPrompt := services.BuildSystemPrompt(req.InterviewContext, req.Profile)

	// Add conversation history
	memoryLock.RLock()
	if mem, exists := memory[sessionID]; exists && len(mem.QA) > 0 {
		// Get last 3 Q&A pairs
		start := 0
		if len(mem.QA) > 3 {
			start = len(mem.QA) - 3
		}
		recent := mem.QA[start:]

		history := "\n\n💬 EARLIER IN THIS INTERVIEW:\n"
		for _, qa := range recent {
			q := qa.Question
			a := qa.Answer
			if len(q) > 80 {
				q = q[:80]
			}
			if len(a) > 100 {
				a = a[:100]
			}
			history += fmt.Sprintf("Q: %s\nYour answer: %s...\n", q, a)
		}
		systemPrompt += history + "\n\nMaintain consistency with what you've already said."
	}
	memoryLock.RUnlock()

	// Select model
	model := "claude-sonnet-4-20250514"
	if req.InterviewContext != nil && req.InterviewContext.Model != "" {
		model = req.InterviewContext.Model
	}

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	// Create channels for communication
	textChan := make(chan string, 100)
	doneChan := make(chan bool, 1)
	errChan := make(chan error, 1)

	var fullAnswer strings.Builder

	// Start streaming in goroutine
	claude := services.NewClaudeService()
	go claude.StreamAnswer(
		question,
		systemPrompt,
		model,
		func(text string) {
			fullAnswer.WriteString(text)
			textChan <- text
		},
		func() {
			doneChan <- true
		},
		func(err error) {
			errChan <- err
		},
	)

	// Stream response
	c.Stream(func(w io.Writer) bool {
		select {
		case text := <-textChan:
			data, _ := json.Marshal(gin.H{"text": text})
			fmt.Fprintf(w, "data: %s\n\n", data)
			c.Writer.Flush()
			return true

		case <-doneChan:
			// Store in memory
			memoryLock.Lock()
			if _, exists := memory[sessionID]; !exists {
				memory[sessionID] = &models.SessionMemory{QA: []models.QAPair{}}
			}
			q := question
			a := fullAnswer.String()
			if len(q) > 150 {
				q = q[:150]
			}
			if len(a) > 200 {
				a = a[:200]
			}
			memory[sessionID].QA = append(memory[sessionID].QA, models.QAPair{
				Question: q,
				Answer:   a,
			})
			// Keep only last 8
			if len(memory[sessionID].QA) > 8 {
				memory[sessionID].QA = memory[sessionID].QA[len(memory[sessionID].QA)-8:]
			}
			memoryLock.Unlock()

			data, _ := json.Marshal(gin.H{"done": true})
			fmt.Fprintf(w, "data: %s\n\n", data)
			c.Writer.Flush()
			return false

		case err := <-errChan:
			data, _ := json.Marshal(gin.H{"error": err.Error()})
			fmt.Fprintf(w, "data: %s\n\n", data)
			c.Writer.Flush()
			return false
		}
	})
}

// transcribeChunk - uses AWS Transcribe for audio transcription
func transcribeChunk(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusOK, models.TranscribeResponse{Success: false, Text: ""})
		return
	}

	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusOK, models.TranscribeResponse{Success: false, Text: ""})
		return
	}
	defer f.Close()

	content, err := io.ReadAll(f)
	if err != nil {
		c.JSON(http.StatusOK, models.TranscribeResponse{Success: false, Text: ""})
		return
	}

	fmt.Printf("[TRANSCRIBE] Received audio: %d bytes\n", len(content))

	// Use AWS Transcribe
	awsService := services.NewAWSTranscribeService()
	fmt.Printf("[AWS] Configured: %v\n", awsService.IsConfigured())
	
	if awsService.IsConfigured() {
		text, err := awsService.TranscribeAudio(content)
		if err != nil {
			fmt.Printf("[AWS] Error: %v\n", err)
		} else if text != "" {
			fmt.Printf("[AWS] Result: %s\n", text)
			c.JSON(http.StatusOK, models.TranscribeResponse{Success: true, Text: text})
			return
		} else {
			fmt.Println("[AWS] Empty result")
		}
	} else {
		fmt.Println("[AWS] Not configured - check AWS_ACCESS_KEY_ID in .env")
	}

	c.JSON(http.StatusOK, models.TranscribeResponse{Success: false, Text: ""})
}

// memoryStatus returns the memory status for a session
func memoryStatus(c *gin.Context) {
	sessionID := c.DefaultQuery("session_id", "default")

	memoryLock.RLock()
	mem, exists := memory[sessionID]
	memoryLock.RUnlock()

	count := 0
	if exists {
		count = len(mem.QA)
	}

	c.JSON(http.StatusOK, gin.H{
		"questions_count": count,
		"has_context":     count > 0,
	})
}

// clearMemory clears the memory for a session
func clearMemory(c *gin.Context) {
	sessionID := c.DefaultQuery("session_id", "default")

	memoryLock.Lock()
	delete(memory, sessionID)
	memoryLock.Unlock()

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// liveHealth returns health status
func liveHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

