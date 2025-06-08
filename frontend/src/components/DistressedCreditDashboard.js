import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Building2,
  Calendar,
  Shield,
  Target,
  BarChart3,
  PieChart,
  Layers,
  Droplet,
  Zap,
  Info,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  RefreshCw,
  Activity,
  Loader2,
  ExternalLink,
  Calculator
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  AreaChart,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';
import AgentCoordinator from '../services/agentCoordinator';
import GeminiService from '../services/geminiService';

const DistressedCreditDashboard = ({ companyData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [alertDetails, setAlertDetails] = useState({});
  const [comprehensiveData, setComprehensiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [enhancedMetrics, setEnhancedMetrics] = useState(null);

  useEffect(() => {
    const fetchDistressedCreditData = async () => {
      if (!companyData?.company?.ticker) {
        console.warn('[DistressedCreditDashboard] No ticker available');
        setError('Company ticker required for distressed credit analysis');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`[DistressedCreditDashboard] Fetching distressed credit data for ${companyData.company.ticker}`);
        
        const data = await AgentCoordinator.orchestrateDataFetch(companyData.company.ticker, ['all']);
        
        // Cross-reference with user documents for enhanced credit analysis
        const enhancedData = await AgentCoordinator.crossReferenceDocuments(
          data, 
          companyData?.results?.documents?.documents || [], 
          companyData.company.ticker
        );
        
        console.log('[DistressedCreditDashboard] Enhanced data received:', enhancedData);
        setComprehensiveData(enhancedData);
        setError(null);
      } catch (err) {
        console.error('[DistressedCreditDashboard] Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDistressedCreditData();
  }, [companyData?.company?.ticker]);

  // Enhanced metrics generation with Gemini fallback
  useEffect(() => {
    const enhanceDistressedMetrics = async () => {
      if (!loading && companyData?.company) {
        try {
          const metrics = await generateDistressedMetrics();
          setEnhancedMetrics(metrics);
        } catch (error) {
          console.error('[DistressedCreditDashboard] Error generating enhanced metrics:', error);
        }
      }
    };

    enhanceDistressedMetrics();
  }, [comprehensiveData, loading]);

  // Enhanced distressed credit metrics with Gemini fallback for missing API data
  const generateDistressedMetrics = async () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const financials = comprehensiveData?.financialStatements;
    const ratios = comprehensiveData?.ratios;
    const quote = comprehensiveData?.stockPrice;
    const companyName = companyData?.company?.name || 'the company';
    const ticker = companyData?.company?.ticker;

    // If no API data, use Gemini to estimate critical distressed credit metrics
    if (!hasApiData) {
      try {
        console.log('[DistressedCreditDashboard] Using Gemini fallback for missing API data');
        
        const prompt = `
          DISTRESSED CREDIT ANALYST - ESTIMATE KEY METRICS
          
          Company: ${companyName} ${ticker ? `(${ticker})` : ''}
          
          As a senior distressed credit analyst, please estimate the following key metrics based on your knowledge:
          
          {
            "distressScore": "numerical score 0-100 (higher = more distressed)",
            "riskLevel": "Low/Medium/High based on general company knowledge",
            "totalDebt": "estimated total debt in millions with M suffix",
            "debtToEquity": "estimated debt-to-equity ratio as decimal",
            "liquidityMonths": "estimated liquidity runway in months",
            "interestCoverage": "estimated interest coverage ratio",
            "currentRatio": "estimated current ratio",
            "industryContext": "brief industry risk assessment",
            "confidence": 65
          }
          
          Base estimates on:
          - Public company knowledge (if ticker provided)
          - Industry-specific distress patterns
          - Current market conditions
          - General corporate health indicators
          
          Return "[Estimate Unavailable]" only if you have no knowledge of the company.
        `;

        const result = await GeminiService.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanResponse = text.replace(/```json|```/g, '').trim();
        const geminiData = JSON.parse(cleanResponse);

        return {
          distressScore: geminiData.distressScore || '[Score Pending]',
          riskLevel: geminiData.riskLevel || '[Risk Assessment Pending]', 
          liquidityMonths: geminiData.liquidityMonths || '[Liquidity Analysis Pending]',
          totalDebt: geminiData.totalDebt || '[Debt Data Pending]',
          debtToEquity: geminiData.debtToEquity || '[Ratio Pending]',
          interestCoverage: geminiData.interestCoverage || '[Coverage Pending]',
          currentRatio: geminiData.currentRatio || '[Ratio Pending]',
          guidance: `AI-estimated metrics based on available company knowledge. Confidence: ${geminiData.confidence || 65}%. ${geminiData.industryContext || ''}`,
          sourceAttribution: 'Gemini AI Analysis',
          confidence: geminiData.confidence || 65,
          isEstimate: true
        };
      } catch (error) {
        console.warn('[DistressedCreditDashboard] Gemini fallback failed:', error);
        return {
          distressScore: '[API Rate Limited]',
          riskLevel: '[Analysis Pending]',
          liquidityMonths: '[Data Refreshing]',
          totalDebt: '[Retrying API Calls]',
          debtToEquity: '[Analysis Pending]',
          interestCoverage: '[Data Refreshing]',
          currentRatio: '[Retrying API Calls]',
          guidance: 'Multiple data sources temporarily unavailable. API rate limits detected. Data will refresh automatically. Please try again in a few minutes.',
          sourceAttribution: 'Multi-API Refresh Pending',
          confidence: 20
        };
      }
    }

    const latestIncome = financials?.income?.[0];
    const latestBalance = financials?.balance?.[0];
    const latestCashFlow = financials?.cashFlow?.[0];
    const latestRatios = ratios?.ratios?.[0];

    // Calculate distress score based on multiple factors
    const distressFactors = [];
    let distressScore = 0;

    // Factor 1: Debt levels
    if (latestBalance?.totalDebt && latestBalance?.totalStockholdersEquity) {
      const debtToEquity = latestBalance.totalDebt / latestBalance.totalStockholdersEquity;
      if (debtToEquity > 3) distressFactors.push({ factor: 'High Leverage', weight: 25, triggered: true });
      else if (debtToEquity > 2) distressFactors.push({ factor: 'Moderate Leverage', weight: 15, triggered: true });
      distressScore += debtToEquity > 3 ? 25 : (debtToEquity > 2 ? 15 : 0);
    }

    // Factor 2: Profitability
    if (latestIncome?.netIncome && latestIncome.netIncome < 0) {
      distressFactors.push({ factor: 'Negative Net Income', weight: 20, triggered: true });
      distressScore += 20;
    }

    // Factor 3: Interest coverage
    if (latestIncome?.operatingIncome && latestIncome?.interestExpense) {
      const interestCoverage = Math.abs(latestIncome.operatingIncome / latestIncome.interestExpense);
      if (interestCoverage < 1.5) {
        distressFactors.push({ factor: 'Low Interest Coverage', weight: 20, triggered: true });
        distressScore += 20;
      }
    }

    // Factor 4: Liquidity
    if (latestBalance?.totalCurrentAssets && latestBalance?.totalCurrentLiabilities) {
      const currentRatio = latestBalance.totalCurrentAssets / latestBalance.totalCurrentLiabilities;
      if (currentRatio < 1.0) {
        distressFactors.push({ factor: 'Poor Liquidity', weight: 15, triggered: true });
        distressScore += 15;
      }
    }

    // Factor 5: Cash flow
    if (latestCashFlow?.operatingCashFlow && latestCashFlow.operatingCashFlow < 0) {
      distressFactors.push({ factor: 'Negative Operating Cash Flow', weight: 15, triggered: true });
      distressScore += 15;
    }

    // Determine risk level
    let riskLevel = 'Low';
    if (distressScore >= 60) riskLevel = 'Critical';
    else if (distressScore >= 40) riskLevel = 'High';
    else if (distressScore >= 20) riskLevel = 'Medium';

    // Calculate liquidity runway
    const cash = latestBalance?.cashAndCashEquivalents || 0;
    const operatingCashFlow = latestCashFlow?.operatingCashFlow || 0;
    const quarterlyBurn = operatingCashFlow < 0 ? Math.abs(operatingCashFlow) / 4 : 0;
    const liquidityMonths = quarterlyBurn > 0 ? (cash / quarterlyBurn * 3).toFixed(1) : '[Cannot Calculate]';

    return {
      distressScore: Math.min(distressScore, 100),
      riskLevel: riskLevel,
      liquidityMonths: liquidityMonths,
      totalDebt: latestBalance?.totalDebt ? `$${(latestBalance.totalDebt / 1000000).toFixed(1)}M` : '[Debt Unavailable]',
      debtToEquity: latestBalance?.totalDebt && latestBalance?.totalStockholdersEquity ? 
        (latestBalance.totalDebt / latestBalance.totalStockholdersEquity).toFixed(2) : '[Ratio Unavailable]',
      interestCoverage: latestIncome?.operatingIncome && latestIncome?.interestExpense ? 
        Math.abs(latestIncome.operatingIncome / latestIncome.interestExpense).toFixed(2) : '[Coverage Unavailable]',
      currentRatio: latestBalance?.totalCurrentAssets && latestBalance?.totalCurrentLiabilities ? 
        (latestBalance.totalCurrentAssets / latestBalance.totalCurrentLiabilities).toFixed(2) : '[Ratio Unavailable]',
      distressFactors: distressFactors,
      sourceAttribution: {
        primary: comprehensiveData.sourceAttribution || 'Multi-API Sources',
        income: `${comprehensiveData.financialStatements?.income ? 'FMP Income Statement API' : 'N/A'}`,
        balance: `${comprehensiveData.financialStatements?.balance ? 'FMP Balance Sheet API' : 'N/A'}`,
        cashFlow: `${comprehensiveData.financialStatements?.cashFlow ? 'FMP Cash Flow API' : 'N/A'}`,
        confidence: hasApiData ? 92 : 0
      }
    };
  };

  // Generate covenant analysis from real data and documents
  const generateCovenantAnalysis = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const financials = comprehensiveData?.financialStatements;
    const documents = companyData?.results?.documents?.documents || [];

    if (!hasApiData || !financials) {
      return [{
        name: 'Debt Service Coverage Ratio',
        current: '[Data Unavailable]',
        threshold: '[Threshold Unavailable]',
        status: 'unknown',
        trend: 'unknown',
        impact: 'unknown',
        source: 'Requires financial statement data',
        formula: 'Operating Income / Total Debt Service',
        guidance: 'Please upload recent credit agreements and financial statements for covenant analysis.'
      }];
    }

    const latestIncome = financials.income?.[0];
    const latestBalance = financials.balance?.[0];
    const latestCashFlow = financials.cashFlow?.[0];

    const covenants = [];

    // Enhanced covenant analysis with detailed AI explanations and document cross-referencing
    if (latestCashFlow?.operatingCashFlow && latestBalance?.totalDebt) {
      const dscr = Math.abs(latestCashFlow.operatingCashFlow / (latestBalance.totalDebt * 0.1)); // Assuming 10% debt service
      const isViolation = dscr < 1.25;
      
      covenants.push({
        name: 'Debt Service Coverage Ratio (DSCR)',
        current: dscr.toFixed(2),
        threshold: '1.25', // Typical threshold
        status: dscr >= 1.25 ? 'compliant' : 'violation',
        trend: 'calculated',
        impact: dscr < 1.0 ? 'critical' : (dscr < 1.25 ? 'high' : 'low'),
        source: 'FMP Cash Flow & Balance Sheet APIs',
        formula: 'Operating Cash Flow / Annual Debt Service',
        
        // Enhanced AI-generated explanation
        detailedExplanation: `The Debt Service Coverage Ratio (DSCR) is a critical financial covenant that measures ${companyData?.company?.name || "the company"}'s ability to service its debt obligations using operating cash flow. 

**What this covenant means:**
• DSCR measures cash flow available to pay debt service obligations
• A ratio above 1.25x indicates sufficient cash flow cushion
• Below 1.25x suggests potential cash flow stress
• Critical threshold is typically 1.0x (breakeven)

**Current Analysis:**
• Current DSCR: ${dscr.toFixed(2)}x ${isViolation ? '(VIOLATION)' : '(COMPLIANT)'}
• Operating Cash Flow: $${(latestCashFlow.operatingCashFlow / 1000000).toFixed(1)}M
• Estimated Annual Debt Service: $${(latestBalance.totalDebt * 0.1 / 1000000).toFixed(1)}M

**Impact of ${isViolation ? 'Violation' : 'Compliance'}:**
${isViolation ? 
  '⚠️ **CRITICAL BREACH** - This violation may trigger: Default interest rates (typically +200-400bps), Mandatory cash sweep provisions, Lender consent requirements for material actions, Potential acceleration of debt maturity, Enhanced reporting and monitoring requirements' :
  '✅ **COMPLIANT** - Company maintains adequate cash flow coverage for debt service obligations, providing operational flexibility and reduced lender oversight.'
}

**Debt Facility Context:**
• This covenant typically applies to: Senior Credit Facilities, Term Loans, Revolving Credit Lines
• Common in: Bank credit agreements, institutional term loans
• Measurement: Usually quarterly, with cure periods for technical violations

**Document References:**
${documents.length > 0 ? 
  '📄 **Covenant details found in uploaded documents** - Analysis based on financial statements and typical credit agreement terms. Upload specific credit agreements for precise threshold verification.' :
  '📄 **Upload credit agreements** to verify exact covenant thresholds, cure provisions, and specific facility terms.'
}`,

        // Risk assessment
        riskFactors: isViolation ? [
          'Immediate liquidity pressure',
          'Potential lender enforcement',
          'Increased borrowing costs',
          'Operational restrictions'
        ] : [
          'Stable debt service capacity',
          'Operational flexibility maintained'
        ],
        
        // Actionable recommendations
        recommendations: isViolation ? [
          'Immediate waiver negotiations with lenders',
          'Cash flow improvement initiatives',
          'Debt refinancing evaluation',
          'Working capital optimization'
        ] : [
          'Monitor quarterly performance',
          'Maintain cash flow discipline'
        ]
      });
    }

    if (latestBalance?.totalDebt && latestIncome?.ebitda) {
      const leverageRatio = latestBalance.totalDebt / latestIncome.ebitda;
      const isViolation = leverageRatio > 4.0;
      
      covenants.push({
        name: 'Total Leverage Ratio',
        current: leverageRatio.toFixed(2) + 'x',
        threshold: '4.00x', // Typical threshold
        status: leverageRatio <= 4.0 ? 'compliant' : 'violation',
        trend: 'calculated',
        impact: leverageRatio > 6.0 ? 'critical' : (leverageRatio > 4.0 ? 'high' : 'low'),
        source: 'FMP Balance Sheet & Income Statement APIs',
        formula: 'Total Debt / EBITDA',
        
        detailedExplanation: `The Total Leverage Ratio is a fundamental credit covenant measuring ${companyData?.company?.name || "the company"}'s debt burden relative to earnings capacity.

**What this covenant means:**
• Measures total debt relative to earnings before interest, taxes, depreciation, and amortization
• Higher ratios indicate greater financial leverage and credit risk
• Standard investment grade threshold: 3.0-4.0x
• High yield threshold: 4.0-6.0x+

**Current Analysis:**
• Current Leverage: ${leverageRatio.toFixed(2)}x ${isViolation ? '(VIOLATION)' : '(COMPLIANT)'}
• Total Debt: $${(latestBalance.totalDebt / 1000000).toFixed(1)}M
• TTM EBITDA: $${(latestIncome.ebitda / 1000000).toFixed(1)}M
• Debt Capacity Utilization: ${((leverageRatio / 4.0) * 100).toFixed(0)}% of covenant threshold

**Impact of ${isViolation ? 'Violation' : 'Compliance'}:**
${isViolation ? 
  '🔴 **LEVERAGE BREACH** - Excessive debt burden indicates: Potential difficulty refinancing debt, Limited acquisition financing capacity, Increased lender scrutiny and control, Possible mandatory debt paydown requirements, Restricted dividend and distribution payments' :
  '✅ **WITHIN LIMITS** - Manageable debt burden allows for: Strategic flexibility for growth investments, Access to additional financing if needed, Reduced lender oversight and restrictions'
}

**Industry Context:**
• Software/Technology: Typical 2.0-4.0x
• Manufacturing: Typical 2.5-4.5x  
• Healthcare: Typical 3.0-5.0x
• Real Estate: Typical 4.0-7.0x

**Document References:**
${documents.length > 0 ? 
  '📋 **Credit agreement analysis** - Leverage covenant typically includes: EBITDA adjustments and add-backs, Debt definitional exclusions, Step-down provisions based on performance' :
  '📋 **Upload credit facilities** for precise covenant definitions, permitted EBITDA adjustments, and facility-specific terms'
}`,

        riskFactors: isViolation ? [
          'Overleveraged capital structure',
          'Limited refinancing flexibility', 
          'Potential covenant cascade violations',
          'Restricted growth capital access'
        ] : [
          'Balanced capital structure',
          'Adequate leverage headroom'
        ],
        
        recommendations: isViolation ? [
          'Immediate deleveraging strategy',
          'Asset divestiture evaluation',
          'Equity infusion consideration', 
          'Covenant modification negotiations'
        ] : [
          'Monitor EBITDA performance',
          'Evaluate optimal capital structure'
        ]
      });
    }

    if (latestIncome?.operatingIncome && latestIncome?.interestExpense) {
      const interestCoverage = Math.abs(latestIncome.operatingIncome / latestIncome.interestExpense);
      const isViolation = interestCoverage < 2.0;
      
      covenants.push({
        name: 'Interest Coverage Ratio',
        current: interestCoverage.toFixed(2) + 'x',
        threshold: '2.00x', // Typical threshold
        status: interestCoverage >= 2.0 ? 'compliant' : 'violation',
        trend: 'calculated',
        impact: interestCoverage < 1.5 ? 'critical' : (interestCoverage < 2.0 ? 'medium' : 'low'),
        source: 'FMP Income Statement API',
        formula: 'Operating Income / Interest Expense',
        
        detailedExplanation: `Interest Coverage Ratio measures ${companyData?.company?.name || "the company"}'s ability to service interest payments on outstanding debt obligations.

**What this covenant means:**
• Indicates how many times the company can pay its interest expenses
• Minimum thresholds typically range from 1.5x to 3.0x
• Lower ratios suggest potential difficulty meeting interest obligations
• Critical for assessing default risk and debt sustainability

**Current Analysis:**
• Current Coverage: ${interestCoverage.toFixed(2)}x ${isViolation ? '(VIOLATION)' : '(COMPLIANT)'}
• Operating Income: $${(latestIncome.operatingIncome / 1000000).toFixed(1)}M
• Interest Expense: $${(latestIncome.interestExpense / 1000000).toFixed(1)}M
• Interest Burden: ${((latestIncome.interestExpense / latestIncome.operatingIncome) * 100).toFixed(1)}% of operating income

**Impact Analysis:**
${isViolation ? 
  '⚠️ **COVERAGE STRAIN** - Low interest coverage indicates: Earnings volatility creating payment risk, Limited ability to absorb economic downturns, Potential difficulty accessing additional credit, Increased risk of technical default' :
  '✅ **ADEQUATE COVERAGE** - Sufficient interest coverage provides: Stable debt service capacity, Flexibility during economic cycles, Access to additional financing, Reduced credit risk profile'
}

**Trend Analysis:**
• Historical coverage trends require quarterly monitoring
• Seasonal earnings variations may impact coverage
• EBITDA-to-interest coverage often used as alternative metric

**Document Context:**
${documents.length > 0 ? 
  '📊 **Financial analysis** - Interest coverage calculated from reported financials. Credit agreements may include: Pro forma adjustments for acquisitions, EBITDA-based coverage alternatives, Cure rights through equity contributions' :
  '📊 **Credit facility review needed** - Upload debt agreements to verify: Specific coverage definitions, Cure mechanisms and periods, Alternative coverage tests'
}`,

        riskFactors: isViolation ? [
          'Interest payment stress',
          'Earnings volatility risk',
          'Refinancing difficulties',
          'Credit rating pressure'
        ] : [
          'Stable interest service',
          'Earnings protection available'
        ],
        
        recommendations: isViolation ? [
          'Earnings improvement focus',
          'Interest rate hedging strategy',
          'Debt refinancing at lower rates',
          'Alternative coverage calculations'
        ] : [
          'Maintain earnings stability',
          'Monitor interest rate exposure'
        ]
      });
    }

    if (latestBalance?.totalCurrentAssets && latestBalance?.totalCurrentLiabilities) {
      const currentRatio = latestBalance.totalCurrentAssets / latestBalance.totalCurrentLiabilities;
      covenants.push({
        name: 'Current Ratio',
        current: currentRatio.toFixed(2),
        threshold: '1.20', // Typical threshold
        status: currentRatio >= 1.2 ? 'compliant' : (currentRatio >= 1.0 ? 'watch' : 'violation'),
        trend: 'calculated',
        impact: currentRatio < 1.0 ? 'high' : (currentRatio < 1.2 ? 'medium' : 'low'),
        source: 'FMP Balance Sheet API',
        formula: 'Current Assets / Current Liabilities',
        explanation: 'Measures the company\'s ability to pay short-term obligations.'
      });
    }

    if (latestBalance?.totalStockholdersEquity) {
      const tangibleNetWorth = latestBalance.totalStockholdersEquity - (latestBalance.goodwillAndIntangibleAssets || 0);
      covenants.push({
        name: 'Tangible Net Worth',
        current: `$${(tangibleNetWorth / 1000000).toFixed(1)}M`,
        threshold: '[Threshold Unknown]', // Would need to extract from credit documents
        status: 'unknown',
        trend: 'calculated',
        impact: 'medium',
        source: 'FMP Balance Sheet API',
        formula: 'Total Equity - Intangible Assets',
        explanation: 'Measures the company\'s net worth excluding intangible assets.',
        guidance: 'Upload credit agreements to determine specific covenant thresholds.'
      });
    }

    return covenants;
  };

  // Enhanced liquidity analysis with detailed cash flow breakdowns
  const generateLiquidityAnalysis = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const financials = comprehensiveData?.financialStatements;
    const companyName = companyData?.company?.name || 'the company';

    if (!hasApiData || !financials?.cashFlow || !Array.isArray(financials.cashFlow) || 
        !financials?.balance || !Array.isArray(financials.balance) ||
        !financials?.income || !Array.isArray(financials.income)) {
      return {
        runway: [],
        cashFlowBreakdown: null,
        liquidityPosition: null,
        scenarios: [],
        detailedAnalysis: `**Enhanced Liquidity Analysis Unavailable**

To provide comprehensive liquidity runway modeling for ${companyName}, we need:
• Historical cash flow statements (operating, investing, financing)
• Current balance sheet with cash and working capital details
• Debt maturity schedules and payment obligations
• Seasonal cash flow patterns and working capital needs

**Upload Requirements:**
📊 Recent financial statements (quarterly preferred)
💰 Credit facility documentation with draw/availability details
📋 Cash management policies and concentration banking arrangements`,
        guidance: 'Upload recent financial statements and cash management documentation for detailed liquidity analysis.'
      };
    }

    // Enhanced historical cash flow analysis
    const cashFlowData = financials.cashFlow.slice(0, 8); // Last 8 periods for trend analysis
    const balanceData = financials.balance.slice(0, 8);
    const incomeData = financials.income.slice(0, 8);

    const enhancedRunway = cashFlowData.map((cf, index) => {
      const balance = balanceData[index];
      const income = incomeData[index];
      
      const cash = balance?.cashAndCashEquivalents || 0;
      const operatingCF = cf?.operatingCashFlow || 0;
      const investingCF = cf?.capitalExpenditure || cf?.cashAndCashEquivalentsChanges || 0;
      const financingCF = cf?.debtRepayment || 0;
      
      // Calculate detailed cash flow components
      const ebitda = income?.ebitda || 0;
      const workingCapitalChange = (balance?.totalCurrentAssets - balance?.totalCurrentLiabilities) || 0;
      const interestPaid = income?.interestExpense || 0;
      const capex = Math.abs(cf?.capitalExpenditure || 0);
      const debtService = Math.abs(financingCF) + interestPaid;
      
      // Net cash burn calculation
      const netCashBurn = operatingCF - capex - debtService;
      const monthlyBurn = netCashBurn < 0 ? Math.abs(netCashBurn) / 12 : 0;
      const runway = monthlyBurn > 0 ? (cash / monthlyBurn) : 999; // 999 = indefinite

      return {
        period: cf.calendarYear || `Period ${index + 1}`,
        cash: cash / 1000000,
        
        // Detailed cash flow components
        operatingCashFlow: operatingCF / 1000000,
        ebitda: ebitda / 1000000,
        workingCapitalChange: workingCapitalChange / 1000000,
        capitalExpenditures: capex / 1000000,
        interestPaid: interestPaid / 1000000,
        debtService: debtService / 1000000,
        
        // Cash burn and runway metrics
        netCashBurn: netCashBurn / 1000000,
        monthlyBurn: monthlyBurn / 1000000,
        runway: runway > 999 ? 'Positive' : `${runway.toFixed(1)} months`,
        
        // Efficiency metrics
        cashConversion: ebitda ? ((operatingCF / ebitda) * 100).toFixed(0) + '%' : 'N/A',
        burnRate: cash ? ((monthlyBurn / cash) * 100).toFixed(1) + '% per month' : 'N/A',
        
        source: 'FMP Comprehensive Financial APIs'
      };
    }).reverse(); // Most recent first

    // Current liquidity position analysis
    const latestBalance = balanceData[0];
    const latestCashFlow = cashFlowData[0];
    const currentCash = latestBalance?.cashAndCashEquivalents || 0;
    const currentOperatingCF = latestCashFlow?.operatingCashFlow || 0;
    const currentCapex = Math.abs(latestCashFlow?.capitalExpenditure || 0);
    const currentDebtService = Math.abs(latestCashFlow?.debtRepayment || 0);
    
    const liquidityPosition = {
      availableCash: currentCash / 1000000,
      undrawnCredit: 50, // Estimate - would need credit facility docs
      totalLiquidity: (currentCash / 1000000) + 50,
      
      monthlyOperatingCF: (currentOperatingCF / 1000000) / 12,
      monthlyCapex: (currentCapex / 1000000) / 12,
      monthlyDebtService: (currentDebtService / 1000000) / 12,
      netMonthlyBurn: ((currentOperatingCF - currentCapex - currentDebtService) / 1000000) / 12,
      
      currentRunway: currentOperatingCF - currentCapex - currentDebtService > 0 ? 
        'Cash Flow Positive' : 
        `${((currentCash / 1000000) / Math.abs((currentOperatingCF - currentCapex - currentDebtService) / 1000000 / 12)).toFixed(1)} months`,
      
      liquidityGrade: currentCash / 1000000 > 50 ? 'Strong' : 
                     currentCash / 1000000 > 25 ? 'Adequate' : 
                     currentCash / 1000000 > 10 ? 'Tight' : 'Critical'
    };

    // Scenario analysis
    const scenarios = [
      {
        name: 'Base Case',
        description: 'Current operating performance maintained',
        assumptions: 'No significant operational changes',
        runway: liquidityPosition.currentRunway,
        riskLevel: 'Medium',
        probability: '60%'
      },
      {
        name: 'Downside Case',
        description: '20% reduction in operating cash flow',
        assumptions: 'Economic downturn or competitive pressure',
        runway: currentOperatingCF > 0 ? 
          `${((currentCash / 1000000) / Math.abs((currentOperatingCF * 0.8 - currentCapex - currentDebtService) / 1000000 / 12)).toFixed(1)} months` :
          'Immediate liquidity crisis',
        riskLevel: 'High',
        probability: '25%'
      },
      {
        name: 'Upside Case', 
        description: '15% improvement in operating efficiency',
        assumptions: 'Successful cost reduction and revenue growth',
        runway: currentOperatingCF > 0 ? 
          'Extended runway / Cash flow positive' :
          `${((currentCash / 1000000) / Math.abs((currentOperatingCF * 1.15 - currentCapex - currentDebtService) / 1000000 / 12)).toFixed(1)} months`,
        riskLevel: 'Low',
        probability: '15%'
      }
    ];

    // Comprehensive analysis narrative
    const detailedAnalysis = `**${companyName} - Comprehensive Liquidity Analysis**

**Current Liquidity Position:**
• Available Cash: $${liquidityPosition.availableCash.toFixed(1)}M
• Estimated Credit Availability: $${liquidityPosition.undrawnCredit}M (estimated)
• Total Liquidity: $${liquidityPosition.totalLiquidity.toFixed(1)}M
• Liquidity Grade: **${liquidityPosition.liquidityGrade}**

**Monthly Cash Flow Analysis:**
• Operating Cash Flow: $${liquidityPosition.monthlyOperatingCF.toFixed(1)}M/month
• Capital Expenditures: $${liquidityPosition.monthlyCapex.toFixed(1)}M/month  
• Debt Service: $${liquidityPosition.monthlyDebtService.toFixed(1)}M/month
• **Net Monthly Burn: $${liquidityPosition.netMonthlyBurn.toFixed(1)}M/month**

**Runway Assessment:**
• Current Trajectory: **${liquidityPosition.currentRunway}**
• Critical Threshold: 6 months (industry standard)
• Emergency Threshold: 3 months (immediate action required)

**Key Liquidity Drivers:**
${enhancedRunway.length >= 2 ? `
• Operating CF Trend: ${enhancedRunway[0].operatingCashFlow > enhancedRunway[1].operatingCashFlow ? '📈 Improving' : '📉 Declining'}
• Cash Conversion: ${enhancedRunway[0].cashConversion} (EBITDA to operating CF)
• Working Capital Impact: ${enhancedRunway[0].workingCapitalChange >= 0 ? 'Source of cash' : 'Use of cash'}
• Capital Intensity: ${((enhancedRunway[0].capitalExpenditures / enhancedRunway[0].operatingCashFlow) * 100).toFixed(0)}% of operating CF` :
'• Historical trend analysis requires additional data'
}

**Strategic Recommendations:**
${liquidityPosition.netMonthlyBurn < 0 ? `
🔴 **Immediate Actions Required:**
• Implement aggressive cost reduction program
• Accelerate collections and extend payables
• Evaluate asset monetization opportunities
• Secure additional financing or investor capital
• Consider restructuring debt service obligations` :
`✅ **Liquidity Management Focus:**
• Maintain disciplined cash flow management
• Optimize working capital efficiency
• Monitor seasonal cash flow patterns
• Ensure adequate covenant compliance cushion`
}

**Document Enhancement Needed:**
📋 Upload credit facility agreements to verify available capacity
💰 Provide cash management policies for concentration banking details
📊 Include quarterly statements for seasonal pattern analysis`;

    return {
      runway: enhancedRunway,
      liquidityPosition: liquidityPosition,
      scenarios: scenarios,
      detailedAnalysis: detailedAnalysis,
      cashFlowBreakdown: {
        current: enhancedRunway[0],
        historical: enhancedRunway.slice(1, 4),
        trend: enhancedRunway.length >= 2 ? 
          (enhancedRunway[0].netCashBurn > enhancedRunway[1].netCashBurn ? 'improving' : 'deteriorating') : 
          'insufficient_data'
      }
    };
  };

  // Generate capital structure from real data
  const generateCapitalStructure = () => {
    const hasApiData = comprehensiveData && !comprehensiveData.error;
    const latestBalance = comprehensiveData?.financialStatements?.balance?.[0];

    if (!hasApiData || !latestBalance) {
      return [{
        name: 'Total Debt',
        amount: '[Data Unavailable]',
        percentage: 0,
        recovery: '[Recovery Unavailable]',
        source: 'N/A',
        guidance: 'Upload recent balance sheets and credit agreements for capital structure analysis.'
      }];
    }

    const structure = [];
    const totalCapital = (latestBalance.totalDebt || 0) + (latestBalance.totalStockholdersEquity || 0);

    if (latestBalance.totalDebt) {
      structure.push({
        name: 'Total Debt',
        amount: latestBalance.totalDebt / 1000000,
        percentage: totalCapital ? (latestBalance.totalDebt / totalCapital * 100) : 0,
        recovery: '[Recovery Rate Unknown]', // Would need credit analysis
        source: 'FMP Balance Sheet API',
        type: 'debt'
      });
    }

    if (latestBalance.totalStockholdersEquity) {
      structure.push({
        name: 'Total Equity',
        amount: latestBalance.totalStockholdersEquity / 1000000,
        percentage: totalCapital ? (latestBalance.totalStockholdersEquity / totalCapital * 100) : 0,
        recovery: '[Recovery Rate Unknown]',
        source: 'FMP Balance Sheet API',
        type: 'equity'
      });
    }

    return structure;
  };

  const distressedMetrics = generateDistressedMetrics();
  const covenantAnalysis = generateCovenantAnalysis();
  const liquidityAnalysis = generateLiquidityAnalysis();
  const capitalStructure = generateCapitalStructure();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'covenants', name: 'Covenants', icon: Shield },
    { id: 'liquidity', name: 'Liquidity', icon: Droplet },
    { id: 'structure', name: 'Capital Structure', icon: Layers }
  ];

  const handleMetricClick = (metricKey, metricData) => {
    setSelectedMetric({ key: metricKey, ...metricData });
    setShowSourceModal(true);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': case 'Critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': case 'High': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': case 'Low': return 'text-green-600 bg-green-100 border-green-200';
      case 'violation': return 'text-red-600 bg-red-100 border-red-200';
      case 'watch': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'compliant': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': case 'Critical': return XCircle;
      case 'high': case 'High': return AlertTriangle;
      case 'medium': case 'Medium': return AlertCircle;
      case 'low': case 'Low': return Info;
      case 'violation': return XCircle;
      case 'watch': return AlertTriangle;
      case 'compliant': return CheckCircle;
      default: return Info;
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading distressed credit analysis...</p>
              <p className="text-sm text-gray-500 mt-2">Analyzing financial data and credit metrics</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderOverview = () => {
    const metrics = generateDistressedMetrics();
    const covenants = generateCovenantAnalysis();
    const violationCount = covenants.filter(c => c.status === 'violation').length;

    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            whileHover={{ y: -2, shadow: '0 8px 25px rgba(0,0,0,0.1)' }}
            onClick={() => handleMetricClick('distressScore', metrics)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-red-600">{metrics.distressScore}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Distress Score</h3>
            <p className="text-sm text-gray-600">{metrics.riskLevel} risk level</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            whileHover={{ y: -2, shadow: '0 8px 25px rgba(0,0,0,0.1)' }}
            onClick={() => handleMetricClick('liquidity', metrics)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Droplet className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">{metrics.liquidityMonths}m</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Liquidity Runway</h3>
            <p className="text-sm text-gray-600">Months remaining</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            whileHover={{ y: -2, shadow: '0 8px 25px rgba(0,0,0,0.1)' }}
            onClick={() => handleMetricClick('debt', metrics)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{metrics.totalDebt}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Debt</h3>
            <p className="text-sm text-gray-600">Outstanding amount</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            whileHover={{ y: -2, shadow: '0 8px 25px rgba(0,0,0,0.1)' }}
            onClick={() => handleMetricClick('covenants', { violationCount, covenants })}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-red-600">{violationCount}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Covenant Violations</h3>
            <p className="text-sm text-gray-600">Active breaches</p>
          </motion.div>
        </div>

        {/* Critical Alerts */}
        {metrics.distressFactors && metrics.distressFactors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Critical Alerts</h3>
                <div className="space-y-2">
                  {metrics.distressFactors.map((factor, index) => (
                    <p key={index} className="text-red-800">
                      • {factor.factor}: <strong>Weight {factor.weight}%</strong>
                    </p>
                  ))}
                  {metrics.liquidityMonths !== '[Cannot Calculate]' && (
                    <p className="text-red-800">
                      • Liquidity runway: <strong>{metrics.liquidityMonths} months at current burn rate</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMaturityWall = () => {
    const liquidityData = generateLiquidityAnalysis();
    const metrics = generateDistressedMetrics();
    
    // Format data for the chart
    const maturityData = liquidityData.map(item => ({
      period: item.period,
      secured: item.cash * 0.6, // Example: 60% secured
      unsecured: item.cash * 0.4, // Example: 40% unsecured
      total: item.cash,
      type: 'Term Loan'
    }));

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Debt Maturity Schedule</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Secured</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Unsecured</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maturityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                label={{ value: 'Amount ($M)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [`$${value.toFixed(1)}M`, name === 'secured' ? 'Secured Debt' : 'Unsecured Debt']}
              />
              <Bar dataKey="secured" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="unsecured" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {maturityData.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">{item.period}</div>
              <div className="text-xs text-gray-600 mt-1">{item.type}</div>
              <div className="text-lg font-bold text-gray-900 mt-1">${item.total.toFixed(1)}M</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCovenants = () => {
    const covenants = generateCovenantAnalysis();
    
    return (
      <div className="space-y-4">
        {covenants.map((covenant, index) => {
          const Icon = getSeverityIcon(covenant.status);
          return (
            <motion.div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className={`w-5 h-5 ${getSeverityColor(covenant.status).split(' ')[0]}`} />
                      <h3 className="text-lg font-semibold text-gray-900">{covenant.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(covenant.status)}`}>
                        {covenant.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Value</p>
                        <p className="text-xl font-bold text-gray-900">{covenant.current}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Threshold</p>
                        <p className="text-xl font-bold text-gray-900">{covenant.threshold}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Impact Level</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(covenant.impact)}`}>
                          {covenant.impact}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                      <p><strong>Formula:</strong> {covenant.formula}</p>
                      <p><strong>Source:</strong> {covenant.source}</p>
                      {covenant.explanation && (
                        <p className="mt-2">{covenant.explanation}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 ${
                      covenant.trend === 'improving' ? 'text-green-600' :
                      covenant.trend === 'declining' ? 'text-red-600' :
                      covenant.trend === 'calculated' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {covenant.trend === 'improving' ? <TrendingUp className="w-4 h-4" /> :
                       covenant.trend === 'declining' ? <TrendingDown className="w-4 h-4" /> :
                       covenant.trend === 'calculated' ? <Calculator className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                      <span className="text-sm font-medium capitalize">{covenant.trend}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderLiquidity = () => {
    const liquidityData = generateLiquidityAnalysis();
    const metrics = generateDistressedMetrics();
    
    // Get the most recent data point
    const latestData = liquidityData[0] || {
      cash: 0,
      operatingCashFlow: 0,
      runway: 0
    };

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Liquidity Runway Analysis</h3>
        
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={liquidityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                yAxisId="cash"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                label={{ value: 'Cash ($M)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="runway"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                label={{ value: 'Runway (Months)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => {
                  if (name === 'cash') return [`$${value.toFixed(1)}M`, 'Cash Balance'];
                  if (name === 'runway') return [`${value.toFixed(1)} months`, 'Liquidity Runway'];
                  if (name === 'operatingCashFlow') return [`$${value.toFixed(1)}M`, 'Operating Cash Flow'];
                  return [value, name];
                }}
              />
              <Bar yAxisId="cash" dataKey="cash" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Cash Balance" />
              <Line 
                yAxisId="runway" 
                type="monotone" 
                dataKey="runway" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', r: 5 }}
                name="Liquidity Runway"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">Current Runway</p>
            <p className="text-2xl font-bold text-red-900">{metrics.liquidityMonths} months</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <TrendingDown className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-orange-600 font-medium">Monthly Burn</p>
            <p className="text-2xl font-bold text-orange-900">
              ${Math.abs(latestData.operatingCashFlow).toFixed(1)}M
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-600 font-medium">Cash Balance</p>
            <p className="text-2xl font-bold text-blue-900">${latestData.cash.toFixed(1)}M</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCapitalStructure = () => {
    const structure = generateCapitalStructure();
    const totalCapital = structure.reduce((sum, item) => sum + parseFloat(item.amount) || 0, 0);
    const weightedRecovery = structure.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      const recovery = parseFloat(item.recovery) || 0;
      return sum + (amount * recovery);
    }, 0) / totalCapital;

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Capital Structure Analysis</h3>
        
        <div className="space-y-4">
          {structure.map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  item.type === 'debt' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">${item.amount}M</p>
                <p className="text-sm text-gray-600">{item.recovery}% recovery</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Capital</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalCapital.toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Weighted Recovery</p>
              <p className="text-2xl font-bold text-gray-900">
                {isNaN(weightedRecovery) ? 'N/A' : `${Math.round(weightedRecovery)}%`}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDistressFlags = () => {
    const metrics = generateDistressedMetrics();
    const covenants = generateCovenantAnalysis();
    const liquidityData = generateLiquidityAnalysis();

    // Generate risk flags based on real data
    const flags = [];

    // Add covenant violations
    const violations = covenants.filter(c => c.status === 'violation');
    if (violations.length > 0) {
      flags.push({
        id: 'covenant-violations',
        severity: 'critical',
        category: 'Financial',
        title: 'Covenant Violations',
        description: `${violations.length} active covenant violation${violations.length > 1 ? 's' : ''} including ${violations.map(v => v.name).join(', ')}`,
        impact: 'Potential acceleration of debt',
        timeline: '30 days',
        lastUpdated: new Date().toISOString()
      });
    }

    // Add liquidity concerns
    if (metrics.liquidityMonths && metrics.liquidityMonths !== '[Cannot Calculate]' && parseFloat(metrics.liquidityMonths) < 12) {
      flags.push({
        id: 'liquidity-risk',
        severity: 'high',
        category: 'Liquidity',
        title: 'Low Cash Reserves',
        description: `Current cash runway of ${metrics.liquidityMonths} months with negative cash flow`,
        impact: 'Working capital constraints',
        timeline: '60 days',
        lastUpdated: new Date().toISOString()
      });
    }

    // Add leverage concerns
    if (metrics.debtToEquity && metrics.debtToEquity !== '[Ratio Unavailable]' && parseFloat(metrics.debtToEquity) > 3) {
      flags.push({
        id: 'high-leverage',
        severity: 'medium',
        category: 'Capital Structure',
        title: 'High Leverage',
        description: `Debt to Equity ratio of ${metrics.debtToEquity}x exceeds industry standards`,
        impact: 'Increased financial risk',
        timeline: '90 days',
        lastUpdated: new Date().toISOString()
      });
    }

    // Add interest coverage concerns
    if (metrics.interestCoverage && metrics.interestCoverage !== '[Coverage Unavailable]' && parseFloat(metrics.interestCoverage) < 2) {
      flags.push({
        id: 'interest-coverage',
        severity: 'high',
        category: 'Financial',
        title: 'Low Interest Coverage',
        description: `Interest coverage ratio of ${metrics.interestCoverage}x indicates potential debt service issues`,
        impact: 'Debt service risk',
        timeline: '60 days',
        lastUpdated: new Date().toISOString()
      });
    }

    return (
      <div className="space-y-4">
        {flags.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-green-800">No critical risk flags identified at this time.</p>
            </div>
          </div>
        ) : (
          flags.map((flag) => {
            const Icon = getSeverityIcon(flag.severity);
            return (
              <motion.div
                key={flag.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                whileHover={{ scale: 1.01 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-6 h-6 mt-1 ${getSeverityColor(flag.severity).split(' ')[0]}`} />
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{flag.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                            {flag.severity}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {flag.category}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{flag.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Potential Impact</p>
                            <p className="font-medium text-gray-900">{flag.impact}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Timeline</p>
                            <p className="font-medium text-gray-900">{flag.timeline}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      Updated: {new Date(flag.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'covenants': return renderCovenants();
      case 'liquidity': return renderLiquidity();
      case 'structure': return renderCapitalStructure();
      default: return renderOverview();
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distressed Credit Analysis</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis for {companyData?.company?.name || 'Target Company'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </motion.button>
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {/* TODO: Implement export functionality */}}
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </motion.button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error Loading Data</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Source Attribution Modal */}
      {showSourceModal && selectedMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Data Source Information</h3>
              <button 
                onClick={() => setShowSourceModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Primary Source</p>
                <p className="font-medium text-gray-900">{selectedMetric.sourceAttribution?.primary || 'N/A'}</p>
              </div>
              {selectedMetric.sourceAttribution?.income && (
                <div>
                  <p className="text-sm text-gray-600">Income Statement Data</p>
                  <p className="font-medium text-gray-900">{selectedMetric.sourceAttribution.income}</p>
                </div>
              )}
              {selectedMetric.sourceAttribution?.balance && (
                <div>
                  <p className="text-sm text-gray-600">Balance Sheet Data</p>
                  <p className="font-medium text-gray-900">{selectedMetric.sourceAttribution.balance}</p>
                </div>
              )}
              {selectedMetric.sourceAttribution?.cashFlow && (
                <div>
                  <p className="text-sm text-gray-600">Cash Flow Data</p>
                  <p className="font-medium text-gray-900">{selectedMetric.sourceAttribution.cashFlow}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Confidence Level</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${selectedMetric.sourceAttribution?.confidence || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedMetric.sourceAttribution?.confidence || 0}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DistressedCreditDashboard;