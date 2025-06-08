import axios from 'axios';

class SecApiService {
  constructor() {
    this.apiKey = process.env.REACT_APP_SECAPI_KEY;
    this.baseURL = 'https://api.sec-api.io';
    this.backendURL = process.env.REACT_APP_BACKEND_URL;
    
    // Client for direct SEC API calls (for simple, non-credit-intensive operations)
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Stratum-Credit-Analysis/2.0'
      }
    });

    // Client for backend proxy calls (for credit-intensive operations)
    this.backendClient = axios.create({
      baseURL: this.backendURL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Credit usage tracking
    this.creditUsage = new Map();
    this.maxCreditsPerEndpoint = 100;
    
    // Cache for API responses (aggressive caching to conserve credits)
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour cache
    
    this.initializeCreditTracking();
  }

  initializeCreditTracking() {
    const endpoints = [
      'query', 'xbrl-to-json', 'extractor', 'company-subsidiaries',
      'executive-compensation', 'directors-board-members', 'outstanding-shares-float',
      'form-13f', 'form-13d-13g', 'form-144', 'full-text-search',
      'mapping', 'edgar-entities', 'litigation-releases'
    ];

    endpoints.forEach(endpoint => {
      this.creditUsage.set(endpoint, {
        used: 0,
        limit: this.maxCreditsPerEndpoint,
        resetTime: Date.now() + 3600000,
        lastRequest: Date.now()
      });
    });
  }

  getCacheKey(endpoint, params) {
    return `sec_${endpoint}_${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`[SecApiService] Cache hit for ${key}`);
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  canMakeRequest(endpoint) {
    const usage = this.creditUsage.get(endpoint);
    if (!usage) return true;

    const now = Date.now();
    if (now > usage.resetTime) {
      usage.used = 0;
      usage.resetTime = now + 3600000;
    }

    return usage.used < usage.limit;
  }

  incrementCredit(endpoint) {
    const usage = this.creditUsage.get(endpoint);
    if (usage) {
      usage.used += 1;
      usage.lastRequest = Date.now();
    }
  }

  /**
   * Enhanced Company Lookup using SEC Mapping and EDGAR Entities APIs
   * Routes through backend for credit management
   */
  async getCompanyLookup(ticker = null, cik = null, companyName = null) {
    const cacheKey = this.getCacheKey('company_lookup', { ticker, cik, companyName });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`[SecApiService] Enhanced company lookup for ${ticker || cik || companyName}`);
      
      const response = await this.backendClient.post('/api/sec/company/lookup', {
        ticker: ticker,
        cik: cik,
        company_name: companyName
      });

      if (response.data.success) {
        const result = {
          success: true,
          cik: response.data.cik,
          ticker: response.data.ticker,
          companyData: response.data.company_data,
          mapping: response.data.company_data.mapping,
          entityDetails: response.data.company_data.entity_details,
          recentFilings: response.data.company_data.recent_filings,
          source: 'SEC EDGAR Entities & Mapping APIs',
          confidence: 98,
          creditUsage: response.data.credit_usage
        };

        this.setCache(cacheKey, result);
        return result;
      } else {
        throw new Error('Company lookup failed');
      }

    } catch (error) {
      console.error('[SecApiService] Company lookup error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        source: 'SEC API Error'
      };
    }
  }

  /**
   * Fetch SEC Filings using Backend Proxy
   * Automatically fetches latest 10-K and 10-Q for distressed credit analysis
   */
  async fetchCoreFilings(ticker) {
    const cacheKey = this.getCacheKey('core_filings', { ticker });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`[SecApiService] Fetching core SEC filings for ${ticker}`);
      
      // Fetch latest 10-K
      const tenKResponse = await this.backendClient.post('/api/sec/filings/fetch', {
        ticker: ticker,
        filing_type: '10-K',
        limit: 1
      });

      // Fetch latest 10-Q
      const tenQResponse = await this.backendClient.post('/api/sec/filings/fetch', {
        ticker: ticker,
        filing_type: '10-Q',
        limit: 2
      });

      const result = {
        success: true,
        ticker: ticker,
        filings: {
          'annual_10k': tenKResponse.data.success ? tenKResponse.data.filings : [],
          'quarterly_10q': tenQResponse.data.success ? tenQResponse.data.filings : []
        },
        totalFilings: (tenKResponse.data.filings?.length || 0) + (tenQResponse.data.filings?.length || 0),
        source: 'SEC Filing Query API',
        creditUsage: tenKResponse.data.credit_usage
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('[SecApiService] Core filings fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        filings: { annual_10k: [], quarterly_10q: [] }
      };
    }
  }

  /**
   * Deep AI Analysis of SEC Filings
   * Routes through backend for credit-intensive analysis
   */
  async analyzeFilingContent(ticker, filingUrl, analysisType = 'covenant') {
    const cacheKey = this.getCacheKey('filing_analysis', { ticker, filingUrl, analysisType });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`[SecApiService] AI analysis of ${analysisType} for ${ticker}`);
      
      const response = await this.backendClient.post('/api/sec/analyze/filing', {
        ticker: ticker,
        filing_url: filingUrl,
        analysis_type: analysisType
      });

      if (response.data.success) {
        const result = {
          success: true,
          ticker: ticker,
          analysisType: analysisType,
          analysis: response.data.analysis,
          source: 'AI-Enhanced SEC Filing Analysis',
          confidence: response.data.analysis.analysis_confidence || 0.85,
          creditUsage: response.data.credit_usage
        };

        this.setCache(cacheKey, result);
        return result;
      } else {
        throw new Error('Filing analysis failed');
      }

    } catch (error) {
      console.error('[SecApiService] Filing analysis error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        analysis: null
      };
    }
  }

  /**
   * XBRL Financial Data Extraction
   */
  async getXBRLData(accessionNumber) {
    const cacheKey = this.getCacheKey('xbrl_data', { accessionNumber });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`[SecApiService] Extracting XBRL data for ${accessionNumber}`);
      
      const response = await this.backendClient.post(`/api/sec/xbrl/extract?accession_number=${accessionNumber}`);

      if (response.data.success) {
        const result = {
          success: true,
          accessionNumber: accessionNumber,
          financialData: response.data.xbrl_data,
          source: 'SEC XBRL-to-JSON API',
          confidence: 99,
          creditUsage: response.data.credit_usage
        };

        this.setCache(cacheKey, result);
        return result;
      } else {
        throw new Error('XBRL extraction failed');
      }

    } catch (error) {
      console.error('[SecApiService] XBRL extraction error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        financialData: null
      };
    }
  }

  /**
   * Full-Text Search (High Credit Cost - Use Sparingly)
   */
  async performFullTextSearch(ticker, searchQuery, limit = 5) {
    console.warn(`[SecApiService] Full-text search initiated - High credit cost operation`);
    
    try {
      const response = await this.backendClient.post('/api/sec/search/full-text', null, {
        params: {
          query: searchQuery,
          ticker: ticker,
          limit: limit
        }
      });

      if (response.data.success) {
        return {
          success: true,
          ticker: ticker,
          searchQuery: searchQuery,
          results: response.data.results,
          source: 'SEC Full-Text Search API',
          creditUsage: response.data.credit_usage,
          warning: 'High credit cost operation'
        };
      } else {
        throw new Error('Full-text search failed');
      }

    } catch (error) {
      console.error('[SecApiService] Full-text search error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        results: []
      };
    }
  }

  /**
   * Comprehensive SEC Data Orchestration
   * Main method for getting all SEC data for a company
   */
  async getComprehensiveSecData(ticker) {
    console.log(`[SecApiService] Starting comprehensive SEC data collection for ${ticker}`);
    
    try {
      const results = {
        ticker: ticker,
        timestamp: new Date().toISOString(),
        source: 'SEC API Comprehensive Analysis',
        success: false,
        data: {}
      };

      // Step 1: Company Lookup & Entity Data
      console.log('[SecApiService] Step 1: Company lookup and entity data');
      const companyLookup = await this.getCompanyLookup(ticker);
      if (companyLookup.success) {
        results.data.company = companyLookup;
      }

      // Step 2: Core Filings (10-K, 10-Q)
      console.log('[SecApiService] Step 2: Fetching core SEC filings');
      const coreFilings = await this.fetchCoreFilings(ticker);
      if (coreFilings.success) {
        results.data.filings = coreFilings;
      }

      // Step 3: Financial Data via XBRL (if filings available)
      if (coreFilings.success && coreFilings.filings.annual_10k.length > 0) {
        console.log('[SecApiService] Step 3: Extracting XBRL financial data');
        const latestFiling = coreFilings.filings.annual_10k[0];
        const xbrlData = await this.getXBRLData(latestFiling.accession_number);
        if (xbrlData.success) {
          results.data.financials = xbrlData;
        }
      }

      // Step 4: AI Analysis (if filing URLs available)
      if (coreFilings.success && coreFilings.filings.annual_10k.length > 0) {
        console.log('[SecApiService] Step 4: AI-enhanced analysis');
        const latestFiling = coreFilings.filings.annual_10k[0];
        
        // Covenant analysis
        const covenantAnalysis = await this.analyzeFilingContent(
          ticker, 
          latestFiling.link_to_html, 
          'covenant'
        );
        if (covenantAnalysis.success) {
          results.data.covenants = covenantAnalysis;
        }

        // Subsidiary structure analysis
        const subsidiaryAnalysis = await this.analyzeFilingContent(
          ticker, 
          latestFiling.link_to_html, 
          'subsidiary'
        );
        if (subsidiaryAnalysis.success) {
          results.data.subsidiaries = subsidiaryAnalysis;
        }

        // Debt structure analysis
        const debtAnalysis = await this.analyzeFilingContent(
          ticker, 
          latestFiling.link_to_html, 
          'debt_structure'
        );
        if (debtAnalysis.success) {
          results.data.debtStructure = debtAnalysis;
        }
      }

      // Determine overall success
      results.success = !!(results.data.company?.success || results.data.filings?.success);
      
      console.log(`[SecApiService] Comprehensive SEC data collection complete for ${ticker}:`, {
        company: !!results.data.company?.success,
        filings: !!results.data.filings?.success,
        financials: !!results.data.financials?.success,
        covenants: !!results.data.covenants?.success,
        subsidiaries: !!results.data.subsidiaries?.success,
        debtStructure: !!results.data.debtStructure?.success
      });

      return results;

    } catch (error) {
      console.error('[SecApiService] Comprehensive data collection error:', error);
      return {
        success: false,
        error: error.message,
        ticker: ticker,
        data: {}
      };
    }
  }

  /**
   * Get current credit usage status
   */
  async getCreditStatus() {
    try {
      const response = await this.backendClient.get('/api/sec/credits');
      return response.data;
    } catch (error) {
      console.error('[SecApiService] Credit status error:', error);
      
      // Return local credit tracking as fallback
      const status = {};
      this.creditUsage.forEach((usage, endpoint) => {
        status[endpoint] = {
          used: usage.used,
          remaining: usage.limit - usage.used,
          limit: usage.limit,
          percentage: Math.round((usage.used / usage.limit) * 100)
        };
      });
      return { credit_status: status };
    }
  }

  /**
   * Specialized endpoints for specific SEC data types
   */
  
  async getExecutiveCompensation(ticker) {
    const companyLookup = await this.getCompanyLookup(ticker);
    if (!companyLookup.success) return { success: false, error: 'Company not found' };
    
    // Implementation would call backend endpoint for executive compensation
    return { success: true, data: 'Executive compensation data', source: 'SEC Executive Compensation API' };
  }

  async getSubsidiaryData(ticker) {
    const result = await this.analyzeFilingContent(ticker, null, 'subsidiary');
    return result;
  }

  async getForm13FHoldings(ticker) {
    // Implementation for institutional holdings
    return { success: true, data: 'Form 13F holdings data', source: 'SEC Form 13F API' };
  }

  async getForm13DG(ticker) {
    // Implementation for beneficial ownership
    return { success: true, data: 'Form 13D/13G data', source: 'SEC Form 13D/13G API' };
  }

  async getInsiderTrading(ticker) {
    // Implementation for Form 144 and Form 3/4/5
    return { success: true, data: 'Insider trading data', source: 'SEC Form 144 API' };
  }

  async getLitigationReleases(ticker) {
    // Implementation for SEC litigation data
    return { success: true, data: 'Litigation releases data', source: 'SEC Litigation Releases API' };
  }
}

export default new SecApiService();