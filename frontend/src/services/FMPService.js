import axios from 'axios';

class FMPService {
  constructor() {
    this.baseURL = 'https://financialmodelingprep.com/api';
    this.apiKey = process.env.REACT_APP_FMP_API_KEY;
    console.log('[FMPService] API Key loaded:', this.apiKey ? 'PRESENT' : 'UNDEFINED');
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
    
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  _getCacheKey(endpoint, params = {}) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  _isCacheValid(timestamp) {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  async _makeRequest(endpoint, params = {}) {
    const cacheKey = this._getCacheKey(endpoint, params);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this._isCacheValid(cached.timestamp)) {
      console.log(`[FMP] Cache hit for ${endpoint}`);
      return cached.data;
    }

    try {
      const url = `${endpoint}?${new URLSearchParams({
        ...params,
        apikey: this.apiKey
      })}`;
      
      console.log(`[FMP] Making request to: ${url}`);
      const response = await this.axios.get(url);
      
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      return response.data;
    } catch (error) {
      console.error(`[FMP] Error fetching ${endpoint}:`, error.message);
      throw new Error(`FMP API Error: ${error.message}`);
    }
  }

  // Company Profile & Basic Info
  async getCompanyProfile(symbol) {
    return this._makeRequest(`/v3/profile/${symbol}`);
  }

  async getCompanyCoreInfo(symbol) {
    return this._makeRequest('/v3/company-core-information', { symbol });
  }

  async getKeyExecutives(symbol) {
    return this._makeRequest(`/v3/key-executives/${symbol}`);
  }

  // Financial Statements
  async getIncomeStatement(symbol, period = 'annual', limit = 5) {
    return this._makeRequest(`/v3/income-statement/${symbol}`, { period, limit });
  }

  async getBalanceSheet(symbol, period = 'annual', limit = 5) {
    return this._makeRequest(`/v3/balance-sheet-statement/${symbol}`, { period, limit });
  }

  async getCashFlowStatement(symbol, period = 'annual', limit = 5) {
    return this._makeRequest(`/v3/cash-flow-statement/${symbol}`, { period, limit });
  }

  // Key Metrics & Ratios
  async getKeyMetrics(symbol, period = 'annual', limit = 5) {
    return this._makeRequest(`/v3/key-metrics/${symbol}`, { period, limit });
  }

  async getKeyMetricsTTM(symbol) {
    return this._makeRequest(`/v3/key-metrics-ttm/${symbol}`);
  }

  async getRatios(symbol, period = 'annual', limit = 5) {
    return this._makeRequest(`/v3/ratios/${symbol}`, { period, limit });
  }

  async getRatiosTTM(symbol) {
    return this._makeRequest(`/v3/ratios-ttm/${symbol}`);
  }

  async getFinancialGrowth(symbol, period = 'annual', limit = 5) {
    return this._makeRequest(`/v3/financial-growth/${symbol}`, { period, limit });
  }

  async getCompanyScore(symbol) {
    return this._makeRequest('/v3/score', { symbol });
  }

  // Market Data
  async getQuote(symbol) {
    return this._makeRequest(`/v3/quote/${symbol}`);
  }

  async getHistoricalMarketCap(symbol, limit = 100) {
    return this._makeRequest(`/v3/historical-market-capitalization/${symbol}`, { limit });
  }

  async getStockPriceChange(symbol) {
    return this._makeRequest(`/v3/stock-price-change/${symbol}`);
  }

  async getHistoricalChart(interval, symbol, from, to) {
    return this._makeRequest(`/v3/historical-chart/${interval}/${symbol}`, { from, to });
  }

  // Analyst & Ownership Data
  async getAnalystEstimates(symbol, period = 'annual', limit = 5) {
    return this._makeRequest(`/v3/analyst-estimates/${symbol}`, { period, limit });
  }

  async getAnalystRecommendations(symbol) {
    return this._makeRequest(`/v3/analyst-stock-recommendations/${symbol}`);
  }

  async getUpgradesDowngrades(symbol) {
    return this._makeRequest('/v3/upgrades-downgrades', { symbol });
  }

  async getInstitutionalHolders(symbol) {
    return this._makeRequest(`/v3/institutional-holder/${symbol}`);
  }

  async getInstitutionalOwnership(symbol) {
    return this._makeRequest('/v3/institutional-ownership/symbol-ownership', { symbol });
  }

  async getInsiderTrading(symbol, limit = 100) {
    return this._makeRequest('/v3/insider-trading', { symbol, limit });
  }

  // News & Transcripts
  async getStockNews(symbol, limit = 50) {
    return this._makeRequest('/v3/stock_news', { tickers: symbol, limit });
  }

  async getPressReleases(symbol, limit = 20) {
    return this._makeRequest(`/v3/press-releases/${symbol}`, { limit });
  }

  async getEarningsCallTranscript(symbol, year, quarter) {
    return this._makeRequest(`/v3/earning_call_transcript/${symbol}`, { year, quarter });
  }

  // Search & Discovery
  async searchCompanies(query, limit = 10) {
    return this._makeRequest('/v3/search', { query, limit });
  }

  async searchTicker(query, limit = 10) {
    return this._makeRequest('/v3/search-ticker', { query, limit });
  }

  // Error handling helper
  handleAPIError(error, endpoint) {
    console.error(`[FMP] ${endpoint} failed:`, error);
    return {
      error: true,
      message: `FMP API Error: ${error.message}`,
      source: 'FMP',
      endpoint
    };
  }
}

export default new FMPService();