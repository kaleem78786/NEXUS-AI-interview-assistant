import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Upload, MessageSquare, Code, BarChart3, Settings, 
  Menu, X, Radio, User, ChevronRight, Sparkles, Zap, Globe,
  Shield, Brain, Rocket, Terminal, Cloud, Database, GitBranch,
  Box, Server, Lock, Star, Award, Crown, Diamond, Target,
  TrendingUp, Activity, Cpu, Layers, ArrowRight, ExternalLink
} from 'lucide-react';

import ResumeUpload from './components/ResumeUpload';
import InterviewAssistant from './components/InterviewAssistant';
import CodingAssistant from './components/CodingAssistant';
import FeedbackPanel from './components/FeedbackPanel';
import SettingsPanel from './components/SettingsPanel';
import LiveInterview from './components/LiveInterview';

// Animated particles background
const ParticleField = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-500/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Navigation items
const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'live', label: 'Live Session', icon: Radio, badge: 'AI' },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'interview', label: 'Practice', icon: MessageSquare },
  { id: 'coding', label: 'Coding Lab', icon: Code },
  { id: 'feedback', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Home Page Component
const HomePage = ({ setActiveTab }) => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    { 
      icon: Radio, 
      title: 'Live Interview AI', 
      desc: 'Real-time question detection and intelligent answers',
      color: 'from-cyan-500 to-blue-500',
      tab: 'live'
    },
    { 
      icon: Brain, 
      title: 'Neural Processing', 
      desc: 'Context-aware responses with memory',
      color: 'from-purple-500 to-pink-500',
      tab: 'interview'
    },
    { 
      icon: Terminal, 
      title: 'Code Intelligence', 
      desc: 'Multi-language coding assistance',
      color: 'from-emerald-500 to-teal-500',
      tab: 'coding'
    },
    { 
      icon: Target, 
      title: 'Performance Analytics', 
      desc: 'Deep insights and improvement tracking',
      color: 'from-orange-500 to-red-500',
      tab: 'feedback'
    },
  ];

  const techStack = [
    { icon: Cloud, name: 'AWS', category: 'Cloud' },
    { icon: Cloud, name: 'GCP', category: 'Cloud' },
    { icon: Cloud, name: 'Azure', category: 'Cloud' },
    { icon: Box, name: 'Kubernetes', category: 'Orchestration' },
    { icon: Box, name: 'Docker', category: 'Container' },
    { icon: GitBranch, name: 'Terraform', category: 'IaC' },
    { icon: GitBranch, name: 'Ansible', category: 'Config' },
    { icon: Layers, name: 'Jenkins', category: 'CI/CD' },
    { icon: Layers, name: 'GitLab CI', category: 'CI/CD' },
    { icon: Layers, name: 'ArgoCD', category: 'GitOps' },
    { icon: Database, name: 'Prometheus', category: 'Monitoring' },
    { icon: Activity, name: 'Grafana', category: 'Observability' },
  ];

  const stats = [
    { value: '99.9%', label: 'Accuracy', icon: Target },
    { value: '<2s', label: 'Response', icon: Zap },
    { value: '50+', label: 'Technologies', icon: Layers },
    { value: '24/7', label: 'Available', icon: Activity },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleField />
      
      {/* Hero Section */}
      <div className="relative z-10 pt-16 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 1, delay: 0.2 }}
              className="mb-10 flex justify-center"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative w-32 h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border border-slate-700/50 shadow-2xl overflow-hidden">
                  <img src="/logo.svg" alt="NEXUS" className="w-24 h-24" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
                NEXUS
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <span className="px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-300 font-medium">
                Enterprise Interview Intelligence Platform
              </span>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Next-generation AI platform designed for 
              <span className="text-white font-semibold"> DevOps Engineers</span>,
              <span className="text-white font-semibold"> Cloud Architects</span>, and
              <span className="text-white font-semibold"> SREs</span>. 
              Master your technical interviews with neural-powered intelligence.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(0, 217, 255, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('live')}
                className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-purple-500 rounded-2xl font-bold text-xl text-white flex items-center gap-3 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Rocket className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Launch Live Session</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('profile')}
                className="px-10 py-5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl font-semibold text-lg text-white flex items-center gap-3 transition-all"
              >
                <User className="w-6 h-6" />
                Upload Resume
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-cyan-400" />
                <p className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Powered by <span className="text-cyan-400">Advanced AI</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                State-of-the-art neural networks trained on millions of technical interviews
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onClick={() => setActiveTab(feature.tab)}
                  className="relative group cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`} />
                  <div className="relative p-6 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 group-hover:border-cyan-500/50 transition-all h-full">
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                    <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Explore</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Expert in <span className="text-emerald-400">DevOps Stack</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Deep knowledge across all major cloud providers, tools, and methodologies
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {techStack.map((tech, i) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + i * 0.05 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="group px-5 py-3 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <tech.icon className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-white text-sm">{tech.name}</p>
                      <p className="text-xs text-slate-500">{tech.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="text-center"
          >
            <div className="inline-block p-8 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-emerald-500/5 rounded-3xl border border-slate-700/50">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">ENTERPRISE READY</span>
              </div>
              <p className="text-lg text-slate-300 mb-6">
                Join thousands of engineers who trust NEXUS for their interview success
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('live')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl font-bold text-white flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                Start Your Journey
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState(() => {
    // Load saved profile from localStorage on startup
    try {
      const saved = localStorage.getItem('nexusProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that parsed data is an object with expected structure
        if (parsed && typeof parsed === 'object' && (parsed.name || parsed.skills)) {
          return parsed;
        }
      }
      return null;
    } catch (e) {
      console.error('Failed to load profile from localStorage:', e);
      localStorage.removeItem('nexusProfile');
      return null;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    try {
      if (profile && typeof profile === 'object') {
        localStorage.setItem('nexusProfile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('nexusProfile');
      }
    } catch (e) {
      console.error('Failed to save profile to localStorage:', e);
    }
  }, [profile]);

  // Loading animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full blur-xl opacity-50" />
            <img src="/logo.svg" alt="NEXUS" className="relative w-20 h-20" />
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-cyan-400 font-medium"
          >
            Initializing NEXUS AI...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomePage setActiveTab={setActiveTab} />;
      case 'live': return <LiveInterview profile={profile} />;
      case 'profile': return <ResumeUpload onProfileUpdate={setProfile} />;
      case 'interview': return <InterviewAssistant profile={profile} />;
      case 'coding': return <CodingAssistant profile={profile} />;
      case 'feedback': return <FeedbackPanel profile={profile} />;
      case 'settings': return <SettingsPanel />;
      default: return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
        }}
      />

      {/* Header */}
      <header className="h-20 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="h-full max-w-[2000px] mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl blur-lg opacity-30" />
              <div className="relative w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700/50">
                <img src="/logo.svg" alt="NEXUS" className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  NEXUS
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wider">INTERVIEW AI</p>
            </div>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-5 py-3 rounded-xl flex items-center gap-2.5 font-medium transition-all ${
                  activeTab === item.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-xl border border-cyan-500/30"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 ${activeTab === item.id ? 'text-cyan-400' : ''}`} />
                <span className="relative z-10">{item.label}</span>
                {item.badge && (
                  <span className="relative z-10 px-1.5 py-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </nav>

          {/* Profile Status */}
          <div className="hidden md:flex items-center gap-4">
            {profile ? (
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-emerald-400 font-semibold">{profile.name || 'Profile Active'}</p>
                  <p className="text-[10px] text-emerald-500/70">AI Personalized</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Resume
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-3 rounded-xl bg-slate-800 text-slate-400"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-slate-900 border-l border-slate-800 z-50 lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-white">Menu</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg bg-slate-800">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full p-4 rounded-xl flex items-center gap-3 font-medium transition-all ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-white border border-cyan-500/30'
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-cyan-400' : ''}`} />
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
