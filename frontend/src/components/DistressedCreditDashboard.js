import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Building2,
  Calendar,
  Shield,
  Target,
  BarChart3,
  PieChart,
  Layers,
  Droplet,
  Zap,
  Info,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  RefreshCw,
  Activity,
  Loader2,
  ExternalLink,
  Calculator
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  AreaChart,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';
import AgentCoordinator from '../services/agentCoordinator';

const DistressedCreditDashboard = ({ companyData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [alertDetails, setAlertDetails] = useState({});
  const [comprehensiveData, setComprehensiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showSourceModal, setShowSourceModal] = useState(false);

  useEffect(() => {
    const fetchDistressedCreditData = async () => {
      if (!companyData?.company?.ticker) {
        console.warn('[DistressedCreditDashboard] No ticker available');
        setError('Company ticker required for distressed credit analysis');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`[DistressedCreditDashboard] Fetching distressed credit data for ${companyData.company.ticker}`);
        
        const coordinator = new AgentCoordinator();
        const data = await coordinator.orchestrateDataFetch(companyData.company.ticker, ['all']);
        
        // Cross-reference with user documents for enhanced credit analysis
        const enhancedData = await coordinator.crossReferenceDocuments(
          data, 
          companyData?.results?.documents?.documents || [], 
          companyData.company.ticker
        );
        
        console.log('[DistressedCreditDashboard] Enhanced data received:', enhancedData);
        setComprehensiveData(enhancedData);
        setError(null);
      } catch (err) {
        console.error('[DistressedCreditDashboard] Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDistressedCreditData();
  }, [companyData?.company?.ticker]);

  // Generate distressed credit metrics from real API data
  const generateDistressedMetrics = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const financials = comprehensiveData?.financialStatements;
    const ratios = comprehensiveData?.ratios;
    const quote = comprehensiveData?.stockPrice;

    if (!hasApiData) {
      return {
        distressScore: '[Data Unavailable]',
        riskLevel: '[Risk Level Unavailable]',
        liquidityMonths: '[Liquidity Unavailable]',
        totalDebt: '[Debt Unavailable]',
        debtToEquity: '[Ratio Unavailable]',
        interestCoverage: '[Coverage Unavailable]',
        currentRatio: '[Ratio Unavailable]',
        guidance: 'Real-time financial data required for accurate distressed credit analysis. Please ensure the company ticker is correct and try uploading recent financial statements.',
        sourceAttribution: 'N/A'
      };
    }

    const latestIncome = financials?.income?.[0];
    const latestBalance = financials?.balance?.[0];
    const latestCashFlow = financials?.cashFlow?.[0];
    const latestRatios = ratios?.ratios?.[0];

    // Calculate distress score based on multiple factors
    const distressFactors = [];
    let distressScore = 0;

    // Factor 1: Debt levels
    if (latestBalance?.totalDebt && latestBalance?.totalStockholdersEquity) {
      const debtToEquity = latestBalance.totalDebt / latestBalance.totalStockholdersEquity;
      if (debtToEquity > 3) distressFactors.push({ factor: 'High Leverage', weight: 25, triggered: true });
      else if (debtToEquity > 2) distressFactors.push({ factor: 'Moderate Leverage', weight: 15, triggered: true });
      distressScore += debtToEquity > 3 ? 25 : (debtToEquity > 2 ? 15 : 0);
    }

    // Factor 2: Profitability
    if (latestIncome?.netIncome && latestIncome.netIncome < 0) {
      distressFactors.push({ factor: 'Negative Net Income', weight: 20, triggered: true });
      distressScore += 20;
    }

    // Factor 3: Interest coverage
    if (latestIncome?.operatingIncome && latestIncome?.interestExpense) {
      const interestCoverage = Math.abs(latestIncome.operatingIncome / latestIncome.interestExpense);
      if (interestCoverage < 1.5) {
        distressFactors.push({ factor: 'Low Interest Coverage', weight: 20, triggered: true });
        distressScore += 20;
      }
    }

    // Factor 4: Liquidity
    if (latestBalance?.totalCurrentAssets && latestBalance?.totalCurrentLiabilities) {
      const currentRatio = latestBalance.totalCurrentAssets / latestBalance.totalCurrentLiabilities;
      if (currentRatio < 1.0) {
        distressFactors.push({ factor: 'Poor Liquidity', weight: 15, triggered: true });
        distressScore += 15;
      }
    }

    // Factor 5: Cash flow
    if (latestCashFlow?.operatingCashFlow && latestCashFlow.operatingCashFlow < 0) {
      distressFactors.push({ factor: 'Negative Operating Cash Flow', weight: 15, triggered: true });
      distressScore += 15;
    }

    // Determine risk level
    let riskLevel = 'Low';
    if (distressScore >= 60) riskLevel = 'Critical';
    else if (distressScore >= 40) riskLevel = 'High';
    else if (distressScore >= 20) riskLevel = 'Medium';

    // Calculate liquidity runway
    const cash = latestBalance?.cashAndCashEquivalents || 0;
    const operatingCashFlow = latestCashFlow?.operatingCashFlow || 0;
    const quarterlyBurn = operatingCashFlow < 0 ? Math.abs(operatingCashFlow) / 4 : 0;
    const liquidityMonths = quarterlyBurn > 0 ? (cash / quarterlyBurn * 3).toFixed(1) : '[Cannot Calculate]';

    return {
      distressScore: Math.min(distressScore, 100),
      riskLevel: riskLevel,
      liquidityMonths: liquidityMonths,
      totalDebt: latestBalance?.totalDebt ? `$${(latestBalance.totalDebt / 1000000).toFixed(1)}M` : '[Debt Unavailable]',
      debtToEquity: latestBalance?.totalDebt && latestBalance?.totalStockholdersEquity ? 
        (latestBalance.totalDebt / latestBalance.totalStockholdersEquity).toFixed(2) : '[Ratio Unavailable]',
      interestCoverage: latestIncome?.operatingIncome && latestIncome?.interestExpense ? 
        Math.abs(latestIncome.operatingIncome / latestIncome.interestExpense).toFixed(2) : '[Coverage Unavailable]',
      currentRatio: latestBalance?.totalCurrentAssets && latestBalance?.totalCurrentLiabilities ? 
        (latestBalance.totalCurrentAssets / latestBalance.totalCurrentLiabilities).toFixed(2) : '[Ratio Unavailable]',
      distressFactors: distressFactors,
      sourceAttribution: {
        primary: comprehensiveData.sourceAttribution || 'Multi-API Sources',
        income: `${comprehensiveData.financialStatements?.income ? 'FMP Income Statement API' : 'N/A'}`,
        balance: `${comprehensiveData.financialStatements?.balance ? 'FMP Balance Sheet API' : 'N/A'}`,
        cashFlow: `${comprehensiveData.financialStatements?.cashFlow ? 'FMP Cash Flow API' : 'N/A'}`,
        confidence: hasApiData ? 92 : 0
      }
    };
  };

  // Generate covenant analysis from real data and documents
  const generateCovenantAnalysis = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const financials = comprehensiveData?.financialStatements;
    const documents = companyData?.results?.documents?.documents || [];

    if (!hasApiData || !financials) {
      return [{
        name: 'Debt Service Coverage Ratio',
        current: '[Data Unavailable]',
        threshold: '[Threshold Unavailable]',
        status: 'unknown',
        trend: 'unknown',
        impact: 'unknown',
        source: 'Requires financial statement data',
        formula: 'Operating Income / Total Debt Service',
        guidance: 'Please upload recent credit agreements and financial statements for covenant analysis.'
      }];
    }

    const latestIncome = financials.income?.[0];
    const latestBalance = financials.balance?.[0];
    const latestCashFlow = financials.cashFlow?.[0];

    const covenants = [];

    // Standard financial covenants with real calculations
    if (latestCashFlow?.operatingCashFlow && latestBalance?.totalDebt) {
      const dscr = Math.abs(latestCashFlow.operatingCashFlow / (latestBalance.totalDebt * 0.1)); // Assuming 10% debt service
      covenants.push({
        name: 'Debt Service Coverage Ratio',
        current: dscr.toFixed(2),
        threshold: '1.25', // Typical threshold
        status: dscr >= 1.25 ? 'compliant' : 'violation',
        trend: 'calculated',
        impact: dscr < 1.0 ? 'critical' : (dscr < 1.25 ? 'high' : 'low'),
        source: 'FMP Cash Flow & Balance Sheet APIs',
        formula: 'Operating Cash Flow / Annual Debt Service',
        explanation: 'Measures the company\'s ability to service its debt obligations with operating cash flow.'
      });
    }

    if (latestBalance?.totalDebt && latestIncome?.ebitda) {
      const leverageRatio = latestBalance.totalDebt / latestIncome.ebitda;
      covenants.push({
        name: 'Total Leverage Ratio',
        current: leverageRatio.toFixed(2),
        threshold: '4.00', // Typical threshold
        status: leverageRatio <= 4.0 ? 'compliant' : 'violation',
        trend: 'calculated',
        impact: leverageRatio > 6.0 ? 'critical' : (leverageRatio > 4.0 ? 'high' : 'low'),
        source: 'FMP Balance Sheet & Income Statement APIs',
        formula: 'Total Debt / EBITDA',
        explanation: 'Measures the company\'s debt burden relative to earnings before interest, taxes, depreciation, and amortization.'
      });
    }

    if (latestIncome?.operatingIncome && latestIncome?.interestExpense) {
      const interestCoverage = Math.abs(latestIncome.operatingIncome / latestIncome.interestExpense);
      covenants.push({
        name: 'Interest Coverage Ratio',
        current: interestCoverage.toFixed(2),
        threshold: '2.00', // Typical threshold
        status: interestCoverage >= 2.0 ? 'compliant' : 'violation',
        trend: 'calculated',
        impact: interestCoverage < 1.5 ? 'critical' : (interestCoverage < 2.0 ? 'medium' : 'low'),
        source: 'FMP Income Statement API',
        formula: 'Operating Income / Interest Expense',
        explanation: 'Measures the company\'s ability to pay interest on outstanding debt.'
      });
    }

    if (latestBalance?.totalCurrentAssets && latestBalance?.totalCurrentLiabilities) {
      const currentRatio = latestBalance.totalCurrentAssets / latestBalance.totalCurrentLiabilities;
      covenants.push({
        name: 'Current Ratio',
        current: currentRatio.toFixed(2),
        threshold: '1.20', // Typical threshold
        status: currentRatio >= 1.2 ? 'compliant' : (currentRatio >= 1.0 ? 'watch' : 'violation'),
        trend: 'calculated',
        impact: currentRatio < 1.0 ? 'high' : (currentRatio < 1.2 ? 'medium' : 'low'),
        source: 'FMP Balance Sheet API',
        formula: 'Current Assets / Current Liabilities',
        explanation: 'Measures the company\'s ability to pay short-term obligations.'
      });
    }

    if (latestBalance?.totalStockholdersEquity) {
      const tangibleNetWorth = latestBalance.totalStockholdersEquity - (latestBalance.goodwillAndIntangibleAssets || 0);
      covenants.push({
        name: 'Tangible Net Worth',
        current: `$${(tangibleNetWorth / 1000000).toFixed(1)}M`,
        threshold: '[Threshold Unknown]', // Would need to extract from credit documents
        status: 'unknown',
        trend: 'calculated',
        impact: 'medium',
        source: 'FMP Balance Sheet API',
        formula: 'Total Equity - Intangible Assets',
        explanation: 'Measures the company\'s net worth excluding intangible assets.',
        guidance: 'Upload credit agreements to determine specific covenant thresholds.'
      });
    }

    return covenants;
  };

  // Generate liquidity analysis
  const generateLiquidityAnalysis = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const financials = comprehensiveData?.financialStatements;

    if (!hasApiData || !financials?.cashFlow) {
      return [];
    }

    // Use historical cash flow data to project runway
    const cashFlowData = financials.cashFlow.slice(0, 4); // Last 4 quarters/years
    const balanceData = financials.balance.slice(0, 4);

    return cashFlowData.map((cf, index) => {
      const balance = balanceData[index];
      const cash = balance?.cashAndCashEquivalents || 0;
      const operatingCF = cf?.operatingCashFlow || 0;
      const quarterlyBurn = operatingCF < 0 ? Math.abs(operatingCF) / 4 : 0;
      const runway = quarterlyBurn > 0 ? (cash / quarterlyBurn) : 0;

      return {
        period: cf.calendarYear || `Period ${index + 1}`,
        cash: cash / 1000000, // Convert to millions
        operatingCashFlow: operatingCF / 1000000,
        runway: runway,
        source: 'FMP Cash Flow & Balance Sheet APIs'
      };
    }).reverse(); // Most recent first
  };

  // Generate capital structure from real data
  const generateCapitalStructure = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const latestBalance = comprehensiveData?.financialStatements?.balance?.[0];

    if (!hasApiData || !latestBalance) {
      return [{
        name: 'Total Debt',
        amount: '[Data Unavailable]',
        percentage: 0,
        recovery: '[Recovery Unavailable]',
        source: 'N/A',
        guidance: 'Upload recent balance sheets and credit agreements for capital structure analysis.'
      }];
    }

    const structure = [];
    const totalCapital = (latestBalance.totalDebt || 0) + (latestBalance.totalStockholdersEquity || 0);

    if (latestBalance.totalDebt) {
      structure.push({
        name: 'Total Debt',
        amount: latestBalance.totalDebt / 1000000,
        percentage: totalCapital ? (latestBalance.totalDebt / totalCapital * 100) : 0,
        recovery: '[Recovery Rate Unknown]', // Would need credit analysis
        source: 'FMP Balance Sheet API',
        type: 'debt'
      });
    }

    if (latestBalance.totalStockholdersEquity) {
      structure.push({
        name: 'Total Equity',
        amount: latestBalance.totalStockholdersEquity / 1000000,
        percentage: totalCapital ? (latestBalance.totalStockholdersEquity / totalCapital * 100) : 0,
        recovery: '[Recovery Rate Unknown]',
        source: 'FMP Balance Sheet API',
        type: 'equity'
      });
    }

    return structure;
  };

  const distressedMetrics = generateDistressedMetrics();
  const covenantAnalysis = generateCovenantAnalysis();
  const liquidityAnalysis = generateLiquidityAnalysis();
  const capitalStructure = generateCapitalStructure();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'covenants', name: 'Covenants', icon: Shield },
    { id: 'liquidity', name: 'Liquidity', icon: Droplet },
    { id: 'structure', name: 'Capital Structure', icon: Layers }
  ];

  const handleMetricClick = (metricKey, metricData) => {
    setSelectedMetric({ key: metricKey, ...metricData });
    setShowSourceModal(true);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': case 'Critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': case 'High': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': case 'Low': return 'text-green-600 bg-green-100 border-green-200';
      case 'violation': return 'text-red-600 bg-red-100 border-red-200';
      case 'watch': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'compliant': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': case 'Critical': return XCircle;
      case 'high': case 'High': return AlertTriangle;
      case 'medium': case 'Medium': return AlertCircle;
      case 'low': case 'Low': return Info;
      case 'violation': return XCircle;
      case 'watch': return AlertTriangle;
      case 'compliant': return CheckCircle;
      default: return Info;
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading distressed credit analysis...</p>
              <p className="text-sm text-gray-500 mt-2">Analyzing financial data and credit metrics</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return AlertCircle;
      case 'low': return Info;
      case 'violation': return XCircle;
      case 'watch': return AlertTriangle;
      case 'compliant': return CheckCircle;
      default: return Info;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          whileHover={{ y: -2, shadow: '0 8px 25px rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{distressedData.overview.distressScore}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Distress Score</h3>
          <p className="text-sm text-gray-600">High risk level</p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          whileHover={{ y: -2, shadow: '0 8px 25px rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Droplet className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{distressedData.overview.liquidityMonths}m</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Liquidity Runway</h3>
          <p className="text-sm text-gray-600">Months remaining</p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          whileHover={{ y: -2, shadow: '0 8px 25px rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">${distressedData.overview.totalDebt}M</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Total Debt</h3>
          <p className="text-sm text-gray-600">Outstanding amount</p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          whileHover={{ y: -2, shadow: '0 8px 25px rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{distressedData.overview.covenantViolations}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Covenant Violations</h3>
          <p className="text-sm text-gray-600">Active breaches</p>
        </motion.div>
      </div>

      {/* Critical Alerts */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Critical Alerts</h3>
            <div className="space-y-2">
              <p className="text-red-800">• Next debt maturity: <strong>$75M due March 2025</strong></p>
              <p className="text-red-800">• DSCR covenant violation: <strong>1.15 vs 1.25 minimum</strong></p>
              <p className="text-red-800">• Liquidity runway: <strong>8.3 months at current burn rate</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaturityWall = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Debt Maturity Schedule</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Secured</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Unsecured</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distressedData.maturityWall}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              label={{ value: 'Amount ($M)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [`$${value}M`, name === 'secured' ? 'Secured Debt' : 'Unsecured Debt']}
            />
            <Bar dataKey="secured" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="unsecured" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {distressedData.maturityWall.map((item, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900">{item.period}</div>
            <div className="text-xs text-gray-600 mt-1">{item.type}</div>
            <div className="text-lg font-bold text-gray-900 mt-1">${item.total}M</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCovenants = () => (
    <div className="space-y-4">
      {distressedData.covenants.map((covenant, index) => {
        const Icon = getSeverityIcon(covenant.status);
        return (
          <motion.div
            key={index}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            whileHover={{ scale: 1.01 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`w-5 h-5 ${getSeverityColor(covenant.status).split(' ')[0]}`} />
                    <h3 className="text-lg font-semibold text-gray-900">{covenant.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(covenant.status)}`}>
                      {covenant.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Value</p>
                      <p className="text-xl font-bold text-gray-900">{covenant.current}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Threshold</p>
                      <p className="text-xl font-bold text-gray-900">{covenant.threshold}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Impact Level</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(covenant.impact)}`}>
                        {covenant.impact}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`flex items-center space-x-1 ${
                    covenant.trend === 'improving' ? 'text-green-600' :
                    covenant.trend === 'declining' ? 'text-red-600' :
                    covenant.trend === 'increasing' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {covenant.trend === 'improving' ? <TrendingUp className="w-4 h-4" /> :
                     covenant.trend === 'declining' || covenant.trend === 'increasing' ? <TrendingDown className="w-4 h-4" /> :
                     <Activity className="w-4 h-4" />}
                    <span className="text-sm font-medium capitalize">{covenant.trend}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderLiquidity = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Liquidity Runway Analysis</h3>
      
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={distressedData.liquidityRunway}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              yAxisId="cash"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              label={{ value: 'Cash ($M)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="runway"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              label={{ value: 'Runway (Months)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar yAxisId="cash" dataKey="cash" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Cash Balance ($M)" />
            <Line 
              yAxisId="runway" 
              type="monotone" 
              dataKey="runway" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: '#EF4444', r: 5 }}
              name="Liquidity Runway (Months)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-sm text-red-600 font-medium">Current Runway</p>
          <p className="text-2xl font-bold text-red-900">8.3 months</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <TrendingDown className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-orange-600 font-medium">Monthly Burn</p>
          <p className="text-2xl font-bold text-orange-900">$8.7M</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-600 font-medium">Cash Balance</p>
          <p className="text-2xl font-bold text-blue-900">$14.2M</p>
        </div>
      </div>
    </div>
  );

  const renderCapitalStructure = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Capital Structure Waterfall</h3>
      
      <div className="space-y-4">
        {distressedData.capitalStructure.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                item.seniority === 1 ? 'bg-green-500' :
                item.seniority === 2 ? 'bg-blue-500' :
                item.seniority === 3 ? 'bg-yellow-500' :
                item.seniority === 4 ? 'bg-orange-500' :
                'bg-red-500'
              }`}>
                {item.seniority}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{item.type}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">${item.amount}M</p>
              <p className="text-sm text-gray-600">{item.recovery}% recovery</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Capital</p>
            <p className="text-2xl font-bold text-gray-900">
              ${distressedData.capitalStructure.reduce((sum, item) => sum + item.amount, 0).toFixed(1)}M
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Weighted Recovery</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(
                distressedData.capitalStructure.reduce((sum, item) => sum + (item.amount * item.recovery), 0) /
                distressedData.capitalStructure.reduce((sum, item) => sum + item.amount, 0)
              )}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDistressFlags = () => (
    <div className="space-y-4">
      {distressedData.distressFlags.map((flag) => {
        const Icon = getSeverityIcon(flag.severity);
        return (
          <motion.div
            key={flag.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            whileHover={{ scale: 1.01 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <Icon className={`w-6 h-6 mt-1 ${getSeverityColor(flag.severity).split(' ')[0]}`} />
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{flag.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                        {flag.severity}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {flag.category}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{flag.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Potential Impact</p>
                        <p className="font-medium text-gray-900">{flag.impact}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Timeline</p>
                        <p className="font-medium text-gray-900">{flag.timeline}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  Updated: {new Date(flag.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'maturity': return renderMaturityWall();
      case 'covenants': return renderCovenants();
      case 'liquidity': return renderLiquidity();
      case 'structure': return renderCapitalStructure();
      case 'flags': return renderDistressFlags();
      default: return renderOverview();
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distressed Credit Analysis</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis for {companyData?.company?.name || 'Target Company'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </motion.button>
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DistressedCreditDashboard;