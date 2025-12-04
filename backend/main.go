/*
NEXUS AI - Enterprise Interview Intelligence Platform
Go Backend - Main Application Entry Point
*/

package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"nexus-ai/config"
	"nexus-ai/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.GetConfig()

	// Set Gin mode
	if !cfg.Debug {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	r := gin.Default()

	// CORS Configuration - Allow all origins
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Root endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"name":        "NEXUS AI",
			"description": "Enterprise Interview Intelligence Platform",
			"version":     "2.0.0",
			"runtime":     "Go",
			"status":      "operational",
			"features": []string{
				"Real-time Interview Assistance",
				"Neural-powered Response Generation",
				"DevOps & Cloud Expertise",
				"Interview Memory System",
				"Multi-platform Support",
			},
		})
	})

	// Health endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "NEXUS AI Backend (Go)",
			"version": "2.0.0",
		})
	})

	// API documentation info
	r.GET("/docs", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"title":       "NEXUS AI API",
			"description": "Enterprise Interview Intelligence Platform API",
			"version":     "2.0.0",
			"endpoints": gin.H{
				"profile": gin.H{
					"POST /profile/upload-resume": "Upload and parse resume",
					"POST /profile/manual":        "Create manual profile",
					"GET /profile":                "List all profiles",
					"GET /profile/:id":            "Get profile by ID",
					"PUT /profile/:id":            "Update profile",
					"DELETE /profile/:id":         "Delete profile",
				},
				"interview": gin.H{
					"POST /interview/session/start":     "Start interview session",
					"POST /interview/session/:id/end":   "End interview session",
					"POST /interview/assist":            "Get interview assistance",
					"POST /interview/coding-assist":     "Get coding assistance",
					"POST /interview/feedback":          "Get response feedback",
					"POST /interview/translate":         "Translate text",
				},
				"live": gin.H{
					"POST /live/stream-answer":    "Stream AI answer (SSE)",
					"POST /live/transcribe-chunk": "Transcribe audio chunk",
					"GET /live/memory-status":     "Get memory status",
					"POST /live/clear-memory":     "Clear session memory",
					"GET /live/health":            "Health check",
				},
			},
		})
	})

	// Register route groups
	api := r.Group("")
	routes.RegisterProfileRoutes(api)
	routes.RegisterInterviewRoutes(api)
	routes.RegisterLiveInterviewRoutes(api)

	// Start server
	port := cfg.Port
	fmt.Printf("\n🚀 NEXUS AI (Go Backend) starting on port %s\n", port)
	fmt.Printf("📍 API: http://localhost:%s\n", port)
	fmt.Printf("📚 Docs: http://localhost:%s/docs\n\n", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

