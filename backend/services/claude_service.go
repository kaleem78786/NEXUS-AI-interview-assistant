package services

import (
	"encoding/json"
	"fmt"
	"strings"

	"nexus-ai/models"
)

type ClaudeService struct {
	client *AnthropicClient
	model  string
}

func NewClaudeService() *ClaudeService {
	return &ClaudeService{
		client: NewAnthropicClient(),
		model:  "claude-3-5-haiku-20241022",
	}
}

// GenerateInterviewResponse generates a tailored interview response
func (s *ClaudeService) GenerateInterviewResponse(
	question string,
	userProfile map[string]interface{},
	interviewType string,
	ctx string,
	assistanceLevel string,
	language string,
) (*models.AssistanceResponse, error) {

	levelInstructions := map[string]string{
		"low":    "Provide brief bullet points only. Keep it minimal.",
		"medium": "Provide a structured response with key points and a sample answer.",
		"high":   "Provide a comprehensive, detailed response with multiple examples and strategies.",
	}

	profileJSON, _ := json.MarshalIndent(userProfile, "", "  ")

	systemPrompt := fmt.Sprintf(`You are NEXUS AI assistant, an expert interview coach helping candidates succeed in job interviews.

USER PROFILE:
%s

INTERVIEW TYPE: %s

RESPONSE LANGUAGE: %s

ASSISTANCE LEVEL: %s
%s

Your task is to help the candidate answer interview questions by:
1. Analyzing the question type (behavioral, technical, situational)
2. Connecting the answer to their specific background and experience
3. Using the STAR method for behavioral questions
4. Being concise yet comprehensive
5. Maintaining a professional, confident tone

Respond in JSON format with these fields:
- suggested_answer: The full suggested response
- key_points: Array of 3-5 key points to remember
- follow_up_tips: Any tips for potential follow-up questions
- confidence_score: Your confidence in this answer (0.0-1.0)`, string(profileJSON), interviewType, language, assistanceLevel, levelInstructions[assistanceLevel])

	userMessage := fmt.Sprintf(`Interview Question: %s

Additional Context: %s

Please provide a tailored response that highlights my relevant experience and skills.`, question, ctx)

	resp, err := s.client.CreateMessage(MessageRequest{
		Model:     s.model,
		MaxTokens: 2000,
		System:    systemPrompt,
		Messages: []MessageInput{
			{Role: "user", Content: userMessage},
		},
	})

	if err != nil {
		return nil, fmt.Errorf("claude API error: %w", err)
	}

	responseText := resp.GetText()

	// Parse JSON response
	result := &models.AssistanceResponse{
		ConfidenceScore: 0.7,
	}

	start := strings.Index(responseText, "{")
	end := strings.LastIndex(responseText, "}") + 1
	if start != -1 && end > start {
		jsonStr := responseText[start:end]
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(jsonStr), &parsed); err == nil {
			if v, ok := parsed["suggested_answer"].(string); ok {
				result.SuggestedAnswer = v
			}
			if v, ok := parsed["key_points"].([]interface{}); ok {
				for _, p := range v {
					if str, ok := p.(string); ok {
						result.KeyPoints = append(result.KeyPoints, str)
					}
				}
			}
			if v, ok := parsed["follow_up_tips"].(string); ok {
				result.FollowUpTips = v
			}
			if v, ok := parsed["confidence_score"].(float64); ok {
				result.ConfidenceScore = v
			}
		}
	}

	if result.SuggestedAnswer == "" {
		result.SuggestedAnswer = responseText
	}

	return result, nil
}

// GenerateCodingAssistance generates coding help
func (s *ClaudeService) GenerateCodingAssistance(
	problem string,
	programmingLanguage string,
	currentCode string,
	hintsOnly bool,
) (*models.CodingAssistanceResponse, error) {

	mode := "Full assistance with code"
	modeInstruction := "Provide clean, efficient code"
	if hintsOnly {
		mode = "Hints only - do not provide full solution"
		modeInstruction = "Provide helpful hints without giving away the solution"
	}

	systemPrompt := fmt.Sprintf(`You are NEXUS AI's coding assistant, helping candidates solve technical interview problems.

PROGRAMMING LANGUAGE: %s
MODE: %s

Your task is to:
1. Understand the problem thoroughly
2. Suggest an optimal approach
3. %s
4. Explain the time and space complexity
5. Mention edge cases to consider

Respond in JSON format with these fields:
- approach: Brief explanation of the approach
- code_snippet: The code solution (null if hints_only mode)
- explanation: Detailed explanation of the solution
- time_complexity: Big O time complexity
- space_complexity: Big O space complexity
- hints: Array of progressive hints`, programmingLanguage, mode, modeInstruction)

	codeDisplay := "# No code yet"
	if currentCode != "" {
		codeDisplay = currentCode
	}

	userMessage := fmt.Sprintf("Problem: %s\n\nCurrent Code (if any):\n```%s\n%s\n```\n\nPlease help me solve this problem.", problem, programmingLanguage, codeDisplay)

	resp, err := s.client.CreateMessage(MessageRequest{
		Model:     s.model,
		MaxTokens: 2500,
		System:    systemPrompt,
		Messages: []MessageInput{
			{Role: "user", Content: userMessage},
		},
	})

	if err != nil {
		return nil, fmt.Errorf("claude API error: %w", err)
	}

	responseText := resp.GetText()
	result := &models.CodingAssistanceResponse{}

	start := strings.Index(responseText, "{")
	end := strings.LastIndex(responseText, "}") + 1
	if start != -1 && end > start {
		jsonStr := responseText[start:end]
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(jsonStr), &parsed); err == nil {
			if v, ok := parsed["approach"].(string); ok {
				result.Approach = v
			}
			if v, ok := parsed["code_snippet"].(string); ok {
				result.CodeSnippet = v
			}
			if v, ok := parsed["explanation"].(string); ok {
				result.Explanation = v
			}
			if v, ok := parsed["time_complexity"].(string); ok {
				result.TimeComplexity = v
			}
			if v, ok := parsed["space_complexity"].(string); ok {
				result.SpaceComplexity = v
			}
			if v, ok := parsed["hints"].([]interface{}); ok {
				for _, h := range v {
					if str, ok := h.(string); ok {
						result.Hints = append(result.Hints, str)
					}
				}
			}
		}
	}

	if result.Approach == "" {
		result.Approach = responseText
	}

	return result, nil
}

// AnalyzeResponseFeedback analyzes user's interview response
func (s *ClaudeService) AnalyzeResponseFeedback(
	question string,
	userResponse string,
	interviewType string,
) (*models.FeedbackResponse, error) {

	systemPrompt := fmt.Sprintf(`You are NEXUS AI's feedback analyzer, providing constructive feedback on interview responses.

INTERVIEW TYPE: %s

Analyze the candidate's response and provide:
1. Overall quality assessment (0-100 score)
2. Tone analysis (confidence, enthusiasm, professionalism)
3. Specific strengths
4. Areas for improvement
5. Detailed, actionable feedback

Respond in JSON format:
- overall_score: Number from 0-100
- tone_analysis: Object with confidence, enthusiasm, professionalism scores (0-100)
- strengths: Array of specific strengths
- improvements: Array of specific improvement suggestions
- detailed_feedback: Comprehensive feedback paragraph`, interviewType)

	userMessage := fmt.Sprintf(`Interview Question: %s

Candidate's Response: %s

Please analyze this response and provide constructive feedback.`, question, userResponse)

	resp, err := s.client.CreateMessage(MessageRequest{
		Model:     s.model,
		MaxTokens: 1500,
		System:    systemPrompt,
		Messages: []MessageInput{
			{Role: "user", Content: userMessage},
		},
	})

	if err != nil {
		return nil, fmt.Errorf("claude API error: %w", err)
	}

	responseText := resp.GetText()

	result := &models.FeedbackResponse{
		OverallScore: 70,
		ToneAnalysis: models.ToneAnalysis{
			Confidence:      70,
			Enthusiasm:      70,
			Professionalism: 70,
		},
	}

	start := strings.Index(responseText, "{")
	end := strings.LastIndex(responseText, "}") + 1
	if start != -1 && end > start {
		jsonStr := responseText[start:end]
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(jsonStr), &parsed); err == nil {
			if v, ok := parsed["overall_score"].(float64); ok {
				result.OverallScore = v
			}
			if v, ok := parsed["tone_analysis"].(map[string]interface{}); ok {
				if c, ok := v["confidence"].(float64); ok {
					result.ToneAnalysis.Confidence = int(c)
				}
				if e, ok := v["enthusiasm"].(float64); ok {
					result.ToneAnalysis.Enthusiasm = int(e)
				}
				if p, ok := v["professionalism"].(float64); ok {
					result.ToneAnalysis.Professionalism = int(p)
				}
			}
			if v, ok := parsed["strengths"].([]interface{}); ok {
				for _, str := range v {
					if s, ok := str.(string); ok {
						result.Strengths = append(result.Strengths, s)
					}
				}
			}
			if v, ok := parsed["improvements"].([]interface{}); ok {
				for _, i := range v {
					if str, ok := i.(string); ok {
						result.Improvements = append(result.Improvements, str)
					}
				}
			}
			if v, ok := parsed["detailed_feedback"].(string); ok {
				result.DetailedFeedback = v
			}
		}
	}

	if result.DetailedFeedback == "" {
		result.DetailedFeedback = responseText
	}

	return result, nil
}

// TranslateText translates text to target language
func (s *ClaudeService) TranslateText(text string, targetLanguage string) (string, error) {
	systemPrompt := fmt.Sprintf("You are a professional translator. Translate the following text to %s. Only respond with the translation, nothing else.", targetLanguage)

	resp, err := s.client.CreateMessage(MessageRequest{
		Model:     s.model,
		MaxTokens: 2000,
		System:    systemPrompt,
		Messages: []MessageInput{
			{Role: "user", Content: text},
		},
	})

	if err != nil {
		return "", fmt.Errorf("translation error: %w", err)
	}

	return resp.GetText(), nil
}

// BuildSystemPrompt builds dynamic system prompt for live interview
func BuildSystemPrompt(ctx *models.InterviewContext, profile map[string]interface{}) string {
	base := `You are being interviewed for a job. Respond exactly like a real human would in an interview - natural, confident, conversational.

SPEAK LIKE A REAL PERSON:
- Use natural speech patterns: "Yeah, so...", "Actually...", "The thing is...", "What we did was..."
- Be conversational but professional
- Show genuine enthusiasm when appropriate
- Use "I" and "we" naturally
- Include small human touches: brief pauses, natural transitions

ANSWER STYLE:
- Start with a direct, confident opener
- Give ONE specific example with real details
- Mention actual numbers/metrics when relevant
- Keep it conversational - 3-4 sentences max
- End strong, don't trail off

WHAT TO AVOID:
- Robot-like formal language
- "As a..." or "In my capacity as..."
- Bullet points or lists
- Long paragraphs
- Saying "I think" or "maybe" - be confident
`

	// Add role context
	if ctx != nil && ctx.Role != "" {
		base += fmt.Sprintf("\n\n🎯 ROLE YOU'RE INTERVIEWING FOR: %s", ctx.Role)
		if ctx.Company != "" {
			base += fmt.Sprintf(" at %s", ctx.Company)
		}
		base += "\nTailor your answers to demonstrate you're perfect for THIS specific role."
	}

	// Add JD context
	if ctx != nil && ctx.JobDescription != "" {
		jdSnippet := ctx.JobDescription
		if len(jdSnippet) > 800 {
			jdSnippet = jdSnippet[:800]
		}
		base += fmt.Sprintf("\n\n📋 JOB REQUIREMENTS TO ADDRESS:\n%s", jdSnippet)
		base += "\n\nWhen relevant, naturally reference how your experience matches these requirements."
	}

	// Add profile context
	if profile != nil {
		name, _ := profile["name"].(string)
		skills, _ := profile["skills"].([]interface{})
		experience, _ := profile["experience"].([]interface{})

		var skillsStr string
		if len(skills) > 0 {
			skillsList := make([]string, 0, 12)
			for i, s := range skills {
				if i >= 12 {
					break
				}
				if str, ok := s.(string); ok {
					skillsList = append(skillsList, str)
				}
			}
			skillsStr = strings.Join(skillsList, ", ")
		}

		base += "\n\n👤 YOUR BACKGROUND:"
		if name != "" {
			base += fmt.Sprintf("\nName: %s", name)
		}
		if skillsStr != "" {
			base += fmt.Sprintf("\nKey Skills: %s", skillsStr)
		}

		// Add experience highlights
		if len(experience) > 0 {
			base += "\nRecent Experience:"
			for i, exp := range experience {
				if i >= 2 {
					break
				}
				if expMap, ok := exp.(map[string]interface{}); ok {
					title, _ := expMap["title"].(string)
					company, _ := expMap["company"].(string)
					base += fmt.Sprintf("\n- %s at %s", title, company)
				} else if expStr, ok := exp.(string); ok {
					if len(expStr) > 100 {
						expStr = expStr[:100]
					}
					base += fmt.Sprintf("\n- %s", expStr)
				}
			}
		}

		base += "\n\nUse YOUR real background naturally in answers - speak as yourself!"
	}

	base += `

EXAMPLE OF GOOD HUMAN RESPONSE:
"Yeah, so I actually led the migration of our entire infrastructure to Kubernetes last year. We were running about 200 microservices and the deployment time was killing us - like 45 minutes per service. I worked with my team to set up a GitOps pipeline with ArgoCD, and we got that down to under 3 minutes. The team was pretty stoked about it."
`

	return base
}

// StreamAnswer generates streaming response for live interview
func (s *ClaudeService) StreamAnswer(
	question string,
	systemPrompt string,
	model string,
	onText func(text string),
	onDone func(),
	onError func(err error),
) {
	if model == "" {
		model = s.model
	}

	userMessage := fmt.Sprintf(`Interviewer asks: "%s"

Respond naturally like you're actually in the interview. Be yourself!`, question)

	s.client.CreateMessageStream(
		MessageRequest{
			Model:     model,
			MaxTokens: 500,
			System:    systemPrompt,
			Messages: []MessageInput{
				{Role: "user", Content: userMessage},
			},
		},
		onText,
		onDone,
		onError,
	)
}
