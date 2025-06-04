import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-600 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="8" 
                strokeDasharray="70 30"
                className="opacity-20"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="35" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="6" 
                strokeDasharray="50 50"
                className="opacity-40"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="25" 
                fill="currentColor" 
                className="opacity-60"
              />
            </svg>
          </div>
        </motion.div>
        
        <motion.h1
          className="text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          arc
        </motion.h1>
        
        <motion.p
          className="text-xl text-blue-100 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Intelligence
        </motion.p>
        
        <motion.div
          className="flex items-center justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </motion.div>
        
        <motion.p
          className="text-sm text-blue-200 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Initializing AI agents...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;