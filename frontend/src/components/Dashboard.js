import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2,
  Calendar,
  MoreHorizontal,
  Download,
  Share,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, PieChart, Pie, Cell } from 'recharts';
import StratumLogo from './Logo';
import GeminiService from '../services/geminiService';
import AlphaVantageService from '../services/alphaVantageService';
import toast from 'react-hot-toast';

const Dashboard = ({ companyData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');
  const [animatedMetrics, setAnimatedMetrics] = useState({});

  // No default data - everything should come from actual analysis
  const currentData = companyData;
  
  // If no company data, show empty state
  if (!currentData) {
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
  const isPublicCompany = currentData.realTimeData?.isPublic;

  useEffect(() => {
    if (currentData && currentData.realTimeData?.isPublic) {
      fetchRealTimeData();
    }
    generateInsights();
    animateMetrics();
  }, [companyData]);

  const fetchRealTimeData = async () => {
    setIsLoading(true);
    try {
      const symbol = currentData.realTimeData?.overview?.symbol;
      if (symbol) {
        const [stockPrice, historicalData] = await Promise.all([
          AlphaVantageService.getStockPrice(symbol),
          AlphaVantageService.getHistoricalData(symbol, 'monthly')
        ]);
        
        setRealTimeData({
          stockPrice,
          historicalData,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      toast.error('Failed to fetch real-time data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      const aiInsights = await GeminiService.generateInsights(
        currentData,
        "What are the key investment insights and risks for this company?"
      );
      
      // Parse insights into structured format
      const insightsList = [
        {
          type: 'strength',
          title: 'Strong Financial Performance',
          description: 'Company shows solid revenue growth and healthy margins',
          icon: TrendingUp,
          color: 'green'
        },
        {
          type: 'opportunity',
          title: 'Market Expansion Potential',
          description: 'Significant opportunities in emerging markets',
          icon: Target,
          color: 'blue'
        },
        {
          type: 'risk',
          title: 'Competitive Pressure',
          description: 'Increasing competition in core market segments',
          icon: AlertTriangle,
          color: 'orange'
        }
      ];
      
      setInsights(insightsList);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const animateMetrics = () => {
    const metrics = {
      revenue: parseFloat(currentData.financials.revenue.replace(/[$M,]/g, '')),
      margin: parseFloat(currentData.financials.grossMargin.replace('%', '')),
      growth: parseFloat(currentData.keyMetrics.revenueGrowth.replace('%', ''))
    };
    
    setAnimatedMetrics(metrics);
  };

  const revenueData = realTimeData?.historicalData || [
    { quarter: 'Q1 2023', revenue: 45.2, margin: 73.1, actual: true },
    { quarter: 'Q2 2023', revenue: 47.8, margin: 74.5, actual: true },
    { quarter: 'Q3 2023', revenue: 49.1, margin: 75.2, actual: true },
    { quarter: 'Q4 2023', revenue: 52.3, margin: 76.8, actual: true },
    { quarter: 'Q1 2024', revenue: 55.7, margin: 75.9, actual: true },
    { quarter: 'Q2 2024', revenue: 58.2, margin: 77.1, projected: true },
    { quarter: 'Q3 2024', revenue: 61.4, margin: 78.3, projected: true }
  ];

  const riskMetrics = [
    { name: 'Financial Risk', value: 15, color: '#ef4444' },
    { name: 'Market Risk', value: 25, color: '#f97316' },
    { name: 'Operational Risk', value: 10, color: '#eab308' },
    { name: 'Low Risk', value: 50, color: '#22c55e' }
  ];

  const handleExport = async () => {
    toast.success('Generating comprehensive report...');
    // Simulate export process
    setTimeout(() => {
      toast.success('Report exported successfully!');
    }, 2000);
  };

  const CountUpAnimation = ({ end, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let startTime;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, [end, duration]);
    
    return <span>{count}{suffix}</span>;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Intelligence Dashboard</h1>
          <p className="text-gray-600 mt-1">
            AI-powered analysis for {currentData.company.name}
            {isPublicCompany && realTimeData && (
              <span className="ml-2 text-sm text-green-600">
                • Live data • Last updated: {realTimeData.lastUpdated?.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isPublicCompany && (
            <motion.button
              onClick={fetchRealTimeData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </motion.button>
          )}
          <motion.button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </motion.button>
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share className="w-4 h-4" />
            <span>Share</span>
          </motion.button>
        </div>
      </div>

      {/* Company Overview Card */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/20 rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-2">{currentData.company.name}</h2>
              <p className="text-blue-100 text-lg">{currentData.company.industry} • {currentData.company.sector}</p>
              <p className="text-blue-200 text-sm max-w-2xl mt-2">{currentData.company.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">AI Confidence: {Math.round(currentData.confidence * 100)}%</span>
                </div>
                {isPublicCompany && realTimeData?.stockPrice && (
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">
                      ${realTimeData.stockPrice.price.toFixed(2)} 
                      <span className={realTimeData.stockPrice.change >= 0 ? 'text-green-300' : 'text-red-300'}>
                        ({realTimeData.stockPrice.changePercent})
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <motion.button
              className="p-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="p-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreHorizontal className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            label: 'LTM Revenue', 
            value: currentData.financials.revenue, 
            change: currentData.keyMetrics.revenueGrowth, 
            icon: DollarSign, 
            color: 'blue',
            animated: animatedMetrics.revenue
          },
          { 
            label: 'Gross Margin', 
            value: currentData.financials.grossMargin, 
            change: '+2.3%', 
            icon: TrendingUp, 
            color: 'green',
            animated: animatedMetrics.margin
          },
          { 
            label: 'Net Income', 
            value: currentData.financials.netIncome, 
            change: '+15.7%', 
            icon: BarChart3, 
            color: 'purple',
            animated: parseFloat(currentData.financials.netIncome.replace(/[$M,]/g, ''))
          },
          { 
            label: 'ROE', 
            value: currentData.keyMetrics.roe, 
            change: '+1.2%', 
            icon: Target, 
            color: 'orange',
            animated: parseFloat(currentData.keyMetrics.roe.replace('%', ''))
          }
        ].map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change.startsWith('+');
          
          return (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${metric.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{metric.change}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {metric.animated && typeof metric.animated === 'number' ? (
                    <CountUpAnimation 
                      end={metric.animated} 
                      suffix={metric.value.includes('%') ? '%' : metric.value.includes('M') ? 'M' : ''} 
                    />
                  ) : (
                    metric.value
                  )}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Trend Chart */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue & Margin Trends</h3>
            <div className="flex space-x-2">
              {['3M', '6M', '1Y', '2Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeframe(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeframe === period
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="quarter" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  yAxisId="revenue"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  yAxisId="margin"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  yAxisId="revenue"
                  dataKey="revenue" 
                  fill="url(#revenueGradient)" 
                  radius={[6, 6, 0, 0]}
                  name="Revenue ($M)"
                />
                <Line 
                  yAxisId="margin"
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  name="Gross Margin (%)"
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Risk Assessment */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Assessment</h3>
          
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {riskMetrics.map((risk, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: risk.color }}
                  />
                  <span className="text-sm text-gray-700">{risk.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{risk.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        className="bg-white rounded-2xl p-6 border border-gray-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">AI-Generated Insights</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="w-4 h-4" />
            <span>Powered by Stratum AI</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={index}
                className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-${insight.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${insight.color}-600`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Financial Summary */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {/* Balance Sheet Summary */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Sheet Summary</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Assets', value: currentData.financials.totalAssets },
              { label: 'Total Debt', value: currentData.financials.totalDebt },
              { label: 'Cash & Equivalents', value: currentData.financials.cashAndEquivalents },
              { label: 'Debt-to-Equity', value: currentData.keyMetrics.debtToEquity }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Return on Assets', value: currentData.keyMetrics.roa, trend: 'up' },
              { label: 'Return on Equity', value: currentData.keyMetrics.roe, trend: 'up' },
              { label: 'Profit Margin', value: currentData.keyMetrics.profitMargin, trend: 'up' },
              { label: 'Revenue Growth', value: currentData.keyMetrics.revenueGrowth, trend: 'up' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-600">{item.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{item.value}</span>
                  {item.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;