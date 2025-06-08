import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  X, 
  Check, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Brain,
  Loader2,
  Building2,
  Calendar,
  DollarSign,
  FileCheck,
  Tag,
  Folder,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import FMPService from '../services/FMPService';

const AddNewCompany = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [ticker, setTicker] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isPrivateCompany, setIsPrivateCompany] = useState(false);
  const [companySearchResults, setCompanySearchResults] = useState([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [searchingCompanies, setSearchingCompanies] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [taggedFiles, setTaggedFiles] = useState({});

  const steps = [
    { id: 'company', title: 'Company Information', subtitle: 'Enter company name and ticker for analysis' },
    { id: 'upload', title: 'Document Upload', subtitle: 'Upload financial documents for AI analysis' },
    { id: 'review', title: 'Review & Tag', subtitle: 'Review uploaded documents and start analysis' }
  ];

  // Real-time company search using FMP API
  const searchCompanies = async (query) => {
    if (!query || query.length < 2) {
      setCompanySearchResults([]);
      setShowCompanyDropdown(false);
      return;
    }

    try {
      setSearchingCompanies(true);
      console.log(`[AddNewCompany] Searching for companies: ${query}`);
      
      const results = await FMPService.searchCompanies(query, 10);
      
      if (results && Array.isArray(results)) {
        const formattedResults = results.map(company => ({
          symbol: company.symbol,
          name: company.name,
          industry: company.industry || 'N/A',
          sector: company.sector || 'N/A',
          exchangeShortName: company.exchangeShortName || 'N/A',
          currency: company.currency || 'USD',
          isEtf: company.isEtf || false
        }));
        
        setCompanySearchResults(formattedResults);
        setShowCompanyDropdown(true);
        console.log(`[AddNewCompany] Found ${formattedResults.length} companies`);
      } else {
        setCompanySearchResults([]);
        setShowCompanyDropdown(false);
      }
    } catch (error) {
      console.error('[AddNewCompany] Company search error:', error);
      setCompanySearchResults([]);
      setShowCompanyDropdown(false);
      toast.error('Error searching companies. Please try again.');
    } finally {
      setSearchingCompanies(false);
    }
  };

  const handleCompanySelect = (company) => {
    setCompanyName(company.name);
    setTicker(company.symbol);
    setSelectedCompany(company);
    setShowCompanyDropdown(false);
    setCompanySearchResults([]);
    setIsPrivateCompany(false);
    toast.success(`Selected ${company.name} (${company.symbol})`);
  };

  const documentTypes = [
    { id: '10k', label: '10-K (Annual Report)', color: 'blue', icon: '📊' },
    { id: '10q', label: '10-Q (Quarterly Report)', color: 'green', icon: '📈' },
    { id: '8k', label: '8-K (Current Report)', color: 'yellow', icon: '📰' },
    { id: 'credit_agreement', label: 'Credit Agreement', color: 'purple', icon: '📋' },
    { id: 'indenture', label: 'Bond Indenture', color: 'red', icon: '🔒' },
    { id: 'investor_deck', label: 'Investor Presentation', color: 'pink', icon: '🎯' },
    { id: 'earnings_transcript', label: 'Earnings Transcript', color: 'indigo', icon: '🎤' },
    { id: 'bankruptcy_filing', label: 'Bankruptcy Filing', color: 'orange', icon: '⚖️' },
    { id: 'other', label: 'Other Document', color: 'gray', icon: '📄' }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    setProcessingFiles(true);
    
    acceptedFiles.forEach(file => {
      const newFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'processing',
        detectedType: null,
        confidence: 0
      };
      
      setUploadedFiles(prev => [...prev, newFile]);
      
      // Simulate AI document classification
      setTimeout(() => {
        const detectedType = classifyDocument(file.name);
        setUploadedFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { 
                ...f, 
                status: 'ready', 
                detectedType: detectedType.type,
                confidence: detectedType.confidence 
              }
            : f
        ));
        
        // Auto-tag if confidence is high
        if (detectedType.confidence > 0.8) {
          setTaggedFiles(prev => ({
            ...prev,
            [newFile.id]: detectedType.type
          }));
        }
      }, Math.random() * 2000 + 1000);
    });
    
    setTimeout(() => setProcessingFiles(false), 2000);
    toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
  }, []);

  const classifyDocument = (filename) => {
    const name = filename.toLowerCase();
    
    if (name.includes('10-k') || name.includes('10k')) {
      return { type: '10k', confidence: 0.95 };
    }
    if (name.includes('10-q') || name.includes('10q')) {
      return { type: '10q', confidence: 0.95 };
    }
    if (name.includes('8-k') || name.includes('8k')) {
      return { type: '8k', confidence: 0.95 };
    }
    if (name.includes('credit') || name.includes('agreement') || name.includes('facility')) {
      return { type: 'credit_agreement', confidence: 0.85 };
    }
    if (name.includes('indenture') || name.includes('bond')) {
      return { type: 'indenture', confidence: 0.85 };
    }
    if (name.includes('presentation') || name.includes('deck') || name.includes('investor')) {
      return { type: 'investor_deck', confidence: 0.80 };
    }
    if (name.includes('earnings') || name.includes('transcript') || name.includes('call')) {
      return { type: 'earnings_transcript', confidence: 0.80 };
    }
    if (name.includes('bankruptcy') || name.includes('chapter') || name.includes('petition')) {
      return { type: 'bankruptcy_filing', confidence: 0.90 };
    }
    
    return { type: 'other', confidence: 0.30 };
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setTaggedFiles(prev => {
      const newTags = { ...prev };
      delete newTags[fileId];
      return newTags;
    });
  };

  const updateFileTag = (fileId, tag) => {
    setTaggedFiles(prev => ({
      ...prev,
      [fileId]: tag
    }));
  };

  const getDocumentTypeInfo = (typeId) => {
    return documentTypes.find(dt => dt.id === typeId) || documentTypes.find(dt => dt.id === 'other');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: 
        return companyName.trim().length > 0 && (isPrivateCompany || selectedCompany);
      case 1: 
        return uploadedFiles.length > 0;
      case 2: 
        return uploadedFiles.every(file => taggedFiles[file.id]);
      default: 
        return true;
    }
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

  const handleComplete = () => {
    const companyData = {
      id: Date.now(),
      name: companyName,
      status: 'analyzing',
      createdAt: new Date().toISOString(),
      documentCount: uploadedFiles.length,
      files: uploadedFiles.map(file => ({
        ...file,
        documentType: taggedFiles[file.id],
        typeInfo: getDocumentTypeInfo(taggedFiles[file.id])
      }))
    };
    
    onComplete(companyData);
  };

  const renderNameStep = () => (
    <motion.div
      className="space-y-8 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Name</h2>
        <p className="text-gray-600">
          Enter the name of the distressed credit opportunity you want to analyze.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Name *
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g., Hertz Global Holdings, Neiman Marcus, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          autoFocus
        />
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">AI-Powered Analysis</h4>
            <p className="text-blue-800 text-sm">
              Once you upload documents, our AI agents will automatically detect the company name, 
              analyze financial statements, and generate comprehensive distressed credit insights.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderUploadStep = () => (
    <motion.div
      className="space-y-8 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Documents</h2>
        <p className="text-gray-600">
          Upload financial documents for {companyName}. Our AI will automatically classify and analyze them.
        </p>
      </div>

      {/* Document Type Guide */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recommended Document Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {documentTypes.slice(0, 6).map((docType) => (
            <div key={docType.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg">
              <span className="text-lg">{docType.icon}</span>
              <span className="text-sm font-medium text-gray-700">{docType.label}</span>
            </div>
          ))}
        </div>
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
              Supports PDF, Excel, Word documents up to 100MB each
            </p>
          </div>
        </div>
      </div>

      {/* Processing Indicator */}
      {processingFiles && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-blue-50 rounded-xl p-4 border border-blue-200"
        >
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-blue-800 font-medium">AI is classifying your documents...</span>
          </div>
        </motion.div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <motion.div
                key={file.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  {file.status === 'processing' ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-sm text-blue-600">Classifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {file.detectedType && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">{getDocumentTypeInfo(file.detectedType).icon}</span>
                          <span className="text-sm text-gray-600">
                            {getDocumentTypeInfo(file.detectedType).label}
                          </span>
                          <span className="text-xs text-green-600">
                            ({Math.round(file.confidence * 100)}%)
                          </span>
                        </div>
                      )}
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderReviewStep = () => (
    <motion.div
      className="space-y-8 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Review & Tag Documents</h2>
        <p className="text-gray-600">
          Review the AI classification and adjust document tags if needed before starting analysis.
        </p>
      </div>

      <div className="space-y-4">
        {uploadedFiles.map((file) => {
          const currentTag = taggedFiles[file.id];
          const currentTypeInfo = getDocumentTypeInfo(currentTag);
          
          return (
            <motion.div
              key={file.id}
              className="bg-white rounded-xl p-6 border border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-${currentTypeInfo.color}-100 rounded-lg flex items-center justify-center`}>
                    <span className="text-lg">{currentTypeInfo.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{file.name}</h4>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                {file.confidence > 0.8 && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                    <Brain className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">
                      AI Confident
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={currentTag || ''}
                  onChange={(e) => updateFileTag(file.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select document type...</option>
                  {documentTypes.map((docType) => (
                    <option key={docType.id} value={docType.id}>
                      {docType.icon} {docType.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <FileCheck className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Ready for AI Analysis</h4>
            <p className="text-blue-800 mb-4">
              Once you start the analysis, our 5 specialized AI agents will:
            </p>
            <ul className="space-y-1 text-blue-700 text-sm">
              <li>• Parse all financial statements and extract key metrics</li>
              <li>• Build comprehensive capital structure and maturity wall</li>
              <li>• Analyze covenant terms and identify potential risks</li>
              <li>• Calculate liquidity runway and distress indicators</li>
              <li>• Generate investment memo and risk assessment</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Company</h1>
            <p className="text-gray-600 mt-1">Set up a new distressed credit analysis project</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
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
            <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep].title}</h2>
            <p className="text-gray-600 mt-1">{steps[currentStep].subtitle}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && renderNameStep()}
              {currentStep === 1 && renderUploadStep()}
              {currentStep === 2 && renderReviewStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={currentStep === 0 ? onCancel : handlePrevious}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{currentStep === 0 ? 'Cancel' : 'Previous'}</span>
          </motion.button>

          <motion.button
            onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
            disabled={!canProceed()}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: canProceed() ? 1.02 : 1 }}
            whileTap={{ scale: canProceed() ? 0.98 : 1 }}
          >
            <span>{currentStep === steps.length - 1 ? 'Start Analysis' : 'Continue'}</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AddNewCompany;