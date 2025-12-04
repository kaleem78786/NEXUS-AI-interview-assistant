package routes

import (
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"sync"

	"nexus-ai/models"
	"nexus-ai/services"

	"github.com/gin-gonic/gin"
)

var (
	profiles     = make(map[string]*models.UserProfile)
	profilesLock sync.RWMutex
)

// RegisterProfileRoutes registers all profile-related routes
func RegisterProfileRoutes(r *gin.RouterGroup) {
	profile := r.Group("/profile")
	{
		profile.POST("/upload-resume", uploadResume)
		profile.POST("/manual", createManualProfile)
		profile.GET("", listProfiles)
		profile.GET("/:profile_id", getProfile)
		profile.PUT("/:profile_id", updateProfile)
		profile.DELETE("/:profile_id", deleteProfile)
	}
}

// uploadResume handles resume file upload and parsing
func uploadResume(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "No file uploaded"})
		return
	}

	// Validate file type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedTypes := map[string]bool{".pdf": true, ".docx": true, ".txt": true}
	if !allowedTypes[ext] {
		c.JSON(http.StatusBadRequest, gin.H{
			"detail": "Unsupported file type. Allowed: .pdf, .docx, .txt",
		})
		return
	}

	// Read file content
	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to open file"})
		return
	}
	defer f.Close()

	content, err := io.ReadAll(f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to read file"})
		return
	}

	// Parse resume
	parser := services.NewResumeParser()

	// Extract text
	resumeText, err := parser.ExtractText(content, file.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}

	// Parse into structured data
	profile, err := parser.ParseResume(resumeText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}

	// Store profile
	profileID := strings.ReplaceAll(file.Filename, ".", "_")

	profilesLock.Lock()
	profiles[profileID] = profile
	profilesLock.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"message":    "Resume uploaded and parsed successfully",
		"profile_id": profileID,
		"profile":    profile,
	})
}

// createManualProfile creates a profile without resume upload
func createManualProfile(c *gin.Context) {
	var profile models.UserProfile
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	// Generate profile ID
	profileID := "default"
	if profile.Name != "" {
		profileID = strings.ToLower(strings.ReplaceAll(profile.Name, " ", "_"))
	}

	profilesLock.Lock()
	profiles[profileID] = &profile
	profilesLock.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"message":    "Profile created successfully",
		"profile_id": profileID,
		"profile":    profile,
	})
}

// listProfiles lists all stored profiles
func listProfiles(c *gin.Context) {
	profilesLock.RLock()
	defer profilesLock.RUnlock()

	list := make([]gin.H, 0, len(profiles))
	for pid, p := range profiles {
		list = append(list, gin.H{
			"profile_id": pid,
			"name":       p.Name,
		})
	}

	c.JSON(http.StatusOK, gin.H{"profiles": list})
}

// getProfile retrieves a stored profile
func getProfile(c *gin.Context) {
	profileID := c.Param("profile_id")

	profilesLock.RLock()
	profile, exists := profiles[profileID]
	profilesLock.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// updateProfile updates an existing profile
func updateProfile(c *gin.Context) {
	profileID := c.Param("profile_id")

	profilesLock.RLock()
	_, exists := profiles[profileID]
	profilesLock.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Profile not found"})
		return
	}

	var profile models.UserProfile
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	profilesLock.Lock()
	profiles[profileID] = &profile
	profilesLock.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"profile": profile,
	})
}

// deleteProfile deletes a profile
func deleteProfile(c *gin.Context) {
	profileID := c.Param("profile_id")

	profilesLock.Lock()
	_, exists := profiles[profileID]
	if exists {
		delete(profiles, profileID)
	}
	profilesLock.Unlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile deleted successfully"})
}

