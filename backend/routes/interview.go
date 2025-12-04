package routes

import (
	"net/http"
	"sync"
	"time"

	"nexus-ai/models"
	"nexus-ai/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var (
	sessions     = make(map[string]*models.InterviewSession)
	sessionsLock sync.RWMutex
)

// RegisterInterviewRoutes registers all interview-related routes
func RegisterInterviewRoutes(r *gin.RouterGroup) {
	interview := r.Group("/interview")
	{
		interview.POST("/session/start", startSession)
		interview.POST("/session/:session_id/end", endSession)
		interview.POST("/assist", getInterviewAssistance)
		interview.POST("/coding-assist", getCodingAssistance)
		interview.POST("/feedback", getResponseFeedback)
		interview.POST("/translate", translateResponse)
	}
}

// startSession starts a new interview session
func startSession(c *gin.Context) {
	interviewType := c.DefaultQuery("interview_type", "mixed")
	language := c.DefaultQuery("language", "en")

	sessionID := uuid.New().String()

	session := &models.InterviewSession{
		SessionID:     sessionID,
		InterviewType: models.InterviewType(interviewType),
		Language:      models.Language(language),
		StartedAt:     time.Now(),
		IsActive:      true,
		Messages:      []models.InterviewMessage{},
	}

	sessionsLock.Lock()
	sessions[sessionID] = session
	sessionsLock.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"session_id":     sessionID,
		"message":        "Interview session started",
		"interview_type": interviewType,
		"language":       language,
	})
}

// endSession ends an interview session
func endSession(c *gin.Context) {
	sessionID := c.Param("session_id")

	sessionsLock.Lock()
	session, exists := sessions[sessionID]
	if exists {
		session.IsActive = false
	}
	sessionsLock.Unlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Session not found"})
		return
	}

	duration := time.Since(session.StartedAt)

	c.JSON(http.StatusOK, gin.H{
		"session_id": sessionID,
		"message":    "Interview session ended",
		"duration":   duration.String(),
	})
}

// getInterviewAssistance provides real-time interview assistance
func getInterviewAssistance(c *gin.Context) {
	var req models.AssistanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	// Set defaults
	if req.InterviewType == "" {
		req.InterviewType = models.InterviewTypeMixed
	}
	if req.Language == "" {
		req.Language = "en"
	}
	if req.AssistanceLevel == "" {
		req.AssistanceLevel = "medium"
	}

	// Get user profile from session if available
	userProfile := make(map[string]any)
	sessionsLock.RLock()
	if session, exists := sessions[req.SessionID]; exists && session.UserProfile != nil {
		// Convert profile to map
		userProfile["name"] = session.UserProfile.Name
		userProfile["skills"] = session.UserProfile.Skills
		userProfile["experience"] = session.UserProfile.Experience
	}
	sessionsLock.RUnlock()

	// Generate response
	claude := services.NewClaudeService()
	response, err := claude.GenerateInterviewResponse(
		req.Question,
		userProfile,
		string(req.InterviewType),
		req.Context,
		req.AssistanceLevel,
		req.Language,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// getCodingAssistance provides coding interview help
func getCodingAssistance(c *gin.Context) {
	var req models.CodingAssistanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	// Set defaults
	if req.Language == "" {
		req.Language = "python"
	}

	claude := services.NewClaudeService()
	response, err := claude.GenerateCodingAssistance(
		req.ProblemDescription,
		req.Language,
		req.CurrentCode,
		req.HintsOnly,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// getResponseFeedback provides feedback on user's response
func getResponseFeedback(c *gin.Context) {
	var req models.FeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	if req.InterviewType == "" {
		req.InterviewType = models.InterviewTypeMixed
	}

	claude := services.NewClaudeService()
	response, err := claude.AnalyzeResponseFeedback(
		req.Question,
		req.UserResponse,
		string(req.InterviewType),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// translateResponse translates text
func translateResponse(c *gin.Context) {
	var req models.TranslateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	claude := services.NewClaudeService()
	translated, err := claude.TranslateText(req.Text, req.TargetLanguage)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"original":        req.Text,
		"translated":      translated,
		"target_language": req.TargetLanguage,
	})
}

