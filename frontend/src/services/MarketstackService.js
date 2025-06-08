import axios from 'axios';

class MarketstackService {
  constructor() {
    this.baseURL = 'http://api.marketstack.com/v1';
    this.apiKey = process.env.REACT_APP_MARKETSTACK_API_KEY;
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
    
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  _getCacheKey(endpoint, params = {}) {
    return `ms_${endpoint}_${JSON.stringify(params)}`;
  }

  _isCacheValid(timestamp) {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  async _makeRequest(endpoint, params = {}) {
    const cacheKey = this._getCacheKey(endpoint, params);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this._isCacheValid(cached.timestamp)) {
      console.log(`[Marketstack] Cache hit for ${endpoint}`);
      return cached.data;
    }

    try {
      const url = `${endpoint}?${new URLSearchParams({
        access_key: this.apiKey,
        ...params
      })}`;
      
      console.log(`[Marketstack] Making request to: ${url}`);
      const response = await this.axios.get(url);
      
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      return response.data;
    } catch (error) {
      console.error(`[Marketstack] Error fetching ${endpoint}:`, error.message);
      throw new Error(`Marketstack API Error: ${error.message}`);
    }
  }

  // Latest quotes
  async getLatestQuote(symbols) {
    const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return this._makeRequest('/eod/latest', { symbols: symbolString });
  }

  // Historical End-of-Day data
  async getEODData(symbols, dateFrom, dateTo, limit = 100) {
    const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
    const params = { symbols: symbolString, limit };
    
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    return this._makeRequest('/eod', params);
  }

  // Intraday data (if available in free tier)
  async getIntradayData(symbols, interval = '1min', limit = 100) {
    const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return this._makeRequest('/intraday', { 
      symbols: symbolString, 
      interval,
      limit 
    });
  }

  // Real-time quotes (if available in free tier)
  async getRealTimeQuotes(symbols) {
    const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return this._makeRequest('/realtime', { symbols: symbolString });
  }

  // Exchanges information
  async getExchanges(limit = 100) {
    return this._makeRequest('/exchanges', { limit });
  }

  // Tickers information
  async getTickers(exchange, limit = 100) {
    return this._makeRequest('/tickers', { exchange, limit });
  }

  // Currencies
  async getCurrencies(limit = 100) {
    return this._makeRequest('/currencies', { limit });
  }

  // Timezones
  async getTimezones() {
    return this._makeRequest('/timezones');
  }

  // Error handling helper
  handleAPIError(error, endpoint) {
    console.error(`[Marketstack] ${endpoint} failed:`, error);
    return {
      error: true,
      message: `Marketstack API Error: ${error.message}`,
      source: 'Marketstack',
      endpoint
    };
  }

  // Utility method to normalize data format for consistency
  normalizeQuoteData(data) {
    if (!data || !data.data || !Array.isArray(data.data)) {
      return null;
    }

    return data.data.map(item => ({
      symbol: item.symbol,
      price: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume,
      date: item.date,
      change: item.close - item.open,
      changePercent: ((item.close - item.open) / item.open) * 100,
      source: 'Marketstack'
    }));
  }
}

export default new MarketstackService();