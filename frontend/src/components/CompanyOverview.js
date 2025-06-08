import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Info,
  Calculator,
  ExternalLink,
  Eye,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Layers,
  Activity,
  Loader2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import AgentCoordinator from '../services/agentCoordinator';

const CompanyOverview = ({ companyData }) => {
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  const [comprehensiveData, setComprehensiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComprehensiveData = async () => {
      if (!companyData?.company?.ticker) {
        console.warn('[CompanyOverview] No ticker available, using document data only');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`[CompanyOverview] Fetching comprehensive data for ${companyData.company.ticker}`);
        
        const coordinator = new AgentCoordinator();
        const data = await coordinator.orchestrateDataFetch(companyData.company.ticker);
        
        console.log('[CompanyOverview] Comprehensive data received:', data);
        setComprehensiveData(data);
        setError(null);
      } catch (err) {
        console.error('[CompanyOverview] Error fetching comprehensive data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComprehensiveData();
  }, [companyData?.company?.ticker]);

  // Generate dynamic company profile from real API data
  const generateCompanyProfile = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const profile = comprehensiveData?.profile;
    
    // Basic company info with fallbacks showing [Data Unavailable] instead of mock data
    const company = {
      name: companyData?.company?.name || '[Company Name Unavailable]',
      ticker: companyData?.company?.ticker || '[Ticker Unavailable]',
      industry: profile?.[0]?.industry || companyData?.company?.industry || '[Industry Unavailable]',
      sector: profile?.[0]?.sector || '[Sector Unavailable]',
      location: profile?.[0]?.address || profile?.[0]?.city || '[Location Unavailable]',
      founded: profile?.[0]?.ipoDate ? new Date(profile[0].ipoDate).getFullYear() : '[Founded Date Unavailable]',
      employees: profile?.[0]?.fullTimeEmployees || '[Employee Count Unavailable]',
      description: profile?.[0]?.description || companyData?.company?.description || '[Company Description Unavailable]',
      website: profile?.[0]?.website || '[Website Unavailable]',
      marketCap: profile?.[0]?.mktCap || '[Market Cap Unavailable]',
      
      // Source attribution for profile data
      profileSource: hasApiData ? 'FMP Company Profile API' : 'User Documents',
      profileConfidence: hasApiData ? 95 : 70
    };

    return company;
  };

  // Generate financial metrics from real API data with source attribution
  const generateFinancialMetrics = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const financials = comprehensiveData?.financialStatements;
    const ratios = comprehensiveData?.ratios;
    const quote = comprehensiveData?.stockPrice;

    const metrics = {};

    if (hasApiData && financials?.income?.[0]) {
      const latestIncome = financials.income[0];
      const prevIncome = financials.income[1];
      
      metrics.ltmRevenue = {
        value: latestIncome.revenue ? `$${(latestIncome.revenue / 1000000).toFixed(1)}M` : '[Revenue Unavailable]',
        change: prevIncome?.revenue ? 
          `${((latestIncome.revenue - prevIncome.revenue) / prevIncome.revenue * 100).toFixed(1)}%` : 
          '[Change Unavailable]',
        source: `${comprehensiveData.sourceAttribution?.income?.source || 'FMP'} Income Statement API`,
        formula: 'Total Revenue for last 12 months',
        confidence: 96,
        endpoint: comprehensiveData.sourceAttribution?.income?.endpoint || '/v3/income-statement/{symbol}'
      };

      const grossProfit = latestIncome.grossProfit || (latestIncome.revenue - latestIncome.costOfRevenue);
      const prevGrossProfit = prevIncome?.grossProfit || (prevIncome?.revenue - prevIncome?.costOfRevenue);
      
      metrics.grossMargin = {
        value: latestIncome.revenue && grossProfit ? 
          `${(grossProfit / latestIncome.revenue * 100).toFixed(1)}%` : 
          '[Gross Margin Unavailable]',
        change: prevIncome?.revenue && prevGrossProfit ? 
          `${((grossProfit / latestIncome.revenue) - (prevGrossProfit / prevIncome.revenue)) * 100 >= 0 ? '+' : ''}${(((grossProfit / latestIncome.revenue) - (prevGrossProfit / prevIncome.revenue)) * 100).toFixed(1)}%` : 
          '[Change Unavailable]',
        source: `${comprehensiveData.sourceAttribution?.income?.source || 'FMP'} Income Statement API`,
        formula: '(Revenue - Cost of Goods Sold) / Revenue × 100',
        confidence: 94,
        endpoint: comprehensiveData.sourceAttribution?.income?.endpoint || '/v3/income-statement/{symbol}'
      };
    }

    if (hasApiData && financials?.balance?.[0]) {
      const latestBalance = financials.balance[0];
      const prevBalance = financials.balance[1];
      
      metrics.cash = {
        value: latestBalance.cashAndCashEquivalents ? 
          `$${(latestBalance.cashAndCashEquivalents / 1000000).toFixed(1)}M` : 
          '[Cash Unavailable]',
        change: prevBalance?.cashAndCashEquivalents ? 
          `${((latestBalance.cashAndCashEquivalents - prevBalance.cashAndCashEquivalents) / prevBalance.cashAndCashEquivalents * 100).toFixed(1)}%` : 
          '[Change Unavailable]',
        source: `${comprehensiveData.sourceAttribution?.balance?.source || 'FMP'} Balance Sheet API`,
        formula: 'Cash + Cash Equivalents + Short-term Investments',
        confidence: 98,
        endpoint: comprehensiveData.sourceAttribution?.balance?.endpoint || '/v3/balance-sheet-statement/{symbol}'
      };

      metrics.totalDebt = {
        value: latestBalance.totalDebt ? 
          `$${(latestBalance.totalDebt / 1000000).toFixed(1)}M` : 
          '[Total Debt Unavailable]',
        change: prevBalance?.totalDebt ? 
          `${((latestBalance.totalDebt - prevBalance.totalDebt) / prevBalance.totalDebt * 100).toFixed(1)}%` : 
          '[Change Unavailable]',
        source: `${comprehensiveData.sourceAttribution?.balance?.source || 'FMP'} Balance Sheet API`,
        formula: 'Short-term Debt + Long-term Debt',
        confidence: 97,
        endpoint: comprehensiveData.sourceAttribution?.balance?.endpoint || '/v3/balance-sheet-statement/{symbol}'
      };
    }

    if (hasApiData && quote && !quote.error) {
      metrics.currentPrice = {
        value: quote.price ? `$${parseFloat(quote.price).toFixed(2)}` : '[Price Unavailable]',
        change: quote.changesPercentage ? 
          `${quote.changesPercentage >= 0 ? '+' : ''}${parseFloat(quote.changesPercentage).toFixed(2)}%` : 
          '[Change Unavailable]',
        source: `${comprehensiveData.sourceAttribution?.stockPrice?.source || 'FMP'} Quote API`,
        formula: 'Latest traded price',
        confidence: 99,
        endpoint: comprehensiveData.sourceAttribution?.stockPrice?.endpoint || '/v3/quote/{symbol}'
      };
    }

    // If no API data, show data unavailable messages with guidance
    if (!hasApiData || Object.keys(metrics).length === 0) {
      return {
        ltmRevenue: {
          value: '[Data Unavailable]',
          change: '[Change Unavailable]',
          source: 'N/A',
          formula: 'Total Revenue for last 12 months',
          confidence: 0,
          guidance: 'Please ensure the company ticker is correct and the company is publicly traded.'
        },
        grossMargin: {
          value: '[Data Unavailable]',
          change: '[Change Unavailable]',
          source: 'N/A',
          formula: '(Revenue - Cost of Goods Sold) / Revenue × 100',
          confidence: 0,
          guidance: 'Financial statement data not available via API. Please upload recent financial statements.'
        },
        cash: {
          value: '[Data Unavailable]',
          change: '[Change Unavailable]',
          source: 'N/A',
          formula: 'Cash + Cash Equivalents + Short-term Investments',
          confidence: 0,
          guidance: 'Balance sheet data not available via API. Please upload recent balance sheet.'
        },
        totalDebt: {
          value: '[Data Unavailable]',
          change: '[Change Unavailable]',
          source: 'N/A',
          formula: 'Short-term Debt + Long-term Debt',
          confidence: 0,
          guidance: 'Debt information not available via API. Please upload recent balance sheet or credit agreements.'
        }
      };
    }

    return metrics;
  };

  // Generate historical revenue data from API
  const generateRevenueData = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const financials = comprehensiveData?.financialStatements;

    if (!hasApiData || !financials?.income) {
      return []; // Return empty array instead of mock data
    }

    // Convert annual data to quarterly format for chart
    return financials.income.slice(0, 6).reverse().map((item, index) => {
      const revenue = item.revenue ? item.revenue / 1000000 : 0;
      const grossProfit = item.grossProfit || (item.revenue - item.costOfRevenue) || 0;
      const margin = item.revenue ? (grossProfit / item.revenue * 100) : 0;
      
      return {
        period: item.calendarYear || `Period ${index + 1}`,
        revenue: parseFloat(revenue.toFixed(1)),
        margin: parseFloat(margin.toFixed(1))
      };
    });
  };

  // Generate management team from API
  const generateManagementData = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const executives = comprehensiveData?.executives;

    if (!hasApiData || !executives || executives.length === 0) {
      return []; // Return empty array instead of mock data
    }

    return executives.slice(0, 5).map(exec => ({
      name: exec.name || '[Name Unavailable]',
      role: exec.title || '[Title Unavailable]',
      tenure: exec.yearBorn ? `${new Date().getFullYear() - exec.yearBorn} years old` : '[Age Unavailable]',
      source: `${comprehensiveData.sourceAttribution?.executives?.source || 'FMP'} Executives API`
    }));
  };

  const company = generateCompanyProfile();
  const metrics = generateFinancialMetrics();
  const revenueData = generateRevenueData();
  const managementData = generateManagementData();

  const handleMetricClick = (metricKey, metricData) => {
    setSelectedMetric({ key: metricKey, ...metricData });
    setShowSourceModal(true);
  };

  const handleFormulaToggle = (metricKey) => {
    setShowFormula(prev => prev === metricKey ? false : metricKey);
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading comprehensive company data...</p>
              <p className="text-sm text-gray-500 mt-2">Fetching from multiple financial APIs</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* API Data Status Alert */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Limited Data Available</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  API data unavailable: {error}. Displaying information from uploaded documents only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Company Header - Arc Intelligence Style */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl">
                {company.ticker !== '[Ticker Unavailable]' ? company.ticker.substring(0, 2) : '🏢'}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
                <div className="flex items-center space-x-4 text-blue-100 text-lg mb-3">
                  <span>{company.industry}</span>
                  {company.sector !== '[Sector Unavailable]' && (
                    <>
                      <span>•</span>
                      <span>{company.sector}</span>
                    </>
                  )}
                  {company.location !== '[Location Unavailable]' && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{company.location}</span>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-blue-100 text-sm max-w-3xl leading-relaxed">
                  {company.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-blue-100 mb-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Data Confidence: {company.profileConfidence}%</span>
              </div>
              <div className="text-sm text-blue-100 mb-2">
                Source: {company.profileSource}
              </div>
              {company.website !== '[Website Unavailable]' && (
                <a 
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-100 hover:text-white transition-colors"
                >
                  <span className="text-sm">{company.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{company.founded}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Founded</h3>
            <p className="text-sm text-gray-600">
              {company.founded !== '[Founded Date Unavailable]' 
                ? `${new Date().getFullYear() - company.founded} years in business`
                : 'Date not available via API'
              }
            </p>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {company.employees !== '[Employee Count Unavailable]' 
                  ? company.employees.toLocaleString() 
                  : '[N/A]'
                }
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Employees</h3>
            <p className="text-sm text-gray-600">
              {company.employees !== '[Employee Count Unavailable]' 
                ? 'Full-time employees' 
                : 'Data not available via API'
              }
            </p>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {company.ticker !== '[Ticker Unavailable]' ? company.ticker : '[N/A]'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Ticker Symbol</h3>
            <p className="text-sm text-gray-600">
              {company.ticker !== '[Ticker Unavailable]' ? 'Public company' : 'Private company or ticker not available'}
            </p>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">
                {company.marketCap !== '[Market Cap Unavailable]' 
                  ? `$${(company.marketCap / 1000000000).toFixed(1)}B`
                  : '[N/A]'
                }
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Market Cap</h3>
            <p className="text-sm text-gray-600">
              {company.marketCap !== '[Market Cap Unavailable]' 
                ? 'Current market valuation' 
                : 'Market cap not available'
              }
            </p>
          </motion.div>
        </div>

        {/* Financial Overview - Real Data with Source Attribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Key Financial Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Financial Overview</h3>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(metrics).map(([key, metric]) => (
                <motion.div
                  key={key}
                  className="cursor-pointer group"
                  onClick={() => handleMetricClick(key, metric)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFormulaToggle(key);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Calculator className="w-3 h-3" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors group-hover:text-blue-600">
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className={`text-2xl font-bold ${
                      metric.value.includes('[') ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {metric.value}
                    </span>
                    {!metric.change.includes('[') && (
                      <div className="flex items-center space-x-1">
                        {metric.change.startsWith('+') ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : metric.change.startsWith('-') ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : null}
                        <span className={`text-sm font-medium ${
                          metric.change.startsWith('+') ? 'text-green-600' : 
                          metric.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Source attribution badge */}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      metric.confidence > 90 ? 'bg-green-100 text-green-800' :
                      metric.confidence > 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {metric.source !== 'N/A' ? metric.source.split(' ')[0] : 'No Data'}
                    </span>
                    <span className="text-gray-500">
                      {metric.confidence}% confidence
                    </span>
                  </div>
                  
                  {/* Formula explanation */}
                  <AnimatePresence>
                    {showFormula === key && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <p className="text-xs text-blue-800 font-medium mb-1">Formula:</p>
                        <p className="text-xs text-blue-700">{metric.formula}</p>
                        {metric.endpoint && (
                          <p className="text-xs text-blue-600 mt-1">Endpoint: {metric.endpoint}</p>
                        )}
                        {metric.guidance && (
                          <p className="text-xs text-orange-700 mt-1 bg-orange-50 p-2 rounded">
                            💡 {metric.guidance}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Revenue Trend Chart - Real Data */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Historical Financial Performance</h3>
            {revenueData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="period" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      yAxisId="revenue"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                      label={{ value: 'Revenue ($M)', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                      yAxisId="margin"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                      label={{ value: 'Margin (%)', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar yAxisId="revenue" dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue ($M)" />
                    <Line 
                      yAxisId="margin" 
                      type="monotone" 
                      dataKey="margin" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', r: 4 }}
                      name="Gross Margin (%)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No Historical Data Available</p>
                  <p className="text-sm mt-2">
                    {comprehensiveData?.error 
                      ? 'API data unavailable. Please upload financial statements.'
                      : 'Financial history not found via API sources.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Management & Investors - Real Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Management Team */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Management Team</h3>
            {managementData.length > 0 ? (
              <div className="space-y-4">
                {managementData.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {member.name !== '[Name Unavailable]' 
                            ? member.name.split(' ').map(n => n[0]).join('') 
                            : '??'
                          }
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{member.tenure}</span>
                      {member.source && (
                        <p className="text-xs text-blue-600 mt-1">{member.source.split(' ')[0]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Management Data Unavailable</p>
                <p className="text-sm mt-2">
                  Executive information not available via API. Please upload recent SEC filings or company documents.
                </p>
              </div>
            )}
          </div>

          {/* Data Sources & Attribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Data Sources & Quality</h3>
            <div className="space-y-4">
              {/* API Status */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">API Data Status</span>
                  {comprehensiveData && !comprehensiveData.error ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {comprehensiveData && !comprehensiveData.error
                    ? 'Successfully connected to financial APIs'
                    : 'Limited API connectivity - using document data'
                  }
                </p>
              </div>

              {/* Document Data */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Document Analysis</span>
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600">
                  {companyData?.results?.documents?.documents?.length || 0} documents processed
                </p>
              </div>

              {/* Data Coverage */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900 block mb-2">Data Coverage</span>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Profile:</span>
                    <span className={company.profileConfidence > 70 ? 'text-green-600' : 'text-yellow-600'}>
                      {company.profileConfidence}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Financials:</span>
                    <span className={Object.values(metrics).some(m => m.confidence > 70) ? 'text-green-600' : 'text-red-600'}>
                      {Math.round(Object.values(metrics).reduce((sum, m) => sum + m.confidence, 0) / Object.keys(metrics).length)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Last Updated</span>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Source Modal - Enhanced with Real Data Context */}
        <AnimatePresence>
          {showSourceModal && selectedMetric && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Source Information</h3>
                  <button
                    onClick={() => setShowSourceModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {selectedMetric.key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className={`text-3xl font-bold ${
                      selectedMetric.value.includes('[') ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {selectedMetric.value}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Data Source:</h5>
                    <p className="text-sm text-gray-600">{selectedMetric.source}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Calculation:</h5>
                    <p className="text-sm text-gray-600">{selectedMetric.formula}</p>
                  </div>

                  {selectedMetric.endpoint && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">API Endpoint:</h5>
                      <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                        {selectedMetric.endpoint}
                      </p>
                    </div>
                  )}

                  {selectedMetric.guidance && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <h5 className="text-sm font-medium text-orange-800 mb-1">Data Guidance:</h5>
                      <p className="text-sm text-orange-700">{selectedMetric.guidance}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      {selectedMetric.confidence > 70 ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className="text-sm text-gray-600">
                        Confidence: {selectedMetric.confidence}%
                      </span>
                    </div>
                    {selectedMetric.confidence === 0 && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        Data Unavailable
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompanyOverview;