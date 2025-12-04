# NEXUS AI - Go Backend

Enterprise Interview Intelligence Platform - High-performance Go backend.

## Features

- 🚀 **High Performance**: Built with Go and Gin framework
- 🤖 **AI-Powered**: Claude AI for intelligent interview responses
- 🎤 **Audio Transcription**: Deepgram integration for voice recognition
- 📄 **Resume Parsing**: PDF, DOCX, and TXT support
- 🔄 **Real-time Streaming**: Server-Sent Events (SSE) for live answers
- 💾 **Session Memory**: Maintains conversation context

## Prerequisites

- Go 1.21+
- Anthropic API Key
- Deepgram API Key (optional)

## Quick Start

### 1. Install Dependencies

```bash
go mod download
go mod tidy
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Run Development Server

```bash
go run main.go
```

Or use make:

```bash
make dev
```

### 4. Build for Production

```bash
make build-prod
```

## API Endpoints

### Root
- `GET /` - API info
- `GET /health` - Health check
- `GET /docs` - API documentation

### Profile Management
- `POST /profile/upload-resume` - Upload and parse resume
- `POST /profile/manual` - Create manual profile
- `GET /profile` - List all profiles
- `GET /profile/:id` - Get profile by ID
- `PUT /profile/:id` - Update profile
- `DELETE /profile/:id` - Delete profile

### Interview Assistance
- `POST /interview/session/start` - Start interview session
- `POST /interview/session/:id/end` - End interview session
- `POST /interview/assist` - Get interview assistance
- `POST /interview/coding-assist` - Get coding assistance
- `POST /interview/feedback` - Get response feedback
- `POST /interview/translate` - Translate text

### Live Interview
- `POST /live/stream-answer` - Stream AI answer (SSE)
- `POST /live/transcribe-chunk` - Transcribe audio chunk
- `GET /live/memory-status` - Get memory status
- `POST /live/clear-memory` - Clear session memory
- `GET /live/health` - Health check

## Project Structure

```
backend-go/
├── main.go              # Entry point
├── go.mod               # Go module
├── go.sum               # Dependencies lock
├── Makefile             # Build commands
├── config/
│   └── config.go        # Configuration
├── models/
│   └── models.go        # Data models
├── services/
│   ├── claude_service.go    # Claude AI integration
│   ├── resume_parser.go     # Resume parsing
│   └── deepgram_service.go  # Audio transcription
└── routes/
    ├── profile.go           # Profile routes
    ├── interview.go         # Interview routes
    └── live_interview.go    # Live interview routes
```

## Deployment

### Build for Linux

```bash
make build-linux
```

### Docker (optional)

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 go build -o nexus-ai main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/nexus-ai .
COPY .env .
EXPOSE 8000
CMD ["./nexus-ai"]
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Yes |
| `DEEPGRAM_API_KEY` | Deepgram speech-to-text API key | No |
| `PORT` | Server port (default: 8000) | No |
| `DEBUG` | Debug mode (default: true) | No |

## License

MIT

