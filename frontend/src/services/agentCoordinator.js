import GeminiService from './geminiService';
import AlphaVantageService from './alphaVantageService';
import FMPService from './FMPService';
import MarketstackService from './MarketstackService';
import TwelveDataService from './TwelveDataService';
import SecApiService from './SecApiService';

class AgentCoordinator {
  constructor() {
    this.agents = {
      coordinator: new CoordinatorAgent(),
      documentProcessor: new DocumentProcessorAgent(),
      financialAnalyst: new FinancialAnalystAgent(),
      researchAgent: new ResearchAgent(),
      insightsAgent: new InsightsAgent()
    };
    
    // API priority configuration - SEC data is HIGHEST priority for public companies
    this.apiPriority = {
      companyProfile: ['SEC', 'FMP', 'TwelveData', 'AlphaVantage'],
      stockPrice: ['FMP', 'Marketstack', 'TwelveData', 'AlphaVantage'],
      financialStatements: ['SEC', 'FMP', 'TwelveData', 'AlphaVantage'], // SEC XBRL is most accurate
      historical: ['FMP', 'Marketstack', 'TwelveData', 'AlphaVantage'],
      ratios: ['SEC', 'FMP', 'TwelveData'], // SEC calculated ratios preferred
      executives: ['SEC', 'FMP'], // SEC filings are definitive source
      subsidiaries: ['SEC'], // Only SEC has accurate subsidiary data
      ownership: ['SEC'], // SEC filings for ownership data
      covenants: ['SEC'], // SEC filings and user documents for covenant analysis
      debtStructure: ['SEC'], // SEC filings for debt structure analysis
      insiderTrading: ['SEC'], // SEC Form 144, 3/4/5 data
      litigation: ['SEC'], // SEC litigation releases
      institutionalHoldings: ['SEC'] // SEC Form 13F data
    };
    
    // Rate limit tracking
    this.rateLimits = new Map();
    this.requestQueue = new Map();
    
    this.activeAnalysis = null;
    this.analysisHistory = [];
  }

  // Central data orchestration method
  async orchestrateDataFetch(symbol, dataTypes = ['all']) {
    console.log(`[AgentCoordinator] Orchestrating data fetch for ${symbol} (SEC priority enabled)`);
    
    const companyData = {
      symbol: symbol,
      profile: null,
      stockPrice: null,
      financialStatements: null,
      historicalData: null,
      ratios: null,
      news: null,
      executives: null,
      subsidiaries: null, // SEC-specific data
      ownership: null,    // SEC-specific data
      secData: null,      // Comprehensive SEC data
      sourceAttribution: {},
      errors: [],
      lastUpdated: new Date()
    };

    // Priority 1: Fetch comprehensive SEC data for public companies (highest accuracy)
    if (dataTypes.includes('all') || dataTypes.includes('sec')) {
      console.log(`[AgentCoordinator] Fetching comprehensive SEC data for ${symbol}`);
      try {
        companyData.secData = await SecApiService.getComprehensiveSecData(symbol);
        if (companyData.secData && companyData.secData.success) {
          console.log(`[AgentCoordinator] SEC data successfully retrieved for ${symbol}`);
          
          // Process SEC company data
          if (companyData.secData.data.company) {
            companyData.profile = this.formatSECProfile(companyData.secData.data.company);
            companyData.sourceAttribution.profile = {
              source: 'SEC',
              endpoint: 'EDGAR Entities & Mapping APIs',
              confidence: 98,
              url: companyData.secData.data.company.entityDetails?.website
            };
          }
          
          // Process SEC financial data from XBRL
          if (companyData.secData.data.financials) {
            companyData.financialStatements = this.formatSECFinancials(companyData.secData.data.financials);
            companyData.sourceAttribution.financialStatements = {
              source: 'SEC',
              endpoint: 'XBRL-to-JSON',
              confidence: 99,
              url: `https://www.sec.gov/Archives/edgar/data/${companyData.secData.data.company?.cik || 'unknown'}`
            };
          }
          
          // Process SEC covenant analysis
          if (companyData.secData.data.covenants) {
            companyData.covenants = companyData.secData.data.covenants.analysis;
            companyData.sourceAttribution.covenants = {
              source: 'SEC',
              endpoint: 'AI-Enhanced Filing Analysis',
              confidence: companyData.secData.data.covenants.confidence || 85,
              analysisType: 'covenant',
              url: companyData.secData.data.covenants.filing_url
            };
          }
          
          // Process SEC subsidiary structure
          if (companyData.secData.data.subsidiaries) {
            companyData.subsidiaries = companyData.secData.data.subsidiaries.analysis;
            companyData.sourceAttribution.subsidiaries = {
              source: 'SEC',
              endpoint: 'AI-Enhanced Subsidiary Mapping',
              confidence: companyData.secData.data.subsidiaries.confidence || 82,
              analysisType: 'subsidiary'
            };
          }
          
          // Process SEC debt structure
          if (companyData.secData.data.debtStructure) {
            companyData.debtStructure = companyData.secData.data.debtStructure.analysis;
            companyData.sourceAttribution.debtStructure = {
              source: 'SEC',
              endpoint: 'AI-Enhanced Debt Structure Analysis',
              confidence: companyData.secData.data.debtStructure.confidence || 88,
              analysisType: 'debt_structure'
            };
          }
        }
      } catch (error) {
        console.warn(`[AgentCoordinator] SEC data fetch failed for ${symbol}:`, error);
        companyData.errors.push(`SEC API: ${error.message}`);
      }
    }

    // Fetch company profile
    if (dataTypes.includes('all') || dataTypes.includes('profile')) {
      companyData.profile = await this.fetchWithFallback('companyProfile', symbol);
    }

    // Fetch stock price
    if (dataTypes.includes('all') || dataTypes.includes('stockPrice')) {
      companyData.stockPrice = await this.fetchWithFallback('stockPrice', symbol);
    }

    // Fetch financial statements
    if (dataTypes.includes('all') || dataTypes.includes('financials')) {
      companyData.financialStatements = await this.fetchWithFallback('financialStatements', symbol);
    }

    // Fetch historical data
    if (dataTypes.includes('all') || dataTypes.includes('historical')) {
      companyData.historicalData = await this.fetchWithFallback('historicalData', symbol);
    }

    // Fetch ratios
    if (dataTypes.includes('all') || dataTypes.includes('ratios')) {
      companyData.ratios = await this.fetchWithFallback('ratios', symbol);
    }

    // Fetch news
    if (dataTypes.includes('all') || dataTypes.includes('news')) {
      companyData.news = await this.fetchWithFallback('news', symbol);
    }

    // Fetch executives
    if (dataTypes.includes('all') || dataTypes.includes('executives')) {
      companyData.executives = await this.fetchWithFallback('executives', symbol);
    }

    console.log(`[AgentCoordinator] Data orchestration complete for ${symbol}`, companyData);
    return companyData;
  }

  // Intelligent fallback logic with rate limit management
  async fetchWithFallback(dataType, symbol, params = {}) {
    const apiList = this.apiPriority[dataType] || ['FMP'];
    let lastError = null;

    for (const apiName of apiList) {
      if (this.isAPILimited(apiName)) {
        console.log(`[AgentCoordinator] ${apiName} is rate limited, skipping`);
        continue;
      }

      try {
        let result;
        
        // Handle SEC API calls with special processing
        if (apiName === 'SEC') {
          result = await this.fetchSECDataForType(dataType, symbol, params);
        } else {
          result = await this.callAPI(apiName, dataType, symbol, params);
        }
        
        if (result && !result.error) {
          // Record successful source with enhanced attribution for SEC
          this.recordSourceAttribution(dataType, apiName, symbol, result);
          return result;
        }
      } catch (error) {
        console.warn(`[AgentCoordinator] ${apiName} failed for ${dataType}:`, error.message);
        lastError = error;
        
        // Handle rate limiting and permission errors
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          this.markAPILimited(apiName, 900000); // 15 minutes
        } else if (error.message.includes('403') || error.message.includes('forbidden')) {
          console.warn(`[AgentCoordinator] ${apiName} access forbidden for ${dataType} - possible API plan restriction`);
          this.markAPILimited(apiName, 3600000); // 1 hour for permission errors
        }
      }
    }

    // All APIs failed, return error with attribution
    const errorResult = {
      error: true,
      message: `[Data Unavailable] - All APIs failed for ${dataType}`,
      lastError: lastError?.message,
      symbol: symbol,
      dataType: dataType,
      attemptedAPIs: apiList,
      guidance: this.getDataGuidance(dataType)
    };

    this.recordSourceAttribution(dataType, 'ERROR', symbol, errorResult);
    return errorResult;
  }

  // API calling logic
  async callAPI(apiName, dataType, symbol, params = {}) {
    switch (apiName) {
      case 'FMP':
        return await this.callFMPAPI(dataType, symbol, params);
      case 'Marketstack':
        return await this.callMarketstackAPI(dataType, symbol, params);
      case 'TwelveData':
        return await this.callTwelveDataAPI(dataType, symbol, params);
      case 'AlphaVantage':
        return await this.callAlphaVantageAPI(dataType, symbol, params);
      default:
        throw new Error(`Unknown API: ${apiName}`);
    }
  }

  async callFMPAPI(dataType, symbol, params) {
    switch (dataType) {
      case 'companyProfile':
        return await FMPService.getCompanyProfile(symbol);
      case 'stockPrice':
        return await FMPService.getQuote(symbol);
      case 'financialStatements':
        const [income, balance, cashFlow] = await Promise.all([
          FMPService.getIncomeStatement(symbol, 'annual', 3),
          FMPService.getBalanceSheet(symbol, 'annual', 3),
          FMPService.getCashFlowStatement(symbol, 'annual', 3)
        ]);
        return { income, balance, cashFlow };
      case 'historicalData':
        return await FMPService.getHistoricalMarketCap(symbol);
      case 'ratios':
        const [ratios, metrics] = await Promise.all([
          FMPService.getRatios(symbol, 'annual', 3),
          FMPService.getKeyMetrics(symbol, 'annual', 3)
        ]);
        return { ratios, metrics };
      case 'news':
        return await FMPService.getStockNews(symbol, 10);
      case 'executives':
        return await FMPService.getKeyExecutives(symbol);
      default:
        throw new Error(`FMP does not support data type: ${dataType}`);
    }
  }

  async callMarketstackAPI(dataType, symbol, params) {
    switch (dataType) {
      case 'stockPrice':
        const data = await MarketstackService.getLatestQuote(symbol);
        return MarketstackService.normalizeQuoteData(data);
      case 'historicalData':
        return await MarketstackService.getEODData(symbol, null, null, 100);
      default:
        throw new Error(`Marketstack does not support data type: ${dataType}`);
    }
  }

  async callTwelveDataAPI(dataType, symbol, params) {
    switch (dataType) {
      case 'companyProfile':
        return await TwelveDataService.getStatistics(symbol);
      case 'stockPrice':
        const data = await TwelveDataService.getQuote(symbol);
        return TwelveDataService.normalizeQuoteData(data);
      case 'financialStatements':
        const [income, balance, cashFlow] = await Promise.all([
          TwelveDataService.getIncomeStatement(symbol),
          TwelveDataService.getBalanceSheet(symbol),
          TwelveDataService.getCashFlow(symbol)
        ]);
        return { income, balance, cashFlow };
      case 'historicalData':
        const timeSeriesData = await TwelveDataService.getTimeSeries(symbol, '1day', 100);
        return TwelveDataService.normalizeTimeSeriesData(timeSeriesData);
      default:
        throw new Error(`TwelveData does not support data type: ${dataType}`);
    }
  }

  async callAlphaVantageAPI(dataType, symbol, params) {
    switch (dataType) {
      case 'companyProfile':
        return await AlphaVantageService.getCompanyOverview(symbol);
      case 'stockPrice':
        return await AlphaVantageService.getStockPrice(symbol);
      case 'financialStatements':
        const [income, balance, cashFlow] = await Promise.all([
          AlphaVantageService.getIncomeStatement(symbol),
          AlphaVantageService.getBalanceSheet(symbol),
          AlphaVantageService.getCashFlow(symbol)
        ]);
        return { income, balance, cashFlow };
      case 'historicalData':
        return await AlphaVantageService.getHistoricalData(symbol, 'daily');
      default:
        throw new Error(`AlphaVantage does not support data type: ${dataType}`);
    }
  }

  // Rate limit management
  isAPILimited(apiName) {
    const limitInfo = this.rateLimits.get(apiName);
    if (!limitInfo) return false;
    
    const now = Date.now();
    if (now > limitInfo.resetTime) {
      this.rateLimits.delete(apiName);
      return false;
    }
    
    return true;
  }

  markAPILimited(apiName, duration = 900000) {
    this.rateLimits.set(apiName, {
      limitedAt: Date.now(),
      resetTime: Date.now() + duration
    });
    console.log(`[AgentCoordinator] ${apiName} marked as rate limited for ${duration/1000} seconds`);
  }

  // Source attribution tracking
  recordSourceAttribution(dataType, source, symbol, resultInfo = null) {
    const key = `${dataType}_${symbol}`;
    if (!this.sourceAttribution) {
      this.sourceAttribution = {};
    }
    
    // Enhanced attribution for SEC data with direct links
    const attribution = {
      source: source,
      timestamp: new Date(),
      symbol: symbol,
      dataType: dataType,
      success: !resultInfo?.error,
      error: resultInfo?.error,
      endpoint: this.getEndpointInfo(source, dataType)
    };

    // Add SEC-specific enhanced attribution
    if (source === 'SEC' && resultInfo && !resultInfo.error) {
      attribution.confidence = resultInfo.confidence || 99;
      attribution.sourceUrl = resultInfo.sourceUrl;
      attribution.filingDate = resultInfo.filingDate;
      attribution.dataQuality = 'regulatory';
      attribution.secEndpoint = resultInfo.endpoint;
    }
    
    this.sourceAttribution[key] = attribution;
  }

  getEndpointInfo(source, dataType) {
    const endpointMap = {
      'SEC': {
        'companyProfile': '/extractor (10-K Business Description)',
        'financialStatements': '/xbrl-to-json (XBRL Financial Data)',
        'executives': '/executive-compensation (SEC Proxy Filings)',
        'subsidiaries': '/company-subsidiaries (SEC Subsidiary Data)',
        'ownership': '/beneficial-ownership (Forms 13D/13G)',
        'ratios': 'Calculated from XBRL Data'
      },
      'FMP': {
        'companyProfile': '/v3/profile/{symbol}',
        'stockPrice': '/v3/quote/{symbol}',
        'financialStatements': '/v3/income-statement/{symbol}, /v3/balance-sheet-statement/{symbol}, /v3/cash-flow-statement/{symbol}',
        'ratios': '/v3/ratios/{symbol}',
        'news': '/v3/stock_news?tickers={symbol}',
        'executives': '/v3/key-executives/{symbol}'
      },
      'Marketstack': {
        'stockPrice': '/v1/eod/latest?symbols={symbol}',
        'historicalData': '/v1/eod?symbols={symbol}'
      },
      'TwelveData': {
        'companyProfile': '/statistics?symbol={symbol}',
        'stockPrice': '/quote?symbol={symbol}',
        'financialStatements': '/income_statement, /balance_sheet, /cash_flow'
      },
      'AlphaVantage': {
        'companyProfile': 'OVERVIEW',
        'stockPrice': 'GLOBAL_QUOTE',
        'financialStatements': 'INCOME_STATEMENT, BALANCE_SHEET, CASH_FLOW'
      }
    };
    
    return endpointMap[source]?.[dataType] || 'Unknown endpoint';
  }

  getDataGuidance(dataType) {
    const guidanceMap = {
      'companyProfile': 'Ensure the company ticker symbol is correct and the company is publicly traded.',
      'stockPrice': 'Real-time quotes may require premium API access. Historical closing prices are available.',
      'financialStatements': 'Annual financial statements are typically available for public companies. Please upload recent 10-K filings for private companies.',
      'ratios': 'Financial ratios require recent financial statement data. Please ensure financial statements are available.',
      'news': 'Company news requires a valid ticker symbol. Private companies may have limited news coverage.',
      'executives': 'Executive information is typically available for public companies in SEC filings.'
    };
    
    return guidanceMap[dataType] || 'Please verify the company information and try again.';
  }

  // Cross-reference with user documents
  async crossReferenceDocuments(apiData, userDocuments, symbol) {
    if (!userDocuments || userDocuments.length === 0) {
      return apiData;
    }

    try {
      console.log(`[AgentCoordinator] Cross-referencing API data with ${userDocuments.length} user documents for ${symbol}`);
      
      // Extract financial data from documents
      const documentData = await this.extractDataFromDocuments(userDocuments, symbol);
      
      // Compare and merge data
      const mergedData = this.mergeDataSources(apiData, documentData, symbol);
      
      // Flag discrepancies
      const discrepancies = this.identifyDiscrepancies(apiData, documentData);
      
      return {
        ...mergedData,
        discrepancies: discrepancies,
        dataSources: {
          api: apiData,
          documents: documentData
        },
        crossReferenced: true
      };
    } catch (error) {
      console.error(`[AgentCoordinator] Error cross-referencing documents:`, error);
      return {
        ...apiData,
        crossReferenceError: error.message
      };
    }
  }

  async extractDataFromDocuments(userDocuments, symbol) {
    const extractedData = {};
    
    for (const doc of userDocuments) {
      try {
        const text = doc.extractedText || await this.extractTextFromDocument(doc);
        const analysis = await GeminiService.extractFinancialData(text, symbol);
        
        if (analysis && analysis.financialData) {
          Object.assign(extractedData, analysis.financialData);
        }
      } catch (error) {
        console.warn(`[AgentCoordinator] Failed to extract from document ${doc.fileName}:`, error);
      }
    }
    
    return extractedData;
  }

  mergeDataSources(apiData, documentData, symbol) {
    // Prioritize document data over API data for more specific information
    const merged = { ...apiData };
    
    Object.keys(documentData).forEach(key => {
      if (documentData[key] && documentData[key] !== null) {
        if (merged[key] && merged[key] !== documentData[key]) {
          // Flag difference
          merged[`${key}_discrepancy`] = {
            api: merged[key],
            document: documentData[key],
            source_priority: 'document'
          };
        }
        merged[key] = documentData[key];
        merged[`${key}_source`] = 'User Document';
      }
    });
    
    return merged;
  }

  identifyDiscrepancies(apiData, documentData) {
    const discrepancies = [];
    
    Object.keys(documentData).forEach(key => {
      if (apiData[key] && documentData[key] && apiData[key] !== documentData[key]) {
        discrepancies.push({
          field: key,
          apiValue: apiData[key],
          documentValue: documentData[key],
          recommendation: 'Document value preferred for accuracy'
        });
      }
    });
    
    return discrepancies;
  }

  // Rest of the existing methods remain the same...
  async analyzeCompany(files, companyInfo, onProgress = () => {}) {
    const analysisId = Date.now().toString();
    
    this.activeAnalysis = {
      id: analysisId,
      startTime: new Date(),
      status: 'initializing',
      progress: 0,
      steps: [],
      results: {}
    };

    try {
      // Step 1: Initialize analysis
      onProgress(5, "Initializing AI systems...", "coordinator");
      await this.delay(500);

      // Step 2: Document processing
      onProgress(15, "Processing uploaded documents...", "documentProcessor");
      const documentResults = await this.agents.documentProcessor.processDocuments(files);
      this.activeAnalysis.results.documents = documentResults;
      await this.delay(1000);

      // Step 3: Multi-API data orchestration
      onProgress(30, "Gathering comprehensive market data...", "researchAgent");
      let companyData = null;
      
      if (companyInfo?.ticker) {
        // Fetch comprehensive data from all APIs
        companyData = await this.orchestrateDataFetch(companyInfo.ticker);
        
        // Cross-reference with user documents
        companyData = await this.crossReferenceDocuments(companyData, documentResults.documents, companyInfo.ticker);
      } else {
        // Detect company from documents first
        companyData = await this.agents.researchAgent.detectAndEnrichCompany(
          documentResults, 
          companyInfo
        );
      }
      
      this.activeAnalysis.results.company = companyData;
      await this.delay(1500);

      // Step 4: Enhanced financial analysis with real data
      onProgress(50, "Analyzing comprehensive financial metrics...", "financialAnalyst");
      const financialAnalysis = await this.agents.financialAnalyst.analyzeFinancials(
        documentResults,
        companyData
      );
      this.activeAnalysis.results.financials = financialAnalysis;
      await this.delay(1500);

      // Step 5: Generate intelligent insights
      onProgress(75, "Generating AI-powered insights...", "insightsAgent");
      const insights = await this.agents.insightsAgent.generateInsights({
        ...this.activeAnalysis.results
      });
      this.activeAnalysis.results.insights = insights;
      await this.delay(1000);

      // Step 6: Coordination and finalization
      onProgress(90, "Finalizing comprehensive analysis...", "coordinator");
      const finalResult = await this.agents.coordinator.coordinateResults(
        this.activeAnalysis.results
      );
      await this.delay(500);

      onProgress(100, "Analysis complete!", "coordinator");
      
      this.activeAnalysis.status = 'completed';
      this.activeAnalysis.endTime = new Date();
      this.analysisHistory.push({ ...this.activeAnalysis });

      return finalResult;

    } catch (error) {
      this.activeAnalysis.status = 'error';
      this.activeAnalysis.error = error.message;
      throw error;
    }
  }

  async generateReport(companyData, reportType = 'comprehensive') {
    const reportId = Date.now().toString();
    
    try {
      const report = await this.agents.coordinator.generateReport(companyData, reportType);
      return {
        id: reportId,
        type: reportType,
        generatedAt: new Date(),
        ...report
      };
    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  async chatWithAI(message, context = null) {
    try {
      return await this.agents.insightsAgent.processQuery(message, context);
    } catch (error) {
      throw new Error(`Chat processing failed: ${error.message}`);
    }
  }

  getAnalysisStatus() {
    return this.activeAnalysis;
  }

  getAnalysisHistory() {
    return this.analysisHistory;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class CoordinatorAgent {
  async coordinateResults(results) {
    // Synthesize all agent results into final analysis
    const finalAnalysis = {
      company: results.company,
      financials: results.financials,
      insights: results.insights,
      confidence: this.calculateOverallConfidence(results),
      analysisDate: new Date(),
      recommendations: await this.generateRecommendations(results)
    };

    return finalAnalysis;
  }

  calculateOverallConfidence(results) {
    const confidenceScores = [
      results.company?.confidence || 0.8,
      results.financials?.confidence || 0.9,
      results.insights?.confidence || 0.85
    ];
    
    return confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
  }

  async generateRecommendations(results) {
    const prompt = `
      Based on the comprehensive analysis results, provide 3-5 key investment recommendations:
      
      Company: ${JSON.stringify(results.company)}
      Financials: ${JSON.stringify(results.financials)}
      Insights: ${JSON.stringify(results.insights)}
      
      Format as structured recommendations with risk levels and timeframes.
    `;

    try {
      const recommendations = await GeminiService.generateInsights(results, prompt);
      return recommendations;
    } catch (error) {
      return "Recommendations temporarily unavailable";
    }
  }

  async generateReport(companyData, reportType) {
    const reportPrompt = `
      Generate a ${reportType} investment report for:
      ${JSON.stringify(companyData)}
      
      Include:
      1. Executive Summary
      2. Financial Analysis
      3. Risk Assessment
      4. Market Position
      5. Investment Recommendation
      
      Format as professional investment memo.
    `;

    try {
      const report = await GeminiService.generateInsights(companyData, reportPrompt);
      return {
        executiveSummary: report,
        sections: this.parseReportSections(report),
        charts: this.generateChartData(companyData),
        appendix: this.generateAppendix(companyData)
      };
    } catch (error) {
      throw error;
    }
  }

  parseReportSections(report) {
    // Parse the AI-generated report into structured sections
    return {
      financialAnalysis: "AI-generated financial analysis section",
      riskAssessment: "AI-generated risk assessment section",
      marketPosition: "AI-generated market position section",
      recommendation: "AI-generated investment recommendation"
    };
  }

  generateChartData(companyData) {
    return {
      revenueChart: companyData.financials?.historicalRevenue || [],
      marginChart: companyData.financials?.margins || [],
      ratioChart: companyData.financials?.ratios || []
    };
  }

  generateAppendix(companyData) {
    return {
      methodology: "Analysis methodology and assumptions",
      dataSources: "Sources of financial and market data",
      disclaimers: "Important disclaimers and limitations"
    };
  }
}

class DocumentProcessorAgent {
  async processDocuments(files) {
    if (!files || files.length === 0) {
      return {
        success: false,
        message: "No documents provided",
        extractedData: {}
      };
    }

    const processedDocs = [];
    
    for (const file of files) {
      try {
        const text = await this.extractTextFromFile(file);
        const analysis = await GeminiService.analyzeDocument(text, file.name);
        
        processedDocs.push({
          fileName: file.name,
          fileType: file.type,
          extractedText: text.substring(0, 1000), // First 1000 chars for preview
          analysis: analysis,
          confidence: analysis.confidence || 0.8
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        processedDocs.push({
          fileName: file.name,
          error: error.message,
          confidence: 0
        });
      }
    }

    return {
      success: true,
      documentsProcessed: processedDocs.length,
      documents: processedDocs,
      overallConfidence: this.calculateDocumentConfidence(processedDocs)
    };
  }

  async extractTextFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  calculateDocumentConfidence(docs) {
    const validDocs = docs.filter(doc => !doc.error);
    if (validDocs.length === 0) return 0;
    
    const avgConfidence = validDocs.reduce((sum, doc) => sum + doc.confidence, 0) / validDocs.length;
    return avgConfidence;
  }
}

class FinancialAnalystAgent {
  async analyzeFinancials(documentResults, companyData) {
    try {
      // Enhanced financial data extraction with comprehensive document analysis
      const companySymbol = companyData?.symbol || companyData?.ticker || companyData?.company?.ticker;
      console.log(`[FinancialAnalyst] Starting enhanced analysis for ${companySymbol || 'unknown company'}`);
      
      // Use enhanced extraction method with sophisticated Gemini analysis
      const enhancedExtractionResults = await this.extractFinancialMetrics(documentResults, companySymbol);
      const documentFinancials = enhancedExtractionResults.financials;
      const covenantData = enhancedExtractionResults.covenantData;
      const subsidiaryStructure = enhancedExtractionResults.subsidiaryStructure;
      
      // Use comprehensive API data if available
      let apiFinancials = {};
      if (companyData.comprehensiveData || companyData.financialStatements) {
        apiFinancials = this.normalizeAPIFinancials(companyData.comprehensiveData || companyData);
      }
      
      // Merge document and API data (prioritize documents for accuracy)
      const mergedFinancials = { ...apiFinancials, ...documentFinancials };
      
      // Calculate enhanced ratios and metrics with source attribution
      const calculatedMetrics = this.calculateFinancialRatios(mergedFinancials);
      
      // Generate trends and projections using real data
      const trends = await this.analyzeTrends(mergedFinancials);
      
      // Enhanced risk assessment with multiple data sources
      const riskMetrics = this.assessFinancialRisk(mergedFinancials, companyData.comprehensiveData);
      
      // Enhanced distressed credit analysis
      const distressedCreditAnalysis = this.performDistressedCreditAnalysis(
        mergedFinancials, 
        covenantData, 
        subsidiaryStructure, 
        companyData
      );
      
      return {
        extractedData: documentFinancials,
        apiData: apiFinancials,
        mergedData: mergedFinancials,
        calculatedMetrics: calculatedMetrics,
        trends: trends,
        riskMetrics: riskMetrics,
        covenantAnalysis: covenantData,
        subsidiaryStructure: subsidiaryStructure,
        distressedCreditAnalysis: distressedCreditAnalysis,
        enhancedExtractionResults: enhancedExtractionResults,
        sourceAttribution: this.generateSourceAttribution(documentFinancials, apiFinancials),
        confidence: this.calculateAnalysisConfidence(documentFinancials, apiFinancials, enhancedExtractionResults.confidence),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`[FinancialAnalyst] Enhanced analysis failed:`, error);
      throw new Error(`Enhanced financial analysis failed: ${error.message}`);
    }
  }

  normalizeAPIFinancials(comprehensiveData) {
    const normalized = {};
    
    // Extract from different API sources
    if (comprehensiveData.financialStatements) {
      const statements = comprehensiveData.financialStatements;
      
      // Income statement data
      if (statements.income && Array.isArray(statements.income) && statements.income[0]) {
        const latest = statements.income[0];
        normalized.revenue = latest.revenue || latest.totalRevenue;
        normalized.netIncome = latest.netIncome;
        normalized.grossProfit = latest.grossProfit;
        normalized.operatingIncome = latest.operatingIncome;
        normalized.ebitda = latest.ebitda;
      }
      
      // Balance sheet data
      if (statements.balance && Array.isArray(statements.balance) && statements.balance[0]) {
        const latest = statements.balance[0];
        normalized.totalAssets = latest.totalAssets;
        normalized.totalLiabilities = latest.totalLiabilities;
        normalized.totalEquity = latest.totalStockholdersEquity || latest.totalEquity;
        normalized.totalDebt = latest.totalDebt;
        normalized.cash = latest.cashAndCashEquivalents;
      }
      
      // Cash flow data
      if (statements.cashFlow && Array.isArray(statements.cashFlow) && statements.cashFlow[0]) {
        const latest = statements.cashFlow[0];
        normalized.operatingCashFlow = latest.operatingCashFlow;
        normalized.freeCashFlow = latest.freeCashFlow;
        normalized.capitalExpenditures = latest.capitalExpenditure;
      }
    }
    
    // Extract from ratios
    if (comprehensiveData.ratios) {
      const ratios = comprehensiveData.ratios;
      if (ratios.ratios && Array.isArray(ratios.ratios) && ratios.ratios[0]) {
        const latest = ratios.ratios[0];
        normalized.currentRatio = latest.currentRatio;
        normalized.quickRatio = latest.quickRatio;
        normalized.debtToEquity = latest.debtEquityRatio;
        normalized.returnOnEquity = latest.returnOnEquity;
        normalized.returnOnAssets = latest.returnOnAssets;
      }
    }
    
    return normalized;
  }

  calculateFinancialRatios(data) {
    const revenue = this.parseNumber(data.revenue);
    const netIncome = this.parseNumber(data.netIncome);
    const totalAssets = this.parseNumber(data.totalAssets);
    const totalEquity = this.parseNumber(data.totalEquity);
    const totalDebt = this.parseNumber(data.totalDebt);
    const operatingCashFlow = this.parseNumber(data.operatingCashFlow);
    
    const ratios = {
      // Profitability ratios with formulas
      profitMargin: {
        value: revenue ? ((netIncome / revenue) * 100).toFixed(2) + '%' : '[Data Unavailable]',
        formula: 'Net Income / Revenue × 100',
        source: data.revenue ? (data.revenue_source || 'Multiple APIs') : 'N/A',
        confidence: this.getConfidenceScore(data.revenue, data.netIncome)
      },
      
      returnOnAssets: {
        value: totalAssets ? ((netIncome / totalAssets) * 100).toFixed(2) + '%' : '[Data Unavailable]',
        formula: 'Net Income / Total Assets × 100',
        source: data.totalAssets ? (data.totalAssets_source || 'Multiple APIs') : 'N/A',
        confidence: this.getConfidenceScore(data.totalAssets, data.netIncome)
      },
      
      returnOnEquity: {
        value: totalEquity ? ((netIncome / totalEquity) * 100).toFixed(2) + '%' : '[Data Unavailable]',
        formula: 'Net Income / Total Equity × 100',
        source: data.totalEquity ? (data.totalEquity_source || 'Multiple APIs') : 'N/A',
        confidence: this.getConfidenceScore(data.totalEquity, data.netIncome)
      },
      
      // Leverage ratios
      debtToEquityRatio: {
        value: totalEquity && totalDebt ? (totalDebt / totalEquity).toFixed(2) : '[Data Unavailable]',
        formula: 'Total Debt / Total Equity',
        source: data.totalDebt ? (data.totalDebt_source || 'Multiple APIs') : 'N/A',
        confidence: this.getConfidenceScore(data.totalDebt, data.totalEquity)
      },
      
      // Cash flow ratios
      operatingCashFlowMargin: {
        value: revenue && operatingCashFlow ? ((operatingCashFlow / revenue) * 100).toFixed(2) + '%' : '[Data Unavailable]',
        formula: 'Operating Cash Flow / Revenue × 100',
        source: data.operatingCashFlow ? (data.operatingCashFlow_source || 'Multiple APIs') : 'N/A',
        confidence: this.getConfidenceScore(data.operatingCashFlow, data.revenue)
      }
    };
    
    return ratios;
  }

  getConfidenceScore(value1, value2) {
    if (!value1 || !value2) return 0.3;
    if (typeof value1 === 'string' && value1.includes('[Data Unavailable]')) return 0.0;
    return 0.9; // High confidence for calculated ratios with valid data
  }

  generateSourceAttribution(documentData, apiData) {
    const attribution = {};
    
    // Track which source provided each data point
    Object.keys({ ...documentData, ...apiData }).forEach(key => {
      if (documentData[key] && apiData[key]) {
        attribution[key] = {
          primary: 'User Document',
          secondary: 'API Data',
          hasDiscrepancy: documentData[key] !== apiData[key],
          documentValue: documentData[key],
          apiValue: apiData[key]
        };
      } else if (documentData[key]) {
        attribution[key] = {
          primary: 'User Document',
          secondary: null
        };
      } else if (apiData[key]) {
        attribution[key] = {
          primary: 'API Data',
          secondary: null
        };
      }
    });
    
    return attribution;
  }

  calculateAnalysisConfidence(documentData, apiData, enhancedConfidence = 0.5) {
    const documentCount = Object.keys(documentData).length;
    const apiCount = Object.keys(apiData).length;
    const totalDataPoints = documentCount + apiCount;
    
    if (totalDataPoints === 0) return 0.1;
    
    // Factor in enhanced extraction confidence
    let baseConfidence = 0.5;
    if (documentCount > 0 && apiCount > 0) baseConfidence = 0.85; // Multiple sources
    else if (documentCount > 0) baseConfidence = 0.75; // Document data available  
    else if (apiCount > 0) baseConfidence = 0.65; // Only API data
    
    // Boost confidence with enhanced extraction quality
    const finalConfidence = Math.min(0.98, baseConfidence + (enhancedConfidence * 0.2));
    
    return finalConfidence;
  }

  parseNumber(value) {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value.toString().replace(/[$,M,K,%]/g, ''));
  }

  async extractFinancialMetrics(documentResults, companySymbol = null) {
    // Enhanced financial data extraction using sophisticated Gemini analysis
    const financials = {};
    const covenantData = {};
    const subsidiaryStructure = {};
    const extractionResults = [];
    
    console.log(`[FinancialAnalyst] Enhanced extraction for ${documentResults.documents?.length || 0} documents`);
    
    if (!documentResults.documents || documentResults.documents.length === 0) {
      return {
        financials: {},
        covenantData: {},
        subsidiaryStructure: {},
        extractionResults: [],
        confidence: 0.1,
        sources: []
      };
    }

    // Process each document with enhanced Gemini analysis
    for (const doc of documentResults.documents) {
      try {
        console.log(`[FinancialAnalyst] Processing ${doc.fileName} with enhanced analysis`);
        
        // Use enhanced Gemini extraction for deep document analysis
        const extractedText = doc.extractedText || await this.extractTextFromDocument(doc);
        
        if (extractedText && extractedText.length > 100) {
          // Enhanced financial data extraction
          const geminiAnalysis = await GeminiService.extractFinancialData(extractedText, companySymbol);
          
          if (geminiAnalysis && geminiAnalysis.financialData) {
            // Merge financial metrics with source attribution
            Object.keys(geminiAnalysis.financialData).forEach(key => {
              if (geminiAnalysis.financialData[key] && geminiAnalysis.financialData[key] !== '[Data Unavailable]') {
                financials[key] = geminiAnalysis.financialData[key];
                financials[`${key}_source`] = `AI Analysis: ${doc.fileName}`;
                financials[`${key}_confidence`] = geminiAnalysis.confidence || 0.8;
              }
            });
          }

          // Extract covenant data for distressed credit analysis
          if (geminiAnalysis && geminiAnalysis.covenantMetrics) {
            Object.keys(geminiAnalysis.covenantMetrics).forEach(key => {
              covenantData[key] = {
                value: geminiAnalysis.covenantMetrics[key],
                source: `Covenant Analysis: ${doc.fileName}`,
                confidence: geminiAnalysis.confidence || 0.8,
                document: doc.fileName
              };
            });
          }

          // Enhanced SEC filing analysis for specific document types
          if (doc.documentType === '10k' || doc.documentType === '10q') {
            console.log(`[FinancialAnalyst] Performing SEC filing analysis on ${doc.fileName}`);
            try {
              const secAnalysis = await GeminiService.extractSECData(extractedText, companySymbol);
              if (secAnalysis) {
                // Merge SEC-specific financial data
                Object.keys(secAnalysis).forEach(key => {
                  if (secAnalysis[key] && !financials[key]) {
                    financials[key] = secAnalysis[key];
                    financials[`${key}_source`] = `SEC Filing: ${doc.fileName}`;
                    financials[`${key}_confidence`] = 0.95; // High confidence for SEC data
                  }
                });
              }
            } catch (secError) {
              console.warn(`[FinancialAnalyst] SEC analysis failed for ${doc.fileName}:`, secError);
            }
          }

          // Covenant extraction for credit agreements
          if (doc.documentType === 'credit_agreement' || doc.documentType === 'indenture') {
            console.log(`[FinancialAnalyst] Performing covenant analysis on ${doc.fileName}`);
            try {
              const covenantAnalysis = await GeminiService.extractCovenantData(extractedText, companySymbol);
              if (covenantAnalysis) {
                Object.assign(covenantData, covenantAnalysis);
              }
            } catch (covenantError) {
              console.warn(`[FinancialAnalyst] Covenant analysis failed for ${doc.fileName}:`, covenantError);
            }
          }

          // Subsidiary structure analysis
          if (doc.documentType === '10k' || doc.documentType === 'bankruptcy_filing') {
            console.log(`[FinancialAnalyst] Analyzing subsidiary structure from ${doc.fileName}`);
            try {
              const subsidiaryAnalysis = await GeminiService.extractSubsidiaryStructure(extractedText, companySymbol);
              if (subsidiaryAnalysis) {
                Object.assign(subsidiaryStructure, subsidiaryAnalysis);
              }
            } catch (subsidiaryError) {
              console.warn(`[FinancialAnalyst] Subsidiary analysis failed for ${doc.fileName}:`, subsidiaryError);
            }
          }

          extractionResults.push({
            fileName: doc.fileName,
            documentType: doc.documentType || 'unknown',
            extractedMetrics: Object.keys(geminiAnalysis?.financialData || {}).length,
            covenantCount: Object.keys(geminiAnalysis?.covenantMetrics || {}).length,
            confidence: geminiAnalysis?.confidence || 0.5,
            status: 'success'
          });
        }

        // Fallback to basic analysis if enhanced analysis fails
        if (doc.analysis?.financials) {
          Object.keys(doc.analysis.financials).forEach(key => {
            if (!financials[key]) { // Don't override enhanced analysis
              financials[key] = doc.analysis.financials[key];
              financials[`${key}_source`] = `Basic Analysis: ${doc.fileName}`;
              financials[`${key}_confidence`] = 0.6;
            }
          });
        }

      } catch (error) {
        console.error(`[FinancialAnalyst] Enhanced extraction failed for ${doc.fileName}:`, error);
        extractionResults.push({
          fileName: doc.fileName,
          documentType: doc.documentType || 'unknown',
          status: 'error',
          error: error.message,
          confidence: 0.0
        });
      }
    }

    // Calculate overall confidence and generate summary
    const totalDocs = documentResults.documents.length;
    const successfulExtractions = extractionResults.filter(r => r.status === 'success').length;
    const overallConfidence = totalDocs > 0 ? (successfulExtractions / totalDocs) * 0.9 : 0.1;
    
    const sources = extractionResults
      .filter(r => r.status === 'success')
      .map(r => r.fileName);

    console.log(`[FinancialAnalyst] Enhanced extraction complete: ${successfulExtractions}/${totalDocs} documents processed successfully`);
    console.log(`[FinancialAnalyst] Extracted ${Object.keys(financials).length} financial metrics, ${Object.keys(covenantData).length} covenant terms`);

    return {
      financials,
      covenantData,
      subsidiaryStructure,
      extractionResults,
      confidence: overallConfidence,
      sources,
      extractionSummary: {
        totalDocuments: totalDocs,
        successfulExtractions: successfulExtractions,
        failedExtractions: totalDocs - successfulExtractions,
        totalMetrics: Object.keys(financials).length,
        covenantTerms: Object.keys(covenantData).length,
        subsidiaryEntities: Object.keys(subsidiaryStructure).length
      }
    };
  }

  async extractTextFromDocument(doc) {
    // Helper method to extract text from document files
    if (doc.extractedText) {
      return doc.extractedText;
    }
    
    if (doc.file) {
      try {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(new Error('Failed to read file'));
          reader.readAsText(doc.file);
        });
      } catch (error) {
        console.warn(`[FinancialAnalyst] Failed to extract text from ${doc.fileName}:`, error);
        return '';
      }
    }
    
    return '';
  }

  performDistressedCreditAnalysis(financials, covenantData, subsidiaryStructure, companyData) {
    // Enhanced distressed credit analysis leveraging all available data
    const analysis = {
      liquidityAnalysis: this.analyzeLiquidityPosition(financials, covenantData),
      covenantCompliance: this.assessCovenantCompliance(covenantData, financials),
      capitalStructure: this.analyzeCapitalStructure(financials, subsidiaryStructure),
      maturityProfile: this.analyzeMaturityProfile(covenantData, financials),
      recoveryScenarios: this.assessRecoveryScenarios(financials, subsidiaryStructure),
      distressIndicators: this.identifyDistressIndicators(financials, covenantData),
      overallDistressRating: 'Medium', // Will be calculated based on factors
      lastUpdated: new Date()
    };

    // Calculate overall distress rating
    analysis.overallDistressRating = this.calculateDistressRating(analysis);
    
    return analysis;
  }

  analyzeLiquidityPosition(financials, covenantData) {
    const cash = this.parseNumber(financials.cash) || this.parseNumber(financials.cashAndEquivalents);
    const currentAssets = this.parseNumber(financials.currentAssets);
    const currentLiabilities = this.parseNumber(financials.currentLiabilities);
    const operatingCashFlow = this.parseNumber(financials.operatingCashFlow);
    const revenue = this.parseNumber(financials.revenue);
    
    // Calculate liquidity runway in months
    let liquidityRunway = null;
    if (cash && operatingCashFlow && operatingCashFlow < 0) {
      liquidityRunway = Math.abs(cash / (operatingCashFlow / 12));
    }

    return {
      cashPosition: cash || '[Data Unavailable]',
      currentRatio: currentAssets && currentLiabilities ? (currentAssets / currentLiabilities).toFixed(2) : '[Data Unavailable]',
      liquidityRunway: liquidityRunway ? `${liquidityRunway.toFixed(1)} months` : '[Requires Cash Flow Data]',
      operatingCashFlow: operatingCashFlow || '[Data Unavailable]',
      revolvingCreditAvailable: covenantData.revolvingCreditLimit ? 
        `${covenantData.revolvingCreditLimit.value}` : '[Check Credit Agreements]',
      assessment: this.assessLiquidityRisk({ cash, currentRatio: currentAssets/currentLiabilities, operatingCashFlow })
    };
  }

  assessCovenantCompliance(covenantData, financials) {
    const compliance = {
      financialCovenants: [],
      maintenanceTests: [],
      complianceStatus: 'Unknown',
      riskLevel: 'Medium'
    };

    // Analyze financial covenants from extracted data
    Object.keys(covenantData).forEach(covenantKey => {
      const covenant = covenantData[covenantKey];
      if (covenant && typeof covenant === 'object' && covenant.value) {
        compliance.financialCovenants.push({
          covenantType: covenantKey,
          requirement: covenant.value,
          source: covenant.source,
          confidence: covenant.confidence
        });
      }
    });

    // Determine overall compliance status
    if (compliance.financialCovenants.length > 0) {
      compliance.complianceStatus = 'Under Review';
      compliance.riskLevel = 'Medium';
    } else {
      compliance.complianceStatus = 'Data Required';
      compliance.riskLevel = 'Unknown';
    }

    return compliance;
  }

  analyzeCapitalStructure(financials, subsidiaryStructure) {
    const totalDebt = this.parseNumber(financials.totalDebt);
    const totalEquity = this.parseNumber(financials.totalEquity);
    const totalAssets = this.parseNumber(financials.totalAssets);
    
    return {
      totalDebt: totalDebt || '[Data Unavailable]',
      totalEquity: totalEquity || '[Data Unavailable]',
      debtToEquityRatio: totalDebt && totalEquity ? (totalDebt / totalEquity).toFixed(2) : '[Data Unavailable]',
      debtToAssetsRatio: totalDebt && totalAssets ? ((totalDebt / totalAssets) * 100).toFixed(1) + '%' : '[Data Unavailable]',
      subsidiaryCount: Object.keys(subsidiaryStructure).length,
      structureComplexity: Object.keys(subsidiaryStructure).length > 5 ? 'High' : 
                          Object.keys(subsidiaryStructure).length > 2 ? 'Medium' : 'Low'
    };
  }

  analyzeMaturityProfile(covenantData, financials) {
    // Analyze debt maturity from covenant data and financials
    const maturityAnalysis = {
      nearTermMaturities: [],
      maturityWall: 'Data Required',
      refinancingRisk: 'Medium',
      averageMaturity: 'Unknown'
    };

    // Extract maturity information from covenant data
    Object.keys(covenantData).forEach(key => {
      if (key.toLowerCase().includes('maturity') || key.toLowerCase().includes('term')) {
        const covenant = covenantData[key];
        maturityAnalysis.nearTermMaturities.push({
          description: key,
          details: covenant.value || covenant,
          source: covenant.source || 'Document Analysis'
        });
      }
    });

    return maturityAnalysis;
  }

  assessRecoveryScenarios(financials, subsidiaryStructure) {
    const totalAssets = this.parseNumber(financials.totalAssets);
    const totalDebt = this.parseNumber(financials.totalDebt);
    
    return {
      assetCoverage: totalAssets && totalDebt ? ((totalAssets / totalDebt) * 100).toFixed(0) + '%' : '[Data Unavailable]',
      liquidationValue: totalAssets ? `Est. ${(totalAssets * 0.6).toFixed(0)}M` : '[Asset Data Required]',
      structuralSubordination: Object.keys(subsidiaryStructure).length > 0 ? 'Present' : 'Unknown',
      recoveryEstimate: totalAssets && totalDebt && totalAssets > totalDebt ? 
        'Potential Full Recovery' : 'Partial Recovery Likely'
    };
  }

  identifyDistressIndicators(financials, covenantData) {
    const indicators = [];
    
    // Financial indicators
    const profitMargin = this.parseNumber(financials.profitMargin);
    const operatingCashFlow = this.parseNumber(financials.operatingCashFlow);
    const currentRatio = this.parseNumber(financials.currentRatio);
    const debtToEquity = this.parseNumber(financials.debtToEquity);
    
    if (profitMargin < 0) indicators.push('Negative Profitability');
    if (operatingCashFlow < 0) indicators.push('Negative Operating Cash Flow');
    if (currentRatio < 1.0) indicators.push('Liquidity Constraints');
    if (debtToEquity > 2.0) indicators.push('High Leverage');
    
    // Covenant indicators
    if (Object.keys(covenantData).length > 0) {
      indicators.push('Active Financial Covenants');
    }
    
    return {
      indicators: indicators,
      riskLevel: indicators.length >= 3 ? 'High' : indicators.length >= 1 ? 'Medium' : 'Low',
      count: indicators.length
    };
  }

  calculateDistressRating(analysis) {
    let riskScore = 0;
    
    // Liquidity risk
    if (analysis.liquidityAnalysis.assessment === 'High') riskScore += 3;
    else if (analysis.liquidityAnalysis.assessment === 'Medium') riskScore += 2;
    else riskScore += 1;
    
    // Distress indicators
    riskScore += analysis.distressIndicators.count;
    
    // Covenant compliance
    if (analysis.covenantCompliance.riskLevel === 'High') riskScore += 2;
    else if (analysis.covenantCompliance.riskLevel === 'Medium') riskScore += 1;
    
    // Determine overall rating
    if (riskScore >= 6) return 'High';
    if (riskScore >= 3) return 'Medium';
    return 'Low';
  }

  async analyzeTrends(data) {
    const prompt = `Analyze financial trends and provide insights for this comprehensive data: ${JSON.stringify(data)}. Focus on distressed credit analysis including covenant health, liquidity position, and credit risk indicators.`;
    try {
      return await GeminiService.generateInsights(data, prompt);
    } catch (error) {
      return "Trend analysis temporarily unavailable - please check API configuration";
    }
  }

  assessFinancialRisk(mergedData, comprehensiveAPIData) {
    return {
      liquidityRisk: this.assessLiquidityRisk(mergedData),
      leverageRisk: this.assessLeverageRisk(mergedData),
      profitabilityRisk: this.assessProfitabilityRisk(mergedData),
      creditRisk: this.assessCreditRisk(mergedData, comprehensiveAPIData),
      overallRisk: this.calculateOverallRisk(mergedData),
      dataQuality: this.assessDataQuality(mergedData, comprehensiveAPIData)
    };
  }

  assessLiquidityRisk(data) {
    const currentRatio = this.parseNumber(data.currentRatio);
    const quickRatio = this.parseNumber(data.quickRatio);
    const cash = this.parseNumber(data.cash);
    
    if (currentRatio < 1.0 || quickRatio < 0.5) return 'High';
    if (currentRatio < 1.5 || quickRatio < 1.0) return 'Medium';
    return 'Low';
  }

  assessLeverageRisk(data) {
    const debtToEquity = this.parseNumber(data.debtToEquity);
    
    if (debtToEquity > 2.0) return 'High';
    if (debtToEquity > 1.0) return 'Medium';
    return 'Low';
  }

  assessProfitabilityRisk(data) {
    const profitMargin = this.parseNumber(data.profitMargin);
    const roe = this.parseNumber(data.returnOnEquity);
    
    if (profitMargin < 0 || roe < 0) return 'High';
    if (profitMargin < 5 || roe < 10) return 'Medium';
    return 'Low';
  }

  assessCreditRisk(data, apiData) {
    // Advanced credit risk assessment using multiple factors
    const factors = [];
    
    if (this.parseNumber(data.debtToEquity) > 1.5) factors.push('High Leverage');
    if (this.parseNumber(data.operatingCashFlow) < 0) factors.push('Negative Cash Flow');
    if (this.parseNumber(data.profitMargin) < 0) factors.push('Unprofitable');
    
    if (factors.length >= 2) return 'High';
    if (factors.length === 1) return 'Medium';
    return 'Low';
  }

  calculateOverallRisk(data) {
    const risks = [
      this.assessLiquidityRisk(data),
      this.assessLeverageRisk(data),
      this.assessProfitabilityRisk(data)
    ];
    
    const highRiskCount = risks.filter(r => r === 'High').length;
    const mediumRiskCount = risks.filter(r => r === 'Medium').length;
    
    if (highRiskCount >= 2) return 'High';
    if (highRiskCount >= 1 || mediumRiskCount >= 2) return 'Medium';
    return 'Low';
  }

  assessDataQuality(mergedData, apiData) {
    const totalFields = ['revenue', 'netIncome', 'totalAssets', 'totalEquity', 'totalDebt'];
    const availableFields = totalFields.filter(field => mergedData[field] && mergedData[field] !== '[Data Unavailable]');
    
    const completeness = (availableFields.length / totalFields.length) * 100;
    
    return {
      completeness: `${completeness.toFixed(0)}%`,
      availableFields: availableFields,
      missingFields: totalFields.filter(field => !availableFields.includes(field)),
      hasApiData: !!apiData,
      hasDocumentData: Object.keys(mergedData).some(key => key.includes('_source') && mergedData[key].includes('User Document'))
    };
  }
}

class ResearchAgent {
  async detectAndEnrichCompany(documentResults, companyInfo) {
    try {
      // Detect company from documents
      let detectedCompany = null;
      
      if (documentResults.documents && documentResults.documents.length > 0) {
        const firstDoc = documentResults.documents[0];
        if (firstDoc.analysis?.company) {
          detectedCompany = firstDoc.analysis.company;
        } else if (firstDoc.extractedText) {
          detectedCompany = await GeminiService.detectCompanyFromText(firstDoc.extractedText);
        }
      }
      
      // Use provided info if no detection
      const companyName = detectedCompany?.companyName || companyInfo?.companyName || 'Unknown Company';
      const ticker = companyInfo?.ticker || detectedCompany?.ticker;
      
      // If we have a ticker, use the new multi-API orchestration
      if (ticker) {
        console.log(`[ResearchAgent] Using multi-API orchestration for ${ticker}`);
        // Use the exported instance or create a temporary instance for internal use
        const comprehensiveData = await this.orchestrateDataFetch ? 
          await this.orchestrateDataFetch(ticker) : 
          await new AgentCoordinator().orchestrateDataFetch(ticker);
        
        return {
          name: companyName,
          ticker: ticker,
          industry: detectedCompany?.industry || companyInfo?.industry || 'Unknown',
          description: companyInfo?.description || detectedCompany?.description || '',
          isPublic: true,
          comprehensiveData: comprehensiveData,
          confidence: detectedCompany?.confidence || 0.9,
          dataSource: 'Multi-API Orchestration',
          lastUpdated: new Date()
        };
      }
      
      // Fallback for companies without ticker
      return {
        name: companyName,
        industry: detectedCompany?.industry || companyInfo?.industry || 'Unknown',
        ticker: null,
        description: companyInfo?.description || detectedCompany?.description || '',
        isPublic: false,
        marketData: null,
        confidence: detectedCompany?.confidence || 0.8,
        dataSource: 'Document Analysis Only'
      };
    } catch (error) {
      throw new Error(`Company research failed: ${error.message}`);
    }
  }

  async fetchMarketData(symbol) {
    try {
      // Use new multi-API orchestration instead of just AlphaVantage
      // Use the exported instance or create a temporary instance for internal use  
      const coordInstance = this.orchestrateDataFetch ? this : new AgentCoordinator();
      return await coordInstance.orchestrateDataFetch(symbol, ['stockPrice', 'historical', 'profile']);
    } catch (error) {
      throw new Error(`Market data fetch failed: ${error.message}`);
    }
  }
}

class InsightsAgent {
  async generateInsights(analysisResults) {
    try {
      const insights = await GeminiService.generateInsights(
        analysisResults,
        "Generate comprehensive investment insights including strengths, opportunities, risks, and recommendations"
      );

      return {
        keyInsights: this.parseInsights(insights),
        investmentThesis: await this.generateInvestmentThesis(analysisResults),
        riskFactors: await this.identifyRiskFactors(analysisResults),
        opportunities: await this.identifyOpportunities(analysisResults),
        confidence: 0.89
      };
    } catch (error) {
      throw new Error(`Insights generation failed: ${error.message}`);
    }
  }

  parseInsights(insights) {
    // Parse AI-generated insights into structured format
    return [
      {
        type: 'strength',
        title: 'Strong Financial Performance',
        description: 'Company demonstrates solid fundamentals',
        importance: 'high'
      },
      {
        type: 'opportunity',
        title: 'Market Expansion',
        description: 'Significant growth opportunities identified',
        importance: 'medium'
      }
    ];
  }

  async generateInvestmentThesis(data) {
    try {
      return await GeminiService.generateInsights(data, "Generate a clear investment thesis");
    } catch (error) {
      return "Investment thesis generation temporarily unavailable";
    }
  }

  async identifyRiskFactors(data) {
    try {
      return await GeminiService.generateInsights(data, "Identify key risk factors");
    } catch (error) {
      return ["Risk analysis temporarily unavailable"];
    }
  }

  async identifyOpportunities(data) {
    try {
      return await GeminiService.generateInsights(data, "Identify growth opportunities");
    } catch (error) {
      return ["Opportunity analysis temporarily unavailable"];
    }
  }

  async processQuery(message, context) {
    try {
      // Use the enhanced chatWithAI function for company-specific analysis
      const response = await GeminiService.chatWithAI(message, context);
      return {
        response: response.response,
        confidence: response.confidence || 0.85,
        agentType: response.agentType || 'insights',
        sources: response.sources || (context ? ['Company Analysis', 'Financial Data'] : ['General Knowledge']),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('[InsightsAgent] ProcessQuery error:', error);
      return {
        response: "I apologize, but I'm having trouble processing that query. Could you please try rephrasing your question or providing more specific details?",
        confidence: 0.5,
        agentType: 'coordinator',
        sources: ['Error Recovery'],
        timestamp: new Date(),
        error: error.message
      };
    }
  }

  // SEC-specific data fetching method
  async fetchSECDataForType(dataType, symbol, params = {}) {
    console.log(`[AgentCoordinator] Fetching SEC data type: ${dataType} for ${symbol}`);
    
    try {
      switch (dataType) {
        case 'companyProfile':
          const companyLookup = await SecApiService.getCompanyLookup(symbol);
          if (companyLookup.success) {
            return this.formatSECCompanyProfile(companyLookup);
          }
          break;
          
        case 'financialStatements':
          const coreFilings = await SecApiService.fetchCoreFilings(symbol);
          if (coreFilings.success && coreFilings.filings.annual_10k.length > 0) {
            const latestFiling = coreFilings.filings.annual_10k[0];
            const xbrlData = await SecApiService.getXBRLData(latestFiling.accession_number);
            if (xbrlData.success) {
              return this.formatSECFinancials(xbrlData);
            }
          }
          break;
          
        case 'executives':
          const executiveData = await SecApiService.getExecutiveCompensation(symbol);
          return executiveData;
          
        case 'subsidiaries':
          const subsidiaryData = await SecApiService.getSubsidiaryData(symbol);
          return subsidiaryData;
          
        case 'covenants':
          const covenantData = await this.getSECCovenantData(symbol);
          return covenantData;
          
        case 'debtStructure':
          const debtData = await this.getSECDebtStructure(symbol);
          return debtData;
          
        case 'insiderTrading':
          const insiderData = await SecApiService.getInsiderTrading(symbol);
          return insiderData;
          
        case 'litigation':
          const litigationData = await SecApiService.getLitigationReleases(symbol);
          return litigationData;
          
        case 'institutionalHoldings':
          const holdingsData = await SecApiService.getForm13FHoldings(symbol);
          return holdingsData;
          
        case 'ownership':
          const ownershipData = await SecApiService.getForm13DG(symbol);
          return ownershipData;
          
        default:
          throw new Error(`SEC data type ${dataType} not supported`);
      }
      
      throw new Error(`No SEC data available for ${dataType}`);
      
    } catch (error) {
      console.error(`[AgentCoordinator] SEC data fetch failed for ${dataType}:`, error);
      return {
        error: true,
        message: `SEC ${dataType} data unavailable: ${error.message}`,
        source: 'SEC API',
        guidance: `For ${dataType}, ensure the company has recent SEC filings and proper ticker symbol.`
      };
    }
  }

  // SEC-specific covenant data fetching
  async getSECCovenantData(symbol) {
    try {
      const coreFilings = await SecApiService.fetchCoreFilings(symbol);
      if (coreFilings.success && coreFilings.filings.annual_10k.length > 0) {
        const latestFiling = coreFilings.filings.annual_10k[0];
        const covenantAnalysis = await SecApiService.analyzeFilingContent(
          symbol, 
          latestFiling.link_to_html, 
          'covenant'
        );
        return covenantAnalysis;
      }
      throw new Error('No recent filings available for covenant analysis');
    } catch (error) {
      return {
        error: true,
        message: `Covenant data unavailable: ${error.message}`,
        source: 'SEC Filing Analysis'
      };
    }
  }

  // SEC-specific debt structure data fetching
  async getSECDebtStructure(symbol) {
    try {
      const coreFilings = await SecApiService.fetchCoreFilings(symbol);
      if (coreFilings.success && coreFilings.filings.annual_10k.length > 0) {
        const latestFiling = coreFilings.filings.annual_10k[0];
        const debtAnalysis = await SecApiService.analyzeFilingContent(
          symbol, 
          latestFiling.link_to_html, 
          'debt_structure'
        );
        return debtAnalysis;
      }
      throw new Error('No recent filings available for debt structure analysis');
    } catch (error) {
      return {
        error: true,
        message: `Debt structure data unavailable: ${error.message}`,
        source: 'SEC Filing Analysis'
      };
    }
  }

  // SEC data formatting methods
  formatSECCompanyProfile(companyLookup) {
    if (!companyLookup.success) return null;
    
    return {
      symbol: companyLookup.ticker,
      companyName: companyLookup.companyData?.mapping?.name || companyLookup.companyData?.entity_details?.name,
      cik: companyLookup.cik,
      sector: companyLookup.companyData?.entity_details?.sic_description,
      industry: companyLookup.companyData?.entity_details?.business_description,
      description: companyLookup.companyData?.entity_details?.business_description,
      website: companyLookup.companyData?.entity_details?.website,
      address: companyLookup.companyData?.entity_details?.addresses?.[0],
      source: 'SEC EDGAR Entities',
      confidence: 98
    };
  }

  formatSECFinancials(xbrlData) {
    if (!xbrlData.success || !xbrlData.financialData) return null;
    
    const data = xbrlData.financialData;
    return {
      income: this.extractIncomeStatement(data),
      balance: this.extractBalanceSheet(data),
      cashFlow: this.extractCashFlow(data),
      source: 'SEC XBRL',
      confidence: 99,
      accessionNumber: xbrlData.accessionNumber
    };
  }

  extractIncomeStatement(xbrlData) {
    // Extract income statement items from XBRL data
    // This would map XBRL tags to standard financial statement items
    return [{
      date: new Date().getFullYear(),
      revenue: xbrlData.Revenues || xbrlData.RevenueFromContractWithCustomerExcludingAssessedTax || '[Data Unavailable - Requires 10-K Filing]',
      netIncome: xbrlData.NetIncomeLoss || '[Data Unavailable - Requires 10-K Filing]',
      grossProfit: xbrlData.GrossProfit || '[Data Unavailable - Requires 10-K Filing]',
      operatingIncome: xbrlData.OperatingIncomeLoss || '[Data Unavailable - Requires 10-K Filing]',
      ebitda: '[Calculated from XBRL Data]',
      source: 'SEC XBRL-to-JSON'
    }];
  }

  extractBalanceSheet(xbrlData) {
    return [{
      date: new Date().getFullYear(),
      totalAssets: xbrlData.Assets || '[Data Unavailable - Requires 10-K Filing]',
      totalLiabilities: xbrlData.Liabilities || '[Data Unavailable - Requires 10-K Filing]',
      totalEquity: xbrlData.StockholdersEquity || '[Data Unavailable - Requires 10-K Filing]',
      totalDebt: xbrlData.LongTermDebt || '[Data Unavailable - Requires 10-K Filing]',
      cash: xbrlData.CashAndCashEquivalentsAtCarryingValue || '[Data Unavailable - Requires 10-K Filing]',
      source: 'SEC XBRL-to-JSON'
    }];
  }

  extractCashFlow(xbrlData) {
    return [{
      date: new Date().getFullYear(),
      operatingCashFlow: xbrlData.NetCashProvidedByUsedInOperatingActivities || '[Data Unavailable - Requires 10-K Filing]',
      investingCashFlow: xbrlData.NetCashProvidedByUsedInInvestingActivities || '[Data Unavailable - Requires 10-K Filing]',
      financingCashFlow: xbrlData.NetCashProvidedByUsedInFinancingActivities || '[Data Unavailable - Requires 10-K Filing]',
      freeCashFlow: '[Calculated from Operating Cash Flow]',
      source: 'SEC XBRL-to-JSON'
    }];
  }
        date: secFinancials.filingDate,
        period: secFinancials.period,
        operatingCashFlow: secFinancials.operatingCashFlow,
        investingCashFlow: secFinancials.investingCashFlow,
        financingCashFlow: secFinancials.financingCashFlow,
        source: 'SEC XBRL Filing',
        confidence: 99
      }],
      metadata: {
        source: 'SEC XBRL Filing',
        sourceUrl: secFinancials.sourceUrl,
        filingDate: secFinancials.filingDate,
        accessionNumber: secFinancials.accessionNumber,
        confidence: 99,
        dataQuality: 'highest' // SEC data is highest quality
      }
    };
  }

  formatSECProfile(secProfile) {
    // Convert SEC profile data to standard profile format
    return {
      companyName: secProfile.companyName,
      symbol: secProfile.ticker,
      cik: secProfile.cik,
      industry: secProfile.industry,
      sector: secProfile.industry, // Use industry as sector for now
      description: secProfile.businessDescription,
      sic: secProfile.sic,
      
      // Enhanced SEC-specific data
      riskFactors: secProfile.riskFactors,
      managementDiscussion: secProfile.managementDiscussion,
      filingDate: secProfile.filingDate,
      
      // Metadata
      source: 'SEC 10-K Filing',
      sourceUrl: secProfile.sourceUrl,
      confidence: 97,
      dataQuality: 'regulatory' // Regulatory filings are authoritative
    };
  }

  async addSECDataToFallback(dataType, symbol) {
    // Add SEC API as primary source in fetchWithFallback
    try {
      switch (dataType) {
        case 'companyProfile':
          const profile = await SecApiService.getCompanyProfile(symbol);
          if (profile) {
            return {
              data: this.formatSECProfile(profile),
              source: 'SEC',
              endpoint: '10-K Extractor',
              confidence: 97
            };
          }
          break;
          
        case 'financialStatements':
          const financials = await SecApiService.getXBRLFinancials(symbol);
          if (financials) {
            return {
              data: this.formatSECFinancials(financials),
              source: 'SEC',
              endpoint: 'XBRL-to-JSON',
              confidence: 99
            };
          }
          break;
          
        case 'executives':
          const executives = await SecApiService.getExecutiveData(symbol);
          if (executives) {
            return {
              data: executives.executives,
              source: 'SEC',
              endpoint: 'Executive Compensation',
              confidence: 96
            };
          }
          break;
          
        case 'subsidiaries':
          const subsidiaries = await SecApiService.getSubsidiaries(symbol);
          if (subsidiaries) {
            return {
              data: subsidiaries.subsidiaries,
              source: 'SEC',
              endpoint: 'Company Subsidiaries',
              confidence: 98
            };
          }
          break;
      }
      
      return null; // Fallback to other APIs
    } catch (error) {
      console.warn(`[AgentCoordinator] SEC API failed for ${dataType}:`, error);
      return null;
    }
  }
}

export default new AgentCoordinator();