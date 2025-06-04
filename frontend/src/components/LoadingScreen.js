import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Search, 
  Zap,
  CheckCircle,
  Loader2
} from 'lucide-react';
import StratumLogo from './Logo';

const LoadingScreen = ({ progress = 0, message = "Initializing AI agents..." }) => {
  const [currentAgent, setCurrentAgent] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState([]);

  const agents = [
    { 
      name: 'Document Processing Agent', 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      description: 'Analyzing uploaded documents and extracting key data points...'
    },
    { 
      name: 'Financial Analysis Agent', 
      icon: BarChart3, 
      color: 'from-green-500 to-green-600',
      description: 'Calculating financial ratios and performance metrics...'
    },
    { 
      name: 'Research Agent', 
      icon: Search, 
      color: 'from-purple-500 to-purple-600',
      description: 'Gathering market data and industry benchmarks...'
    },
    { 
      name: 'Insights Agent', 
      icon: TrendingUp, 
      color: 'from-orange-500 to-orange-600',
      description: 'Generating investment insights and recommendations...'
    },
    { 
      name: 'Coordinator Agent', 
      icon: Brain, 
      color: 'from-indigo-500 to-indigo-600',
      description: 'Synthesizing analysis and preparing your dashboard...'
    }
  ];

  const progressSteps = [
    { label: 'Initializing AI systems', progress: 0 },
    { label: 'Processing documents', progress: 20 },
    { label: 'Extracting financial data', progress: 40 },
    { label: 'Analyzing metrics', progress: 60 },
    { label: 'Generating insights', progress: 80 },
    { label: 'Finalizing dashboard', progress: 100 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAgent(prev => (prev + 1) % agents.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentStep = progressSteps.find(step => progress <= step.progress) || progressSteps[progressSteps.length - 1];
    setLoadingSteps(progressSteps.map(step => ({
      ...step,
      completed: progress >= step.progress,
      active: step.label === currentStep.label
    })));
  }, [progress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo */}
        <motion.div
          className="mb-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <StratumLogo size="xl" className="justify-center mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">AI Analysis in Progress</h1>
          <p className="text-xl text-blue-200">{message}</p>
        </motion.div>

        {/* Progress Circle */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                  strokeDasharray: "251.2",
                  strokeDashoffset: `${251.2 * (1 - progress / 100)}`
                }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            {/* Progress Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Active Agent */}
        <motion.div
          className="mb-12"
          key={currentAgent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center mb-6">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agents[currentAgent].color} flex items-center justify-center`}>
                {React.createElement(agents[currentAgent].icon, { 
                  className: "w-8 h-8 text-white" 
                })}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{agents[currentAgent].name}</h3>
            <p className="text-blue-200">{agents[currentAgent].description}</p>
            
            {/* Agent Status Indicator */}
            <div className="flex items-center justify-center mt-4 space-x-2">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-blue-400 font-medium">Processing...</span>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                step.completed 
                  ? 'bg-green-500/20 border-green-500/30' 
                  : step.active 
                    ? 'bg-blue-500/20 border-blue-500/30' 
                    : 'bg-white/5 border-white/10'
              } border`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500' 
                    : step.active 
                      ? 'bg-blue-500' 
                      : 'bg-gray-500'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : step.active ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  )}
                </div>
                <span className={`font-medium ${
                  step.completed ? 'text-green-400' : step.active ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              <span className={`text-sm ${
                step.completed ? 'text-green-400' : step.active ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {step.completed ? 'Complete' : step.active ? 'Processing...' : 'Pending'}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Bottom Message */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <p className="text-blue-200 mb-4">
            Our AI agents are working together to provide you with the most comprehensive analysis.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-blue-300">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Highly Accurate</span>
            </div>
          </div>
        </motion.div>

        {/* Floating Animation Elements */}
        <div className="absolute top-20 left-20">
          <motion.div
            className="w-3 h-3 bg-blue-400 rounded-full opacity-60"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="absolute top-40 right-20">
          <motion.div
            className="w-2 h-2 bg-purple-400 rounded-full opacity-60"
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="absolute bottom-40 left-40">
          <motion.div
            className="w-4 h-4 bg-teal-400 rounded-full opacity-40"
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;