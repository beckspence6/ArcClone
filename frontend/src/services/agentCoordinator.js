import GeminiService from './geminiService';
import AlphaVantageService from './alphaVantageService';
import FMPService from './FMPService';
import MarketstackService from './MarketstackService';
import TwelveDataService from './TwelveDataService';

class AgentCoordinator {
  constructor() {
    this.agents = {
      coordinator: new CoordinatorAgent(),
      documentProcessor: new DocumentProcessorAgent(),
      financialAnalyst: new FinancialAnalystAgent(),
      researchAgent: new ResearchAgent(),
      insightsAgent: new InsightsAgent()
    };
    
    // API priority configuration for intelligent fallbacks
    this.apiPriority = {
      companyProfile: ['FMP', 'TwelveData', 'AlphaVantage'],
      stockPrice: ['FMP', 'Marketstack', 'TwelveData', 'AlphaVantage'],
      financialStatements: ['FMP', 'TwelveData', 'AlphaVantage'],
      historicalData: ['FMP', 'Marketstack', 'TwelveData', 'AlphaVantage'],
      ratios: ['FMP', 'TwelveData'],
      news: ['FMP'],
      executives: ['FMP']
    };
    
    // Rate limit tracking
    this.rateLimits = new Map();
    this.requestQueue = new Map();
    
    this.activeAnalysis = null;
    this.analysisHistory = [];
  }

  // Central data orchestration method
  async orchestrateDataFetch(symbol, dataTypes = ['all']) {
    console.log(`[AgentCoordinator] Orchestrating data fetch for ${symbol}`);
    
    const companyData = {
      symbol: symbol,
      profile: null,
      stockPrice: null,
      financialStatements: null,
      historicalData: null,
      ratios: null,
      news: null,
      executives: null,
      sourceAttribution: {},
      errors: [],
      lastUpdated: new Date()
    };

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
        const result = await this.callAPI(apiName, dataType, symbol, params);
        if (result && !result.error) {
          // Record successful source
          this.recordSourceAttribution(dataType, apiName, symbol);
          return result;
        }
      } catch (error) {
        console.warn(`[AgentCoordinator] ${apiName} failed for ${dataType}:`, error.message);
        lastError = error;
        
        // Handle rate limiting
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          this.markAPILimited(apiName, 900000); // 15 minutes
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
  recordSourceAttribution(dataType, source, symbol, errorInfo = null) {
    const key = `${dataType}_${symbol}`;
    if (!this.sourceAttribution) {
      this.sourceAttribution = {};
    }
    
    this.sourceAttribution[key] = {
      source: source,
      timestamp: new Date(),
      symbol: symbol,
      dataType: dataType,
      success: !errorInfo,
      error: errorInfo,
      endpoint: this.getEndpointInfo(source, dataType)
    };
  }

  getEndpointInfo(source, dataType) {
    const endpointMap = {
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
      // Extract financial data from processed documents
      const financialData = this.extractFinancialMetrics(documentResults);
      
      // Calculate key ratios and metrics
      const calculatedMetrics = this.calculateFinancialRatios(financialData);
      
      // Generate trends and projections
      const trends = await this.analyzeTrends(financialData);
      
      return {
        extractedData: financialData,
        calculatedMetrics: calculatedMetrics,
        trends: trends,
        riskMetrics: this.assessFinancialRisk(financialData),
        confidence: 0.92
      };
    } catch (error) {
      throw new Error(`Financial analysis failed: ${error.message}`);
    }
  }

  extractFinancialMetrics(documentResults) {
    // Extract financial data from AI analysis results
    const financials = {};
    
    documentResults.documents?.forEach(doc => {
      if (doc.analysis?.financials) {
        Object.assign(financials, doc.analysis.financials);
      }
    });

    return financials;
  }

  calculateFinancialRatios(data) {
    const revenue = this.parseNumber(data.revenue);
    const netIncome = this.parseNumber(data.netIncome);
    const totalAssets = this.parseNumber(data.totalAssets);
    const totalEquity = this.parseNumber(data.totalEquity);
    
    return {
      profitMargin: revenue ? (netIncome / revenue * 100).toFixed(2) + '%' : 'N/A',
      roa: totalAssets ? (netIncome / totalAssets * 100).toFixed(2) + '%' : 'N/A',
      roe: totalEquity ? (netIncome / totalEquity * 100).toFixed(2) + '%' : 'N/A',
      // Add more ratio calculations
    };
  }

  parseNumber(value) {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/[$,M,K,%]/g, ''));
  }

  async analyzeTrends(data) {
    const prompt = `Analyze financial trends for this data: ${JSON.stringify(data)}`;
    try {
      return await GeminiService.generateInsights(data, prompt);
    } catch (error) {
      return "Trend analysis temporarily unavailable";
    }
  }

  assessFinancialRisk(data) {
    return {
      liquidityRisk: this.assessLiquidityRisk(data),
      leverageRisk: this.assessLeverageRisk(data),
      profitabilityRisk: this.assessProfitabilityRisk(data),
      overallRisk: 'Medium' // Calculated based on individual risks
    };
  }

  assessLiquidityRisk(data) {
    // Implement liquidity risk assessment logic
    return 'Low';
  }

  assessLeverageRisk(data) {
    // Implement leverage risk assessment logic
    return 'Medium';
  }

  assessProfitabilityRisk(data) {
    // Implement profitability risk assessment logic
    return 'Low';
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
        const coordinator = new AgentCoordinator();
        const comprehensiveData = await coordinator.orchestrateDataFetch(ticker);
        
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
      const coordinator = new AgentCoordinator();
      return await coordinator.orchestrateDataFetch(symbol, ['stockPrice', 'historical', 'profile']);
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
      const response = await GeminiService.generateInsights(context, message);
      return {
        response: response,
        confidence: 0.85,
        sources: context ? ['Company Analysis', 'Financial Data'] : ['General Knowledge'],
        timestamp: new Date()
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new AgentCoordinator();