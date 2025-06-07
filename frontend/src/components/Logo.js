import React from 'react';
import { motion } from 'framer-motion';

const StratumLogo = ({ className = "h-8 w-auto", variant = "default" }) => {
  if (variant === "icon") {
    return (
      <motion.div 
        className={`flex items-center justify-center ${className}`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          {/* Modern geometric logo with depth */}
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <defs>
              <linearGradient id="stratumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Background circle with subtle glow */}
            <circle 
              cx="20" 
              cy="20" 
              r="18" 
              fill="url(#stratumGradient)" 
              filter="url(#glow)"
              opacity="0.1"
            />
            {/* Main S shape - modern and clean */}
            <path
              d="M12 14 C12 11, 15 8, 20 8 C25 8, 28 11, 28 14 C28 17, 25 18, 20 18 C15 18, 12 21, 12 24 C12 27, 15 30, 20 30 C25 30, 28 27, 28 24"
              stroke="url(#stratumGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Accent dots for modern touch */}
            <circle cx="20" cy="8" r="1.5" fill="#3B82F6" />
            <circle cx="20" cy="30" r="1.5" fill="#8B5CF6" />
          </svg>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`flex items-center space-x-3 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Icon */}
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <defs>
            <linearGradient id="stratumMainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {/* Clean S shape */}
          <path
            d="M12 14 C12 11, 15 8, 20 8 C25 8, 28 11, 28 14 C28 17, 25 18, 20 18 C15 18, 12 21, 12 24 C12 27, 15 30, 20 30 C25 30, 28 27, 28 24"
            stroke="url(#stratumMainGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Accent dots */}
          <circle cx="20" cy="8" r="1.5" fill="#3B82F6" />
          <circle cx="20" cy="30" r="1.5" fill="#8B5CF6" />
        </svg>
      </div>
      
      {/* Wordmark */}
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Stratum
        </span>
        <span className="text-xs text-gray-500 -mt-1 tracking-wider uppercase">
          Credit Intelligence
        </span>
      </div>
    </motion.div>
  );
};

export default StratumLogo;