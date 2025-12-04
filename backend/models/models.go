package models

import (
	"time"
)

// InterviewType enum
type InterviewType string

const (
	InterviewTypeBehavioral  InterviewType = "behavioral"
	InterviewTypeTechnical   InterviewType = "technical"
	InterviewTypeCoding      InterviewType = "coding"
	InterviewTypeSituational InterviewType = "situational"
	InterviewTypeMixed       InterviewType = "mixed"
)

// Language enum
type Language string

const (
	LanguageEnglish    Language = "en"
	LanguageSpanish    Language = "es"
	LanguageFrench     Language = "fr"
	LanguageGerman     Language = "de"
	LanguageChinese    Language = "zh"
	LanguageJapanese   Language = "ja"
	LanguageKorean     Language = "ko"
	LanguageHindi      Language = "hi"
	LanguageArabic     Language = "ar"
	LanguagePortuguese Language = "pt"
	LanguageRussian    Language = "ru"
	LanguageItalian    Language = "it"
	LanguageDutch      Language = "nl"
	LanguageTurkish    Language = "tr"
	LanguagePolish     Language = "pl"
)

// Experience represents work experience
type Experience struct {
	Company      string   `json:"company,omitempty"`
	Title        string   `json:"title,omitempty"`
	Duration     string   `json:"duration,omitempty"`
	Description  string   `json:"description,omitempty"`
	Achievements []string `json:"achievements,omitempty"`
}

// Education represents education entry
type Education struct {
	Institution string `json:"institution,omitempty"`
	Degree      string `json:"degree,omitempty"`
	Field       string `json:"field,omitempty"`
	Year        string `json:"year,omitempty"`
}

// Project represents a project
type Project struct {
	Name         string   `json:"name,omitempty"`
	Description  string   `json:"description,omitempty"`
	Technologies []string `json:"technologies,omitempty"`
}

// UserProfile represents a user's profile
type UserProfile struct {
	Name          string       `json:"name"`
	Email         string       `json:"email,omitempty"`
	Phone         string       `json:"phone,omitempty"`
	Skills        []string     `json:"skills"`
	Experience    []Experience `json:"experience"`
	Education     []Education  `json:"education"`
	Projects      []Project    `json:"projects"`
	Achievements  []string     `json:"achievements"`
	Summary       string       `json:"summary,omitempty"`
	RawResumeText string       `json:"raw_resume_text,omitempty"`
}

// InterviewMessage represents a message in interview
type InterviewMessage struct {
	Role      string    `json:"role"` // "interviewer" or "candidate"
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp,omitempty"`
	Language  string    `json:"language,omitempty"`
}

// InterviewSession represents an interview session
type InterviewSession struct {
	SessionID     string             `json:"session_id"`
	UserProfile   *UserProfile       `json:"user_profile,omitempty"`
	InterviewType InterviewType      `json:"interview_type"`
	Language      Language           `json:"language"`
	Messages      []InterviewMessage `json:"messages"`
	StartedAt     time.Time          `json:"started_at"`
	IsActive      bool               `json:"is_active"`
}

// AssistanceRequest for interview assistance
type AssistanceRequest struct {
	SessionID       string        `json:"session_id"`
	Question        string        `json:"question" binding:"required"`
	Context         string        `json:"context,omitempty"`
	InterviewType   InterviewType `json:"interview_type"`
	Language        string        `json:"language"`
	AssistanceLevel string        `json:"assistance_level"` // low, medium, high
}

// AssistanceResponse for interview assistance
type AssistanceResponse struct {
	SuggestedAnswer string   `json:"suggested_answer"`
	KeyPoints       []string `json:"key_points"`
	FollowUpTips    string   `json:"follow_up_tips,omitempty"`
	ConfidenceScore float64  `json:"confidence_score"`
}

// FeedbackRequest for response feedback
type FeedbackRequest struct {
	SessionID     string        `json:"session_id"`
	UserResponse  string        `json:"user_response" binding:"required"`
	Question      string        `json:"question" binding:"required"`
	InterviewType InterviewType `json:"interview_type"`
}

// ToneAnalysis for feedback
type ToneAnalysis struct {
	Confidence      int `json:"confidence"`
	Enthusiasm      int `json:"enthusiasm"`
	Professionalism int `json:"professionalism"`
}

// FeedbackResponse for response feedback
type FeedbackResponse struct {
	OverallScore     float64      `json:"overall_score"`
	ToneAnalysis     ToneAnalysis `json:"tone_analysis"`
	Strengths        []string     `json:"strengths"`
	Improvements     []string     `json:"improvements"`
	DetailedFeedback string       `json:"detailed_feedback"`
}

// CodingAssistanceRequest for coding help
type CodingAssistanceRequest struct {
	SessionID          string `json:"session_id"`
	ProblemDescription string `json:"problem_description" binding:"required"`
	Language           string `json:"language"`
	CurrentCode        string `json:"current_code,omitempty"`
	HintsOnly          bool   `json:"hints_only"`
}

// CodingAssistanceResponse for coding help
type CodingAssistanceResponse struct {
	Approach        string   `json:"approach"`
	CodeSnippet     string   `json:"code_snippet,omitempty"`
	Explanation     string   `json:"explanation"`
	TimeComplexity  string   `json:"time_complexity,omitempty"`
	SpaceComplexity string   `json:"space_complexity,omitempty"`
	Hints           []string `json:"hints"`
}

// InterviewContext for live interview
type InterviewContext struct {
	Role           string `json:"role,omitempty"`
	Company        string `json:"company,omitempty"`
	JobDescription string `json:"job_description,omitempty"`
	Model          string `json:"model,omitempty"`
}

// AnswerRequest for live interview
type AnswerRequest struct {
	Question         string            `json:"question" binding:"required"`
	Profile          map[string]any    `json:"profile,omitempty"`
	SessionID        string            `json:"session_id,omitempty"`
	InterviewContext *InterviewContext `json:"interview_context,omitempty"`
}

// SessionMemory for storing Q&A pairs
type SessionMemory struct {
	QA []QAPair `json:"qa"`
}

// QAPair represents a question-answer pair
type QAPair struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

// TranscribeResponse for audio transcription
type TranscribeResponse struct {
	Success bool   `json:"success"`
	Text    string `json:"text"`
}

// TranslateRequest for translation
type TranslateRequest struct {
	Text           string `json:"text" binding:"required"`
	TargetLanguage string `json:"target_language" binding:"required"`
}

