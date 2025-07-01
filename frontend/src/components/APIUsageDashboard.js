import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Zap,
  Shield,
  Loader2
} from 'lucide-react';
import MultiAPIService from '../services/MultiAPIService';

const APIUsageDashboard = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAPIStatus = async () => {
      try {
        setLoading(true);
        const status = await MultiAPIService.getAPIStatus();
        setApiStatus(status);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAPIStatus();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAPIStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (api) => {
    if (!api.available) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (api.rateLimitStatus === 'critical') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (api.rateLimitStatus === 'warning') return <Clock className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusColor = (api) => {
    if (!api.available) return 'border-red-200 bg-red-50';
    if (api.rateLimitStatus === 'critical') return 'border-red-200 bg-red-50';
    if (api.rateLimitStatus === 'warning') return 'border-yellow-200 bg-yellow-50';
    return 'border-green-200 bg-green-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">API Status Dashboard</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Checking API status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">API Status Dashboard</h3>
        </div>
        <p className="text-red-600">Error loading API status: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">API Status Dashboard</h3>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{apiStatus.summary.availableAPIs}/{apiStatus.summary.totalAPIs} APIs Active</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Available APIs</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {apiStatus.summary.availableAPIs}
          </p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Rate Limited</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700 mt-1">
            {apiStatus.summary.criticalAPIs}
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Reliability</span>
          </div>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {Math.round((apiStatus.summary.availableAPIs / apiStatus.summary.totalAPIs) * 100)}%
          </p>
        </div>
      </div>

      {/* Individual API Status */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Individual API Status</h4>
        {Object.entries(apiStatus.apis).map(([name, api]) => (
          <motion.div
            key={name}
            className={`rounded-lg border p-4 ${getStatusColor(api)}`}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(api)}
                <div>
                  <h5 className="font-medium text-gray-900">{name}</h5>
                  <p className="text-xs text-gray-600">
                    Priority {api.priority} • {api.confidence}% accuracy
                  </p>
                </div>
              </div>
              
              {api.available && api.usage && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {api.usage.current}/{api.usage.limit}
                  </div>
                  <div className="text-xs text-gray-600">
                    {api.usage.percentage}% used
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${
                        api.rateLimitStatus === 'critical' ? 'bg-red-500' :
                        api.rateLimitStatus === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(api.usage.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {!api.available && (
                <div className="text-right">
                  <div className="text-sm font-medium text-red-600">Unavailable</div>
                  <div className="text-xs text-red-500">
                    {api.error ? 'Error' : 'Rate Limited'}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendation */}
      {apiStatus.summary.recommendation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-blue-900">Recommendation</h5>
              <p className="text-sm text-blue-700 mt-1">
                {apiStatus.summary.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIUsageDashboard;