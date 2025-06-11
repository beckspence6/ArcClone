import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  BarChart3, 
  TrendingUp,
  Zap,
  CheckCircle,
  Building2,
  Shield,
  Search,
  Database
} from 'lucide-react';
import StratumLogo from './Logo';

const LoadingScreen = ({ progress = 0, message = "Analyzing company data...", companyName = "your company" }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeAgent, setActiveAgent] = useState(null);

  // Simplified, elegant agent representation
  const agents = [
    { 
      name: 'Document Processing', 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      description: 'Extracting key financials',
      elegantColor: 'bg-blue-500'
    },
    { 
      name: 'Financial Analysis', 
      icon: BarChart3, 
      color: 'from-green-500 to-green-600',
      description: 'Building capital structure',
      elegantColor: 'bg-green-500'
    },
    { 
      name: 'Market Research', 
      icon: TrendingUp, 
      color: 'from-purple-500 to-purple-600',
      description: 'Gathering market data',
      elegantColor: 'bg-purple-500'
    },
    { 
      name: 'AI Insights', 
      icon: Brain, 
      color: 'from-orange-500 to-orange-600',
      description: 'Generating distressed credit insights',
      elegantColor: 'bg-orange-500'
    }
  ];

  // Simplified progress steps
  const progressSteps = [
    { label: `Initializing analysis for ${companyName}`, progress: 0 },
    { label: 'Processing documents', progress: 25 },
    { label: 'Analyzing financials', progress: 50 },
    { label: 'Generating insights', progress: 75 },
    { label: 'Finalizing dashboard', progress: 100 }
  ];

  useEffect(() => {
    // Determine current step based on progress
    const step = progressSteps.findIndex(step => progress <= step.progress);
    setCurrentStep(step >= 0 ? step : progressSteps.length - 1);
    
    // Set active agent based on progress
    if (progress <= 25) setActiveAgent(0);
    else if (progress <= 50) setActiveAgent(1);
    else if (progress <= 75) setActiveAgent(2);
    else setActiveAgent(3);
  }, [progress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center relative overflow-hidden">
      {/* Subtle background elements - Apple style */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Main Message - Arc Intelligence Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {progressSteps[currentStep]?.label || message}
          </h2>
          <p className="text-gray-600 text-lg">
            Our AI is conducting comprehensive distressed credit analysis
          </p>
        </motion.div>

        {/* Elegant Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {progress}% complete
          </div>
        </motion.div>

        {/* Active Agent - Minimalist Display */}
        <AnimatePresence mode="wait">
          {activeAgent !== null && (
            <motion.div
              key={activeAgent}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl ${agents[activeAgent]?.elegantColor} flex items-center justify-center`}>
                  {React.createElement(agents[activeAgent]?.icon, { 
                    className: "w-6 h-6 text-white" 
                  })}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">
                    {agents[activeAgent]?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {agents[activeAgent]?.description}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="ml-auto"
                >
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion State */}
        {progress >= 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Analysis Complete</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;