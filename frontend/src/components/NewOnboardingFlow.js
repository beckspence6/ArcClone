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
import SecApiService from '../services/SecApiService';
import MultiAPIService from '../services/MultiAPIService';
import AgentCoordinator from '../services/agentCoordinator';
import toast from 'react-hot-toast';

const NewOnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'analyst',
    notifications: true,
    marketUpdates: false,
    companyTicker: '',  // For SEC company mapping
    secVerified: false,  // Track SEC verification status
    companyName: '',     // Store verified company name
    verificationMethod: null // Track how company was verified
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchingCompanies, setSearchingCompanies] = useState(false);
  const [companySearchResults, setCompanySearchResults] = useState([]);
  const [secCompanyData, setSecCompanyData] = useState(null);
  const [secFilings, setSecFilings] = useState(null);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const handleCompanySelect = (company) => {
    setFormData({
      ...formData,
      company: company.name,
      companyTicker: company.symbol,
      selectedCompany: company
    });
    setShowCompanyDropdown(false);
  };

  const steps = [
    { id: 'welcome', title: 'Welcome to Stratum' },
    { id: 'account', title: 'Create Your Account' },
    { id: 'company-mapping', title: 'SEC Company Verification' },
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

  // Enhanced SEC Company Verification with FMP fallback for better UX
  const handleSECCompanyLookup = async (ticker) => {
    if (!ticker || ticker.length < 1) return;
    
    setSearchingCompanies(true);
    try {
      console.log('[Onboarding] Starting company verification for:', ticker);
      
      // Strategy 1: Try FMP first (higher rate limits, faster response)
      try {
        console.log('[Onboarding] Attempting FMP company lookup first...');
        const fmpProfile = await FMPService.getCompanyProfile(ticker.toUpperCase());
        
        if (fmpProfile && fmpProfile.length > 0) {
          const company = fmpProfile[0];
          console.log('[Onboarding] FMP verification successful:', company.companyName);
          
          // FMP success = Company is publicly traded = SEC registered
          setFormData(prev => ({
            ...prev,
            companyTicker: ticker.toUpperCase(),
            secVerified: true,
            companyName: company.companyName,
            verificationMethod: 'FMP_PRIMARY'
          }));
          
          // Try to get SEC data in background (optional, non-blocking)
          setTimeout(async () => {
            try {
              const secLookup = await SecApiService.getCompanyLookup(ticker.toUpperCase());
              if (secLookup.success) {
                setSecCompanyData(secLookup);
                console.log('[Onboarding] Background SEC data retrieved successfully');
              }
            } catch (secError) {
              console.log('[Onboarding] Background SEC lookup failed (non-critical):', secError.message);
            }
          }, 1000);
          
          toast.success(`✅ Company verified: ${company.companyName} (NYSE/NASDAQ listed)`);
          return;
        }
      } catch (fmpError) {
        console.log('[Onboarding] FMP lookup failed, trying SEC...', fmpError.message);
      }
      
      // Strategy 2: Try SEC API (as backup)
      try {
        console.log('[Onboarding] Attempting SEC company lookup...');
        const companyLookup = await SecApiService.getCompanyLookup(ticker.toUpperCase());
        
        if (companyLookup.success) {
          setSecCompanyData(companyLookup);
          
          // Also fetch core filings if SEC lookup succeeds
          const coreFilings = await SecApiService.fetchCoreFilings(ticker.toUpperCase());
          if (coreFilings.success) {
            setSecFilings(coreFilings);
          }
          
          setFormData(prev => ({
            ...prev,
            companyTicker: ticker.toUpperCase(),
            secVerified: true,
            companyName: companyLookup.companyData?.mapping?.name || companyLookup.companyData?.entity_details?.name,
            cik: companyLookup.cik,
            verificationMethod: 'SEC_DIRECT'
          }));
          
          toast.success(`✅ SEC verification complete for ${companyLookup.companyData?.mapping?.name || ticker}`);
          return;
        }
      } catch (secError) {
        console.log('[Onboarding] SEC lookup failed:', secError.message);
        
        if (secError.message.includes('rate limit') || secError.message.includes('429')) {
          // Rate limited - provide helpful feedback
          toast.error('SEC API temporarily rate limited. Try a different ticker or wait a moment.');
        }
      }
      
      // Strategy 3: Try basic company search as final fallback
      try {
        console.log('[Onboarding] Attempting basic company search...');
        const searchResults = await FMPService.searchCompanies(ticker);
        
        if (searchResults && searchResults.length > 0) {
          const match = searchResults.find(company => 
            company.symbol === ticker.toUpperCase()
          );
          
          if (match) {
            setFormData(prev => ({
              ...prev,
              companyTicker: ticker.toUpperCase(),
              secVerified: true,
              companyName: match.name,
              verificationMethod: 'FMP_SEARCH'
            }));
            
            toast.success(`✅ Company found: ${match.name} (Market listed)`);
            return;
          }
        }
      } catch (searchError) {
        console.log('[Onboarding] Company search failed:', searchError.message);
      }
      
      // All strategies failed
      toast.error(`Company "${ticker}" not found. Please verify the ticker symbol.`);
      setFormData(prev => ({ 
        ...prev, 
        secVerified: false,
        verificationMethod: null
      }));
      
    } catch (error) {
      console.error('[Onboarding] Company verification error:', error);
      toast.error('Company verification failed. Please try again.');
      setFormData(prev => ({ 
        ...prev, 
        secVerified: false,
        verificationMethod: null
      }));
    } finally {
      setSearchingCompanies(false);
    }
  };

  const handleCompanySearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setCompanySearchResults([]);
      return;
    }

    setSearchingCompanies(true);
    try {
      // Search using FMP for company suggestions, then verify with SEC
      const results = await FMPService.searchCompanies(searchTerm);
      if (results && results.length > 0) {
        const enhancedResults = results.slice(0, 5).map(company => ({
          ...company,
          verified: false // Will be verified when selected
        }));
        setCompanySearchResults(enhancedResults);
      }
    } catch (error) {
      console.error('[Onboarding] Company search error:', error);
      setCompanySearchResults([]);
    } finally {
      setSearchingCompanies(false);
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
        return formData.companyTicker && formData.secVerified;
      case 3:
        return true;
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
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-lg"
              placeholder="you@company.com"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 pl-10 pr-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-lg"
              placeholder="Create a strong password"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
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

  const renderCompanyStep = () => (
    <motion.div
      className="space-y-8 max-w-md mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">SEC Company Verification</h2>
        <p className="text-gray-300">Verify your company in the SEC database for accurate regulatory data</p>
      </div>

      <div className="space-y-6">
        {/* Company Ticker Input with DEBOUNCED search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Company Ticker Symbol</label>
          <div className="relative">
            <input
              type="text"
              value={formData.companyTicker}
              onChange={(e) => {
                const ticker = e.target.value.toUpperCase();
                setFormData({ ...formData, companyTicker: ticker });
                // Only trigger search when user stops typing for 500ms AND has 2+ characters
                clearTimeout(window.searchTimeout);
                if (ticker.length >= 2) {
                  window.searchTimeout = setTimeout(() => {
                    handleSECCompanyLookup(ticker);
                  }, 500);
                }
              }}
              className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-lg"
              placeholder="e.g., AAPL, TSLA, MSFT"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            {searchingCompanies && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 animate-spin" />
            )}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Enter at least 2 characters. Search will start after you stop typing.
          </p>
        </div>

        {/* SEC Verification Status */}
        {formData.companyTicker && (
          <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border ${
            formData.secVerified ? 'border-green-500/30 bg-green-500/10' : 'border-white/20'
          }`}>
            <div className="flex items-start space-x-3">
              {formData.secVerified ? (
                <Check className="w-5 h-5 text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-1 ${
                  formData.secVerified ? 'text-green-300' : 'text-yellow-300'
                }`}>
                  {formData.secVerified ? 'SEC Verification Complete' : 'Pending SEC Verification'}
                </h3>
                {formData.secVerified ? (
                  <div className="space-y-2 text-sm">
                    <p className="text-green-200">
                      ✓ Company verified and publicly traded
                    </p>
                    <p className="text-white">
                      <strong>Company:</strong> {formData.companyName || 'Unknown'}
                    </p>
                    <p className="text-gray-300">
                      <strong>Ticker:</strong> {formData.companyTicker}
                    </p>
                    {formData.verificationMethod && (
                      <p className="text-xs text-blue-300">
                        <strong>Verified via:</strong> {
                          formData.verificationMethod === 'SEC_DIRECT' ? 'SEC EDGAR Database' :
                          formData.verificationMethod === 'FMP_PRIMARY' ? 'Financial Markets API (NYSE/NASDAQ)' :
                          formData.verificationMethod === 'FMP_SEARCH' ? 'Market Search API' :
                          'Multi-source verification'
                        }
                      </p>
                    )}
                    {secCompanyData?.cik && (
                      <p className="text-gray-300">
                        <strong>SEC CIK:</strong> {secCompanyData.cik}
                      </p>
                    )}
                    {secFilings && (
                      <p className="text-gray-300">
                        <strong>Recent SEC Filings:</strong> {secFilings.totalFilings} found
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-yellow-200 text-sm">
                    Enter a valid ticker symbol to verify company registration
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SEC Data Benefits */}
        <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">SEC Data Advantages</h3>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Most accurate financial data from XBRL filings</li>
                <li>• Comprehensive covenant and debt structure analysis</li>
                <li>• Real-time subsidiary and ownership mapping</li>
                <li>• Executive compensation and insider trading data</li>
              </ul>
            </div>
          </div>
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
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
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
            {currentStep === 2 && renderCompanyStep()}
            {currentStep === 3 && renderPreferencesStep()}
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