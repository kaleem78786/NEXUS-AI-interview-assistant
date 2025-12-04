# 🦜 ParakeetAI - Real-Time Interview Assistant

An AI-powered interview assistant that helps job candidates succeed in their interviews with real-time assistance, coding help, and performance feedback.

![ParakeetAI](https://img.shields.io/badge/Powered%20by-Claude%20AI-blueviolet)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![React](https://img.shields.io/badge/React-18+-61dafb)

## ✨ Features

### 1. Resume/Profile Integration
- Upload your resume (PDF, DOCX, TXT) for automatic parsing
- AI extracts skills, experience, education, and achievements
- Personalized responses based on your background

### 2. Real-Time Interview Assistance
- Speech-to-text for capturing interview questions
- AI-generated responses tailored to your profile
- Support for behavioral, technical, and situational questions
- STAR method guidance for behavioral questions

### 3. Coding Interview Assistant
- Problem analysis and approach suggestions
- Code solutions in multiple languages (Python, JavaScript, Java, etc.)
- Time and space complexity analysis
- Progressive hints mode for learning

### 4. Multi-Language Support
- 50+ languages supported
- Automatic language detection
- Real-time translation capabilities

### 5. Performance Feedback
- Response quality scoring
- Tone analysis (confidence, enthusiasm, professionalism)
- Specific strengths and improvement areas
- Detailed actionable feedback

### 6. Discreet & User-Friendly
- Clean, modern interface
- Non-intrusive design for live interviews
- Customizable assistance levels

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Claude API key from Anthropic

### 1. Clone the Repository
```bash
cd /home/adnan/Documents/kaleem/perakeet-AI
```

### 2. Set Up the Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Start the backend server
python run.py
```

The backend will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 3. Set Up the Frontend

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
perakeet-AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Configuration settings
│   │   ├── models.py            # Pydantic models
│   │   ├── routes/
│   │   │   ├── interview.py     # Interview endpoints
│   │   │   └── profile.py       # Profile endpoints
│   │   └── services/
│   │       ├── claude_service.py    # Claude AI integration
│   │       └── resume_parser.py     # Resume parsing
│   ├── requirements.txt
│   └── run.py                   # Server entry point
│
├── frontend/
│   ├── public/
│   │   └── parakeet.svg         # App icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── ResumeUpload.jsx
│   │   │   ├── InterviewAssistant.jsx
│   │   │   ├── CodingAssistant.jsx
│   │   │   ├── FeedbackPanel.jsx
│   │   │   └── SettingsPanel.jsx
│   │   ├── api.js               # API client
│   │   ├── App.jsx              # Main application
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 🔧 API Endpoints

### Profile Management
- `POST /profile/upload-resume` - Upload and parse resume
- `POST /profile/manual` - Create profile manually
- `GET /profile/{profile_id}` - Get profile
- `PUT /profile/{profile_id}` - Update profile
- `DELETE /profile/{profile_id}` - Delete profile

### Interview Assistance
- `POST /interview/session/start` - Start interview session
- `POST /interview/session/{session_id}/end` - End session
- `POST /interview/assist` - Get interview assistance
- `POST /interview/coding-assist` - Get coding help
- `POST /interview/feedback` - Get response feedback
- `POST /interview/translate` - Translate text

## ⚙️ Configuration

### Assistance Levels
- **Low**: Brief bullet points only
- **Medium**: Structured response with key points
- **High**: Comprehensive response with examples

### Interview Types
- **Behavioral**: STAR method questions
- **Technical**: Technical knowledge questions
- **Coding**: Programming problems
- **Mixed**: All question types

## 🌐 Supported Languages

English, Spanish, French, German, Chinese, Japanese, Korean, Hindi, Arabic, Portuguese, Russian, Italian, Dutch, Turkish, Polish, and many more.

## 🛡️ Privacy & Security

- No permanent data storage
- Session-based processing
- Encrypted communication
- User-controlled data sharing

## 📝 Usage Tips

1. **Upload Your Resume First**: This enables personalized responses based on your actual experience.

2. **Use Voice Input**: Click the microphone to capture questions hands-free during interviews.

3. **Adjust Assistance Level**: Use "Low" for minimal prompts during actual interviews, "High" for practice.

4. **Practice with Feedback**: Use the feedback feature to improve your responses before real interviews.

5. **Try Progressive Hints**: In coding mode, use hints-only mode to learn problem-solving approaches.

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python 3.9+ is installed
- Check that ANTHROPIC_API_KEY is set correctly
- Verify all dependencies are installed

### Frontend can't connect
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify network connectivity

### Speech recognition not working
- Enable microphone permissions in browser
- Use Chrome or Edge for best support
- Check system audio settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ by ParakeetAI Team


