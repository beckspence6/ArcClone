import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Import components
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DataRoom from './components/DataRoom';
import Reports from './components/Reports';
import Chat from './components/Chat';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';
import OnboardingFlow from './components/OnboardingFlow';

// Import services
import GeminiService from './services/geminiService';
import AlphaVantageService from './services/alphaVantageService';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Initialize user session
  useEffect(() => {
    const savedUser = localStorage.getItem('stratum_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
    }
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('stratum_user', JSON.stringify(user));
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('onboarding');
  };

  const handleLogout = () => {
    setUser(null);
    setCompanyData(null);
    localStorage.removeItem('stratum_user');
    localStorage.removeItem('stratum_company');
    setCurrentView('landing');
  };

  const handleCompanySetup = async (files, companyInfo) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Simulate analysis progress
      const progressSteps = [
        { progress: 20, message: "Processing uploaded documents..." },
        { progress: 40, message: "Extracting financial data..." },
        { progress: 60, message: "Analyzing company metrics..." },
        { progress: 80, message: "Generating insights..." },
        { progress: 100, message: "Analysis complete!" }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAnalysisProgress(step.progress);
      }

      // Process files and analyze company
      let analysisResult = null;
      
      if (files && files.length > 0) {
        // Read first file for analysis
        const file = files[0];
        const text = await readFileAsText(file);
        
        // Detect company from document
        const companyDetection = await GeminiService.detectCompanyFromText(text);
        
        // Get full analysis
        analysisResult = await GeminiService.analyzeDocument(text, file.name);
        
        // If it's a public company, get real-time data
        if (companyDetection.ticker) {
          const stockData = await AlphaVantageService.getStockPrice(companyDetection.ticker);
          const overview = await AlphaVantageService.getCompanyOverview(companyDetection.ticker);
          
          if (overview) {
            analysisResult.realTimeData = {
              stockPrice: stockData,
              overview: overview,
              isPublic: true
            };
          }
        }
      } else if (companyInfo.companyName) {
        // Search for company if no files uploaded
        const searchResults = await AlphaVantageService.searchSymbol(companyInfo.companyName);
        if (searchResults.length > 0) {
          const symbol = searchResults[0].symbol;
          const overview = await AlphaVantageService.getCompanyOverview(symbol);
          const stockData = await AlphaVantageService.getStockPrice(symbol);
          
          analysisResult = {
            company: {
              name: overview.name,
              industry: overview.industry,
              sector: overview.sector,
              description: overview.description
            },
            financials: {
              revenue: AlphaVantageService.formatCurrency(overview.revenueTTM),
              grossMargin: AlphaVantageService.formatPercent(overview.profitMargin),
              netIncome: AlphaVantageService.formatCurrency(overview.grossProfitTTM),
              totalAssets: "N/A",
              totalDebt: "N/A",
              cashAndEquivalents: "N/A"
            },
            realTimeData: {
              stockPrice: stockData,
              overview: overview,
              isPublic: true
            },
            confidence: 0.95
          };
        }
      }

      if (analysisResult) {
        setCompanyData(analysisResult);
        localStorage.setItem('stratum_company', JSON.stringify(analysisResult));
      }

      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error during company setup:', error);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const renderCurrentView = () => {
    if (isAnalyzing) {
      return (
        <LoadingScreen 
          progress={analysisProgress}
          message="Analyzing your company data..."
        />
      );
    }

    switch (currentView) {
      case 'landing':
        return <LandingPage onLogin={handleLogin} />;
      case 'onboarding':
        return <OnboardingFlow onComplete={handleCompanySetup} user={user} />;
      case 'dashboard':
        return <Dashboard companyData={companyData} />;
      case 'dataroom':
        return <DataRoom companyData={companyData} onAnalyze={handleCompanySetup} />;
      case 'reports':
        return <Reports companyData={companyData} />;
      case 'chat':
        return <Chat companyData={companyData} />;
      case 'settings':
        return <Settings user={user} setUser={setUser} onLogout={handleLogout} />;
      default:
        return <LandingPage onLogin={handleLogin} />;
    }
  };

  const showSidebar = user && currentView !== 'landing' && currentView !== 'onboarding' && !isAnalyzing;

  return (
    <div className="App bg-gray-50 min-h-screen">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
          },
        }}
      />
      
      <div className="flex">
        {showSidebar && (
          <Sidebar 
            currentView={currentView} 
            setCurrentView={setCurrentView}
            user={user}
            companyData={companyData}
            onLogout={handleLogout}
          />
        )}
        
        <main className={`${showSidebar ? 'flex-1' : 'w-full'} overflow-hidden`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="h-screen overflow-y-auto"
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;