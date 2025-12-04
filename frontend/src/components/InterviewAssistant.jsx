import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Mic, MicOff, Send, Sparkles, Copy, Check, Volume2, Target,
  Clock, Loader2, ChevronDown, MessageCircle, Brain, Zap,
  Lightbulb, BookOpen, Award, TrendingUp, Play, Square,
  RefreshCw, Star, Crown, ChevronRight
} from 'lucide-react';
import { startSession, getInterviewAssistance } from '../api';

const API_BASE = 'http://localhost:8000';

// Quick question templates
const QUESTION_TEMPLATES = {
  behavioral: [
    'Tell me about yourself',
    'Why should we hire you?',
    'What are your greatest strengths?',
    'Describe a challenging project you worked on',
    'How do you handle conflict in a team?'
  ],
  technical: [
    'Explain the difference between Docker and Kubernetes',
    'How would you design a CI/CD pipeline?',
    'What is Infrastructure as Code?',
    'Explain microservices architecture',
    'How do you handle secrets management?'
  ],
  scenario: [
    'How would you handle a production outage?',
    'Design a highly available system',
    'How would you migrate to the cloud?',
    'Optimize a slow deployment pipeline',
    'Handle a security breach scenario'
  ]
};

function InterviewAssistant({ profile }) {
  const [isListening, setIsListening] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeCategory, setActiveCategory] = useState('behavioral');
  
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQuestion(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied');
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          try { recognitionRef.current.start(); } catch (e) {}
        }
      };
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Listening...', { icon: '🎤' });
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
      // Use the streaming endpoint
      const res = await fetch(`${API_BASE}/live/stream-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          profile: profile || null,
          session_id: `practice_${Date.now()}`
        })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.text) {
                fullAnswer += d.text;
                setResponse({
                  suggested_answer: fullAnswer,
                  confidence_score: 0.95,
                  isStreaming: true
                });
              }
              if (d.done) {
                setResponse(prev => ({ ...prev, isStreaming: false }));
                setHistory(prev => [{
                  question: question.trim(),
                  answer: fullAnswer,
                  timestamp: new Date(),
                }, ...prev].slice(0, 20));
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!', { icon: '📋' });
    setTimeout(() => setCopied(false), 2000);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            Practice Mode
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Practice</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Practice your interview skills with AI-powered responses. 
            {!profile && <span className="text-amber-400"> Upload your resume for personalized answers.</span>}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Input & Response */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Input Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden"
            >
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Enter the interview question..."
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[140px] resize-none text-lg pr-28"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                    />
                    
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleListening}
                        className={`p-3 rounded-xl transition-all ${
                          isListening
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </motion.button>
                      
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading || !question.trim()}
                        className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 transition-all"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>

                {/* Category Tabs */}
                <div className="flex gap-2 mt-4 mb-3">
                  {Object.keys(QUESTION_TEMPLATES).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeCategory === cat
                          ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Quick Questions */}
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TEMPLATES[activeCategory].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuestion(q)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Response */}
            <AnimatePresence mode="wait">
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">AI Response</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-400">{Math.round(response.confidence_score * 100)}% confidence</span>
                          {response.isStreaming && (
                            <span className="text-xs text-cyan-400 animate-pulse">Generating...</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(response.suggested_answer)}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(response.suggested_answer)}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
                      {response.suggested_answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Profile Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-5 rounded-2xl border ${
                profile 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-amber-500/5 border-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {profile ? (
                  <Crown className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Award className="w-6 h-6 text-amber-400" />
                )}
                <span className={`font-semibold ${profile ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {profile ? 'Profile Active' : 'No Profile'}
                </span>
              </div>
              <p className={`text-sm ${profile ? 'text-emerald-400/70' : 'text-amber-400/70'}`}>
                {profile 
                  ? 'AI will generate personalized responses based on your experience'
                  : 'Upload your resume for personalized interview answers'}
              </p>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">Interview Tips</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Use STAR method for behavioral questions',
                  'Be specific with examples and metrics',
                  'Show enthusiasm and confidence',
                  'Ask clarifying questions when needed',
                  'Practice common questions beforehand'
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-amber-400">{i + 1}</span>
                    </div>
                    <span className="text-slate-400">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* History */}
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden"
              >
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    <span className="font-semibold text-white">History ({history.length})</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-700/50"
                    >
                      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                        {history.map((item, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setQuestion(item.question);
                              setResponse({ suggested_answer: item.answer, confidence_score: 0.95, isStreaming: false });
                            }}
                            className="p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span className="text-xs text-slate-500">
                                {item.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 truncate">{item.question}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewAssistant;
