import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Eye
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';

const Dashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState('BlueSky');
  
  // Mock data for BlueSky
  const companyData = {
    overview: {
      name: 'BlueSky',
      industry: 'Software',
      location: 'San Francisco, CA',
      founded: '2015',
      totalFunding: '$95M',
      ltmRevenue: '$37.4M',
      grossMargin: '29.8%',
      cash: '$3.3M',
      existingDebt: '-'
    },
    revenueData: [
      { quarter: '9/30/23', revenue: 52, margin: 78 },
      { quarter: '12/31/23', revenue: 54, margin: 76 },
      { quarter: '3/31/24', revenue: 58, margin: 74 },
      { quarter: '6/30/24', revenue: 62, margin: 72 },
      { quarter: '9/30/24', revenue: 70, margin: 81 }
    ],
    creditMapping: {
      criteria: 'Meets Requirements',
      lenderCapital: 'Approved',
      blueSky: 'Qualified',
      status: 'In Progress'
    },
    investors: [
      'Sequoia, a16z, Left Lane, NFX, VC'
    ],
    management: [
      'Emily Thompson',
      'Michael Harris',
      'David Chen'
    ]
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Private Credit Intelligence Platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
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
        className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl p-8 mb-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{companyData.overview.name}</h2>
              <p className="text-blue-100">{companyData.overview.industry}</p>
              <p className="text-blue-100 text-sm">{companyData.overview.location}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <motion.button
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
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
        <motion.div
          className="bg-white rounded-xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Founded date</p>
              <p className="text-2xl font-bold text-gray-900">{companyData.overview.founded}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total funding</p>
              <p className="text-2xl font-bold text-gray-900">{companyData.overview.totalFunding}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">LTM Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{companyData.overview.ltmRevenue}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">+12%</span>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">LTM Gross Margin</p>
              <p className="text-2xl font-bold text-gray-900">{companyData.overview.grossMargin}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">+2.1%</span>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-teal-500" />
          </div>
        </motion.div>
      </div>

      {/* Revenue Chart and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Rolling Quarterly LTM Revenue & Gross Margin</h3>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">LTM Revenue</p>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-gray-900">$60.4M</span>
              <span className="text-lg text-teal-600 font-medium">81.8% Gross Margin</span>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={companyData.revenueData}>
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
                  domain={[0, 80]}
                />
                <YAxis 
                  yAxisId="margin"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  yAxisId="revenue"
                  dataKey="revenue" 
                  fill="#0891b2" 
                  radius={[4, 4, 0, 0]}
                  name="LTM Revenue ($M)"
                />
                <Line 
                  yAxisId="margin"
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Gross Margin (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Company Details */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {/* Overview */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Overview</h4>
            <div className="space-y-3 text-sm">
              <p className="text-gray-600">
                BlueSky Software is a leading provider of cloud-based enterprise solutions, specializing in scalable project management and collaboration tools for mid-to-large-sized organizations.
              </p>
            </div>
          </div>

          {/* Latest Round */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Latest round</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Series C ($30M, 2021)</span>
              </div>
            </div>
          </div>

          {/* Total employees */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Total employees</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-gray-900">326</span>
              </div>
            </div>
          </div>

          {/* Investors */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Investors</h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">{companyData.investors[0]}</p>
            </div>
          </div>

          {/* Management */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Management</h4>
            <div className="space-y-2 text-sm">
              {companyData.management.map((person, index) => (
                <p key={index} className="text-gray-600">{person}</p>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Financial Summary */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        {/* Cash */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Cash</h4>
          <div className="flex items-baseline space-x-3">
            <span className="text-2xl font-bold text-gray-900">{companyData.overview.cash}</span>
            <span className="text-sm text-gray-500">—</span>
          </div>
        </div>

        {/* Existing Debt */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Existing Debt</h4>
          <div className="flex items-baseline space-x-3">
            <span className="text-2xl font-bold text-gray-900">{companyData.overview.existingDebt}</span>
          </div>
        </div>
      </motion.div>

      {/* Credit Box Mapping */}
      <motion.div
        className="mt-8 bg-white rounded-xl p-6 border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h4 className="font-semibold text-gray-900 mb-4">Credit box mapping</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Criteria</p>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {companyData.creditMapping.criteria}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Lender Capital</p>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {companyData.creditMapping.lenderCapital}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">BlueSky</p>
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {companyData.creditMapping.blueSky}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              {companyData.creditMapping.status}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;