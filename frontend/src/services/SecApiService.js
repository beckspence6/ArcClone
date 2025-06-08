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

  // Core API methods - Highest priority for accurate financial data

  /**
   * Get company CIK from ticker symbol
   */
  async getCompanyCIK(ticker) {
    const cacheKey = this.getCacheKey('company-cik', { ticker });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (!this.canMakeRequest('query')) {
      throw new Error('SEC API credit limit reached for company lookup');
    }

    try {
      // Use company search to get CIK
      const response = await this.client.get('/company-search', {
        params: {
          query: ticker,
          token: this.apiKey
        }
      });

      this.incrementCredit('query');
      
      const companies = response.data;
      const company = companies.find(c => 
        c.ticker === ticker.toUpperCase() || 
        c.name.toLowerCase().includes(ticker.toLowerCase())
      );

      if (!company) {
        throw new Error(`Company not found for ticker: ${ticker}`);
      }

      const result = {
        cik: company.cik,
        name: company.name,
        ticker: company.ticker,
        sic: company.sic,
        sicDescription: company.sicDescription,
        industry: company.industry,
        source: 'SEC Company Search',
        confidence: 98
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[SecApiService] Error getting company CIK:', error);
      throw new Error(`SEC company lookup failed: ${error.message}`);
    }
  }

  /**
   * Get latest financial data from XBRL filings (highest accuracy)
   */
  async getXBRLFinancials(ticker) {
    const cacheKey = this.getCacheKey('xbrl-financials', { ticker });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (!this.canMakeRequest('xbrl-to-json')) {
      console.warn('[SecApiService] XBRL API credits exhausted, using fallback');
      return null;
    }

    try {
      // First get the company CIK
      const companyData = await this.getCompanyCIK(ticker);
      
      // Get latest 10-K filing URL
      const filingResponse = await this.client.get('/query', {
        params: {
          query: `cik:${companyData.cik} AND formType:"10-K"`,
          from: '0',
          size: '1',
          sort: '[{ "filedAt": { "order": "desc" } }]',
          token: this.apiKey
        }
      });

      this.incrementCredit('query');

      if (!filingResponse.data.filings || filingResponse.data.filings.length === 0) {
        throw new Error('No 10-K filings found');
      }

      const latestFiling = filingResponse.data.filings[0];
      
      // Extract XBRL data
      const xbrlResponse = await this.client.post('/xbrl-to-json', {
        htm_url: latestFiling.linkToHtml,
        token: this.apiKey
      });

      this.incrementCredit('xbrl-to-json');

      const xbrlData = xbrlResponse.data;
      
      // Structure the financial data
      const result = {
        filingDate: latestFiling.filedAt,
        period: latestFiling.periodOfReport,
        accessionNumber: latestFiling.accessionNumber,
        linkToFiling: latestFiling.linkToHtml,
        
        // Income Statement Data
        revenue: this.extractXBRLValue(xbrlData, ['Revenues', 'SalesRevenueNet', 'Revenue']),
        grossProfit: this.extractXBRLValue(xbrlData, ['GrossProfit']),
        operatingIncome: this.extractXBRLValue(xbrlData, ['OperatingIncomeLoss']),
        netIncome: this.extractXBRLValue(xbrlData, ['NetIncomeLoss', 'ProfitLoss']),
        interestExpense: this.extractXBRLValue(xbrlData, ['InterestExpense']),
        
        // Balance Sheet Data
        totalAssets: this.extractXBRLValue(xbrlData, ['Assets']),
        totalLiabilities: this.extractXBRLValue(xbrlData, ['Liabilities']),
        totalEquity: this.extractXBRLValue(xbrlData, ['StockholdersEquity', 'ShareholdersEquity']),
        totalDebt: this.extractXBRLValue(xbrlData, ['LongTermDebt', 'DebtCurrent', 'DebtNoncurrent']),
        cash: this.extractXBRLValue(xbrlData, ['CashAndCashEquivalentsAtCarryingValue', 'Cash']),
        currentAssets: this.extractXBRLValue(xbrlData, ['AssetsCurrent']),
        currentLiabilities: this.extractXBRLValue(xbrlData, ['LiabilitiesCurrent']),
        
        // Cash Flow Data  
        operatingCashFlow: this.extractXBRLValue(xbrlData, ['NetCashProvidedByUsedInOperatingActivities']),
        investingCashFlow: this.extractXBRLValue(xbrlData, ['NetCashProvidedByUsedInInvestingActivities']),
        financingCashFlow: this.extractXBRLValue(xbrlData, ['NetCashProvidedByUsedInFinancingActivities']),
        
        // Metadata
        source: 'SEC XBRL Filing',
        sourceUrl: latestFiling.linkToHtml,
        confidence: 99, // Highest confidence for SEC data
        filingType: '10-K',
        dataExtracted: new Date().toISOString()
      };

      this.setCache(cacheKey, result);
      console.log(`[SecApiService] XBRL financials extracted for ${ticker}`);
      return result;

    } catch (error) {
      console.error('[SecApiService] XBRL extraction failed:', error);
      return null; // Return null to trigger fallback to other APIs
    }
  }

  /**
   * Extract XBRL value using multiple possible field names
   */
  extractXBRLValue(xbrlData, fieldNames) {
    for (const fieldName of fieldNames) {
      if (xbrlData[fieldName]) {
        const value = xbrlData[fieldName];
        // Return the most recent value if it's an array
        if (Array.isArray(value) && value.length > 0) {
          return value[0].value || value[0];
        }
        return value.value || value;
      }
    }
    return null;
  }

  /**
   * Get structured company profile from SEC filings
   */
  async getCompanyProfile(ticker) {
    const cacheKey = this.getCacheKey('company-profile', { ticker });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (!this.canMakeRequest('extractor')) {
      console.warn('[SecApiService] Extractor API credits exhausted');
      return null;
    }

    try {
      const companyData = await this.getCompanyCIK(ticker);
      
      // Get latest 10-K for company profile
      const filingResponse = await this.client.get('/query', {
        params: {
          query: `cik:${companyData.cik} AND formType:"10-K"`,
          from: '0',
          size: '1',
          sort: '[{ "filedAt": { "order": "desc" } }]',
          token: this.apiKey
        }
      });

      if (!filingResponse.data.filings || filingResponse.data.filings.length === 0) {
        return null;
      }

      const latestFiling = filingResponse.data.filings[0];

      // Extract structured sections
      const extractorResponse = await this.client.post('/extractor', {
        url: latestFiling.linkToHtml,
        sections: [
          { section: "1", name: "business" },
          { section: "1A", name: "risk_factors" },
          { section: "7", name: "management_discussion" }
        ],
        token: this.apiKey
      });

      this.incrementCredit('extractor');

      const sections = extractorResponse.data;
      
      const result = {
        companyName: companyData.name,
        ticker: ticker.toUpperCase(),
        cik: companyData.cik,
        sic: companyData.sic,
        industry: companyData.sicDescription,
        businessDescription: sections.business || '[Business description pending]',
        riskFactors: sections.risk_factors || '[Risk factors pending]',
        managementDiscussion: sections.management_discussion || '[MD&A pending]',
        filingDate: latestFiling.filedAt,
        sourceUrl: latestFiling.linkToHtml,
        source: 'SEC 10-K Filing',
        confidence: 97
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('[SecApiService] Company profile extraction failed:', error);
      return null;
    }
  }

  /**
   * Get executive compensation and management data
   */
  async getExecutiveData(ticker) {
    const cacheKey = this.getCacheKey('executives', { ticker });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (!this.canMakeRequest('executive-compensation')) {
      return null;
    }

    try {
      const companyData = await this.getCompanyCIK(ticker);
      
      const response = await this.client.get('/executive-compensation', {
        params: {
          cik: companyData.cik,
          token: this.apiKey
        }
      });

      this.incrementCredit('executive-compensation');

      const result = {
        executives: response.data.executives || [],
        source: 'SEC Executive Compensation',
        confidence: 96,
        filingDate: response.data.filingDate
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('[SecApiService] Executive data extraction failed:', error);
      return null;
    }
  }

  /**
   * Get company subsidiaries from SEC filings
   */
  async getSubsidiaries(ticker) {
    const cacheKey = this.getCacheKey('subsidiaries', { ticker });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (!this.canMakeRequest('company-subsidiaries')) {
      return null;
    }

    try {
      const companyData = await this.getCompanyCIK(ticker);
      
      const response = await this.client.get('/company-subsidiaries', {
        params: {
          cik: companyData.cik,
          token: this.apiKey
        }
      });

      this.incrementCredit('company-subsidiaries');

      const result = {
        subsidiaries: response.data || [],
        source: 'SEC Subsidiary Data',
        confidence: 98
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('[SecApiService] Subsidiaries extraction failed:', error);
      return null;
    }
  }

  /**
   * Strategic method to get comprehensive SEC data for a company
   * Prioritizes highest-value data within credit constraints
   */
  async getComprehensiveData(ticker) {
    console.log(`[SecApiService] Starting comprehensive data fetch for ${ticker}`);
    
    const results = {
      ticker: ticker.toUpperCase(),
      timestamp: new Date().toISOString(),
      source: 'SEC API (sec-api.io)',
      success: false
    };

    try {
      // Priority 1: XBRL Financial Data (highest accuracy)
      console.log('[SecApiService] Fetching XBRL financial data...');
      results.financials = await this.getXBRLFinancials(ticker);
      
      // Priority 2: Company Profile 
      console.log('[SecApiService] Fetching company profile...');
      results.profile = await this.getCompanyProfile(ticker);
      
      // Priority 3: Executive Data (if credits available)
      if (this.canMakeRequest('executive-compensation')) {
        console.log('[SecApiService] Fetching executive data...');
        results.executives = await this.getExecutiveData(ticker);
      }
      
      // Priority 4: Subsidiaries (if credits available)
      if (this.canMakeRequest('company-subsidiaries')) {
        console.log('[SecApiService] Fetching subsidiaries...');
        results.subsidiaries = await this.getSubsidiaries(ticker);
      }

      results.success = !!(results.financials || results.profile);
      
      console.log(`[SecApiService] Comprehensive data fetch complete for ${ticker}:`, {
        financials: !!results.financials,
        profile: !!results.profile,
        executives: !!results.executives,
        subsidiaries: !!results.subsidiaries
      });

      return results;

    } catch (error) {
      console.error('[SecApiService] Comprehensive data fetch failed:', error);
      results.error = error.message;
      return results;
    }
  }

  /**
   * Get current credit usage status
   */
  getCreditStatus() {
    const status = {};
    this.creditUsage.forEach((usage, endpoint) => {
      status[endpoint] = {
        used: usage.used,
        remaining: usage.limit - usage.used,
        limit: usage.limit,
        percentage: Math.round((usage.used / usage.limit) * 100)
      };
    });
    return status;
  }
}

export default new SecApiService();