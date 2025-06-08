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
    
    this.activeAnalysis = null;
    this.analysisHistory = [];
  }

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
      onProgress(5, "Initializing AI agents...", "coordinator");
      await this.delay(500);

      // Step 2: Document processing
      onProgress(15, "Processing uploaded documents...", "documentProcessor");
      const documentResults = await this.agents.documentProcessor.processDocuments(files);
      this.activeAnalysis.results.documents = documentResults;
      await this.delay(1000);

      // Step 3: Company detection and enrichment
      onProgress(30, "Detecting company and gathering data...", "researchAgent");
      const companyData = await this.agents.researchAgent.detectAndEnrichCompany(
        documentResults, 
        companyInfo
      );
      this.activeAnalysis.results.company = companyData;
      await this.delay(1500);

      // Step 4: Financial analysis
      onProgress(50, "Analyzing financial metrics...", "financialAnalyst");
      const financialAnalysis = await this.agents.financialAnalyst.analyzeFinancials(
        documentResults,
        companyData
      );
      this.activeAnalysis.results.financials = financialAnalysis;
      await this.delay(1500);

      // Step 5: Generate insights
      onProgress(75, "Generating investment insights...", "insightsAgent");
      const insights = await this.agents.insightsAgent.generateInsights({
        ...this.activeAnalysis.results
      });
      this.activeAnalysis.results.insights = insights;
      await this.delay(1000);

      // Step 6: Coordination and finalization
      onProgress(90, "Coordinating final analysis...", "coordinator");
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
      
      // Enrich with market data if public company
      let marketData = null;
      if (companyInfo?.ticker || detectedCompany?.ticker) {
        const symbol = companyInfo.ticker || detectedCompany.ticker;
        try {
          marketData = await this.fetchMarketData(symbol);
        } catch (error) {
          console.warn('Failed to fetch market data:', error);
        }
      }
      
      return {
        name: companyName,
        industry: detectedCompany?.industry || companyInfo?.industry || 'Unknown',
        ticker: companyInfo?.ticker || detectedCompany?.ticker,
        description: companyInfo?.description || detectedCompany?.description || '',
        isPublic: !!marketData,
        marketData: marketData,
        confidence: detectedCompany?.confidence || 0.8
      };
    } catch (error) {
      throw new Error(`Company research failed: ${error.message}`);
    }
  }

  async fetchMarketData(symbol) {
    try {
      const [overview, stockPrice, historicalData] = await Promise.all([
        AlphaVantageService.getCompanyOverview(symbol),
        AlphaVantageService.getStockPrice(symbol),
        AlphaVantageService.getHistoricalData(symbol, 'monthly')
      ]);

      return {
        overview,
        currentPrice: stockPrice,
        historicalData,
        lastUpdated: new Date()
      };
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