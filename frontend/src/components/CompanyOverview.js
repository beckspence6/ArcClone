import React, { useState } from 'react';
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
  Activity
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';

const CompanyOverview = ({ companyData }) => {
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showFormula, setShowFormula] = useState(false);

  // Company data with source tracking
  const company = {
    name: companyData?.company?.name || 'Sample Company',
    industry: companyData?.company?.industry || 'Software',
    location: 'San Francisco, CA',
    founded: 2015,
    employees: 328,
    description: companyData?.company?.description || 'BlueSky Software is a leading provider of cloud-based enterprise solutions, specializing in scalable project management and collaboration tools for mid-to-large-sized organizations.',
    logo: '🔵',
    website: 'www.blueskysoft.com',
    
    // Key metrics with source attribution
    metrics: {
      ltmRevenue: {
        value: '$37.4M',
        change: '+15.2%',
        source: 'Financial Statements Q3 2024.xlsx, Page 3',
        formula: 'Sum of quarterly revenue for last 12 months',
        confidence: 96
      },
      grossMargin: {
        value: '29.8%',
        change: '+2.1%',
        source: 'Income Statement, Line 23',
        formula: '(Revenue - COGS) / Revenue × 100',
        confidence: 94
      },
      cash: {
        value: '$3.3M',
        change: '-12.5%',
        source: 'Balance Sheet Q3 2024, Cash & Equivalents',
        formula: 'Cash + Cash Equivalents + Short-term Investments',
        confidence: 98
      },
      existingDebt: {
        value: '$2.1M',
        change: '+5.3%',
        source: 'Balance Sheet, Long-term Debt',
        formula: 'Total Debt - Current Portion of Long-term Debt',
        confidence: 97
      }
    },

    // Management team
    management: [
      { name: 'Emily Thompson', role: 'CEO', tenure: '5 years' },
      { name: 'Michael Harris', role: 'CFO', tenure: '3 years' },
      { name: 'David Chen', role: 'CTO', tenure: '4 years' }
    ],

    // Key investors
    investors: [
      { name: 'Sequoia Capital', type: 'VC', stake: 'Series C' },
      { name: 'aFe, Left Lane Capital', type: 'VC', stake: 'Series B' },
      { name: 'NFX, Greylock Partners', type: 'VC', stake: 'Series A' }
    ],

    // Recent performance data
    revenueData: [
      { quarter: 'Q1 2023', revenue: 28.2, margin: 26.5 },
      { quarter: 'Q2 2023', revenue: 30.1, margin: 27.8 },
      { quarter: 'Q3 2023', revenue: 32.5, margin: 28.2 },
      { quarter: 'Q4 2023', revenue: 34.8, margin: 28.9 },
      { quarter: 'Q1 2024', revenue: 36.2, margin: 29.1 },
      { quarter: 'Q2 2024', revenue: 37.4, margin: 29.8 }
    ]
  };

  const handleMetricClick = (metricKey, metricData) => {
    setSelectedMetric({ key: metricKey, ...metricData });
    setShowSourceModal(true);
  };

  const handleFormulaToggle = (metricKey) => {
    setShowFormula(prev => prev === metricKey ? false : metricKey);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Company Header - Arc Intelligence Style */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl">
                {company.logo}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
                <div className="flex items-center space-x-4 text-blue-100 text-lg mb-3">
                  <span>{company.industry}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{company.location}</span>
                  </div>
                </div>
                <p className="text-blue-100 text-sm max-w-3xl leading-relaxed">
                  {company.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-blue-100 mb-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">AI Confidence: 94%</span>
              </div>
              <a 
                href={`https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-100 hover:text-white transition-colors"
              >
                <span className="text-sm">{company.website}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{company.founded}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Founded</h3>
            <p className="text-sm text-gray-600">{new Date().getFullYear() - company.founded} years in business</p>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{company.employees}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Employees</h3>
            <p className="text-sm text-gray-600">Across all departments</p>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">Series C</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Latest Round</h3>
            <p className="text-sm text-gray-600">Led by Sequoia Capital</p>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">$36M</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Funding</h3>
            <p className="text-sm text-gray-600">Across all rounds</p>
          </motion.div>
        </div>

        {/* Financial Overview - Arc Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Key Financial Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Financial Overview</h3>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(company.metrics).map(([key, metric]) => (
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
                    <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                    <div className="flex items-center space-x-1">
                      {metric.change.startsWith('+') ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
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
                        <p className="text-xs text-blue-600 mt-1">Confidence: {metric.confidence}%</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Rolling Quarterly LTM Revenue & Gross Margin</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={company.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="quarter" 
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
                  <Bar yAxisId="revenue" dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="LTM Revenue ($M)" />
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
          </div>
        </div>

        {/* Management & Investors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Management Team */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Management</h3>
            <div className="space-y-4">
              {company.management.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{member.tenure}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Investors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Investors</h3>
            <div className="space-y-4">
              {company.investors.map((investor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{investor.name}</p>
                    <p className="text-sm text-gray-600">{investor.type}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {investor.stake}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source Modal */}
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
                    <p className="text-3xl font-bold text-gray-900">{selectedMetric.value}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Data Source:</h5>
                    <p className="text-sm text-gray-600">{selectedMetric.source}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Calculation:</h5>
                    <p className="text-sm text-gray-600">{selectedMetric.formula}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">Confidence: {selectedMetric.confidence}%</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Document
                    </button>
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