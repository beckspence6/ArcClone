import axios from 'axios';

class TwelveDataService {
  constructor() {
    this.baseURL = 'https://api.twelvedata.com';
    this.apiKey = process.env.REACT_APP_TWELVEDATA_API_KEY;
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
    
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  _getCacheKey(endpoint, params = {}) {
    return `td_${endpoint}_${JSON.stringify(params)}`;
  }

  _isCacheValid(timestamp) {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  async _makeRequest(endpoint, params = {}) {
    const cacheKey = this._getCacheKey(endpoint, params);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this._isCacheValid(cached.timestamp)) {
      console.log(`[TwelveData] Cache hit for ${endpoint}`);
      return cached.data;
    }

    try {
      const url = `${endpoint}?${new URLSearchParams({
        apikey: this.apiKey,
        ...params
      })}`;
      
      console.log(`[TwelveData] Making request to: ${url}`);
      const response = await this.axios.get(url);
      
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      return response.data;
    } catch (error) {
      console.error(`[TwelveData] Error fetching ${endpoint}:`, error.message);
      throw new Error(`TwelveData API Error: ${error.message}`);
    }
  }

  // Real-time quotes
  async getQuote(symbol, interval = '1min') {
    return this._makeRequest('/quote', { symbol, interval });
  }

  // Time series data
  async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
    return this._makeRequest('/time_series', { 
      symbol, 
      interval, 
      outputsize 
    });
  }

  // Financial statements
  async getBalanceSheet(symbol, period = 'annual') {
    return this._makeRequest('/balance_sheet', { symbol, period });
  }

  async getIncomeStatement(symbol, period = 'annual') {
    return this._makeRequest('/income_statement', { symbol, period });
  }

  async getCashFlow(symbol, period = 'annual') {
    return this._makeRequest('/cash_flow', { symbol, period });
  }

  // Company statistics
  async getStatistics(symbol) {
    return this._makeRequest('/statistics', { symbol });
  }

  // Dividends
  async getDividends(symbol, range = '1y') {
    return this._makeRequest('/dividends', { symbol, range });
  }

  // Splits
  async getSplits(symbol, range = '1y') {
    return this._makeRequest('/splits', { symbol, range });
  }

  // Earnings
  async getEarnings(symbol, period = 'annual') {
    return this._makeRequest('/earnings', { symbol, period });
  }

  // IPO calendar
  async getIPOCalendar() {
    return this._makeRequest('/ipo_calendar');
  }

  // Market state
  async getMarketState(exchange) {
    return this._makeRequest('/market_state', { exchange });
  }

  // Symbol search
  async symbolSearch(symbol) {
    return this._makeRequest('/symbol_search', { symbol });
  }

  // Earliest timestamp
  async getEarliestTimestamp(symbol, interval = '1day') {
    return this._makeRequest('/earliest_timestamp', { symbol, interval });
  }

  // Exchange rate (for forex)
  async getExchangeRate(symbol1, symbol2) {
    return this._makeRequest('/exchange_rate', { 
      symbol: `${symbol1}/${symbol2}` 
    });
  }

  // Technical indicators
  async getTechnicalIndicator(symbol, indicator, interval = '1day', time_period = 14) {
    return this._makeRequest(`/${indicator}`, { 
      symbol, 
      interval, 
      time_period 
    });
  }

  // Error handling helper
  handleAPIError(error, endpoint) {
    console.error(`[TwelveData] ${endpoint} failed:`, error);
    return {
      error: true,
      message: `TwelveData API Error: ${error.message}`,
      source: 'TwelveData',
      endpoint
    };
  }

  // Utility method to normalize data format for consistency
  normalizeQuoteData(data) {
    if (!data || data.status === 'error') {
      return null;
    }

    return {
      symbol: data.symbol,
      price: parseFloat(data.close || data.price),
      open: parseFloat(data.open),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      volume: parseInt(data.volume),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change),
      datetime: data.datetime,
      source: 'TwelveData'
    };
  }

  // Normalize time series data
  normalizeTimeSeriesData(data) {
    if (!data || !data.values || data.status === 'error') {
      return null;
    }

    return {
      symbol: data.meta?.symbol,
      interval: data.meta?.interval,
      values: data.values.map(item => ({
        datetime: item.datetime,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume)
      })),
      source: 'TwelveData'
    };
  }
}

export default new TwelveDataService();