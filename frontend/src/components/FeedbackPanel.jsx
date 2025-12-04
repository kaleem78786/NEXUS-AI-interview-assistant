import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Target, Award, Star, Clock,
  CheckCircle, AlertCircle, Zap, Brain, Activity, PieChart,
  ArrowUp, ArrowDown, Sparkles, Trophy, Medal, Crown
} from 'lucide-react';

// Mock data for analytics
const generateMockData = () => ({
  totalSessions: Math.floor(Math.random() * 50) + 10,
  questionsAnswered: Math.floor(Math.random() * 200) + 50,
  avgConfidence: 85 + Math.floor(Math.random() * 14),
  totalPracticeTime: Math.floor(Math.random() * 20) + 5,
  streak: Math.floor(Math.random() * 10) + 1,
  skillBreakdown: {
    'Technical': 75 + Math.floor(Math.random() * 20),
    'Behavioral': 70 + Math.floor(Math.random() * 25),
    'System Design': 65 + Math.floor(Math.random() * 30),
    'Problem Solving': 80 + Math.floor(Math.random() * 15),
    'Communication': 85 + Math.floor(Math.random() * 10),
  },
  recentPerformance: Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    score: 60 + Math.floor(Math.random() * 35),
    questions: Math.floor(Math.random() * 15) + 5,
  })),
  topicsCovered: [
    { name: 'Kubernetes', count: 12, trend: 'up' },
    { name: 'AWS', count: 10, trend: 'up' },
    { name: 'Terraform', count: 8, trend: 'stable' },
    { name: 'CI/CD', count: 7, trend: 'up' },
    { name: 'Docker', count: 6, trend: 'down' },
    { name: 'Monitoring', count: 5, trend: 'up' },
  ],
  achievements: [
    { name: 'First Session', icon: Star, unlocked: true, date: '2024-01-15' },
    { name: '10 Questions', icon: Target, unlocked: true, date: '2024-01-16' },
    { name: '50 Questions', icon: Award, unlocked: true, date: '2024-01-20' },
    { name: 'Week Streak', icon: Zap, unlocked: true, date: '2024-01-22' },
    { name: '100 Questions', icon: Trophy, unlocked: false, date: null },
    { name: 'DevOps Master', icon: Crown, unlocked: false, date: null },
  ]
});

function StatCard({ icon: Icon, label, value, subvalue, color, trend }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
      {subvalue && <p className="text-xs text-slate-500 mt-1">{subvalue}</p>}
    </motion.div>
  );
}

function SkillBar({ name, score, color }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-300 font-medium">{name}</span>
        <span className="text-sm text-slate-400">{score}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function FeedbackPanel({ profile }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setData(generateMockData());
    }, 500);
  }, []);

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-300 text-sm font-medium mb-6">
            <BarChart3 className="w-4 h-4" />
            Performance Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Progress</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Track your interview preparation journey with detailed analytics and insights
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Activity}
            label="Total Sessions"
            value={data.totalSessions}
            subvalue="Last 30 days"
            color="bg-gradient-to-br from-cyan-500 to-blue-500"
            trend={12}
          />
          <StatCard
            icon={Target}
            label="Questions Answered"
            value={data.questionsAnswered}
            subvalue="Across all categories"
            color="bg-gradient-to-br from-emerald-500 to-teal-500"
            trend={8}
          />
          <StatCard
            icon={Brain}
            label="Avg. Confidence"
            value={`${data.avgConfidence}%`}
            subvalue="AI assessment"
            color="bg-gradient-to-br from-purple-500 to-pink-500"
            trend={5}
          />
          <StatCard
            icon={Zap}
            label="Day Streak"
            value={data.streak}
            subvalue="Keep it going!"
            color="bg-gradient-to-br from-orange-500 to-red-500"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Skills Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Skill Breakdown</h3>
                <p className="text-sm text-slate-400">Your performance by category</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {Object.entries(data.skillBreakdown).slice(0, 3).map(([skill, score]) => (
                  <SkillBar 
                    key={skill} 
                    name={skill} 
                    score={score}
                    color={
                      score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                      score >= 70 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                      'bg-gradient-to-r from-amber-500 to-orange-500'
                    }
                  />
                ))}
              </div>
              <div>
                {Object.entries(data.skillBreakdown).slice(3).map(([skill, score]) => (
                  <SkillBar 
                    key={skill} 
                    name={skill} 
                    score={score}
                    color={
                      score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                      score >= 70 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                      'bg-gradient-to-r from-amber-500 to-orange-500'
                    }
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Topics Covered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Topics Covered</h3>
                <p className="text-sm text-slate-400">Most practiced areas</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {data.topicsCovered.map((topic, i) => (
                <div key={topic.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400">
                      {i + 1}
                    </span>
                    <span className="text-slate-300">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{topic.count}</span>
                    {topic.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                    {topic.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Weekly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Weekly Performance</h3>
              <p className="text-sm text-slate-400">Your progress over the last 7 days</p>
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-4 h-48">
            {data.recentPerformance.map((day, i) => (
              <div key={day.day} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-40">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${day.score}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`w-full ${
                      day.score >= 80 ? 'bg-gradient-to-t from-emerald-500 to-teal-400' :
                      day.score >= 60 ? 'bg-gradient-to-t from-cyan-500 to-blue-400' :
                      'bg-gradient-to-t from-amber-500 to-orange-400'
                    }`}
                  />
                </div>
                <span className="text-xs text-slate-400 mt-2">{day.day}</span>
                <span className="text-xs text-slate-500">{day.questions}q</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Achievements</h3>
              <p className="text-sm text-slate-400">Your milestones and badges</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.achievements.map((achievement) => (
              <motion.div
                key={achievement.name}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-xl border text-center ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30'
                    : 'bg-slate-800/50 border-slate-700/50 opacity-50'
                }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-500 to-amber-500'
                    : 'bg-slate-700'
                }`}>
                  <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <p className={`text-sm font-medium ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`}>
                  {achievement.name}
                </p>
                {achievement.date && (
                  <p className="text-xs text-slate-500 mt-1">{achievement.date}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default FeedbackPanel;
