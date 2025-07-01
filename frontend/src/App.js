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
import TeamManagement from './components/TeamManagement';
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';

// Import services
import AgentCoordinator from './services/agentCoordinator';

function App() {
  // Helper methods for document data integration
  const mergeDocumentFinancials = (existingFinancials, documentsResult) => {
    if (!documentsResult?.documents) return existingFinancials;

    const documentFinancials = {};
    documentsResult.documents.forEach(doc => {
      if (doc.analysis?.financialMetrics) {
        doc.analysis.financialMetrics.forEach(metric => {
          const key = metric.metric.toLowerCase();
          documentFinancials[key] = {
            value: metric.value,
            source: `Document: ${doc.fileName}`,
            confidence: 0.8,
            extracted: true
          };
        });
      }
    });

    return {
      ...existingFinancials,
      ...documentFinancials,
      documentSources: true
    };
  };

  const mergeDocumentMetrics = (existingMetrics, documentsResult) => {
    if (!documentsResult?.documents) return existingMetrics;

    const extractedMetrics = [];
    documentsResult.documents.forEach(doc => {
      if (doc.analysis?.financialMetrics) {
        doc.analysis.financialMetrics.forEach(metric => {
          extractedMetrics.push({
            name: metric.metric,
            value: metric.value,
            source: `Document: ${doc.fileName}`,
            category: 'financial',
            extracted: true
          });
        });
      }
    });

    return [
      ...(existingMetrics || []),
      ...extractedMetrics
    ];
  };

  const extractDocumentCovenants = (documentsResult) => {
    if (!documentsResult?.documents) return [];

    const covenants = [];
    documentsResult.documents.forEach(doc => {
      if (doc.analysis?.covenants) {
        doc.analysis.covenants.forEach(covenant => {
          covenants.push({
            description: covenant.description,
            source: `Document: ${doc.fileName}`,
            confidence: covenant.confidence || 0.7,
            extracted: true
          });
        });
      }
    });

    return covenants;
  };

  const getValueFromDocuments = (documentsResult, metricType) => {
    if (!documentsResult?.documents) return null;

    for (const doc of documentsResult.documents) {
      if (doc.analysis?.financialMetrics) {
        const metric = doc.analysis.financialMetrics.find(m => 
          m.metric.toLowerCase().includes(metricType.toLowerCase())
        );
        if (metric) return metric.value;
      }
    }
    return null;
  };

  const countExtractedFinancials = (documentsResult) => {
    if (!documentsResult?.documents) return 0;
    
    return documentsResult.documents.reduce((total, doc) => {
      return total + (doc.analysis?.financialMetrics?.length || 0);
    }, 0);
  };

  const countExtractedCovenants = (documentsResult) => {
    if (!documentsResult?.documents) return 0;
    
    return documentsResult.documents.reduce((total, doc) => {
      return total + (doc.analysis?.covenants?.length || 0);
    }, 0);
  };

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
    console.log('[App] Received company data:', companyData);
    
    // Extract company info from the new structure
    const companyInfo = companyData.company || {};
    const companyName = companyInfo.name || companyData.name || 'Unknown Company';
    const ticker = companyInfo.ticker || '';
    
    // Add company to list with complete data structure
    const newCompany = {
      ...companyData,
      id: companyData.id || Date.now(),
      status: 'analyzing',
      lastUpdated: new Date().toISOString(),
      analysisData: {
        company: {
          name: companyName,
          ticker: ticker,
          selectedCompany: companyInfo.selectedCompany,
          isPrivateCompany: companyInfo.isPrivateCompany,
          industry: companyInfo.industry || 'Not specified',
          sector: 'Distressed Credit',
          description: companyInfo.selectedCompany?.name ? 
            `${companyInfo.selectedCompany.name} (${ticker}) - Distressed credit analysis target` : 
            `${companyName} - Company under distressed credit analysis`
        },
        financials: {
          revenue: 'N/A',
          grossMargin: 'N/A',
          netIncome: 'N/A',
          totalAssets: 'N/A',
          totalDebt: 'N/A',
          cashAndEquivalents: 'N/A'
        },
        keyMetrics: {
          revenueGrowth: 'N/A',
          roe: 'N/A',
          roa: 'N/A',
          profitMargin: 'N/A',
          debtToEquity: 'N/A'
        },
        confidence: 0.85
      }
    };
    
    console.log('[App] Created company structure:', newCompany);
    
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
        { 
          companyName: companyName, 
          ticker: ticker,
          ...companyInfo 
        },
        (progress, message, agent) => {
          setAnalysisProgress(progress);
        }
      );

      // Update company with enhanced analysis results
      const analyzedCompany = {
        ...newCompany,
        status: 'completed',
        analysisData: {
          ...newCompany.analysisData,
          company: {
            ...newCompany.analysisData.company,
            name: companyName,
            ticker: ticker
          },
          ...analysisResult,
          // Integrate document-extracted financial data
          financials: mergeDocumentFinancials(
            analysisResult?.financials || newCompany.analysisData.financials,
            analysisResult?.results?.documents
          ),
          keyMetrics: mergeDocumentMetrics(
            analysisResult?.keyMetrics || newCompany.analysisData.keyMetrics,
            analysisResult?.results?.documents
          ),
          // Store covenant data from documents
          covenants: extractDocumentCovenants(analysisResult?.results?.documents),
          // Store processed documents with analysis
          processedDocuments: analysisResult?.results?.documents || []
        },
        lastAnalyzed: new Date().toISOString(),
        totalDebt: this.getValueFromDocuments(analysisResult?.results?.documents, 'debt') || 
                   analysisResult?.financials?.totalDebt || 'N/A',
        liquidity: this.getValueFromDocuments(analysisResult?.results?.documents, 'cash') || 
                   analysisResult?.financials?.cashAndEquivalents || 'N/A',
        nextMaturity: '2025', // Would be extracted from analysis
        riskFlags: analysisResult?.insights?.riskFactors?.slice(0, 3) || [],
        documents: companyData.files, // Store uploaded documents
        // Add document extraction summary
        documentStats: {
          documentsProcessed: analysisResult?.results?.documents?.documents?.length || 0,
          financialsExtracted: this.countExtractedFinancials(analysisResult?.results?.documents),
          covenantsExtracted: this.countExtractedCovenants(analysisResult?.results?.documents),
          lastProcessed: new Date().toISOString()
        }
      };

      setCompanies(prev => prev.map(c => 
        c.id === newCompany.id ? analyzedCompany : c
      ));
      setCurrentCompany(analyzedCompany);
      
      // Navigate to dashboard
      setCurrentView('dashboard');
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Update company status to error but keep basic structure for viewing
      const errorCompany = {
        ...newCompany,
        status: 'error', 
        error: error.message,
        // Keep basic data so dashboard can still render
        analysisData: {
          ...newCompany.analysisData,
          company: {
            ...newCompany.analysisData.company,
            name: companyData.name
          }
        }
      };
      
      setCompanies(prev => prev.map(c => 
        c.id === newCompany.id ? errorCompany : c
      ));
      
      setCurrentCompany(errorCompany);
      setCurrentView('dashboard'); // Still show dashboard even with error
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
        return <Dashboard companyData={currentCompany} />;
        
      case 'dataroom':
        return <DataRoom companyData={currentCompany} />;
        
      case 'reports':
        return <Reports companyData={currentCompany} />;
        
      case 'chat':
        return <Chat companyData={currentCompany} />;
        
      case 'settings':
        return <Settings user={user} setUser={setUser} onLogout={handleLogout} />;
        
      case 'team':
        return <TeamManagement user={user} companyData={currentCompany} />;
        
      default:
        return <LandingPage onLogin={handleLogin} />;
    }
  };

  const showNavigation = user && 
    currentView !== 'landing' && 
    currentView !== 'onboarding' && 
    currentView !== 'dashboard-loading' &&
    !isAnalyzing;

  const showSidebar = user && 
    currentView !== 'landing' && 
    currentView !== 'onboarding' && 
    currentView !== 'company-management' && 
    currentView !== 'add-company' &&
    currentView !== 'dashboard-loading' &&
    !isAnalyzing;

  // Helper methods for document data integration


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