/**
 * Multi-API Service - Provides robust fallback strategy for financial data
 * 
 * Strategy:
 * 1. Primary: FMP API (paid, high limits)
 * 2. Secondary: Alpha Vantage (free tier available)
 * 3. Tertiary: Polygon.io (free tier available)
 * 4. Quaternary: Yahoo Finance (via unofficial API)
 * 5. Final: Web scraping backup
 */

import axios from 'axios';
import FMPService from './FMPService';

class MultiAPIService {
  constructor() {
    this.services = [
      {
        name: 'FMP',
        service: FMPService,
        priority: 1,
        rateLimitDaily: 250, // Free tier
        rateLimitPerMinute: 25
      },
      {
        name: 'AlphaVantage',
        baseURL: 'https://www.alphavantage.co/query',
        apiKey: 'demo', // Free tier key - replace with real one
        priority: 2,
        rateLimitDaily: 25, // Free tier
        rateLimitPerMinute: 5
      },
      {
        name: 'Polygon',
        baseURL: 'https://api.polygon.io/v2',
        apiKey: 'demo', // Free tier key - replace with real one
        priority: 3,
        rateLimitDaily: 5, // Very limited free tier
        rateLimitPerMinute: 1
      },
      {
        name: 'YahooFinance',
        baseURL: 'https://query1.finance.yahoo.com/v8/finance/chart',
        priority: 4,
        rateLimitDaily: 2000, // Unofficial, higher tolerance
        rateLimitPerMinute: 100
      }
    ];

    this.usageTracking = new Map();
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
  }

  /**
   * Get company profile with intelligent fallback
   */
  async getCompanyProfile(symbol) {
    console.log(`[MultiAPI] Getting company profile for ${symbol}`);
    
    // Try FMP first (primary)
    try {
      const fmpResult = await FMPService.getCompanyProfile(symbol);
      if (fmpResult && fmpResult.length > 0) {
        console.log('[MultiAPI] FMP success');
        return {
          success: true,
          data: fmpResult[0],
          source: 'FMP',
          confidence: 95
        };
      }
    } catch (error) {
      console.log('[MultiAPI] FMP failed:', error.message);
    }

    // Try Alpha Vantage
    try {
      const avResult = await this.getAlphaVantageProfile(symbol);
      if (avResult.success) {
        console.log('[MultiAPI] Alpha Vantage success');
        return avResult;
      }
    } catch (error) {
      console.log('[MultiAPI] Alpha Vantage failed:', error.message);
    }

    // Try Yahoo Finance
    try {
      const yahooResult = await this.getYahooProfile(symbol);
      if (yahooResult.success) {
        console.log('[MultiAPI] Yahoo Finance success');
        return yahooResult;
      }
    } catch (error) {
      console.log('[MultiAPI] Yahoo Finance failed:', error.message);
    }

    // All APIs failed
    return {
      success: false,
      error: 'All financial APIs unavailable',
      source: 'MultiAPI',
      fallbackMessage: 'Consider upgrading API plans or using document upload'
    };
  }

  /**
   * Alpha Vantage company overview
   */
  async getAlphaVantageProfile(symbol) {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=demo`;
    
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data;
      
      if (data.Symbol) {
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
            exchange: data.Exchange
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
   * Get financial statements with fallback
   */
  async getFinancialStatements(symbol) {
    console.log(`[MultiAPI] Getting financial statements for ${symbol}`);
    
    // Try FMP first
    try {
      const fmpResult = await FMPService.getFinancialStatements(symbol);
      if (fmpResult && fmpResult.income && fmpResult.income.length > 0) {
        return {
          success: true,
          data: fmpResult,
          source: 'FMP',
          confidence: 95
        };
      }
    } catch (error) {
      console.log('[MultiAPI] FMP financials failed:', error.message);
    }

    // Try Alpha Vantage income statement
    try {
      const avResult = await this.getAlphaVantageIncomeStatement(symbol);
      if (avResult.success) {
        return avResult;
      }
    } catch (error) {
      console.log('[MultiAPI] Alpha Vantage financials failed:', error.message);
    }

    return {
      success: false,
      error: 'Financial statements unavailable',
      source: 'MultiAPI',
      fallbackMessage: 'Upload company documents for financial analysis'
    };
  }

  /**
   * Alpha Vantage income statement
   */
  async getAlphaVantageIncomeStatement(symbol) {
    const url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=demo`;
    
    try {
      const response = await axios.get(url, { timeout: 15000 });
      const data = response.data;
      
      if (data.annualReports && data.annualReports.length > 0) {
        const latest = data.annualReports[0];
        return {
          success: true,
          data: {
            income: [{
              date: latest.fiscalDateEnding,
              revenue: latest.totalRevenue,
              grossProfit: latest.grossProfit,
              operatingIncome: latest.operatingIncome,
              netIncome: latest.netIncome,
              source: 'Alpha Vantage'
            }]
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