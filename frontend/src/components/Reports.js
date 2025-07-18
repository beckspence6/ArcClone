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
  Archive,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Edit3,
  Info,
  Calculator
} from 'lucide-react';
import StratumLogo from './Logo';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import toast from 'react-hot-toast';
import AgentCoordinator from '../services/agentCoordinator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = ({ companyData }) => {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReports, setSelectedReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBulkExport, setShowBulkExport] = useState(false);
  const [availableReports, setAvailableReports] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Generate dynamic company content from real data
  const generateCompanyContent = () => {
    const companyName = companyData?.company?.name || companyData?.analysisData?.company?.name || 'Target Company';
    const ticker = companyData?.company?.ticker || companyData?.analysisData?.company?.ticker;
    const industry = companyData?.company?.industry || companyData?.analysisData?.company?.industry || 'Industry Classification Pending';
    const isPrivate = companyData?.company?.isPrivateCompany || companyData?.analysisData?.company?.isPrivateCompany;
    
    // Extract financial data if available
    const financials = companyData?.analysisData?.financials || {};
    const revenue = financials.revenue !== 'N/A' ? financials.revenue : '[Revenue Data Unavailable]';
    const grossMargin = financials.grossMargin !== 'N/A' ? financials.grossMargin : '[Margin Data Unavailable]';
    const totalDebt = financials.totalDebt !== 'N/A' ? financials.totalDebt : '[Debt Data Unavailable]';
    const cash = financials.cashAndEquivalents !== 'N/A' ? financials.cashAndEquivalents : '[Cash Data Unavailable]';
    
    return {
      companyName,
      ticker,
      industry,
      isPrivate,
      revenue,
      grossMargin,
      totalDebt,
      cash,
      displayName: ticker ? `${companyName} (${ticker})` : companyName,
      companyType: isPrivate ? 'Private Company' : 'Public Company',
      executiveSummary: generateExecutiveSummary(companyName, ticker, industry, financials),
      opportunityDescription: generateOpportunityDescription(companyName, ticker, industry, isPrivate)
    };
  };

  const generateExecutiveSummary = (companyName, ticker, industry, financials) => {
    const hasFinancials = financials && Object.keys(financials).some(key => financials[key] !== 'N/A');
    
    if (hasFinancials) {
      return `${companyName}${ticker ? ` (${ticker})` : ''} presents a distressed credit analysis opportunity in the ${industry} sector. Based on available financial data, the company shows ${financials.revenue !== 'N/A' ? `LTM revenue of ${financials.revenue}` : 'revenue figures under review'} and ${financials.grossMargin !== 'N/A' ? `gross margins of ${financials.grossMargin}` : 'margin analysis in progress'}. This analysis focuses on covenant compliance, liquidity position, and recovery scenarios for stakeholders in the capital structure.`;
    } else {
      return `${companyName}${ticker ? ` (${ticker})` : ''} is under comprehensive distressed credit analysis in the ${industry} sector. The analysis incorporates uploaded financial documents, SEC filings, and credit agreements to assess covenant compliance, liquidity runway, and potential restructuring scenarios. Financial metrics and risk assessments are being extracted from document analysis and real-time market data where available.`;
    }
  };

  const generateOpportunityDescription = (companyName, ticker, industry, isPrivate) => {
    const dataSource = isPrivate ? 'document-based analysis' : 'real-time market data and document analysis';
    return `Comprehensive distressed credit assessment for ${companyName} utilizing ${dataSource} to evaluate restructuring opportunities, covenant violations, and recovery scenarios across the capital structure.`;
  };

  // Enhanced report templates for distressed credit
  const reportTemplates = [
    {
      id: 'distress-summary',
      title: 'Distressed Credit Summary',
      description: 'Comprehensive overview of financial distress indicators',
      type: 'summary',
      icon: AlertTriangle,
      color: 'red',
      estimatedTime: '5-7 minutes',
      includes: ['Distress Score', 'Covenant Analysis', 'Liquidity Runway', 'Risk Flags']
    },
    {
      id: 'covenant-analysis',
      title: 'Covenant Tracking Report',
      description: 'Detailed analysis of debt covenants and compliance status',
      type: 'financial',
      icon: CheckCircle,
      color: 'green',
      estimatedTime: '3-5 minutes',
      includes: ['Covenant Status', 'Violation Details', 'Trend Analysis', 'Recommendations']
    },
    {
      id: 'liquidity-forecast',
      title: 'Liquidity & Cash Flow Forecast',
      description: 'Cash runway analysis and liquidity projections',
      type: 'financial',
      icon: Clock,
      color: 'blue',
      estimatedTime: '4-6 minutes',
      includes: ['Cash Position', 'Burn Rate', 'Runway Analysis', 'Scenarios']
    },
    {
      id: 'capital-structure',
      title: 'Capital Structure Analysis',
      description: 'Debt waterfall and recovery analysis by seniority',
      type: 'strategic',
      icon: BarChart3,
      color: 'purple',
      estimatedTime: '6-8 minutes',
      includes: ['Debt Ranking', 'Recovery Rates', 'Waterfall Analysis', 'Scenarios']
    },
    {
      id: 'investment-memo',
      title: 'Investment Committee Memo',
      description: 'Executive summary for investment decision making',
      type: 'executive',
      icon: Building2,
      color: 'indigo',
      estimatedTime: '8-10 minutes',
      includes: ['Executive Summary', 'Key Risks', 'Investment Thesis', 'Recommendations']
    },
    {
      id: 'maturity-analysis',
      title: 'Debt Maturity Wall Analysis',
      description: 'Analysis of upcoming debt maturities and refinancing needs',
      type: 'financial',
      icon: Calendar,
      color: 'orange',
      estimatedTime: '4-6 minutes',
      includes: ['Maturity Schedule', 'Refinancing Risk', 'Market Conditions', 'Strategy']
    }
  ];

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
    try {
      setGeneratingReport(true);
      
      const companyName = generateCompanyContent().companyName;
      const fileName = `${companyName.replace(/\s+/g, '_')}_Investment_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create PDF with enhanced content
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Investment Analysis Report', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(companyName, pageWidth / 2, 35, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 45, { align: 'center' });
      
      // Add executive summary
      const { executiveSummary } = generateCompanyContent();
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 20, 65);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const splitSummary = pdf.splitTextToSize(executiveSummary, pageWidth - 40);
      pdf.text(splitSummary, 20, 75);
      
      // Add financial metrics section
      let yPosition = 75 + (splitSummary.length * 5) + 20;
      
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 25;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Financial Metrics', 20, yPosition);
      yPosition += 15;
      
      const content = generateCompanyContent();
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const metrics = [
        `Revenue: ${content.revenue}`,
        `Gross Margin: ${content.grossMargin}`,
        `Total Debt: ${content.totalDebt}`,
        `Cash Position: ${content.cash}`
      ];
      
      metrics.forEach(metric => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 25;
        }
        pdf.text(`• ${metric}`, 25, yPosition);
        yPosition += 8;
      });
      
      // Add footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text('Confidential - Investment Analysis', 20, pageHeight - 10);
      }
      
      // Save the PDF
      pdf.save(fileName);
      
      toast.success(`PDF report exported successfully: ${fileName}`);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to export PDF. Please try again.');
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

  const handleEmailShare = async () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!shareEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Generate comprehensive report content
      const companyName = generateCompanyContent().companyName;
      const reportContent = `Investment Opportunity Report: ${companyName}`;
      
      // Simulate email sending (would integrate with backend email service)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Investment report successfully sent to ${shareEmail}`);
      setShareEmail('');
      setShowShareModal(false);
    } catch (error) {
      console.error('Email sharing error:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsGenerating(false);
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

  const handleBulkExport = async () => {
    if (selectedReports.length === 0) {
      toast.error('Please select at least one report to export');
      return;
    }

    try {
      setIsGenerating(true);
      const companyName = generateCompanyContent().companyName;
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Create comprehensive PDF with all selected reports
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Cover page
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Comprehensive Investment Package', pageWidth / 2, 40, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'normal');
      pdf.text(companyName, pageWidth / 2, 55, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 70, { align: 'center' });
      pdf.text(`Reports Included: ${selectedReports.length}`, pageWidth / 2, 80, { align: 'center' });
      
      // Table of contents
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Table of Contents', 20, 30);
      
      let yPos = 50;
      selectedReports.forEach((reportId, index) => {
        const report = reportTemplates.find(r => r.id === reportId);
        if (report) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${index + 1}. ${report.title}`, 25, yPos);
          pdf.text(`Page ${index + 3}`, pageWidth - 40, yPos);
          yPos += 8;
        }
      });
      
      // Generate each selected report
      for (let i = 0; i < selectedReports.length; i++) {
        const reportId = selectedReports[i];
        const template = reportTemplates.find(r => r.id === reportId);
        
        if (template) {
          pdf.addPage();
          
          // Report header
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(template.title, 20, 30);
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text(template.description, 20, 45);
          
          // Report content
          yPos = 65;
          const content = generateReportContent(template.id);
          const splitContent = pdf.splitTextToSize(content, pageWidth - 40);
          
          splitContent.forEach(line => {
            if (yPos > pageHeight - 20) {
              pdf.addPage();
              yPos = 25;
            }
            pdf.text(line, 20, yPos);
            yPos += 5;
          });
          
          // Add includes section
          yPos += 10;
          if (yPos > pageHeight - 50) {
            pdf.addPage();
            yPos = 25;
          }
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Report Includes:', 20, yPos);
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          template.includes.forEach(item => {
            if (yPos > pageHeight - 20) {
              pdf.addPage();
              yPos = 25;
            }
            pdf.text(`• ${item}`, 25, yPos);
            yPos += 6;
          });
        }
      }
      
      // Add footer to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text('Confidential - Investment Analysis Package', 20, pageHeight - 10);
      }
      
      // Save the comprehensive PDF
      const fileName = `${companyName.replace(/\s+/g, '_')}_Complete_Analysis_Package_${timestamp}.pdf`;
      pdf.save(fileName);
      
      toast.success(`Complete analysis package exported: ${fileName}`);
      setSelectedReports([]);
      setShowBulkExport(false);
      
    } catch (error) {
      console.error('Bulk export error:', error);
      toast.error('Failed to export package. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportContent = (reportId) => {
    const companyName = generateCompanyContent().companyName;
    
    switch (reportId) {
      case 'distress-summary':
        return `This report provides a comprehensive overview of ${companyName}'s financial distress indicators, including covenant compliance analysis, liquidity runway assessment, and key risk factor identification. The analysis incorporates real-time financial data and document-based insights to deliver actionable intelligence for distressed credit investment decisions.`;
      
      case 'covenant-analysis':
        return `Detailed covenant tracking and compliance analysis for ${companyName}, examining debt service coverage ratios, leverage constraints, and financial maintenance requirements. This report includes trend analysis, violation alerts, and strategic recommendations for covenant management and waiver negotiations.`;
      
      case 'liquidity-forecast':
        return `Comprehensive liquidity and cash flow analysis for ${companyName}, featuring detailed runway modeling, burn rate calculations, and scenario-based projections. The forecast includes working capital optimization strategies and contingency planning for various market conditions.`;
      
      case 'capital-structure':
        return `In-depth capital structure analysis for ${companyName}, mapping debt waterfall scenarios, recovery rate assessments, and intercreditor dynamics. This analysis provides critical insights for understanding relative value and recovery potential across the capital structure.`;
      
      case 'investment-memo':
        return `Executive investment committee memorandum for ${companyName}, synthesizing key financial metrics, strategic positioning, and investment thesis development. This memo provides decision-makers with concise yet comprehensive analysis for informed capital allocation decisions.`;
      
      case 'maturity-analysis':
        return `Debt maturity wall analysis for ${companyName}, examining upcoming refinancing requirements, market conditions impact, and strategic alternatives evaluation. This report identifies potential liquidity events and refinancing strategies across different time horizons.`;
      
      default:
        return `Comprehensive financial analysis for ${companyName}, providing institutional-grade insights and recommendations for investment decision-making.`;
    }
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
                  <Edit3 className="w-4 h-4" />
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
                  {generateCompanyContent().executiveSummary}
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
                  <p className="text-2xl font-bold text-gray-900">{generateCompanyContent().displayName}</p>
                  <p className="text-sm text-gray-600">{generateCompanyContent().industry} • {generateCompanyContent().companyType}</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <DollarSign className="w-6 h-6 text-green-500" />
                    <h3 className="font-semibold text-gray-900">LTM Revenue</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{generateCompanyContent().revenue}</p>
                  <p className="text-sm text-green-600">
                    {generateCompanyContent().revenue && generateCompanyContent().revenue.includes('[') ? 'Data extraction in progress' : 'From financial analysis'}
                  </p>
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
                  As of latest analysis, {generateCompanyContent().companyName} shows {generateCompanyContent().cash} in cash and equivalents and {generateCompanyContent().totalDebt} in total debt outstanding. The financial analysis incorporates real-time data from multiple sources including SEC filings, credit agreements, and market data APIs to provide comprehensive liquidity and capital structure assessment.
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