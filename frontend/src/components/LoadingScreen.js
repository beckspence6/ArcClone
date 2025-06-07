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
  Loader2,
  Building2,
  DollarSign,
  Shield,
  Target,
  Calculator,
  AlertTriangle
} from 'lucide-react';
import StratumLogo from './Logo';

const LoadingScreen = ({ progress = 0, message = "Initializing AI agents..." }) => {
  const [currentAgent, setCurrentAgent] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState([]);
  const [agentActivities, setAgentActivities] = useState({});

  const agents = [
    { 
      name: 'Coordinator Agent', 
      icon: Brain, 
      color: 'from-indigo-500 to-indigo-600',
      description: 'Orchestrating comprehensive distressed credit analysis...',
      tasks: [
        'Parsing uploaded documents',
        'Coordinating agent workflows',
        'Quality checking analysis',
        'Synthesizing final results'
      ]
    },
    { 
      name: 'Document Processor', 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      description: 'Processing SEC filings, credit agreements, and financial documents...',
      tasks: [
        'Extracting text from PDFs',
        'Classifying document types',
        'Parsing financial statements',
        'Identifying key sections'
      ]
    },
    { 
      name: 'Financial Analyst', 
      icon: BarChart3, 
      color: 'from-green-500 to-green-600',
      description: 'Building capital structure and calculating financial ratios...',
      tasks: [
        'Parsing debt instruments',
        'Building maturity wall',
        'Calculating liquidity metrics',
        'Analyzing covenant terms'
      ]
    },
    { 
      name: 'Research Agent', 
      icon: Search, 
      color: 'from-purple-500 to-purple-600',
      description: 'Gathering market data and mapping debt structure...',
      tasks: [
        'Fetching market data',
        'Analyzing peer companies',
        'Research industry trends',
        'Benchmarking performance'
      ]
    },
    { 
      name: 'Insights Agent', 
      icon: TrendingUp, 
      color: 'from-orange-500 to-orange-600',
      description: 'Generating distress signals and investment recommendations...',
      tasks: [
        'Identifying risk factors',
        'Calculating distress scores',
        'Generating recommendations',
        'Creating executive summary'
      ]
    }
  ];

  const progressSteps = [
    { label: 'Initializing AI systems', progress: 0, icon: Zap },
    { label: 'Processing documents', progress: 20, icon: FileText },
    { label: 'Analyzing capital structure', progress: 40, icon: Building2 },
    { label: 'Calculating financial metrics', progress: 60, icon: Calculator },
    { label: 'Assessing distress signals', progress: 80, icon: AlertTriangle },
    { label: 'Generating insights', progress: 95, icon: Target },
    { label: 'Finalizing dashboard', progress: 100, icon: CheckCircle }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAgent(prev => (prev + 1) % agents.length);
    }, 3000);

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

  // Simulate agent activities
  useEffect(() => {
    const currentAgentData = agents[currentAgent];
    const interval = setInterval(() => {
      setAgentActivities(prev => ({
        ...prev,
        [currentAgent]: {
          currentTask: Math.floor(Math.random() * currentAgentData.tasks.length),
          progress: Math.min(progress + Math.random() * 10, 100)
        }
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentAgent, progress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
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

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <StratumLogo size="xl" className="justify-center mb-8" />
          <h1 className="text-5xl font-bold text-white mb-6">
            Distressed Credit Analysis
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              In Progress
            </span>
          </h1>
          <p className="text-2xl text-blue-200">{message}</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Agent Showcase */}
          <div className="xl:col-span-2 space-y-8">
            {/* Progress Circle */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                    fill="none"
                  />
                  {/* Progress Circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="url(#progressGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                      strokeDasharray: "219.9",
                      strokeDashoffset: `${219.9 * (1 - progress / 100)}`
                    }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Progress Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white">{Math.round(progress)}%</span>
                    <p className="text-blue-200 text-sm">Complete</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Agent Display */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
              key={currentAgent}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-6">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${agents[currentAgent].color} flex items-center justify-center mr-6`}>
                  {React.createElement(agents[currentAgent].icon, { 
                    className: "w-10 h-10 text-white" 
                  })}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white mb-2">{agents[currentAgent].name}</h3>
                  <p className="text-blue-200 text-lg">{agents[currentAgent].description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                  <span className="text-blue-400 font-semibold">Active</span>
                </div>
              </div>

              {/* Agent Tasks */}
              <div className="grid grid-cols-2 gap-4">
                {agents[currentAgent].tasks.map((task, index) => {
                  const isCurrentTask = agentActivities[currentAgent]?.currentTask === index;
                  const taskProgress = agentActivities[currentAgent]?.progress || 0;
                  
                  return (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-xl border ${
                        isCurrentTask 
                          ? 'bg-blue-500/20 border-blue-500/40' 
                          : 'bg-white/5 border-white/10'
                      } transition-all`}
                      animate={{
                        scale: isCurrentTask ? 1.02 : 1,
                        borderColor: isCurrentTask ? '#3B82F6' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          isCurrentTask ? 'text-blue-300' : 'text-gray-300'
                        }`}>
                          {task}
                        </span>
                        {isCurrentTask && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        )}
                      </div>
                      {isCurrentTask && (
                        <div className="mt-2 w-full bg-blue-900/50 rounded-full h-1">
                          <motion.div 
                            className="bg-blue-400 h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(taskProgress, 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Progress Steps Sidebar */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-blue-400" />
              Analysis Pipeline
            </h3>
            
            {loadingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  className={`flex items-center p-4 rounded-xl transition-all ${
                    step.completed 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : step.active 
                        ? 'bg-blue-500/20 border-blue-500/30' 
                        : 'bg-white/5 border-white/10'
                  } border`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                    step.completed 
                      ? 'bg-green-500' 
                      : step.active 
                        ? 'bg-blue-500' 
                        : 'bg-gray-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : step.active ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <span className={`font-medium ${
                      step.completed ? 'text-green-400' : step.active ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {step.completed ? 'Complete' : step.active ? 'Processing...' : 'Queued'}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-sm font-bold ${
                      step.completed ? 'text-green-400' : step.active ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      {step.progress}%
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Agent Overview */}
            <div className="mt-8 p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                AI Agent Status
              </h4>
              <div className="space-y-3">
                {agents.map((agent, index) => {
                  const Icon = agent.icon;
                  const isActive = index === currentAgent;
                  const isCompleted = index < currentAgent;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-2 rounded-lg ${
                        isActive ? 'bg-blue-500/20' : isCompleted ? 'bg-green-500/20' : 'bg-white/5'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-blue-500' : isCompleted ? 'bg-green-500' : 'bg-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : isActive ? (
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                          <Icon className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        isActive ? 'text-blue-300' : isCompleted ? 'text-green-300' : 'text-gray-400'
                      }`}>
                        {agent.name}
                      </span>
                      {isActive && (
                        <div className="ml-auto flex items-center space-x-1">
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" />
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Message */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <p className="text-blue-200 mb-6 text-lg">
            Building your personalized distressed credit analysis dashboard...
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-blue-300">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Capital Structure</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Maturity Wall</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Distress Signals</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Investment Thesis</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;