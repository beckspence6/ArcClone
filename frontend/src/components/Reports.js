import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Share2, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Building2,
  Eye,
  Mail,
  Link,
  Package,
  Zap,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  Archive
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import toast from 'react-hot-toast';
import AgentCoordinator from '../services/agentCoordinator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = ({ companyData }) => {
  const [selectedReport, setSelectedReport] = useState('opportunity-memo');
  const [showFormula, setShowFormula] = useState(false);
  const [expandedSection, setExpandedSection] = useState('definition');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [availableReports, setAvailableReports] = useState([]);

  useEffect(() => {
    if (companyData) {
      loadAvailableReports();
      generateDefaultReport();
    }
  }, [companyData]);

  const loadAvailableReports = () => {
    const reports = [
      {
        id: 'opportunity-memo',
        name: 'Investment Opportunity Memo',
        company: companyData?.company?.name || 'Company',
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'Generated',
        type: 'Investment Analysis'
      },
      {
        id: 'financial-analysis',
        name: 'Financial Analysis Report',
        company: companyData?.company?.name || 'Company',
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'Available',
        type: 'Financial Review'
      },
      {
        id: 'risk-assessment',
        name: 'Risk Assessment Report',
        company: companyData?.company?.name || 'Company',
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'Available',
        type: 'Risk Analysis'
      }
    ];
    setAvailableReports(reports);
  };

  const generateDefaultReport = async () => {
    setGeneratingReport(true);
    try {
      const report = await AgentCoordinator.generateReport(companyData, 'comprehensive');
      setReportData(report);
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportToPDF = async () => {
    setGeneratingReport(true);
    try {
      toast.success('Generating PDF report...');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Title Page
      pdf.setFontSize(24);
      pdf.text(companyData?.company?.name || 'Investment Report', pageWidth / 2, 30, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text('Investment Analysis Report', pageWidth / 2, 45, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 60, { align: 'center' });
      pdf.text('Powered by Stratum AI', pageWidth / 2, 70, { align: 'center' });
      
      // Executive Summary
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Executive Summary', 20, 30);
      
      pdf.setFontSize(11);
      const summaryText = reportData?.executiveSummary || 
        `${companyData?.company?.name || 'The company'} presents a compelling investment opportunity with strong financial fundamentals and growth potential. Our AI analysis indicates positive indicators across key metrics including revenue growth, profitability, and market position.`;
      
      const splitSummary = pdf.splitTextToSize(summaryText, pageWidth - 40);
      pdf.text(splitSummary, 20, 45);
      
      // Financial Metrics
      if (companyData?.financials) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text('Key Financial Metrics', 20, 30);
        
        pdf.setFontSize(11);
        let yPos = 50;
        
        Object.entries(companyData.financials).forEach(([key, value]) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = 30;
          }
          pdf.text(`${key}: ${value}`, 20, yPos);
          yPos += 10;
        });
      }
      
      // Save PDF
      pdf.save(`${companyData?.company?.name || 'Company'}_Investment_Report.pdf`);
      toast.success('PDF report generated successfully!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingReport(false);
    }
  };

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: `${companyData?.company?.name || 'Company'} Investment Report`,
        text: 'Investment analysis report generated by Stratum AI',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report link copied to clipboard!');
    }
  };

  // If no company data, show empty state
  if (!companyData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 max-w-md mx-auto border border-gray-200"
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Reports Available</h2>
            <p className="text-gray-600 mb-6">
              Upload documents and complete AI analysis to generate comprehensive investment reports.
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

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Report Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <span>Reports</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 font-medium">Opportunity memo</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Opportunity memo</h1>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </motion.button>
                <motion.button
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-8">
            {/* Executive Summary */}
            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive summary</h2>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  BlueSky Software presents a compelling investment opportunity in the enterprise software space. 
                  The company has demonstrated strong revenue growth with LTM revenue of $70.2M and improving gross margins of 81.3%. 
                  The business model is subscription-based with high customer retention rates and expanding market presence in the 
                  project management sector.
                </p>
              </div>
            </motion.section>

            {/* Opportunity Overview */}
            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Opportunity overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Building2 className="w-6 h-6 text-blue-500" />
                    <h3 className="font-semibold text-gray-900">Company</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">BlueSky</p>
                  <p className="text-sm text-gray-600">Software • San Francisco, CA</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <DollarSign className="w-6 h-6 text-green-500" />
                    <h3 className="font-semibold text-gray-900">LTM Revenue</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">$70.2M</p>
                  <p className="text-sm text-green-600">+15% YoY growth</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-6 h-6 text-teal-500" />
                    <h3 className="font-semibold text-gray-900">Gross Margin</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">81.3%</p>
                  <p className="text-sm text-teal-600">Improving trend</p>
                </div>
              </div>
            </motion.section>

            {/* Revenue Chart */}
            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Rolling Quarterly LTM Revenue & Gross Margin</h3>
                  <button
                    onClick={() => setShowFormula(!showFormula)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Calculator className="w-4 h-4" />
                    <span className="text-sm">Formula</span>
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">LTM Revenue</p>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold text-gray-900">$70.2M</span>
                    <span className="text-lg text-teal-600 font-medium">81.3% Gross Margin</span>
                  </div>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={reportData?.revenueData || []}>
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
              </div>
            </motion.section>

            {/* Balance Sheet */}
            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Balance sheet</h2>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">As of September 2024</h3>
                  <span className="text-sm text-gray-500">DATA ROOM</span>
                </div>
                <p className="text-gray-700 mb-6">
                  As of 9/30/24, BlueSky had $19.7 million cash and $15.0 million long-term debt 
                  outstanding. The company has negative working capital, like many software companies.
                </p>
                
                <div className="border border-gray-200 rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">Rolling Quarterly Balance Sheet</h4>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Assets</p>
                        <div className="space-y-1 text-gray-600">
                          <div className="flex justify-between">
                            <span>Cash & Equivalents</span>
                            <span>$19.7M</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Accounts Receivable</span>
                            <span>$12.3M</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Current Assets</span>
                            <span>$35.2M</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Liabilities</p>
                        <div className="space-y-1 text-gray-600">
                          <div className="flex justify-between">
                            <span>Accounts Payable</span>
                            <span>$8.1M</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Long-term Debt</span>
                            <span>$15.0M</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Liabilities</span>
                            <span>$28.4M</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Equity</p>
                        <div className="space-y-1 text-gray-600">
                          <div className="flex justify-between">
                            <span>Shareholders' Equity</span>
                            <span>$42.1M</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Retained Earnings</span>
                            <span>$18.7M</span>
                          </div>
                          <div className="flex justify-between font-medium text-gray-900">
                            <span>Total Equity</span>
                            <span>$60.8M</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>

        {/* Formula Sidebar */}
        <AnimatePresence>
          {showFormula && (
            <motion.div
              className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen"
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Formula</h3>
                  <button
                    onClick={() => setShowFormula(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">LTM Gross Margin</p>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Definition */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('definition')}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">Definition</span>
                    {expandedSection === 'definition' ? 
                      <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'definition' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-900 mb-2">LTM Gross Margin</p>
                          <p className="text-sm text-gray-600">
                            LTM gross profit divided by LTM revenue.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Methodology */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('methodology')}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">Methodology</span>
                    {expandedSection === 'methodology' ? 
                      <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'methodology' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="space-y-3 text-sm text-gray-600">
                          <div className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            <p>LTM revenue was calculated using the most recent 12 months of revenue data as of 9/30/2024 from the <a href="#" className="text-blue-600 underline">Income Statement</a>.</p>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            <p>LTM gross profit was calculated using the most recent 12 months of gross profit data as of 9/30/2024 from the <a href="#" className="text-blue-600 underline">Income Statement</a>.</p>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            <p>LTM gross margin was calculated by dividing LTM gross profit by LTM revenue.</p>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            <p>LTM gross margin calculation was repeated for each historical quarter with complete LTM data available.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Calculation */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('calculation')}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">Calculation</span>
                    {expandedSection === 'calculation' ? 
                      <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'calculation' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="bg-gray-900 rounded-lg p-4 text-white font-mono text-sm">
                          <div>LTM Gross Margin = </div>
                          <div className="text-green-400">  (LTM Gross Profit / LTM Revenue) * 100</div>
                          <div className="mt-2 text-gray-400">= ($57.1M / $70.2M) * 100</div>
                          <div className="text-blue-400">= 81.3%</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sources */}
                <div>
                  <button
                    onClick={() => toggleSection('sources')}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">Sources</span>
                    {expandedSection === 'sources' ? 
                      <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'sources' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">Income Statement</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">📄</span>
                              <span className="text-sm text-gray-600">bluesky_IS.xlsx</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Reports;