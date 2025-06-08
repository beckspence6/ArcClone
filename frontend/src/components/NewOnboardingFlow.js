import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  Building2,
  BarChart3,
  Shield,
  Zap,
  Chrome,
  ChevronLeft,
  Search,
  MapPin,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import StratumLogo from './Logo';
import FMPService from '../services/FMPService';
import toast from 'react-hot-toast';

const NewOnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: '',
    ticker: '',
    selectedCompany: null,
    role: 'analyst',
    industry: '',
    notifications: true,
    marketUpdates: false,
    isPrivateCompany: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companySearchResults, setCompanySearchResults] = useState([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [searchingCompanies, setSearchingCompanies] = useState(false);

  // Real-time company search using FMP API
  const searchCompanies = async (query) => {
    if (!query || query.length < 2) {
      setCompanySearchResults([]);
      setShowCompanyDropdown(false);
      return;
    }

    try {
      setSearchingCompanies(true);
      console.log(`[OnboardingFlow] Searching for companies: ${query}`);
      
      // Use FMP search API for real company data
      const results = await FMPService.searchCompanies(query, 10);
      
      if (results && Array.isArray(results)) {
        const formattedResults = results.map(company => ({
          symbol: company.symbol,
          name: company.name,
          industry: company.industry || 'N/A',
          sector: company.sector || 'N/A',
          exchangeShortName: company.exchangeShortName || 'N/A',
          currency: company.currency || 'USD',
          isEtf: company.isEtf || false
        }));
        
        setCompanySearchResults(formattedResults);
        setShowCompanyDropdown(true);
        console.log(`[OnboardingFlow] Found ${formattedResults.length} companies`);
      } else {
        setCompanySearchResults([]);
        setShowCompanyDropdown(false);
      }
    } catch (error) {
      console.error('[OnboardingFlow] Company search error:', error);
      setCompanySearchResults([]);
      setShowCompanyDropdown(false);
      toast.error('Error searching companies. Please try again.');
    } finally {
      setSearchingCompanies(false);
    }
  };
  const companyDatabase = [
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      industry: 'Technology', 
      sector: 'Consumer Electronics',
      location: 'Cupertino, CA',
      founded: 1976,
      marketCap: '$2.8T'
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corporation', 
      industry: 'Technology', 
      sector: 'Software',
      location: 'Redmond, WA',
      founded: 1975,
      marketCap: '$2.4T'
    },
    { 
      symbol: 'GOOGL', 
      name: 'Alphabet Inc.', 
      industry: 'Technology', 
      sector: 'Internet Services',
      location: 'Mountain View, CA',
      founded: 1998,
      marketCap: '$1.7T'
    },
    { 
      symbol: 'AMZN', 
      name: 'Amazon.com Inc.', 
      industry: 'E-commerce', 
      sector: 'Consumer Discretionary',
      location: 'Seattle, WA',
      founded: 1994,
      marketCap: '$1.5T'
    },
    { 
      symbol: 'TSLA', 
      name: 'Tesla Inc.', 
      industry: 'Automotive', 
      sector: 'Electric Vehicles',
      location: 'Austin, TX',
      founded: 2003,
      marketCap: '$800B'
    },
    { 
      symbol: 'META', 
      name: 'Meta Platforms Inc.', 
      industry: 'Technology', 
      sector: 'Social Media',
      location: 'Menlo Park, CA',
      founded: 2004,
      marketCap: '$750B'
    },
    { 
      symbol: 'NFLX', 
      name: 'Netflix Inc.', 
      industry: 'Entertainment', 
      sector: 'Streaming Services',
      location: 'Los Gatos, CA',
      founded: 1997,
      marketCap: '$180B'
    },
    { 
      symbol: 'NVDA', 
      name: 'NVIDIA Corporation', 
      industry: 'Technology', 
      sector: 'Semiconductors',
      location: 'Santa Clara, CA',
      founded: 1993,
      marketCap: '$1.2T'
    }
  ];

  const handleCompanySearch = (searchTerm) => {
    setFormData(prev => ({ ...prev, company: searchTerm }));
    
    if (searchTerm.length >= 2) {
      const results = companyDatabase.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6);
      
      setCompanySearchResults(results);
      setShowCompanyDropdown(true);
    } else {
      setCompanySearchResults([]);
      setShowCompanyDropdown(false);
    }
  };

  const handleCompanySelect = (company) => {
    setFormData(prev => ({ 
      ...prev, 
      company: company.name,
      selectedCompany: company,
      industry: company.industry
    }));
    setShowCompanyDropdown(false);
    setCompanySearchResults([]);
  };

  const steps = [
    { id: 'welcome', title: 'Welcome to Stratum' },
    { id: 'account', title: 'Create Your Account' },
    { id: 'company', title: 'Select Target Company' },
    { id: 'preferences', title: 'Quick Setup' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Simulate account creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        id: Date.now(),
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        role: formData.role,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face`,
        preferences: {
          notifications: formData.notifications,
          marketUpdates: formData.marketUpdates
        },
        createdAt: new Date().toISOString()
      };
      
      toast.success('Account created successfully!');
      onComplete(userData);
      
    } catch (error) {
      toast.error('Failed to create account');
      console.error('Account creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    toast.success('Google OAuth integration coming soon!');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.password && formData.firstName && formData.lastName;
      case 2:
        return formData.isPrivateCompany || formData.selectedCompany;
      default:
        return true;
    }
  };

  const renderWelcomeStep = () => (
    <motion.div
      className="text-center space-y-8 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="space-y-6">
        <StratumLogo size="xl" className="justify-center" />
        <div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Professional Distressed
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Credit Analysis
            </span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Advanced AI-powered platform for institutional investors analyzing 
            distressed debt opportunities and restructuring scenarios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Multi-Company Portfolio</h3>
          <p className="text-gray-300 text-sm">
            Manage multiple distressed credit targets with dedicated dashboards and analysis for each.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sophisticated Analytics</h3>
          <p className="text-gray-300 text-sm">
            Maturity walls, covenant analysis, liquidity runways, and waterfall modeling.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Enterprise Security</h3>
          <p className="text-gray-300 text-sm">
            Bank-grade security with SOC 2 compliance and complete data ownership.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Speed</h3>
          <p className="text-gray-300 text-sm">
            Transform weeks of analysis into minutes with specialized financial AI agents.
          </p>
        </div>
      </div>

      <motion.button
        onClick={handleNext}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-3 mx-auto shadow-2xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-lg font-semibold">Get Started</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );

  const renderAccountStep = () => (
    <motion.div
      className="space-y-8 max-w-md mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Create Your Account</h2>
        <p className="text-gray-300">Join the future of distressed credit analysis</p>
      </div>

      <div className="space-y-6">
        {/* Google OAuth Button */}
        <motion.button
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all border border-gray-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Chrome className="w-5 h-5" />
          <span className="font-semibold">Continue with Google</span>
        </motion.button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-900 text-gray-400">or create with email</span>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-lg"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-lg"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-lg"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-lg"
              placeholder="Create a secure password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Company Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">Company to Analyze</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleCompanySearch(e.target.value)}
              onFocus={() => {
                if (companySearchResults.length > 0) setShowCompanyDropdown(true);
              }}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-lg"
              placeholder="Search for a company (e.g., Apple, AAPL, Tesla)"
            />
          </div>

          {/* Company Search Dropdown */}
          <AnimatePresence>
            {showCompanyDropdown && companySearchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg rounded-xl border border-white/20 z-50 max-h-64 overflow-y-auto"
              >
                {companySearchResults.map((company, index) => (
                  <motion.button
                    key={company.symbol}
                    onClick={() => handleCompanySelect(company)}
                    className="w-full p-4 text-left hover:bg-blue-50/50 transition-colors border-b border-gray-200/20 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{company.symbol}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{company.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{company.industry}</span>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{company.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{company.marketCap}</p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Founded {company.founded}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-lg"
          >
            <option value="analyst" className="bg-gray-800">Credit Analyst</option>
            <option value="portfolio_manager" className="bg-gray-800">Portfolio Manager</option>
            <option value="principal" className="bg-gray-800">Principal</option>
            <option value="managing_director" className="bg-gray-800">Managing Director</option>
            <option value="other" className="bg-gray-800">Other</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderPreferencesStep = () => (
    <motion.div
      className="space-y-8 max-w-md mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Quick Setup</h2>
        <p className="text-gray-300">Customize your experience (you can change these later)</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Email Notifications</h3>
              <p className="text-gray-300 text-sm">Get notified about analysis completions and alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Market Updates</h3>
              <p className="text-gray-300 text-sm">Weekly distressed debt market insights and trends</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.marketUpdates}
                onChange={(e) => setFormData({ ...formData, marketUpdates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">You're All Set!</h3>
              <p className="text-blue-200 text-sm">
                Your account will be created and you'll be taken to your portfolio dashboard 
                where you can start adding companies to analyze.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Progress Bar */}
        {currentStep > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${index <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/20 text-gray-400'
                    }
                  `}>
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index !== steps.length - 1 && (
                    <div className={`
                      flex-1 h-1 mx-4
                      ${index < currentStep ? 'bg-blue-600' : 'bg-white/20'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">{steps[currentStep].title}</h2>
            </div>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && renderWelcomeStep()}
            {currentStep === 1 && renderAccountStep()}
            {currentStep === 2 && renderPreferencesStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep > 0 && (
          <div className="flex items-center justify-between mt-12">
            <motion.button
              onClick={handlePrevious}
              className="flex items-center space-x-2 px-6 py-3 text-gray-300 hover:text-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </motion.button>

            <motion.button
              onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
              disabled={!canProceed() || isLoading}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={{ scale: canProceed() && !isLoading ? 1.02 : 1 }}
              whileTap={{ scale: canProceed() && !isLoading ? 0.98 : 1 }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === steps.length - 1 ? 'Create Account' : 'Continue'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOnboardingFlow;