import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, File, Check, X, User, Briefcase, Award, Code, 
  Sparkles, FileText, Loader, Shield, Globe, Target,
  ChevronRight, Star, Zap, Crown, Database, Terminal
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h3 className="font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-slate-400">{description}</p>
  </motion.div>
);

function ResumeUpload({ onProfileUpdate }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedProfile, setParsedProfile] = useState(() => {
    // Load saved profile from localStorage on component mount
    try {
      const saved = localStorage.getItem('nexusProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate parsed data
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
      return null;
    } catch (e) {
      console.error('Failed to load profile:', e);
      localStorage.removeItem('nexusProfile');
      return null;
    }
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFile(file);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/profile/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Ensure profile has required fields
      const profileData = data.profile || data;
      const normalizedProfile = {
        name: profileData.name || 'Unknown',
        email: profileData.email || null,
        skills: profileData.skills || [],
        experience: profileData.experience || [],
        education: profileData.education || [],
        projects: profileData.projects || [],
        achievements: profileData.achievements || [],
        summary: profileData.summary || '',
        raw_resume_text: profileData.raw_resume_text || '',
      };
      
      setParsedProfile(normalizedProfile);
      onProfileUpdate(normalizedProfile);
      
      // Save to localStorage
      localStorage.setItem('nexusProfile', JSON.stringify(normalizedProfile));
      
      toast.success('Profile created successfully!', {
        icon: '✨',
        duration: 4000
      });
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload resume. Please try again.');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  }, [onProfileUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const clearUpload = () => {
    setUploadedFile(null);
    setParsedProfile(null);
    onProfileUpdate(null);
    localStorage.removeItem('nexusProfile');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
            <Crown className="w-4 h-4" />
            AI-Powered Profile Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Professional Profile</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload your resume and let our neural network create a comprehensive profile 
            for personalized interview responses
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`relative group cursor-pointer transition-all duration-300 ${
                isDragActive ? 'scale-[1.02]' : ''
              }`}
            >
              <input {...getInputProps()} />
              
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl transition-opacity ${
                isDragActive ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
              }`} />
              
              <div className={`relative p-12 bg-slate-900/80 backdrop-blur-sm rounded-2xl border-2 border-dashed transition-all ${
                isDragActive 
                  ? 'border-purple-400 bg-purple-500/5' 
                  : 'border-slate-700 hover:border-purple-500/50'
              }`}>
                {isUploading ? (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          className="text-slate-700"
                          strokeWidth="4"
                          stroke="currentColor"
                          fill="transparent"
                          r="36"
                          cx="40"
                          cy="40"
                        />
                        <circle
                          className="text-purple-500"
                          strokeWidth="4"
                          strokeDasharray={226}
                          strokeDashoffset={226 - (226 * uploadProgress) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="36"
                          cx="40"
                          cy="40"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                        {uploadProgress}%
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium">Analyzing your resume with AI...</p>
                    <p className="text-sm text-slate-500 mt-2">Extracting skills, experience, and achievements</p>
                  </div>
                ) : uploadedFile && parsedProfile ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg text-white font-semibold mb-2">{uploadedFile.name}</p>
                    <p className="text-emerald-400 font-medium">Profile created successfully!</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearUpload();
                      }}
                      className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      Upload Different Resume
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30"
                    >
                      <Upload className="w-10 h-10 text-purple-400" />
                    </motion.div>
                    <p className="text-lg text-white font-semibold mb-2">
                      {isDragActive ? 'Drop your resume here!' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-slate-400 mb-4">or click to browse</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                      <FileText className="w-4 h-4" />
                      <span>PDF, DOC, DOCX • Max 10MB</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <FeatureCard 
                icon={Sparkles}
                title="AI Analysis"
                description="Neural extraction of skills and experience"
                color="bg-gradient-to-br from-purple-500 to-pink-500"
              />
              <FeatureCard 
                icon={Target}
                title="Personalization"
                description="Tailored responses for your background"
                color="bg-gradient-to-br from-cyan-500 to-blue-500"
              />
              <FeatureCard 
                icon={Shield}
                title="Secure"
                description="Your data stays private and protected"
                color="bg-gradient-to-br from-emerald-500 to-teal-500"
              />
              <FeatureCard 
                icon={Zap}
                title="Instant"
                description="Profile ready in seconds"
                color="bg-gradient-to-br from-amber-500 to-orange-500"
              />
            </div>
          </motion.div>

          {/* Profile Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {parsedProfile ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-slate-700/50">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                        {parsedProfile.name ? parsedProfile.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {parsedProfile.name || 'Professional Profile'}
                        </h2>
                        <p className="text-purple-300 font-medium">
                          {parsedProfile.title || 'DevOps Engineer'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-bold">AI Ready</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    
                    {/* Summary */}
                    {parsedProfile.summary && typeof parsedProfile.summary === 'string' && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-5 h-5 text-cyan-400" />
                          <h3 className="font-semibold text-white">Summary</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {parsedProfile.summary}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {parsedProfile.skills && parsedProfile.skills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-5 h-5 text-emerald-400" />
                          <h3 className="font-semibold text-white">Technical Skills</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(parsedProfile.skills) 
                            ? parsedProfile.skills 
                            : typeof parsedProfile.skills === 'string'
                            ? parsedProfile.skills.split(',') 
                              : []
                          ).slice(0, 15).map((skill, i) => (
                            <motion.span
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg border border-slate-700/50 hover:border-emerald-500/30 transition-colors"
                            >
                              {typeof skill === 'string' ? skill.trim() : String(skill)}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {parsedProfile.experience && parsedProfile.experience.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="w-5 h-5 text-amber-400" />
                          <h3 className="font-semibold text-white">Experience</h3>
                        </div>
                        <div className="space-y-3">
                          {(Array.isArray(parsedProfile.experience) 
                            ? parsedProfile.experience 
                            : [parsedProfile.experience]
                          ).slice(0, 3).map((exp, i) => (
                            <div key={i} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                              {typeof exp === 'object' ? (
                                <>
                                  <p className="font-medium text-white">{exp.title || exp.role || 'Role'}</p>
                                  <p className="text-sm text-slate-400">{exp.company || ''} {exp.duration ? `• ${exp.duration}` : ''}</p>
                                </>
                              ) : (
                                <p className="text-slate-300">{exp}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements/Certifications */}
                    {(parsedProfile.achievements?.length > 0 || parsedProfile.certifications) && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-5 h-5 text-purple-400" />
                          <h3 className="font-semibold text-white">Achievements & Certifications</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(parsedProfile.achievements) 
                            ? parsedProfile.achievements 
                            : parsedProfile.certifications 
                              ? [parsedProfile.certifications]
                              : []
                          ).slice(0, 5).map((item, i) => (
                            <span 
                              key={i} 
                              className="px-3 py-1.5 bg-purple-500/10 text-purple-300 text-sm rounded-lg border border-purple-500/20"
                            >
                              {typeof item === 'object' ? item.name || item.title || JSON.stringify(item) : item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-6 bg-slate-800/50 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">Profile Active</span>
                      </div>
                      <span className="text-sm text-slate-500">
                        AI will use this for personalized responses
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 flex items-center justify-center p-8"
                >
                  <div className="text-center max-w-sm">
                    <div className="w-24 h-24 mx-auto mb-6 bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-700/50">
                      <User className="w-12 h-12 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      No Profile Yet
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Upload your resume to create a personalized profile. The AI will analyze 
                      your experience and skills to provide tailored interview responses.
                    </p>
                    <div className="space-y-3 text-left">
                      {[
                        'Extract skills and technologies',
                        'Identify key achievements',
                        'Map career progression',
                        'Generate personalized answers'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-slate-400">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;
