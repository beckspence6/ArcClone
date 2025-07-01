/**
 * Multi-API Service - Enhanced with 5 APIs + Smart Rate Limiting
 * 
 * Strategy (Ordered by Rate Limits & Reliability):
 * 1. FMP API (paid, 250 requests/day)
 * 2. Alpha Vantage (500 requests/day)
 * 3. Quandl (50,000 requests/day - premium source)
 * 4. Marketstack (100 requests/month)
 * 5. Yahoo Finance (unofficial, high tolerance)
 * 6. SEC API (100 requests/day)
 */

import axios from 'axios';
import FMPService from './FMPService';

class MultiAPIService {
  constructor() {
    // API Configuration with Real Keys and Rate Limits
    this.apis = {
      fmp: {
        name: 'FMP',
        service: FMPService,
        priority: 1,
        dailyLimit: 250,
        monthlyLimit: null,
        currentUsage: 0,
        resetTime: this.getNextDayReset(),
        confidence: 95
      },
      alphaVantage: {
        name: 'Alpha Vantage',
        baseURL: 'https://www.alphavantage.co/query',
        apiKey: process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'XGFXK2D6WYPZILH3',
        priority: 2,
        dailyLimit: 500,
        monthlyLimit: null,
        currentUsage: 0,
        resetTime: this.getNextDayReset(),
        confidence: 85
      },
      quandl: {
        name: 'Quandl',
        baseURL: 'https://www.quandl.com/api/v3',
        apiKey: process.env.REACT_APP_QUANDL_API_KEY || 'qQRQsAs5oy27ZZTMRzgK',
        priority: 3,
        dailyLimit: 50000, // Very high limit
        monthlyLimit: null,
        currentUsage: 0,
        resetTime: this.getNextDayReset(),
        confidence: 90
      },
      marketstack: {
        name: 'Marketstack',
        baseURL: 'http://api.marketstack.com/v1',
        apiKey: process.env.REACT_APP_MARKETSTACK_API_KEY || '778f04412a443de4310d7f90bf1fe3d4',
        priority: 4,
        dailyLimit: null,
        monthlyLimit: 100, // Very limited - use sparingly
        currentUsage: 0,
        resetTime: this.getNextMonthReset(),
        confidence: 88
      },
      yahoo: {
        name: 'Yahoo Finance',
        baseURL: 'https://query1.finance.yahoo.com',
        priority: 5,
        dailyLimit: 2000, // Unofficial limit
        monthlyLimit: null,
        currentUsage: 0,
        resetTime: this.getNextDayReset(),
        confidence: 75
      },
      sec: {
        name: 'SEC',
        baseURL: '/api/sec',
        priority: 6,
        dailyLimit: 100,
        monthlyLimit: null,
        currentUsage: 0,
        resetTime: this.getNextDayReset(),
        confidence: 99
      }
    };

    // Persistent cache with 6-hour timeout
    this.cache = new Map();
    this.cacheTimeout = 6 * 60 * 60 * 1000; // 6 hours
    this.usageTracking = this.loadUsageFromStorage();
    
    console.log('[MultiAPI] Initialized with 6 APIs and smart rate limiting');
  }

  // Usage tracking persistence
  loadUsageFromStorage() {
    try {
      const stored = localStorage.getItem('multiapi_usage');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[MultiAPI] Could not load usage from storage');
    }
    return {};
  }

  saveUsageToStorage() {
    try {
      localStorage.setItem('multiapi_usage', JSON.stringify(this.usageTracking));
    } catch (error) {
      console.warn('[MultiAPI] Could not save usage to storage');
    }
  }

  getNextDayReset() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  getNextMonthReset() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth.getTime();
  }

  // Smart API selection based on availability and rate limits
  getAvailableAPI(dataType = 'general') {
    const now = Date.now();
    
    // Reset usage counters if needed
    Object.keys(this.apis).forEach(key => {
      const api = this.apis[key];
      if (now > api.resetTime) {
        api.currentUsage = 0;
        api.resetTime = api.monthlyLimit ? this.getNextMonthReset() : this.getNextDayReset();
      }
    });

    // Find best available API
    const availableAPIs = Object.entries(this.apis)
      .filter(([key, api]) => {
        const dailyOk = !api.dailyLimit || api.currentUsage < api.dailyLimit;
        const monthlyOk = !api.monthlyLimit || api.currentUsage < api.monthlyLimit;
        return dailyOk && monthlyOk;
      })
      .sort((a, b) => a[1].priority - b[1].priority);

    return availableAPIs.length > 0 ? availableAPIs[0] : null;
  }

  // Increment usage and save
  incrementUsage(apiKey) {
    if (this.apis[apiKey]) {
      this.apis[apiKey].currentUsage++;
      this.saveUsageToStorage();
      console.log(`[MultiAPI] ${this.apis[apiKey].name} usage: ${this.apis[apiKey].currentUsage}/${this.apis[apiKey].dailyLimit || this.apis[apiKey].monthlyLimit || '∞'}`);
    }
  }

  // Cache management
  getCacheKey(type, symbol) {
    return `${type}_${symbol}`.toLowerCase();
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log(`[MultiAPI] Cache hit for ${key}`);
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

  /**
   * Enhanced company profile with intelligent 6-API fallback strategy
   */
  async getCompanyProfile(symbol) {
    const cacheKey = this.getCacheKey('profile', symbol);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    console.log(`[MultiAPI] Getting company profile for ${symbol} with smart fallback`);
    
    // Strategy 1: Try FMP (highest quality, paid tier)
    try {
      const fmpResult = await FMPService.getCompanyProfile(symbol);
      if (fmpResult && fmpResult.length > 0) {
        const result = {
          success: true,
          data: fmpResult[0],
          source: 'FMP',
          confidence: 95
        };
        this.incrementUsage('fmp');
        this.setCache(cacheKey, result);
        return result;
      }
    } catch (error) {
      console.log('[MultiAPI] FMP failed:', error.message);
    }

    // Strategy 2: Try Alpha Vantage (500 requests/day)
    try {
      const avResult = await this.getAlphaVantageProfile(symbol);
      if (avResult.success) {
        this.incrementUsage('alphaVantage');
        this.setCache(cacheKey, avResult);
        return avResult;
      }
    } catch (error) {
      console.log('[MultiAPI] Alpha Vantage failed:', error.message);
    }

    // Strategy 3: Try Quandl (50,000 requests/day - premium)
    try {
      const quandlResult = await this.getQuandlProfile(symbol);
      if (quandlResult.success) {
        this.incrementUsage('quandl');
        this.setCache(cacheKey, quandlResult);
        return quandlResult;
      }
    } catch (error) {
      console.log('[MultiAPI] Quandl failed:', error.message);
    }

    // Strategy 4: Try Marketstack (100/month - use sparingly)
    const availableAPI = this.getAvailableAPI();
    if (availableAPI && availableAPI[0] === 'marketstack') {
      try {
        const marketstackResult = await this.getMarketstackProfile(symbol);
        if (marketstackResult.success) {
          this.incrementUsage('marketstack');
          this.setCache(cacheKey, marketstackResult);
          return marketstackResult;
        }
      } catch (error) {
        console.log('[MultiAPI] Marketstack failed:', error.message);
      }
    }

    // Strategy 5: Try Yahoo Finance (unlimited unofficial)
    try {
      const yahooResult = await this.getYahooProfile(symbol);
      if (yahooResult.success) {
        this.incrementUsage('yahoo');
        this.setCache(cacheKey, yahooResult);
        return yahooResult;
      }
    } catch (error) {
      console.log('[MultiAPI] Yahoo Finance failed:', error.message);
    }

    // Strategy 6: Try SEC API (final fallback)
    try {
      const secResult = await this.getSECProfile(symbol);
      if (secResult.success) {
        this.incrementUsage('sec');
        this.setCache(cacheKey, secResult);
        return secResult;
      }
    } catch (error) {
      console.log('[MultiAPI] SEC API failed:', error.message);
    }

    // All APIs exhausted
    return {
      success: false,
      error: 'All 6 APIs exhausted or rate limited',
      source: 'MultiAPI',
      suggestion: 'Try again in 1 hour or upload company documents for analysis'
    };
  }

  /**
   * Enhanced Alpha Vantage company overview with real API key
   */
  async getAlphaVantageProfile(symbol) {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${this.apis.alphaVantage.apiKey}`;
    
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data;
      
      if (data.Symbol && data.Name) {
        return {
          success: true,
          data: {
            symbol: data.Symbol,
            companyName: data.Name,
            sector: data.Sector,
            industry: data.Industry,
            description: data.Description,
            marketCap: data.MarketCapitalization,
            peRatio: data.PERatio,
            website: data.OfficialSite,
            currency: 'USD',
            exchange: data.Exchange,
            employees: data.FullTimeEmployees,
            dividendYield: data.DividendYield,
            eps: data.EPS
          },
          source: 'Alpha Vantage',
          confidence: 85
        };
      }
      
      return { success: false, error: 'No data found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Quandl company profile (premium financial data)
   */
  async getQuandlProfile(symbol) {
    // Quandl uses different datasets, trying WIKI prices first
    const url = `https://www.quandl.com/api/v3/datatables/SHARADAR/TICKERS.json?ticker=${symbol}&api_key=${this.apis.quandl.apiKey}`;
    
    try {
      const response = await axios.get(url, { timeout: 15000 });
      const data = response.data;
      
      if (data.datatable && data.datatable.data && data.datatable.data.length > 0) {
        const companyData = data.datatable.data[0];
        const columns = data.datatable.columns;
        
        // Map columns to values
        const companyInfo = {};
        columns.forEach((col, index) => {
          companyInfo[col.name] = companyData[index];
        });
        
        return {
          success: true,
          data: {
            symbol: companyInfo.ticker,
            companyName: companyInfo.name,
            sector: companyInfo.sector,
            industry: companyInfo.industry,
            exchange: companyInfo.exchange,
            currency: companyInfo.currency,
            description: `${companyInfo.name} operates in the ${companyInfo.industry} sector`,
            marketCap: companyInfo.marketcap,
            employees: companyInfo.employees
          },
          source: 'Quandl',
          confidence: 90
        };
      }
      
      return { success: false, error: 'No data found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Marketstack company profile (limited use - 100/month)
   */
  async getMarketstackProfile(symbol) {
    const url = `http://api.marketstack.com/v1/eod?access_key=${this.apis.marketstack.apiKey}&symbols=${symbol}&limit=1`;
    
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data;
      
      if (data.data && data.data.length > 0) {
        const stockData = data.data[0];
        
        return {
          success: true,
          data: {
            symbol: stockData.symbol,
            companyName: stockData.symbol, // Marketstack doesn't provide company names in EOD
            exchange: stockData.exchange,
            currency: 'USD',
            price: stockData.close,
            volume: stockData.volume,
            date: stockData.date,
            description: `Stock listed on ${stockData.exchange}`
          },
          source: 'Marketstack',
          confidence: 75,
          note: 'Limited data - primarily for stock prices'
        };
      }
      
      return { success: false, error: 'No data found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * SEC API integration
   */
  async getSECProfile(symbol) {
    try {
      // This would call your existing SEC service
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/sec/company/lookup`, {
        ticker: symbol
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            symbol: symbol,
            companyName: response.data.company_data?.mapping?.name,
            cik: response.data.cik,
            sector: response.data.company_data?.entity_details?.sic_description,
            description: response.data.company_data?.entity_details?.business_description
          },
          source: 'SEC',
          confidence: 99
        };
      }
      
      return { success: false, error: 'SEC lookup failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Yahoo Finance basic profile
   */
  async getYahooProfile(symbol) {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}`;
    
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data;
      
      if (data.quotes && data.quotes.length > 0) {
        const quote = data.quotes[0];
        return {
          success: true,
          data: {
            symbol: quote.symbol,
            companyName: quote.longname || quote.shortname,
            sector: quote.sector,
            industry: quote.industry,
            exchange: quote.exchange,
            currency: 'USD'
          },
          source: 'Yahoo Finance',
          confidence: 75
        };
      }
      
      return { success: false, error: 'No data found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enhanced financial statements with 6-API fallback
   */
  async getFinancialStatements(symbol) {
    const cacheKey = this.getCacheKey('financials', symbol);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    console.log(`[MultiAPI] Getting financial statements for ${symbol}`);
    
    // Strategy 1: Try FMP (most comprehensive)
    try {
      const fmpResult = await FMPService.getFinancialStatements(symbol);
      if (fmpResult && fmpResult.income && fmpResult.income.length > 0) {
        const result = {
          success: true,
          data: fmpResult,
          source: 'FMP',
          confidence: 95
        };
        this.incrementUsage('fmp');
        this.setCache(cacheKey, result);
        return result;
      }
    } catch (error) {
      console.log('[MultiAPI] FMP financials failed:', error.message);
    }

    // Strategy 2: Try Alpha Vantage (comprehensive financial data)
    try {
      const avResult = await this.getAlphaVantageFinancials(symbol);
      if (avResult.success) {
        this.incrementUsage('alphaVantage');
        this.setCache(cacheKey, avResult);
        return avResult;
      }
    } catch (error) {
      console.log('[MultiAPI] Alpha Vantage financials failed:', error.message);
    }

    // Strategy 3: Try Quandl (premium financial data)
    try {
      const quandlResult = await this.getQuandlFinancials(symbol);
      if (quandlResult.success) {
        this.incrementUsage('quandl');
        this.setCache(cacheKey, quandlResult);
        return quandlResult;
      }
    } catch (error) {
      console.log('[MultiAPI] Quandl financials failed:', error.message);
    }

    return {
      success: false,
      error: 'Financial statements unavailable from all sources',
      source: 'MultiAPI',
      fallbackMessage: 'Upload company financial documents for analysis'
    };
  }

  /**
   * Alpha Vantage comprehensive financial statements
   */
  async getAlphaVantageFinancials(symbol) {
    const promises = [
      axios.get(`https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${this.apis.alphaVantage.apiKey}`),
      axios.get(`https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${symbol}&apikey=${this.apis.alphaVantage.apiKey}`),
      axios.get(`https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${symbol}&apikey=${this.apis.alphaVantage.apiKey}`)
    ];

    try {
      const [incomeRes, balanceRes, cashFlowRes] = await Promise.all(promises);
      
      const income = incomeRes.data.annualReports?.[0];
      const balance = balanceRes.data.annualReports?.[0];
      const cashFlow = cashFlowRes.data.annualReports?.[0];

      if (income || balance || cashFlow) {
        return {
          success: true,
          data: {
            income: income ? [{
              date: income.fiscalDateEnding,
              revenue: income.totalRevenue,
              grossProfit: income.grossProfit,
              operatingIncome: income.operatingIncome,
              netIncome: income.netIncome,
              source: 'Alpha Vantage'
            }] : [],
            balance: balance ? [{
              date: balance.fiscalDateEnding,
              totalAssets: balance.totalAssets,
              totalLiabilities: balance.totalLiabilities,
              totalEquity: balance.totalShareholderEquity,
              cash: balance.cashAndCashEquivalentsAtCarryingValue,
              source: 'Alpha Vantage'
            }] : [],
            cashFlow: cashFlow ? [{
              date: cashFlow.fiscalDateEnding,
              operatingCashFlow: cashFlow.operatingCashflow,
              investingCashFlow: cashFlow.cashflowFromInvestment,
              financingCashFlow: cashFlow.cashflowFromFinancing,
              source: 'Alpha Vantage'
            }] : []
          },
          source: 'Alpha Vantage',
          confidence: 85
        };
      }
      
      return { success: false, error: 'No financial data found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Quandl financial data
   */
  async getQuandlFinancials(symbol) {
    const url = `https://www.quandl.com/api/v3/datatables/SHARADAR/SF1.json?ticker=${symbol}&dimension=ARY&api_key=${this.apis.quandl.apiKey}`;
    
    try {
      const response = await axios.get(url, { timeout: 15000 });
      const data = response.data;
      
      if (data.datatable && data.datatable.data && data.datatable.data.length > 0) {
        const financialData = data.datatable.data[0];
        const columns = data.datatable.columns;
        
        // Map columns to values
        const metrics = {};
        columns.forEach((col, index) => {
          metrics[col.name] = financialData[index];
        });
        
        return {
          success: true,
          data: {
            income: [{
              date: metrics.datekey,
              revenue: metrics.revenue,
              grossProfit: metrics.gp,
              operatingIncome: metrics.opinc,
              netIncome: metrics.netinc,
              source: 'Quandl'
            }],
            balance: [{
              date: metrics.datekey,
              totalAssets: metrics.assets,
              totalLiabilities: metrics.liabilities,
              totalEquity: metrics.equity,
              cash: metrics.cashneq,
              source: 'Quandl'
            }]
          },
          source: 'Quandl',
          confidence: 90
        };
      }
      
      return { success: false, error: 'No financial data found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Multi-source company search
   */
  async searchCompanies(query) {
    console.log(`[MultiAPI] Searching companies for: ${query}`);
    
    const results = [];

    // Try FMP search
    try {
      const fmpResults = await FMPService.searchCompanies(query);
      if (fmpResults && fmpResults.length > 0) {
        results.push(...fmpResults.map(company => ({
          ...company,
          source: 'FMP',
          confidence: 90
        })));
      }
    } catch (error) {
      console.log('[MultiAPI] FMP search failed:', error.message);
    }

    // Try Yahoo Finance search
    try {
      const yahooResults = await this.searchYahooCompanies(query);
      if (yahooResults.success && yahooResults.data.length > 0) {
        results.push(...yahooResults.data.map(company => ({
          ...company,
          source: 'Yahoo Finance',
          confidence: 75
        })));
      }
    } catch (error) {
      console.log('[MultiAPI] Yahoo search failed:', error.message);
    }

    // Remove duplicates by symbol
    const uniqueResults = results.filter((company, index, self) => 
      index === self.findIndex(c => c.symbol === company.symbol)
    );

    return uniqueResults.slice(0, 10); // Return top 10 results
  }

  /**
   * Yahoo Finance company search
   */
  async searchYahooCompanies(query) {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${query}`;
    
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data;
      
      if (data.quotes && data.quotes.length > 0) {
        const companies = data.quotes.map(quote => ({
          symbol: quote.symbol,
          name: quote.longname || quote.shortname,
          exchange: quote.exchange,
          sector: quote.sector
        }));
        
        return {
          success: true,
          data: companies,
          source: 'Yahoo Finance'
        };
      }
      
      return { success: false, error: 'No search results' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get API health status
   */
  async getAPIStatus() {
    const status = {};
    
    for (const service of this.services) {
      try {
        // Quick test call for each service
        const testSymbol = 'AAPL';
        let testResult;
        
        if (service.name === 'FMP') {
          testResult = await FMPService.getCompanyProfile(testSymbol);
          status[service.name] = {
            available: !!(testResult && testResult.length > 0),
            priority: service.priority,
            dailyLimit: service.rateLimitDaily
          };
        } else if (service.name === 'AlphaVantage') {
          testResult = await this.getAlphaVantageProfile(testSymbol);
          status[service.name] = {
            available: testResult.success,
            priority: service.priority,
            dailyLimit: service.rateLimitDaily
          };
        } else if (service.name === 'YahooFinance') {
          testResult = await this.getYahooProfile(testSymbol);
          status[service.name] = {
            available: testResult.success,
            priority: service.priority,
            dailyLimit: service.rateLimitDaily
          };
        }
      } catch (error) {
        status[service.name] = {
          available: false,
          error: error.message,
          priority: service.priority
        };
      }
    }
    
    return status;
  }
}

export default new MultiAPIService();