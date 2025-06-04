import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Building2, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Check,
  AlertCircle,
  Loader2,
  X,
  Plus
} from 'lucide-react';
import StratumLogo from './Logo';
import toast from 'react-hot-toast';

const OnboardingFlow = ({ onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companyType: 'private',
    ticker: '',
    description: '',
    analysisType: 'comprehensive'
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Stratum',
      subtitle: 'Let\'s set up your AI-powered financial analysis platform'
    },
    {
      id: 'company-info',
      title: 'Company Information',
      subtitle: 'Tell us about the company you want to analyze'
    },
    {
      id: 'document-upload',
      title: 'Upload Documents',
      subtitle: 'Upload financial documents for AI analysis'
    },
    {
      id: 'analysis-preferences',
      title: 'Analysis Preferences',
      subtitle: 'Customize your analysis settings'
    }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploaded',
      progress: 100
    }))]);
    toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/csv': ['.csv']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      const files = uploadedFiles.map(f => f.file);
      await onComplete(files, formData);
    } catch (error) {
      toast.error('Error setting up your account. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderWelcomeStep = () => (
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4">
        <StratumLogo size="xl" className="justify-center" />
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Stratum</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your financial analysis with AI-powered insights. 
          Let's get you set up in just a few minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="p-6 bg-blue-50 rounded-xl text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-gray-600 text-sm">Drag & drop your financial documents for instant analysis</p>
        </div>

        <div className="p-6 bg-green-50 rounded-xl text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
          <p className="text-gray-600 text-sm">Our AI agents analyze and extract key financial insights</p>
        </div>

        <div className="p-6 bg-purple-50 rounded-xl text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Generate Reports</h3>
          <p className="text-gray-600 text-sm">Get comprehensive reports and investment insights</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-500 mb-4">Ready to begin your analysis journey?</p>
        <motion.button
          onClick={handleNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Get Started</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );

  const renderCompanyInfoStep = () => (
    <motion.div
      className="space-y-8 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Company Information</h2>
        <p className="text-gray-600">
          Tell us about the company you want to analyze. This helps our AI provide more accurate insights.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="e.g., Apple Inc., Tesla, Amazon"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Energy">Energy</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Type</label>
            <select
              value={formData.companyType}
              onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="private">Private Company</option>
              <option value="public">Public Company</option>
            </select>
          </div>
        </div>

        {formData.companyType === 'public' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Ticker (Optional)</label>
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              placeholder="e.g., AAPL, TSLA, AMZN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              We'll automatically fetch real-time financial data for public companies
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the company's business model and operations..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderDocumentUploadStep = () => (
    <motion.div
      className="space-y-8 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Financial Documents</h2>
        <p className="text-gray-600">
          Upload financial statements, reports, or any relevant documents for AI analysis.
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-gray-600 mb-4">
              or <span className="text-blue-600 font-medium">browse to choose files</span>
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, Excel, Word documents up to 50MB each
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h3>
          <div className="space-y-2">
            {uploadedFiles.map((item) => (
              <motion.div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{item.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Ready</span>
                  </div>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Skip Option */}
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">No documents to upload?</h4>
        <p className="text-gray-600 text-sm mb-4">
          You can skip this step and use our demo data, or upload documents later.
        </p>
        <button
          onClick={handleNext}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Continue with demo data →
        </button>
      </div>
    </motion.div>
  );

  const renderAnalysisPreferencesStep = () => (
    <motion.div
      className="space-y-8 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Analysis Preferences</h2>
        <p className="text-gray-600">
          Customize how our AI analyzes your financial data.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">Analysis Type</label>
          <div className="space-y-3">
            <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="analysisType"
                value="comprehensive"
                checked={formData.analysisType === 'comprehensive'}
                onChange={(e) => setFormData({ ...formData, analysisType: e.target.value })}
                className="mt-1"
              />
              <div>
                <h4 className="font-medium text-gray-900">Comprehensive Analysis</h4>
                <p className="text-gray-600 text-sm">
                  Full financial analysis including ratios, trends, risk assessment, and investment recommendations.
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="analysisType"
                value="focused"
                checked={formData.analysisType === 'focused'}
                onChange={(e) => setFormData({ ...formData, analysisType: e.target.value })}
                className="mt-1"
              />
              <div>
                <h4 className="font-medium text-gray-900">Focused Analysis</h4>
                <p className="text-gray-600 text-sm">
                  Targeted analysis on specific financial aspects like profitability, liquidity, or growth.
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="analysisType"
                value="quick"
                checked={formData.analysisType === 'quick'}
                onChange={(e) => setFormData({ ...formData, analysisType: e.target.value })}
                className="mt-1"
              />
              <div>
                <h4 className="font-medium text-gray-900">Quick Overview</h4>
                <p className="text-gray-600 text-sm">
                  Fast summary of key financial metrics and health indicators.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-6 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Getting Started</h4>
              <p className="text-blue-800 text-sm">
                You can always change these preferences later in your dashboard settings. 
                Our AI will adapt to your analysis needs over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName.trim().length > 0;
      case 2:
        return true; // Can proceed even without files
      case 3:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index !== steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-4
                    ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h2>
            <p className="text-gray-600 mt-2">{steps[currentStep].subtitle}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && renderWelcomeStep()}
              {currentStep === 1 && renderCompanyInfoStep()}
              {currentStep === 2 && renderDocumentUploadStep()}
              {currentStep === 3 && renderAnalysisPreferencesStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {currentStep > 0 && (
          <div className="flex items-center justify-between">
            <motion.button
              onClick={handlePrevious}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </motion.button>

            <motion.button
              onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
              disabled={!canProceed() || isProcessing}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: canProceed() && !isProcessing ? 1.02 : 1 }}
              whileTap={{ scale: canProceed() && !isProcessing ? 0.98 : 1 }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;