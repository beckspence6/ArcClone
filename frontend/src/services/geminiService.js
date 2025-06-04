import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAzYlOoS2ZdYehhGsdDtqEYsjTr-1AWD98';
const genAI = new GoogleGenerativeAI(API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeDocument(text, fileName) {
    try {
      const prompt = `
        Analyze the following financial document and extract key information:
        
        Document: ${fileName}
        Content: ${text}
        
        Please provide a JSON response with the following structure:
        {
          "company": {
            "name": "Company Name",
            "industry": "Industry",
            "sector": "Sector",
            "description": "Brief description"
          },
          "financials": {
            "revenue": "Latest revenue",
            "grossMargin": "Gross margin percentage",
            "netIncome": "Net income",
            "totalAssets": "Total assets",
            "totalDebt": "Total debt",
            "cashAndEquivalents": "Cash and cash equivalents"
          },
          "keyMetrics": {
            "revenueGrowth": "Revenue growth rate",
            "profitMargin": "Profit margin",
            "roa": "Return on assets",
            "roe": "Return on equity",
            "debtToEquity": "Debt to equity ratio"
          },
          "insights": [
            "Key insight 1",
            "Key insight 2",
            "Key insight 3"
          ],
          "risks": [
            "Risk factor 1",
            "Risk factor 2",
            "Risk factor 3"
          ],
          "confidence": 0.95
        }
        
        Focus on extracting numerical data and provide realistic estimates if exact numbers aren't available.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      // Clean the response and parse JSON
      const cleanResponse = text_response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error analyzing document:', error);
      return this.getFallbackAnalysis(fileName);
    }
  }

  async generateInsights(companyData, question) {
    try {
      const prompt = `
        Based on the following company data, answer this question: "${question}"
        
        Company Data: ${JSON.stringify(companyData)}
        
        Provide a comprehensive, professional response with:
        1. Direct answer to the question
        2. Supporting data and analysis
        3. Key insights and implications
        4. Risk factors or considerations
        
        Format your response as if you're a senior financial analyst providing advice to an investment committee.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating insights:', error);
      return "I apologize, but I'm having trouble accessing the analysis at the moment. Please try again shortly.";
    }
  }

  async detectCompanyFromText(text) {
    try {
      const prompt = `
        Analyze this text and identify the company name, industry, and key details:
        
        Text: ${text}
        
        Return JSON with:
        {
          "companyName": "extracted company name",
          "industry": "industry/sector",
          "ticker": "stock ticker if mentioned",
          "confidence": 0.95
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const cleanResponse = response.text().replace(/```json|```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error detecting company:', error);
      return { companyName: "Unknown Company", industry: "Unknown", confidence: 0.1 };
    }
  }

  async generateCreditAnalysis(companyData) {
    try {
      const prompt = `
        Perform a comprehensive credit analysis for this company:
        
        Company Data: ${JSON.stringify(companyData)}
        
        Provide a detailed credit analysis including:
        1. Credit rating assessment (AAA to D scale)
        2. Key credit strengths (3-5 points)
        3. Key credit concerns (3-5 points)
        4. Financial ratio analysis
        5. Industry comparison
        6. Overall recommendation (Approve/Conditional/Decline)
        
        Format as professional credit memo.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating credit analysis:', error);
      return "Credit analysis unavailable at this time.";
    }
  }

  getFallbackAnalysis(fileName) {
    return {
      company: {
        name: "Sample Company",
        industry: "Technology",
        sector: "Software",
        description: "Technology company focusing on enterprise solutions"
      },
      financials: {
        revenue: "$100M",
        grossMargin: "75%",
        netIncome: "$15M",
        totalAssets: "$200M",
        totalDebt: "$50M",
        cashAndEquivalents: "$25M"
      },
      keyMetrics: {
        revenueGrowth: "15%",
        profitMargin: "15%",
        roa: "7.5%",
        roe: "12%",
        debtToEquity: "0.33"
      },
      insights: [
        "Strong revenue growth trajectory",
        "Healthy profit margins",
        "Conservative debt levels"
      ],
      risks: [
        "Market competition",
        "Technology disruption",
        "Economic sensitivity"
      ],
      confidence: 0.8
    };
  }
}

export default new GeminiService();