import axios from 'axios';

const API_KEY = 'GO78AUVBP5P3J288';
const BASE_URL = 'https://www.alphavantage.co/query';

class AlphaVantageService {
  constructor() {
    this.apiKey = API_KEY;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async makeRequest(params) {
    const cacheKey = JSON.stringify(params);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          ...params,
          apikey: this.apiKey
        }
      });

      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error('AlphaVantage API Error:', error);
      throw error;
    }
  }

  async getCompanyOverview(symbol) {
    try {
      const data = await this.makeRequest({
        function: 'OVERVIEW',
        symbol: symbol
      });

      if (data.Symbol) {
        return {
          symbol: data.Symbol,
          name: data.Name,
          description: data.Description,
          industry: data.Industry,
          sector: data.Sector,
          marketCap: data.MarketCapitalization,
          peRatio: data.PERatio,
          pegRatio: data.PEGRatio,
          bookValue: data.BookValue,
          dividendYield: data.DividendYield,
          eps: data.EPS,
          revenuePerShare: data.RevenuePerShareTTM,
          profitMargin: data.ProfitMargin,
          operatingMargin: data.OperatingMarginTTM,
          returnOnAssets: data.ReturnOnAssetsTTM,
          returnOnEquity: data.ReturnOnEquityTTM,
          revenueTTM: data.RevenueTTM,
          grossProfitTTM: data.GrossProfitTTM,
          ebitda: data.EBITDA,
          quarterlyEarningsGrowth: data.QuarterlyEarningsGrowthYOY,
          quarterlyRevenueGrowth: data.QuarterlyRevenueGrowthYOY,
          analystTargetPrice: data.AnalystTargetPrice,
          week52High: data['52WeekHigh'],
          week52Low: data['52WeekLow'],
          beta: data.Beta
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching company overview:', error);
      return null;
    }
  }

  async getStockPrice(symbol) {
    try {
      const data = await this.makeRequest({
        function: 'GLOBAL_QUOTE',
        symbol: symbol
      });

      const quote = data['Global Quote'];
      if (quote) {
        return {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: quote['10. change percent'],
          volume: parseInt(quote['06. volume']),
          previousClose: parseFloat(quote['08. previous close']),
          open: parseFloat(quote['02. open']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          latestTradingDay: quote['07. latest trading day']
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching stock price:', error);
      return null;
    }
  }

  async getHistoricalData(symbol, timeframe = 'monthly') {
    try {
      const functionMap = {
        'daily': 'TIME_SERIES_DAILY',
        'weekly': 'TIME_SERIES_WEEKLY',
        'monthly': 'TIME_SERIES_MONTHLY'
      };

      const data = await this.makeRequest({
        function: functionMap[timeframe] || 'TIME_SERIES_MONTHLY',
        symbol: symbol,
        outputsize: 'compact'
      });

      const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
      if (timeSeriesKey) {
        const timeSeries = data[timeSeriesKey];
        return Object.entries(timeSeries).map(([date, values]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        })).slice(0, 12).reverse(); // Last 12 periods
      }
      return [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  async getIncomeStatement(symbol) {
    try {
      const data = await this.makeRequest({
        function: 'INCOME_STATEMENT',
        symbol: symbol
      });

      if (data.annualReports) {
        return data.annualReports.slice(0, 3).map(report => ({
          fiscalDateEnding: report.fiscalDateEnding,
          totalRevenue: report.totalRevenue,
          costOfRevenue: report.costOfRevenue,
          grossProfit: report.grossProfit,
          operatingIncome: report.operatingIncome,
          netIncome: report.netIncome,
          ebitda: report.ebitda,
          researchAndDevelopment: report.researchAndDevelopment,
          operatingExpenses: report.operatingExpenses
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching income statement:', error);
      return [];
    }
  }

  async getBalanceSheet(symbol) {
    try {
      const data = await this.makeRequest({
        function: 'BALANCE_SHEET',
        symbol: symbol
      });

      if (data.annualReports) {
        return data.annualReports.slice(0, 3).map(report => ({
          fiscalDateEnding: report.fiscalDateEnding,
          totalAssets: report.totalAssets,
          totalCurrentAssets: report.totalCurrentAssets,
          cashAndCashEquivalents: report.cashAndCashEquivalents,
          inventory: report.inventory,
          totalLiabilities: report.totalLiabilities,
          totalCurrentLiabilities: report.totalCurrentLiabilities,
          longTermDebt: report.longTermDebt,
          totalShareholderEquity: report.totalShareholderEquity,
          retainedEarnings: report.retainedEarnings
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      return [];
    }
  }

  async getCashFlow(symbol) {
    try {
      const data = await this.makeRequest({
        function: 'CASH_FLOW',
        symbol: symbol
      });

      if (data.annualReports) {
        return data.annualReports.slice(0, 3).map(report => ({
          fiscalDateEnding: report.fiscalDateEnding,
          operatingCashflow: report.operatingCashflow,
          paymentsForOperatingActivities: report.paymentsForOperatingActivities,
          proceedsFromOperatingActivities: report.proceedsFromOperatingActivities,
          changeInOperatingLiabilities: report.changeInOperatingLiabilities,
          changeInOperatingAssets: report.changeInOperatingAssets,
          depreciation: report.depreciation,
          dividendPayout: report.dividendPayout,
          stockSaleAndPurchase: report.stockSaleAndPurchase,
          capitalExpenditures: report.capitalExpenditures,
          changeInCashAndCashEquivalents: report.changeInCashAndCashEquivalents
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching cash flow:', error);
      return [];
    }
  }

  async searchSymbol(keywords) {
    try {
      const data = await this.makeRequest({
        function: 'SYMBOL_SEARCH',
        keywords: keywords
      });

      if (data.bestMatches) {
        return data.bestMatches.slice(0, 5).map(match => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region'],
          marketOpen: match['5. marketOpen'],
          marketClose: match['6. marketClose'],
          timezone: match['7. timezone'],
          currency: match['8. currency'],
          matchScore: match['9. matchScore']
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching symbol:', error);
      return [];
    }
  }

  formatCurrency(value) {
    if (!value) return 'N/A';
    const num = parseFloat(value);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  }

  formatPercent(value) {
    if (!value) return 'N/A';
    const num = parseFloat(value);
    return `${(num * 100).toFixed(2)}%`;
  }
}

export default new AlphaVantageService();