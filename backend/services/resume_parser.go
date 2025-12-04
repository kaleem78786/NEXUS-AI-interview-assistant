package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"path/filepath"
	"strings"

	"nexus-ai/models"

	"github.com/ledongthuc/pdf"
)

type ResumeParser struct {
	client *AnthropicClient
	model  string
}

func NewResumeParser() *ResumeParser {
	return &ResumeParser{
		client: NewAnthropicClient(),
		model:  "claude-3-5-haiku-20241022",
	}
}

// ExtractTextFromPDF extracts text from PDF content
func (p *ResumeParser) ExtractTextFromPDF(content []byte) (string, error) {
	reader := bytes.NewReader(content)

	pdfReader, err := pdf.NewReader(reader, int64(len(content)))
	if err != nil {
		return "", fmt.Errorf("PDF read error: %w", err)
	}

	var text strings.Builder
	numPages := pdfReader.NumPage()

	for i := 1; i <= numPages; i++ {
		page := pdfReader.Page(i)
		if page.V.IsNull() {
			continue
		}
		pageText, err := page.GetPlainText(nil)
		if err != nil {
			continue
		}
		text.WriteString(pageText)
		text.WriteString("\n")
	}

	return strings.TrimSpace(text.String()), nil
}

// ExtractTextFromDOCX extracts text from DOCX content
func (p *ResumeParser) ExtractTextFromDOCX(content []byte) (string, error) {
	// Simple DOCX text extraction
	// DOCX is a ZIP file containing XML
	// For production, use a proper library like unioffice

	// Return placeholder - DOCX support would need proper implementation
	return "DOCX file uploaded. Text extraction requires additional setup.", nil
}

// ExtractText extracts text based on file type
func (p *ResumeParser) ExtractText(content []byte, filename string) (string, error) {
	ext := strings.ToLower(filepath.Ext(filename))

	switch ext {
	case ".pdf":
		return p.ExtractTextFromPDF(content)
	case ".docx":
		return p.ExtractTextFromDOCX(content)
	case ".txt":
		return string(content), nil
	default:
		return "", fmt.Errorf("unsupported file type: %s", ext)
	}
}

// ParseResume uses Claude to parse resume text into structured data
func (p *ResumeParser) ParseResume(resumeText string) (*models.UserProfile, error) {
	systemPrompt := `You are an expert resume parser. Extract structured information from the resume text.

Return a JSON object with these fields:
- name: Full name of the candidate
- email: Email address (if found)
- phone: Phone number (if found)
- skills: Array of skills mentioned
- experience: Array of work experiences, each with: company, title, duration, description, achievements
- education: Array of education entries, each with: institution, degree, field, year
- projects: Array of projects, each with: name, description, technologies
- achievements: Array of notable achievements or certifications
- summary: A brief professional summary based on the resume

Be thorough and extract all relevant information. If a field is not found, use an empty array or null.`

	userMessage := fmt.Sprintf("Parse this resume:\n\n%s", resumeText)

	resp, err := p.client.CreateMessage(MessageRequest{
		Model:     p.model,
		MaxTokens: 3000,
		System:    systemPrompt,
		Messages: []MessageInput{
			{Role: "user", Content: userMessage},
		},
	})

	if err != nil {
		return nil, fmt.Errorf("resume parsing error: %w", err)
	}

	responseText := resp.GetText()

	// Parse JSON from response
	profile := &models.UserProfile{
		Skills:        []string{},
		Experience:    []models.Experience{},
		Education:     []models.Education{},
		Projects:      []models.Project{},
		Achievements:  []string{},
		RawResumeText: resumeText,
	}

	start := strings.Index(responseText, "{")
	end := strings.LastIndex(responseText, "}") + 1

	if start != -1 && end > start {
		jsonStr := responseText[start:end]
		var parsed map[string]interface{}

		if err := json.Unmarshal([]byte(jsonStr), &parsed); err == nil {
			if v, ok := parsed["name"].(string); ok {
				profile.Name = v
			}
			if v, ok := parsed["email"].(string); ok {
				profile.Email = v
			}
			if v, ok := parsed["phone"].(string); ok {
				profile.Phone = v
			}
			if v, ok := parsed["summary"].(string); ok {
				profile.Summary = v
			}

			// Parse skills
			if v, ok := parsed["skills"].([]interface{}); ok {
				for _, s := range v {
					if str, ok := s.(string); ok {
						profile.Skills = append(profile.Skills, str)
					}
				}
			}

			// Parse achievements
			if v, ok := parsed["achievements"].([]interface{}); ok {
				for _, a := range v {
					if str, ok := a.(string); ok {
						profile.Achievements = append(profile.Achievements, str)
					}
				}
			}

			// Parse experience
			if v, ok := parsed["experience"].([]interface{}); ok {
				for _, exp := range v {
					if expMap, ok := exp.(map[string]interface{}); ok {
						experience := models.Experience{}
						if c, ok := expMap["company"].(string); ok {
							experience.Company = c
						}
						if t, ok := expMap["title"].(string); ok {
							experience.Title = t
						}
						if d, ok := expMap["duration"].(string); ok {
							experience.Duration = d
						}
						if desc, ok := expMap["description"].(string); ok {
							experience.Description = desc
						}
						if ach, ok := expMap["achievements"].([]interface{}); ok {
							for _, a := range ach {
								if str, ok := a.(string); ok {
									experience.Achievements = append(experience.Achievements, str)
								}
							}
						}
						profile.Experience = append(profile.Experience, experience)
					}
				}
			}

			// Parse education
			if v, ok := parsed["education"].([]interface{}); ok {
				for _, edu := range v {
					if eduMap, ok := edu.(map[string]interface{}); ok {
						education := models.Education{}
						if i, ok := eduMap["institution"].(string); ok {
							education.Institution = i
						}
						if d, ok := eduMap["degree"].(string); ok {
							education.Degree = d
						}
						if f, ok := eduMap["field"].(string); ok {
							education.Field = f
						}
						if y, ok := eduMap["year"].(string); ok {
							education.Year = y
						}
						profile.Education = append(profile.Education, education)
					}
				}
			}

			// Parse projects
			if v, ok := parsed["projects"].([]interface{}); ok {
				for _, proj := range v {
					if projMap, ok := proj.(map[string]interface{}); ok {
						project := models.Project{}
						if n, ok := projMap["name"].(string); ok {
							project.Name = n
						}
						if d, ok := projMap["description"].(string); ok {
							project.Description = d
						}
						if t, ok := projMap["technologies"].([]interface{}); ok {
							for _, tech := range t {
								if str, ok := tech.(string); ok {
									project.Technologies = append(project.Technologies, str)
								}
							}
						}
						profile.Projects = append(profile.Projects, project)
					}
				}
			}
		}
	}

	// Fallback if no name found
	if profile.Name == "" && len(resumeText) > 0 {
		profile.Summary = resumeText
		if len(profile.Summary) > 500 {
			profile.Summary = profile.Summary[:500]
		}
	}

	return profile, nil
}
