import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Monitor, Mic, MicOff, Zap, Copy, Check, Trash2, 
  Brain, Send, Radio, ChevronRight, FileText, Briefcase,
  RefreshCw, User, Bot, Maximize2, Minimize2, X, Upload,
  Sparkles, Target, Settings, ChevronDown, Play
} from 'lucide-react';

const API_BASE = '';

// Available AI Models
const AI_MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', desc: 'Best for interviews', recommended: true },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', desc: 'Fast & accurate' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', desc: 'Most capable' },
];

function LiveInterview({ profile }) {
  // Session Setup State
  const [setupComplete, setSetupComplete] = useState(false);
  const [interviewRole, setInterviewRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-20250514');
  const [useProfile, setUseProfile] = useState(true);
  
  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isCapturingAudio, setIsCapturingAudio] = useState(false);
  
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexusChat') || '[]'); } catch { return []; }
  });
  
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Detected question from voice
  const [detectedQuestion, setDetectedQuestion] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const [liveTranscript, setLiveTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [sessionId] = useState(() => `nexus_${Date.now()}`);
  const [sessionTime, setSessionTime] = useState(0);
  const [copied, setCopied] = useState(null);
  const [videoExpanded, setVideoExpanded] = useState(true);
  
  // Session context for AI
  const sessionContext = useRef({
    role: '',
    company: '',
    jd: '',
    model: '',
    profile: null
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const transcribeTimerRef = useRef(null);
  const isStreamingRef = useRef(false);
  const chatEndRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const lastTranscriptRef = useRef('');

  useEffect(() => { isStreamingRef.current = isStreaming; }, [isStreaming]);
  
  useEffect(() => {
    localStorage.setItem('nexusChat', JSON.stringify(messages.slice(-50)));
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  useEffect(() => {
    if (isConnected) {
      sessionTimerRef.current = setInterval(() => setSessionTime(p => p + 1), 1000);
    }
    return () => clearInterval(sessionTimerRef.current);
  }, [isConnected]);

  // Handle video setup when screen is connected
  useEffect(() => {
    if (connectionType === 'screen' && streamRef.current?.active) {
      // Small delay to ensure video element is rendered
      const setupVideo = () => {
        if (videoRef.current && streamRef.current?.active) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.play().catch(e => console.log('Auto-play error:', e));
        }
      };
      
      // Try immediately and with delay
      setupVideo();
      const timer = setTimeout(setupVideo, 200);
      return () => clearTimeout(timer);
    }
  }, [connectionType]);

  // Speech Recognition - Auto detect voice, but manual trigger for answers
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (e) => {
        let t = '';
        for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
        setLiveTranscript(t);
        
        // Accumulate to detected question for BOTH mic and screen modes
        if (e.results[e.resultIndex]?.isFinal && !isStreamingRef.current) {
          const newText = t.trim();
          if (newText) {
            setDetectedQuestion(prev => {
              const combined = prev ? prev + ' ' + newText : newText;
              return combined.slice(-500);
            });
            lastTranscriptRef.current = newText;
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              setLiveTranscript('');
            }, 2000);
          }
        }
      };
      recognitionRef.current.onend = () => { if (isListening) try { recognitionRef.current.start(); } catch{} };
    }
  }, [isListening]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  // Clear detected question
  const clearDetectedQuestion = () => {
    setDetectedQuestion('');
    setLiveTranscript('');
  };

  const connectScreen = async () => {
    // Check if we're on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isSecure) {
      toast.error('Screen share requires HTTPS. Use "Microphone Only" instead, or run locally.', { duration: 5000 });
      return;
    }
    
    try {
      // Get screen for video display
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          displaySurface: 'browser', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        }, 
        audio: true
      });
      
      // ALSO get microphone to capture interviewer's voice from speakers
      let micStream;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: true,
            sampleRate: 48000
          }
        });
        console.log('[MIC] Got microphone for audio capture');
        toast.success('🎤 Using microphone to capture interviewer voice!');
      } catch (micErr) {
        console.log('[MIC] Microphone not available, using screen audio');
      }
      
      streamRef.current = screenStream;
      setIsConnected(true);
      setConnectionType('screen');
      
      // Start Web Speech API for real-time transcription (like ParakeetAI)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          toast.success('🎤 Voice detection active - speak to transcribe!');
        } catch (e) {
          console.log('Speech recognition already started');
        }
      }
      
      screenStream.getVideoTracks()[0].onended = () => disconnect();
    } catch (e) { 
      console.error('Screen share error:', e);
      if (e.name === 'NotAllowedError') {
        toast.error('Screen share was denied. Please allow access.');
      } else {
        toast.error('Failed to capture screen. Try "Microphone Only".');
      }
    }
  };

  const connectMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsConnected(true);
      setConnectionType('mic');
      toast.success('🎤 Connected!');
      startMicListening();
    } catch { toast.error('Mic denied'); }
  };

  const startMicListening = () => {
    if (!recognitionRef.current) {
      console.log('Recognition not available');
      return;
    }
    try { 
      recognitionRef.current.start(); 
      setIsListening(true);
      console.log('Mic listening started');
    } catch (e) {
      console.log('Mic start error:', e);
      // Try again after a short delay
      setTimeout(() => {
        try { recognitionRef.current.start(); setIsListening(true); } catch {}
      }, 500);
    }
  };

  const stopMicListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
    clearTimeout(silenceTimerRef.current);
  };

  const toggleMic = () => isListening ? stopMicListening() : startMicListening();

  const startScreenAudio = (stream) => {
    const audioTracks = stream.getAudioTracks();
    console.log('[AUDIO] Tracks:', audioTracks.length, audioTracks.map(t => t.label));
    
    if (audioTracks.length === 0) {
      toast.error('❌ No audio track! Make sure to check "Share audio" when sharing tab');
      return;
    }
    
    // Clone the track to avoid issues with the original stream
    const audioTrack = audioTracks[0].clone();
    const audioStream = new MediaStream([audioTrack]);
    console.log('[AUDIO] Created stream with track:', audioTrack.label, audioTrack.readyState);
    
    // Setup audio level monitoring
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(audioStream);
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const max = Math.max(...dataArray);
        setAudioLevel(Math.min(100, avg * 2));
        // Log audio levels periodically
        if (Math.random() < 0.02) {
          console.log(`[AUDIO] Level: avg=${avg.toFixed(1)}, max=${max}`);
        }
        requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) {
      console.log('[AUDIO] Analyser error:', e);
    }
    
    try {
      // Use the same stream for recording
      const mr = new MediaRecorder(audioStream, { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      
      mr.ondataavailable = (e) => { 
        if (e.data.size > 0) {
          console.log('[AUDIO] Chunk:', e.data.size, 'bytes, type:', e.data.type);
          audioChunksRef.current.push(e.data); 
        }
      };
      
      mr.onstop = async () => { 
        if (audioChunksRef.current.length > 0) {
          await processAudioChunk();
        }
      };
      
      mr.start();
      setIsCapturingAudio(true);
      
      // Send audio chunks every 5 seconds for better accuracy
      transcribeTimerRef.current = setInterval(() => {
        if (mr.state === 'recording') { 
          mr.stop(); 
          mr.start(); 
        }
      }, 5000);
      
    } catch (e) {
      console.log('MediaRecorder error:', e);
    }
  };

  const processAudioChunk = async () => {
    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];
    
    if (blob.size < 1000) return;
    
    const fd = new FormData();
    fd.append('file', blob, 'audio.webm');
    
    try {
      const res = await fetch(`${API_BASE}/live/transcribe-chunk`, { method: 'POST', body: fd });
      const data = await res.json();
      
      if (data.success && data.text?.trim()) {
        const text = data.text.trim();
        console.log('[AWS]', text);
        setLiveTranscript(text);
        
        if (!isStreamingRef.current) {
          setDetectedQuestion(prev => {
            if (prev && prev.includes(text)) return prev;
            const combined = prev ? prev + ' ' + text : text;
            return combined.slice(-500);
          });
        }
      }
    } catch (e) {
      console.log('Transcribe error:', e);
    }
  };


  const disconnect = () => {
    stopMicListening();
    clearInterval(transcribeTimerRef.current);
    clearTimeout(silenceTimerRef.current);
    try { mediaRecorderRef.current?.stop(); } catch {}
    clearInterval(sessionTimerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsConnected(false);
    setConnectionType(null);
    setIsCapturingAudio(false);
    setLiveTranscript('');
    setDetectedQuestion('');
    toast.success('Ended');
  };

  // Generate answer - only when user clicks Get Answer
  const generateAnswer = useCallback(async (text) => {
    const q = (text || manualInput || detectedQuestion).trim();
    if (!q || isStreamingRef.current) return;
    
    setMessages(prev => [...prev, { type: 'q', text: q, time: Date.now() }]);
    setStreamingText('');
    setIsStreaming(true);
    isStreamingRef.current = true;
    setLiveTranscript('');
    setManualInput('');
    setDetectedQuestion(''); // Clear after using

    try {
      const response = await fetch(`${API_BASE}/live/stream-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: q, 
          profile: useProfile ? profile : null, 
          session_id: sessionId,
          // Include interview context for more natural answers
          interview_context: {
            role: sessionContext.current.role,
            company: sessionContext.current.company,
            job_description: sessionContext.current.jd,
            model: sessionContext.current.model
          }
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullAnswer += data.text;
                setStreamingText(fullAnswer);
              }
              if (data.done) {
                setMessages(prev => [...prev, { type: 'a', text: fullAnswer, time: Date.now() }]);
                setStreamingText('');
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { type: 'a', text: 'Error: ' + e.message, time: Date.now() }]);
      setStreamingText('');
    } finally {
      setIsStreaming(false);
      isStreamingRef.current = false;
    }
  }, [manualInput, detectedQuestion, profile, sessionId]);

  // Get answer from detected question
  const getAnswerFromDetected = () => {
    if (detectedQuestion.trim()) {
      generateAnswer(detectedQuestion);
    }
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('nexusChat');
  };

  // Start session with context
  const startSession = (type) => {
    // Save context for AI
    sessionContext.current = {
      role: interviewRole,
      company: companyName,
      jd: jobDescription,
      model: selectedModel,
      profile: useProfile ? profile : null
    };
    
    if (type === 'screen') {
      connectScreen();
    } else {
      connectMic();
    }
  };

  // SETUP SCREEN - Before starting session
  if (!isConnected && !setupComplete) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Interview Setup</h1>
            <p className="text-slate-400">Configure your session for personalized AI responses</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Interview Details */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Interview Role */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Interview Role *</h3>
                    <p className="text-xs text-slate-500">Position you're applying for</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={interviewRole}
                  onChange={(e) => setInterviewRole(e.target.value)}
                  placeholder="e.g., Senior DevOps Engineer, Cloud Architect..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Company Name */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Company Name</h3>
                    <p className="text-xs text-slate-500">Optional - for context</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Google, Amazon, Microsoft..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Job Description */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Job Description</h3>
                    <p className="text-xs text-slate-500">Paste the JD for tailored answers</p>
                  </div>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here... (requirements, responsibilities, qualifications)"
                  rows={5}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </motion.div>

            {/* Right Column - Profile & Model */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Your Profile/CV */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Your Profile/CV</h3>
                    <p className="text-xs text-slate-500">AI will reference your background</p>
                  </div>
                </div>
                
                {profile ? (
                  <div className="space-y-3">
                    <div 
                      onClick={() => setUseProfile(!useProfile)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        useProfile 
                          ? 'bg-emerald-500/10 border-emerald-500/50' 
                          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            useProfile ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                          }`}>
                            {useProfile && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <p className="font-medium text-white">{profile.name || 'Your Profile'}</p>
                            <p className="text-xs text-slate-500">
                              {Array.isArray(profile.skills) ? profile.skills.slice(0, 3).join(', ') : 'Skills loaded'}
                            </p>
                          </div>
                        </div>
                        {useProfile && <Sparkles className="w-4 h-4 text-emerald-400" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      {useProfile ? '✓ AI will personalize answers based on your profile' : 'Profile disabled - generic answers'}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                    <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-amber-400 text-sm font-medium">No profile uploaded</p>
                    <p className="text-xs text-amber-400/70 mt-1">Go to Profile tab to upload your resume</p>
                  </div>
                )}
              </div>

              {/* AI Model Selection */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Model</h3>
                    <p className="text-xs text-slate-500">Select response model</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {AI_MODELS.map((model) => (
                    <div
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedModel === model.id
                          ? 'bg-violet-500/10 border-violet-500/50'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedModel === model.id ? 'border-violet-500 bg-violet-500' : 'border-slate-600'
                          }`}>
                            {selectedModel === model.id && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{model.name}</p>
                            <p className="text-xs text-slate-500">{model.desc}</p>
                          </div>
                        </div>
                        {model.recommended && (
                          <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Chat */}
              {messages.length > 0 && (
                <div className="p-4 bg-slate-800/50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{messages.length} previous messages</span>
                  <button onClick={clearChat} className="text-red-400 text-sm hover:text-red-300">Clear History</button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Start Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <button
              onClick={() => setSetupComplete(true)}
              disabled={!interviewRole.trim()}
              className={`w-full p-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                interviewRole.trim()
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-6 h-6" />
              Continue to Connect Meeting
              <ChevronRight className="w-6 h-6" />
            </button>
            {!interviewRole.trim() && (
              <p className="text-center text-amber-400 text-sm mt-3">Please enter the interview role to continue</p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // CONNECTION SCREEN - After setup
  if (!isConnected && setupComplete) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-xl w-full">
          {/* Session Info */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/30 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-400 text-sm font-medium">Interview Session</span>
              <button 
                onClick={() => setSetupComplete(false)} 
                className="text-slate-400 text-xs hover:text-white"
              >
                Edit Setup
              </button>
            </div>
            <p className="text-white font-semibold text-lg">{interviewRole}</p>
            {companyName && <p className="text-slate-400 text-sm">{companyName}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs">
              {useProfile && profile && (
                <span className="text-emerald-400">✓ Profile Active</span>
              )}
              {jobDescription && (
                <span className="text-amber-400">✓ JD Loaded</span>
              )}
              <span className="text-violet-400">Model: {AI_MODELS.find(m => m.id === selectedModel)?.name}</span>
            </div>
          </motion.div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Connect Your Meeting</h1>
            <p className="text-slate-400">Choose how to capture the interview</p>
          </div>

          <div className="space-y-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startSession('screen')} 
              className="w-full p-5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl flex items-center gap-4 group transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Monitor className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-white text-lg">Screen Share</p>
                <p className="text-sm text-slate-500">Capture meeting window + audio</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-600 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startSession('mic')} 
              className="w-full p-5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-xl flex items-center gap-4 group transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-white text-lg">Microphone Only</p>
                <p className="text-sm text-slate-500">Listen through your microphone</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-600 group-hover:translate-x-1 group-hover:text-purple-400 transition-all" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="h-[calc(100vh-80px)] flex bg-slate-950">
      
      {/* LEFT: MEETING + CHAT */}
      <div className="flex-1 flex flex-col">
        
        {/* MEETING SCREEN */}
        {connectionType === 'screen' && (
          <div className={`bg-slate-900 border-b border-slate-800 relative ${videoExpanded ? 'h-[45%] min-h-[250px]' : 'h-24'}`}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#0f172a' }}
            />
            
            {/* Overlay controls */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top bar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1.5 bg-red-500 rounded-lg text-xs text-white font-bold flex items-center gap-1.5 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                  <span className="px-2.5 py-1.5 bg-black/80 rounded-lg text-xs text-white font-mono">{formatTime(sessionTime)}</span>
                </div>
                <button onClick={() => setVideoExpanded(!videoExpanded)} className="p-2 bg-black/80 rounded-lg text-white hover:bg-black transition-colors">
                  {videoExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Bottom status */}
              {(isListening || isCapturingAudio) && (
                <div className="absolute bottom-3 left-3 px-3 py-2 bg-emerald-500 rounded-lg flex items-center gap-2 shadow-lg pointer-events-auto">
                  <Radio className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-xs text-white font-semibold">Capturing Audio</span>
                  {/* Audio level bar */}
                  <div className="w-20 h-2 bg-emerald-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-100"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                  <span className="text-xs text-white">{audioLevel > 10 ? '🔊' : '🔇'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header for mic mode */}
        {connectionType === 'mic' && (
          <div className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-semibold text-white">NEXUS</span>
              <span className="text-xs text-slate-500">{formatTime(sessionTime)}</span>
            </div>
            <button onClick={disconnect} className="text-xs text-red-400">End</button>
          </div>
        )}


        {/* CHAT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && !streamingText && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Voice auto-detection active</p>
                <p className="text-slate-600 text-xs mt-1">Click "Get Answer" when ready</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'q' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'a' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.type === 'q' ? 'bg-cyan-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-100 rounded-bl-sm'
              }`}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className={`flex items-center gap-2 mt-1 text-[10px] ${msg.type === 'q' ? 'text-cyan-200' : 'text-slate-500'}`}>
                  {msg.type === 'a' && (
                    <button onClick={() => copyText(msg.text, i)} className="hover:text-white">
                      {copied === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                  {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.type === 'q' && (
                <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center ml-2 flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* STREAMING */}
          {(streamingText || isStreaming) && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[75%] bg-slate-800 text-slate-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
                {streamingText ? (
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {streamingText}
                    <span className="inline-block w-2 h-5 bg-cyan-400 ml-0.5 animate-pulse" />
                  </p>
                ) : (
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <div className="border-t border-slate-800 bg-slate-900 p-3">
          {/* Detected Question Display */}
          {detectedQuestion && !isStreaming && (
            <div className="mb-3 p-3 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-cyan-400 uppercase">Detected Question</span>
              </div>
              <p className="text-white text-sm mb-3 leading-relaxed">{detectedQuestion}</p>
              <div className="flex gap-2">
                <button 
                  onClick={getAnswerFromDetected} 
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <Zap className="w-4 h-4" /> Get Answer
                </button>
                <button 
                  onClick={clearDetectedQuestion} 
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              </div>
            </div>
          )}
          
          {/* Live Transcript Preview */}
          {liveTranscript && (
            <div className="mb-2 px-3 py-2 bg-slate-800/50 rounded-lg text-sm text-slate-400 flex items-center">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse mr-2" />
              <span className="truncate flex-1">{liveTranscript}</span>
            </div>
          )}

          {/* Manual Input Row */}
          <div className="flex gap-2">
            <button onClick={toggleMic} className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isStreaming && manualInput && generateAnswer()}
              placeholder="Type question here..."
              className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <button 
              onClick={() => generateAnswer()} 
              disabled={(!manualInput && !detectedQuestion) || isStreaming} 
              className="px-5 py-3 bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all hover:bg-cyan-400"
            >
              {isStreaming ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-56 border-l border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-3 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">Session</span>
            <button onClick={disconnect} className="text-xs text-red-400 hover:text-red-300">End</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <p className="text-lg font-bold text-white">{messages.filter(m => m.type === 'a').length}</p>
              <p className="text-[10px] text-slate-500">Answers</p>
            </div>
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <p className="text-lg font-bold text-white">{formatTime(sessionTime)}</p>
              <p className="text-[10px] text-slate-500">Time</p>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            {connectionType === 'screen' ? <Monitor className="w-4 h-4 text-cyan-400" /> : <Mic className="w-4 h-4 text-purple-400" />}
            <span className="text-sm text-slate-300">{connectionType === 'screen' ? 'Screen' : 'Mic'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isListening || isCapturingAudio ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-xs text-slate-500">{isListening || isCapturingAudio ? 'Listening' : 'Idle'}</span>
          </div>
        </div>

        <div className="p-3 mt-auto">
          <button onClick={clearChat} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-lg flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default LiveInterview;
