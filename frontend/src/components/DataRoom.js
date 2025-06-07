import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Download, 
  Calendar, 
  FileType,
  HardDrive,
  ChevronRight,
  Cloud,
  Plus,
  MoreHorizontal,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Brain,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import AgentCoordinator from '../services/agentCoordinator';

const DataRoom = ({ companyData, onAnalyze }) => {
  const [activeTab, setActiveTab] = useState('import');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Initialize with user's existing documents if any
  const [documents, setDocuments] = useState(
    companyData?.documents || companyData?.files || []
  );
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState('');
  const [analysisMessage, setAnalysisMessage] = useState('');
  const fileInputRef = useRef(null);

  const cloudIntegrations = [
    { 
      name: 'SharePoint', 
      icon: Cloud, 
      color: 'blue', 
      connected: false,
      description: 'Connect to Microsoft SharePoint'
    },
    { 
      name: 'Google Drive', 
      icon: Cloud, 
      color: 'green', 
      connected: false,
      description: 'Sync with Google Drive'
    },
    { 
      name: 'Dropbox', 
      icon: Cloud, 
      color: 'blue', 
      connected: false,
      description: 'Import from Dropbox'
    },
    { 
      name: 'Box', 
      icon: Cloud, 
      color: 'blue', 
      connected: false,
      description: 'Connect to Box storage'
    },
    { 
      name: 'Other', 
      icon: Plus, 
      color: 'gray', 
      connected: false,
      description: 'Add custom integration'
    }
  ];

  // Remove mock documents - only show user uploads

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      simulateUpload(file);
    });
  };

  const simulateUpload = (file) => {
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // Add document to list
          const newDoc = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type.split('/')[1]?.toUpperCase() || 'Unknown',
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            date: new Date().toISOString().split('T')[0],
            status: 'uploaded',
            description: 'Ready for AI analysis',
            file: file
          };
          
          setDocuments(prev => [newDoc, ...prev]);
          toast.success(`${file.name} uploaded successfully!`);
          return 100;
        }
        return prev + 15;
      });
    }, 100);
  };

  const removeFile = (fileId) => {
    setDocuments(prev => prev.filter(f => f.id !== fileId));
    toast.success('File removed');
  };

  const startAIAnalysis = async () => {
    if (documents.length === 0) {
      toast.error('Please upload documents before starting analysis');
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const files = documents.map(doc => doc.file);
      
      await AgentCoordinator.analyzeCompany(
        files,
        companyData?.company || {},
        (progress, message, agent) => {
          setAnalysisProgress(progress);
          setAnalysisMessage(message);
          setCurrentAgent(agent);
        }
      );

      const analysisResult = AgentCoordinator.getAnalysisStatus();
      
      if (analysisResult.status === 'completed') {
        toast.success('Analysis completed successfully!');
        
        // Update document statuses
        setDocuments(prev => prev.map(doc => ({
          ...doc,
          status: 'processed',
          description: 'AI analysis completed - insights extracted'
        })));

        // Trigger dashboard update
        if (onAnalyze) {
          onAnalyze(files, analysisResult.results);
        }
      }
    } catch (error) {
      toast.error('Analysis failed: ' + error.message);
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const connectToCloud = (integration) => {
    toast.success(`Connecting to ${integration.name}...`);
    // Simulate connection
    setTimeout(() => {
      toast.success(`Connected to ${integration.name}!`);
    }, 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <span>Data room</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Import</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Data Room</h1>
          <p className="text-gray-600 mt-1">Upload and process financial documents with AI analysis</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'import'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Import
        </button>
        <button
          onClick={() => setActiveTab('connect')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'connect'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Connect
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Upload/Connect */}
        <div>
          {activeTab === 'import' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Import</h3>
              
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-gray-600" />
                </div>
                
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your files here
                </h4>
                <p className="text-gray-600 mb-6">
                  Support for Excel, PDF, Word, and PowerPoint files
                </p>
                
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="w-5 h-5" />
                  <span>Choose Files</span>
                </motion.button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                  accept=".pdf,.xlsx,.xls,.docx,.doc,.pptx,.ppt"
                />
              </div>

              {/* Upload Progress */}
              <AnimatePresence>
                {uploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      <span className="text-sm font-medium text-blue-900">Uploading...</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-blue-700 mt-2">{uploadProgress}% complete</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'connect' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Connect</h3>
              
              <div className="space-y-4">
                {cloudIntegrations.map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <motion.div
                      key={integration.name}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          integration.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          integration.color === 'green' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{integration.name}</h4>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => connectToCloud(integration)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Connect
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Documents Queue */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Documents queue</h3>
              <motion.button
                onClick={startAIAnalysis}
                disabled={documents.length === 0 || analyzing}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-3 mx-auto"
                whileHover={{ scale: documents.length > 0 && !analyzing ? 1.02 : 1 }}
                whileTap={{ scale: documents.length > 0 && !analyzing ? 0.98 : 1 }}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AI Analysis in Progress...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Start AI Analysis ({documents.length} files)</span>
                  </>
                )}
              </motion.button>

              {/* AI Analysis Progress */}
              <AnimatePresence>
                {analyzing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 bg-white rounded-xl p-6 border border-gray-200"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis in Progress</h3>
                      <p className="text-gray-600">{analysisMessage}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{Math.round(analysisProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${analysisProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-600">{currentAgent || 'Coordinator'} Agent</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-600 mb-4">
                <div className="col-span-2">Document</div>
                <div>File</div>
                <div>Date</div>
                <div>File Type</div>
                <div>File Size</div>
              </div>

              {/* Documents List - Only show user uploaded documents */}
              <div className="space-y-3">
                {documents.map((doc) => (
                  <motion.div
                    key={doc.id}
                    className="grid grid-cols-6 gap-4 items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="col-span-2 flex items-center space-x-3">
                      {getStatusIcon(doc.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 truncate">{doc.description}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">📄</div>
                    <div className="text-sm text-gray-600">{doc.date}</div>
                    <div className="text-sm text-gray-600">{doc.type}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">{doc.size}</div>
                      <button
                        onClick={() => removeFile(doc.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {documents.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                  <p className="text-gray-600 mb-4">Upload financial documents to start AI analysis</p>
                  <div className="text-sm text-gray-500">
                    <p>Supported formats: PDF, Excel, Word, PowerPoint</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DataRoom;