import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Building2, 
  Calendar, 
  FolderOpen, 
  MoreHorizontal,
  Archive,
  Trash2,
  Edit3,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const CompanyManagement = ({ onSelectCompany, onCreateNew, companies = [], onDeleteCompany }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'distressed': return 'text-red-600 bg-red-100';
      case 'watch': return 'text-yellow-600 bg-yellow-100';
      case 'analyzing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'distressed': return TrendingDown;
      case 'watch': return AlertTriangle;
      case 'analyzing': return Clock;
      default: return Building2;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Distressed Credit Portfolio</h1>
            <p className="text-gray-600">Manage your credit analysis projects and investment targets</p>
          </div>
          <motion.button
            onClick={onCreateNew}
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Add New Company</span>
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search companies, industries, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Companies', value: companies.length, icon: Building2, color: 'blue' },
            { label: 'Distressed', value: companies.filter(c => c.status === 'distressed').length, icon: TrendingDown, color: 'red' },
            { label: 'Watch List', value: companies.filter(c => c.status === 'watch').length, icon: AlertTriangle, color: 'yellow' },
            { label: 'Analyzing', value: companies.filter(c => c.status === 'analyzing').length, icon: Clock, color: 'purple' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Add New Company Card */}
          <motion.div
            onClick={onCreateNew}
            className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-all group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add New Company</h3>
            <p className="text-gray-600">Start analyzing a new distressed credit opportunity</p>
          </motion.div>

          {/* Company Cards */}
          {filteredCompanies.map((company, index) => {
            const StatusIcon = getStatusIcon(company.status);
            return (
              <motion.div
                key={company.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (index + 1) * 0.1 }}
                onClick={() => onSelectCompany(company)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {company.name}
                        </h3>
                        <p className="text-sm text-gray-600">{company.industry}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span className="capitalize">{company.status}</span>
                    </div>
                    {company.lastAnalyzed && (
                      <span className="text-xs text-gray-500">
                        Analyzed {new Date(company.lastAnalyzed).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Total Debt</p>
                      <p className="text-sm font-semibold text-gray-900">{company.totalDebt || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Liquidity</p>
                      <p className="text-sm font-semibold text-gray-900">{company.liquidity || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Next Maturity</p>
                      <p className="text-sm font-semibold text-gray-900">{company.nextMaturity || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Documents</p>
                      <p className="text-sm font-semibold text-gray-900">{company.documentCount || 0}</p>
                    </div>
                  </div>

                  {/* Risk Flags */}
                  {company.riskFlags && Array.isArray(company.riskFlags) && company.riskFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {company.riskFlags.slice(0, 3).map((flag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                        >
                          {typeof flag === 'string' ? flag : flag.title || 'Risk Flag'}
                        </span>
                      ))}
                      {company.riskFlags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{company.riskFlags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>{company.documentCount || 0} docs</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="w-3 h-3" />
                        <span>{company.analysisCount || 0} analyses</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      Updated {company.lastUpdated ? new Date(company.lastUpdated).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {companies.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Companies Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start by adding your first distressed credit opportunity to begin comprehensive analysis.
            </p>
            <motion.button
              onClick={onCreateNew}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add Your First Company
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;