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
  Activity
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
  Cell,
  Waterfall,
  WaterfallChart
} from 'recharts';

const DistressedCreditDashboard = ({ companyData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [alertDetails, setAlertDetails] = useState({});

  // Mock distressed credit data structure
  const distressedData = {
    overview: {
      distressScore: 73,
      riskLevel: 'high',
      liquidityMonths: 8.3,
      totalDebt: 487.5,
      nextMaturity: '2025-03-15',
      covenantViolations: 2
    },
    maturityWall: [
      { period: '2024 Q4', secured: 25, unsecured: 15, total: 40, type: 'Term Loan' },
      { period: '2025 Q1', secured: 45, unsecured: 30, total: 75, type: 'Bonds' },
      { period: '2025 Q2', secured: 60, unsecured: 25, total: 85, type: 'Credit Line' },
      { period: '2025 Q3', secured: 80, unsecured: 40, total: 120, type: 'Notes' },
      { period: '2025 Q4', secured: 35, unsecured: 20, total: 55, type: 'Term Loan' },
      { period: '2026 Q1', secured: 90, unsecured: 50, total: 140, type: 'Bonds' }
    ],
    covenants: [
      { 
        name: 'Debt Service Coverage Ratio', 
        current: 1.15, 
        threshold: 1.25, 
        status: 'violation',
        trend: 'declining',
        impact: 'high'
      },
      { 
        name: 'Total Leverage Ratio', 
        current: 6.8, 
        threshold: 6.0, 
        status: 'violation',
        trend: 'increasing',
        impact: 'critical'
      },
      { 
        name: 'Interest Coverage Ratio', 
        current: 2.1, 
        threshold: 2.0, 
        status: 'compliant',
        trend: 'stable',
        impact: 'medium'
      },
      { 
        name: 'Current Ratio', 
        current: 1.3, 
        threshold: 1.2, 
        status: 'compliant',
        trend: 'improving',
        impact: 'low'
      },
      { 
        name: 'Tangible Net Worth', 
        current: 185.2, 
        threshold: 200.0, 
        status: 'watch',
        trend: 'declining',
        impact: 'medium'
      }
    ],
    liquidityRunway: [
      { month: 'Jan 2024', cash: 45.2, burnRate: -8.5, runway: 12.3 },
      { month: 'Feb 2024', cash: 38.7, burnRate: -9.2, runway: 11.1 },
      { month: 'Mar 2024', cash: 32.1, burnRate: -7.8, runway: 10.8 },
      { month: 'Apr 2024', cash: 26.3, burnRate: -8.9, runway: 9.7 },
      { month: 'May 2024', cash: 19.8, burnRate: -9.1, runway: 8.3 },
      { month: 'Jun 2024', cash: 14.2, burnRate: -8.7, runway: 7.9 }
    ],
    capitalStructure: [
      { name: 'Senior Secured', amount: 185.5, recovery: 85, seniority: 1, type: 'debt' },
      { name: 'Senior Unsecured', amount: 124.8, recovery: 45, seniority: 2, type: 'debt' },
      { name: 'Subordinated', amount: 67.2, recovery: 15, seniority: 3, type: 'debt' },
      { name: 'Preferred Equity', amount: 45.0, recovery: 5, seniority: 4, type: 'equity' },
      { name: 'Common Equity', amount: 92.3, recovery: 0, seniority: 5, type: 'equity' }
    ],
    distressFlags: [
      {
        id: 1,
        severity: 'critical',
        category: 'Financial',
        title: 'Covenant Violations',
        description: 'Multiple debt covenant breaches including DSCR and leverage ratios',
        impact: 'Potential acceleration of debt',
        timeline: '30 days',
        lastUpdated: '2024-01-15'
      },
      {
        id: 2,
        severity: 'high',
        category: 'Liquidity',
        title: 'Low Cash Reserves',
        description: 'Current cash runway below 9 months with negative cash flow',
        impact: 'Working capital constraints',
        timeline: '60 days',
        lastUpdated: '2024-01-14'
      },
      {
        id: 3,
        severity: 'medium',
        category: 'Market',
        title: 'Credit Rating Downgrade',
        description: 'Moody\'s downgraded credit rating to Caa1',
        impact: 'Increased borrowing costs',
        timeline: '90 days',
        lastUpdated: '2024-01-10'
      },
      {
        id: 4,
        severity: 'medium',
        category: 'Operational',
        title: 'Revenue Decline',
        description: '15% YoY revenue decline in core business segments',
        impact: 'Reduced debt service capacity',
        timeline: '180 days',
        lastUpdated: '2024-01-08'
      }
    ]
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'maturity', name: 'Maturity Wall', icon: Calendar },
    { id: 'covenants', name: 'Covenants', icon: Shield },
    { id: 'liquidity', name: 'Liquidity', icon: Droplet },
    { id: 'structure', name: 'Capital Structure', icon: Layers },
    { id: 'flags', name: 'Risk Flags', icon: AlertTriangle }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      case 'violation': return 'text-red-600 bg-red-100 border-red-200';
      case 'watch': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'compliant': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
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