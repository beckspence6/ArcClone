import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Import components
import LandingPage from './components/LandingPage';
import NewOnboardingFlow from './components/NewOnboardingFlow';
import CompanyManagement from './components/CompanyManagement';
import AddNewCompany from './components/AddNewCompany';
import Dashboard from './components/Dashboard';
import DataRoom from './components/DataRoom';
import Reports from './components/Reports';
import Chat from './components/Chat';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';

// Import services
import AgentCoordinator from './services/agentCoordinator';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Initialize app state
  useEffect(() => {
    const savedUser = localStorage.getItem('stratum_user');
    const savedCompanies = localStorage.getItem('stratum_companies');
    const savedCurrentCompany = localStorage.getItem('stratum_current_company');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Only redirect if user has completed onboarding AND has companies
      if (userData.onboardingComplete && savedCompanies && JSON.parse(savedCompanies).length > 0) {
        setCurrentView('company-management');
      } else if (userData.onboardingComplete) {
        setCurrentView('company-management'); 
      } else {
        // User exists but hasn't completed onboarding, stay on landing
        setCurrentView('landing');
      }
    } else {
      // No user, always show landing page
      setCurrentView('landing');
    }
    
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }

    if (savedCurrentCompany) {
      setCurrentCompany(JSON.parse(savedCurrentCompany));
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('stratum_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('stratum_companies', JSON.stringify(companies));
  }, [companies]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = (userData) => {
    const completedUser = { ...userData, onboardingComplete: true };
    setUser(completedUser);
    setCurrentView('company-management');
  };

  const handleLogout = () => {
    setUser(null);
    setCompanies([]);
    setCurrentCompany(null);
    localStorage.removeItem('stratum_user');
    localStorage.removeItem('stratum_companies');
    localStorage.removeItem('stratum_current_company');
    setCurrentView('landing');
  };

  const handleCreateNewCompany = () => {
    setCurrentView('add-company');
  };

  const handleSelectCompany = (company) => {
    setCurrentCompany(company);
    localStorage.setItem('stratum_current_company', JSON.stringify(company));
    setCurrentView('dashboard');
  };

  const handleCompanyCreated = async (companyData) => {
    // Add company to list
    const newCompany = {
      ...companyData,
      status: 'analyzing',
      lastUpdated: new Date().toISOString()
    };
    
    setCompanies(prev => [newCompany, ...prev]);
    setCurrentCompany(newCompany);
    
    // Start analysis loading screen
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentView('dashboard-loading');

    try {
      // Process files with AI agents
      const files = companyData.files.map(f => f.file);
      
      const analysisResult = await AgentCoordinator.analyzeCompany(
        files,
        { companyName: companyData.name },
        (progress, message, agent) => {
          setAnalysisProgress(progress);
        }
      );

      // Update company with analysis results
      const analyzedCompany = {
        ...newCompany,
        status: 'completed',
        analysisData: analysisResult,
        lastAnalyzed: new Date().toISOString(),
        totalDebt: analysisResult?.financials?.totalDebt || 'N/A',
        liquidity: analysisResult?.financials?.cashAndEquivalents || 'N/A',
        nextMaturity: '2025', // Would be extracted from analysis
        riskFlags: analysisResult?.insights?.riskFactors?.slice(0, 3) || []
      };

      setCompanies(prev => prev.map(c => 
        c.id === newCompany.id ? analyzedCompany : c
      ));
      setCurrentCompany(analyzedCompany);
      
      // Navigate to dashboard
      setCurrentView('dashboard');
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Update company status to error
      setCompanies(prev => prev.map(c => 
        c.id === newCompany.id 
          ? { ...c, status: 'error', error: error.message }
          : c
      ));
      
      setCurrentView('company-management');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const handleDeleteCompany = (companyId) => {
    setCompanies(prev => prev.filter(c => c.id !== companyId));
    if (currentCompany?.id === companyId) {
      setCurrentCompany(null);
      setCurrentView('company-management');
    }
  };

  const renderCurrentView = () => {
    if (isAnalyzing || currentView === 'dashboard-loading') {
      return (
        <LoadingScreen 
          progress={analysisProgress}
          message="AI agents are analyzing your company data..."
        />
      );
    }

    switch (currentView) {
      case 'landing':
        return <LandingPage onLogin={handleLogin} />;
        
      case 'onboarding':
        return <NewOnboardingFlow onComplete={handleOnboardingComplete} />;
        
      case 'company-management':
        return (
          <CompanyManagement 
            companies={companies}
            onSelectCompany={handleSelectCompany}
            onCreateNew={handleCreateNewCompany}
            onDeleteCompany={handleDeleteCompany}
          />
        );
        
      case 'add-company':
        return (
          <AddNewCompany 
            onComplete={handleCompanyCreated}
            onCancel={() => setCurrentView('company-management')}
          />
        );
        
      case 'dashboard':
        return <Dashboard companyData={currentCompany?.analysisData} />;
        
      case 'dataroom':
        return <DataRoom companyData={currentCompany?.analysisData} />;
        
      case 'reports':
        return <Reports companyData={currentCompany?.analysisData} />;
        
      case 'chat':
        return <Chat companyData={currentCompany?.analysisData} />;
        
      case 'settings':
        return <Settings user={user} setUser={setUser} onLogout={handleLogout} />;
        
      default:
        return <LandingPage onLogin={handleLogin} />;
    }
  };

  const showSidebar = user && 
    currentView !== 'landing' && 
    currentView !== 'onboarding' && 
    currentView !== 'company-management' && 
    currentView !== 'add-company' &&
    currentView !== 'dashboard-loading' &&
    !isAnalyzing;

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
            companyData={currentCompany}
            onLogout={handleLogout}
            onBackToCompanies={() => setCurrentView('company-management')}
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