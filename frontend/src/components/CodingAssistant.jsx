import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Code, Play, Copy, Check, Terminal, Sparkles, Loader2,
  RefreshCw, Zap, Brain, Send, ChevronRight, Clock,
  FileCode, Database, Cloud, Server, GitBranch, Box,
  Layers, Shield, Cpu, Settings
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

// Language configurations
const LANGUAGES = [
  { id: 'python', name: 'Python', icon: '🐍', color: 'from-blue-500 to-yellow-500' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨', color: 'from-yellow-400 to-yellow-600' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷', color: 'from-blue-400 to-blue-600' },
  { id: 'go', name: 'Go', icon: '🐹', color: 'from-cyan-400 to-cyan-600' },
  { id: 'rust', name: 'Rust', icon: '🦀', color: 'from-orange-500 to-red-500' },
  { id: 'bash', name: 'Bash/Shell', icon: '💻', color: 'from-green-500 to-emerald-500' },
  { id: 'yaml', name: 'YAML', icon: '📄', color: 'from-purple-400 to-pink-400' },
  { id: 'terraform', name: 'Terraform', icon: '🏗️', color: 'from-purple-500 to-indigo-500' },
  { id: 'dockerfile', name: 'Dockerfile', icon: '🐳', color: 'from-blue-400 to-cyan-400' },
];

// Challenge templates
const CHALLENGES = {
  devops: [
    'Write a Kubernetes deployment for a microservice',
    'Create a Terraform module for AWS VPC',
    'Write a GitHub Actions CI/CD pipeline',
    'Create a Docker multi-stage build',
    'Write a Prometheus alerting rule'
  ],
  algorithms: [
    'Implement a load balancer algorithm',
    'Write a rate limiter',
    'Implement a circuit breaker pattern',
    'Create a cache with TTL',
    'Write a retry mechanism with exponential backoff'
  ],
  scripts: [
    'Write a log rotation script',
    'Create a backup automation script',
    'Write a health check script',
    'Create a deployment rollback script',
    'Write a secrets rotation script'
  ]
};

function CodingAssistant({ profile }) {
  const [language, setLanguage] = useState('python');
  const [challenge, setChallenge] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('devops');
  const [history, setHistory] = useState([]);

  const handleSubmit = async () => {
    if (!challenge.trim() || isLoading) return;

    setIsLoading(true);
    setCode('');

    try {
      const prompt = `Coding Challenge: ${challenge}

Language: ${language}

Please provide:
1. A clean, well-commented solution
2. Brief explanation of the approach
3. Time and space complexity if applicable
4. Any DevOps best practices considerations

Write production-quality code.`;

      const res = await fetch(`${API_BASE}/live/stream-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: prompt,
          profile: profile || null,
          session_id: `coding_${Date.now()}`
        })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullCode = '';
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
                fullCode += d.text;
                setCode(fullCode);
              }
              if (d.done) {
                setHistory(prev => [{
                  challenge: challenge.trim(),
                  language,
                  code: fullCode,
                  timestamp: new Date()
                }, ...prev].slice(0, 10));
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      toast.error('Failed to generate code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied!', { icon: '📋' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm font-medium mb-6">
            <Terminal className="w-4 h-4" />
            Coding Lab
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Code <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Intelligence</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Generate production-quality code with AI-powered assistance for DevOps challenges
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            
            {/* Language Selection */}
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                Select Language
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`p-3 rounded-xl transition-all text-center ${
                      language === lang.id
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-white'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{lang.icon}</span>
                    <span className="text-xs font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Challenge Input */}
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Challenge
              </h3>
              
              {/* Category Tabs */}
              <div className="flex gap-2 mb-4">
                {Object.keys(CHALLENGES).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === cat
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* Quick Challenges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {CHALLENGES[activeTab].map((c) => (
                  <button
                    key={c}
                    onClick={() => setChallenge(c)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>

              <textarea
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                placeholder="Describe your coding challenge or select from templates above..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[120px] resize-none text-lg"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!challenge.trim() || isLoading}
                className="w-full mt-4 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Code...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Solution
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Output Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-slate-400 font-mono">solution.{language}</span>
              </div>
              {code && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">Copy</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {/* Code Display */}
            <div className="flex-1 p-6 overflow-auto min-h-[500px]">
              {code ? (
                <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  <code>{code}</code>
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-700/50"
                    >
                      <Terminal className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Code</h3>
                    <p className="text-slate-400 text-sm">
                      Enter a challenge and click Generate to see AI-powered solutions
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {code && (
              <div className="p-4 bg-slate-800/30 border-t border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <FileCode className="w-3 h-3" />
                    {code.split('\n').length} lines
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    {code.length} chars
                  </span>
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Generated
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Recent Challenges
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.slice(0, 6).map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setChallenge(item.challenge);
                    setLanguage(item.language);
                    setCode(item.code);
                  }}
                  className="p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-purple-500/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{LANGUAGES.find(l => l.id === item.language)?.icon}</span>
                    <span className="text-xs text-slate-500">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 truncate">{item.challenge}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CodingAssistant;
