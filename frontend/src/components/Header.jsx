import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Wifi, WifiOff, Github } from 'lucide-react';

function Header({ isConnected }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-night-900/80 backdrop-blur-xl border-b border-night-700 z-50">
      <div className="max-w-screen-2xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-parakeet-400 to-parakeet-600 rounded-xl flex items-center justify-center relative">
            <span className="text-white font-black text-xl">C</span>
            <Zap size={12} className="absolute -top-1 -right-1 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-parakeet-400">Crack</span>
              <span className="text-white"> with </span>
              <span className="text-yellow-400">Adnan</span>
            </h1>
            <p className="text-xs text-night-400">Interview Assistant</p>
          </div>
        </motion.div>

        {/* Right side */}
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isConnected ? 'bg-parakeet-500/20 text-parakeet-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isConnected ? (
              <>
                <Wifi size={16} />
                <span className="text-sm font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={16} />
                <span className="text-sm font-medium">Disconnected</span>
              </>
            )}
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-night-800 border border-night-600 flex items-center justify-center text-night-400 hover:text-white hover:border-parakeet-500/50 transition-all duration-300"
          >
            <Github size={20} />
          </a>
        </motion.div>
      </div>
    </header>
  );
}

export default Header;
