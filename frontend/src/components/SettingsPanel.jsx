import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Settings, User, Bell, Shield, Palette, Globe, Volume2,
  Moon, Sun, Monitor, Check, ChevronRight, Zap, Brain,
  Save, RefreshCw, Trash2, Download, Upload, Lock, Key
} from 'lucide-react';

function SettingsPanel() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'en',
    autoAnswer: true,
    autoDelay: 2,
    soundEnabled: true,
    notifications: true,
    aiModel: 'advanced',
    responseLength: 'medium',
    saveHistory: true
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Setting updated', { icon: '⚙️' });
  };

  const SettingSection = ({ icon: Icon, title, description, children }) => (
    <div className="p-6 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 mb-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors relative ${
          enabled ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' : 'bg-slate-700'
        }`}
      >
        <motion.div 
          animate={{ x: enabled ? 24 : 2 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
  );

  const RadioGroup = ({ options, value, onChange, label }) => (
    <div className="py-3">
      <span className="text-slate-300 mb-3 block">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              value === option.value
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-slate-500/10 to-zinc-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/10 border border-slate-500/20 rounded-full text-slate-300 text-sm font-medium mb-6">
            <Settings className="w-4 h-4" />
            Configuration
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">Settings</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Customize NEXUS AI to match your preferences and workflow
          </p>
        </motion.div>

        {/* AI Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SettingSection
            icon={Brain}
            title="AI Configuration"
            description="Configure AI behavior and response settings"
          >
            <Toggle
              label="Auto-generate answers"
              enabled={settings.autoAnswer}
              onChange={(v) => updateSetting('autoAnswer', v)}
            />
            
            {settings.autoAnswer && (
              <RadioGroup
                label="Auto-trigger delay"
                value={settings.autoDelay}
                onChange={(v) => updateSetting('autoDelay', v)}
                options={[
                  { value: 1, label: '1 second' },
                  { value: 2, label: '2 seconds' },
                  { value: 3, label: '3 seconds' },
                  { value: 4, label: '4 seconds' },
                ]}
              />
            )}

            <RadioGroup
              label="AI Model"
              value={settings.aiModel}
              onChange={(v) => updateSetting('aiModel', v)}
              options={[
                { value: 'fast', label: '⚡ Fast' },
                { value: 'balanced', label: '⚖️ Balanced' },
                { value: 'advanced', label: '🧠 Advanced' },
              ]}
            />

            <RadioGroup
              label="Response Length"
              value={settings.responseLength}
              onChange={(v) => updateSetting('responseLength', v)}
              options={[
                { value: 'concise', label: 'Concise' },
                { value: 'medium', label: 'Medium' },
                { value: 'detailed', label: 'Detailed' },
              ]}
            />
          </SettingSection>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SettingSection
            icon={Palette}
            title="Appearance"
            description="Customize the look and feel"
          >
            <RadioGroup
              label="Theme"
              value={settings.theme}
              onChange={(v) => updateSetting('theme', v)}
              options={[
                { value: 'dark', label: '🌙 Dark' },
                { value: 'light', label: '☀️ Light' },
                { value: 'system', label: '💻 System' },
              ]}
            />
          </SettingSection>
        </motion.div>

        {/* Audio & Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SettingSection
            icon={Bell}
            title="Notifications & Sound"
            description="Control alerts and audio feedback"
          >
            <Toggle
              label="Sound effects"
              enabled={settings.soundEnabled}
              onChange={(v) => updateSetting('soundEnabled', v)}
            />
            <Toggle
              label="Desktop notifications"
              enabled={settings.notifications}
              onChange={(v) => updateSetting('notifications', v)}
            />
          </SettingSection>
        </motion.div>

        {/* Privacy & Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SettingSection
            icon={Shield}
            title="Privacy & Data"
            description="Manage your data and privacy settings"
          >
            <Toggle
              label="Save interview history locally"
              enabled={settings.saveHistory}
              onChange={(v) => updateSetting('saveHistory', v)}
            />
            
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  localStorage.clear();
                  toast.success('All data cleared');
                }}
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const data = JSON.stringify(localStorage);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'nexus-backup.json';
                  a.click();
                  toast.success('Data exported');
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Data
              </motion.button>
            </div>
          </SettingSection>
        </motion.div>

        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SettingSection
            icon={Globe}
            title="Language & Region"
            description="Set your preferred language"
          >
            <RadioGroup
              label="Interface Language"
              value={settings.language}
              onChange={(v) => updateSetting('language', v)}
              options={[
                { value: 'en', label: '🇺🇸 English' },
                { value: 'es', label: '🇪🇸 Español' },
                { value: 'fr', label: '🇫🇷 Français' },
                { value: 'de', label: '🇩🇪 Deutsch' },
                { value: 'zh', label: '🇨🇳 中文' },
              ]}
            />
          </SettingSection>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 rounded-2xl border border-cyan-500/20 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center border border-slate-700/50">
            <img src="/logo.svg" alt="NEXUS" className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">NEXUS AI</h3>
          <p className="text-sm text-slate-400 mb-2">Enterprise Interview Intelligence Platform</p>
          <p className="text-xs text-slate-500">Version 2.0.0 • Built with ❤️</p>
        </motion.div>
      </div>
    </div>
  );
}

export default SettingsPanel;
