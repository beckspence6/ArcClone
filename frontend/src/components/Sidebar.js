import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  MessageSquare, 
  Settings, 
  Building2,
  ChevronDown,
  ChevronUp,
  File,
  Download,
  Users,
  CreditCard,
  LogOut,
  ArrowLeft,
  Check
} from 'lucide-react';
import StratumLogo from './Logo';

const Sidebar = ({ currentView, setCurrentView, user, companyData, onLogout, onBackToCompanies }) => {
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'dataroom', name: 'Data room', icon: FolderOpen },
    { id: 'reports', name: 'Reports', icon: FileText },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
  ];

  const settings = [
    { id: 'settings', name: 'General', icon: Settings },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'plans', name: 'Plans', icon: CreditCard },
  ];

  const fileActions = [
    { id: 'export', name: 'Export', icon: Download },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <StratumLogo size="medium" />
      </div>

      {/* Company Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-900">
              {companyData?.company?.name || user?.company || 'Demo Company'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
              <span className="font-medium">{item.name}</span>
            </motion.button>
          );
        })}

        {/* Settings Section */}
        <div className="pt-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Settings</p>
          {settings.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                <span className="font-medium">{item.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* File Actions */}
        <div className="pt-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">File</p>
          {fileActions.map((item) => {
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.id}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{item.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Demo User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role || 'Analyst'}</p>
            </div>
          </div>
          <motion.button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;