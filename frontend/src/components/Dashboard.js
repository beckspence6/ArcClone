import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2,
  BarChart3,
  Brain,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import DistressedCreditDashboard from './DistressedCreditDashboard';
import CompanyOverview from './CompanyOverview';
import AgentCoordinator from '../services/agentCoordinator';

const Dashboard = ({ companyData }) => {
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // If no company data, show empty state
  if (!companyData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 max-w-md mx-auto border border-gray-200"
          >
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Available</h2>
            <p className="text-gray-600 mb-6">
              Upload documents in the Data Room to begin AI analysis and generate your personalized dashboard.
            </p>
            <motion.button
              onClick={() => window.location.hash = '#dataroom'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Go to Data Room
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Handle refresh functionality
  const handleRefresh = async () => {
    if (!companyData?.company?.ticker) {
      // If no ticker, just refresh the page data
      window.location.reload();
      return;
    }

    try {
      setIsRefreshing(true);
      console.log(`[Dashboard] Refreshing data for ${companyData.company.ticker}`);
      
      // Trigger a fresh data fetch through the AgentCoordinator
      await AgentCoordinator.orchestrateDataFetch(companyData.company.ticker, ['all']);
      
      setLastRefresh(new Date());
      console.log('[Dashboard] Data refresh completed');
    } catch (error) {
      console.error('[Dashboard] Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Dashboard tabs
  const tabs = [
    { 
      id: 'overview', 
      name: 'Company Overview', 
      icon: Building2,
      description: 'Comprehensive company profile and financial overview'
    },
    { 
      id: 'analytics', 
      name: 'Credit Analytics', 
      icon: BarChart3,
      description: 'Advanced distressed credit analysis and risk assessment'
    }
  ];

  // Render content based on selected tab
  const renderTabContent = () => {
    if (dashboardTab === 'analytics') {
      return <DistressedCreditDashboard companyData={companyData} />;
    } else {
      return <CompanyOverview companyData={companyData} />;
    }
  };

  // Get company name for display
  const companyName = companyData?.company?.name || companyData?.company?.company || 'Company';
  const companyTicker = companyData?.company?.ticker;
  const isPublicCompany = !!companyTicker;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Company Header - Clean and Professional */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                {companyTicker ? (
                  <span className="text-blue-600 font-bold text-sm">
                    {companyTicker.substring(0, 2)}
                  </span>
                ) : (
                  <Building2 className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {companyTicker && (
                    <span className="font-medium">{companyTicker}</span>
                  )}
                  {companyData?.company?.industry && (
                    <>
                      <span>•</span>
                      <span>{companyData.company.industry}</span>
                    </>
                  )}
                  {isPublicCompany && (
                    <>
                      <span>•</span>
                      <span className="text-green-600">Public Company</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </motion.button>
              
              <div className="text-right">
                <p className="text-xs text-gray-500">Last updated</p>
                <p className="text-xs font-medium text-gray-700">
                  {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDashboardTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    dashboardTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs font-normal opacity-75">
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Data Quality Alert */}
      {companyData && !companyTicker && (
        <div className="mx-8 mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Limited Data Analysis</h4>
              <p className="text-sm text-yellow-700 mt-1">
                This appears to be a private company. Analysis is based on uploaded documents only. 
                For public companies, provide the ticker symbol for enhanced real-time financial data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dashboardTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;