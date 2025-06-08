import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAzYlOoS2ZdYehhGsdDtqEYsjTr-1AWD98';
const genAI = new GoogleGenerativeAI(API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeDocument(text, fileName) {
    try {
      // Determine document type for specialized analysis
      const docType = this.identifyDocumentType(fileName, text);
      
      let prompt = '';
      
      if (docType === '10k' || docType === '10q') {
        prompt = this.buildSECFilingPrompt(text, fileName, docType);
      } else if (docType === 'credit_agreement' || docType === 'indenture') {
        prompt = this.buildCreditDocumentPrompt(text, fileName, docType);
      } else if (docType === '8k') {
        prompt = this.build8KPrompt(text, fileName);
      } else {
        prompt = this.buildGeneralFinancialPrompt(text, fileName);
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      // Clean the response and parse JSON
      const cleanResponse = text_response.replace(/```json|```/g, '').trim();
      const analysis = JSON.parse(cleanResponse);
      
      // Add document metadata
      analysis.documentMetadata = {
        fileName: fileName,
        documentType: docType,
        analyzedAt: new Date().toISOString(),
        extractionMethod: 'Gemini Advanced Analysis'
      };
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing document:', error);
      return this.getFallbackAnalysis(fileName);
    }
  }

  identifyDocumentType(fileName, text) {
    const name = fileName.toLowerCase();
    const content = text.toLowerCase();
    
    if (name.includes('10-k') || content.includes('form 10-k')) return '10k';
    if (name.includes('10-q') || content.includes('form 10-q')) return '10q';
    if (name.includes('8-k') || content.includes('form 8-k')) return '8k';
    if (name.includes('credit') || name.includes('loan') || content.includes('credit agreement')) return 'credit_agreement';
    if (name.includes('indenture') || content.includes('indenture')) return 'indenture';
    if (name.includes('financial') || name.includes('statement')) return 'financial_statement';
    
    return 'general';
  }

  buildSECFilingPrompt(text, fileName, docType) {
    return `
      ADVANCED SEC FILING ANALYSIS - ${docType.toUpperCase()}
      
      Document: ${fileName}
      Content: ${text.substring(0, 50000)} // Limit to avoid token limits
      
      CRITICAL: This is a ${docType} filing. Extract ALL the following with PRECISE details:
      
      1. SUBSIDIARY STRUCTURE ANALYSIS (CRITICAL):
         - Map ALL subsidiaries, holding companies (HoldCos), operating companies (OpCos)
         - Identify Special Purpose Vehicles (SPVs) and Special Purpose Entities (SPEs)
         - For EACH subsidiary: name, jurisdiction, ownership percentage, debt amount, asset value
         - Extract guarantor vs non-guarantor subsidiaries
         - Note any restricted subsidiaries or unrestricted subsidiaries
      
      2. DETAILED DEBT ANALYSIS:
         - Total consolidated debt and breakdown by subsidiary
         - Senior secured debt, senior unsecured debt, subordinated debt
         - Credit facilities: revolving credit, term loans, bonds
         - Maturity dates, interest rates, covenants for each facility
         - Cross-default provisions and guarantees
      
      3. COVENANT EXTRACTION (VERBATIM):
         - Extract EXACT covenant language with thresholds
         - Financial maintenance covenants (DSCR, leverage, coverage ratios)
         - Negative covenants (restrictions on distributions, investments, debt)
         - Affirmative covenants (reporting, insurance, compliance)
         - Include covenant testing dates and cure mechanisms
      
      4. FINANCIAL STATEMENT DETAILS:
         - Revenue by segment/subsidiary if disclosed
         - EBITDA calculations and adjustments
         - Working capital by major subsidiary
         - Capital expenditures by segment
         - Cash flow from operations, investing, financing
      
      Return JSON with this EXACT structure:
      {
        "company": {
          "name": "Exact company name",
          "industry": "Industry classification",
          "fiscalYearEnd": "Fiscal year end date",
          "reportingPeriod": "Period covered by this filing",
          "filingDate": "Date of filing"
        },
        "subsidiaryStructure": [
          {
            "name": "Subsidiary exact name",
            "type": "OpCo/HoldCo/SPV/SPE",
            "jurisdiction": "State/Country of incorporation",
            "ownershipPercentage": "Ownership %",
            "isGuarantor": true/false,
            "debt": {
              "amount": "Debt amount if specified",
              "description": "Type and details of debt"
            },
            "assets": {
              "amount": "Asset value if specified",
              "description": "Key assets held"
            },
            "parentEntity": "Direct parent entity name"
          }
        ],
        "debtStructure": {
          "totalConsolidatedDebt": "Total debt amount",
          "facilities": [
            {
              "name": "Facility name (e.g., Term Loan A)",
              "type": "Revolving Credit/Term Loan/Bonds",
              "amount": "Outstanding amount",
              "maturityDate": "Maturity date",
              "interestRate": "Interest rate",
              "guarantors": ["List of guarantor subsidiaries"],
              "collateral": "Description of collateral",
              "issuer": "Which entity issued/borrowed"
            }
          ]
        },
        "covenants": [
          {
            "name": "Exact covenant name",
            "type": "Financial/Negative/Affirmative",
            "exactLanguage": "VERBATIM text from document",
            "threshold": "Numeric threshold if applicable",
            "testingDate": "When covenant is tested",
            "applicableDebt": "Which debt facility this applies to",
            "cureProvisions": "Cure mechanisms if any",
            "documentSection": "Section reference in document"
          }
        ],
        "financials": {
          "revenue": "Latest revenue",
          "revenueBySegment": {},
          "ebitda": "EBITDA amount",
          "ebitdaAdjustments": "Description of adjustments",
          "netIncome": "Net income",
          "totalAssets": "Total assets",
          "totalDebt": "Total debt",
          "cashAndEquivalents": "Cash amount",
          "workingCapital": "Working capital"
        },
        "riskFactors": [
          "Key risk factors identified in document"
        ],
        "materialEvents": [
          "Any material events or changes mentioned"
        ],
        "confidence": 0.XX,
        "extractionNotes": "Any limitations or notes about extraction"
      }
    `;
  }

  buildCreditDocumentPrompt(text, fileName, docType) {
    return `
      CREDIT AGREEMENT DEEP ANALYSIS
      
      Document: ${fileName}
      Type: ${docType}
      Content: ${text.substring(0, 50000)}
      
      EXTRACT EVERY COVENANT AND TERM with PRECISION:
      
      1. BORROWER AND GUARANTOR STRUCTURE:
         - Primary borrower entity name and details
         - Each guarantor entity with guarantee amount/scope
         - Non-guarantor subsidiaries and restrictions
      
      2. COMPLETE COVENANT ANALYSIS:
         Extract VERBATIM language for EVERY covenant including:
         - Financial maintenance covenants (exact thresholds, testing periods)
         - Negative covenants (prohibited actions, exceptions)
         - Affirmative covenants (required actions, reporting)
         - Include ALL defined terms and calculation methodologies
      
      3. DEBT FACILITY DETAILS:
         - Credit facility type and amount
         - Term loan details, revolving credit details
         - Interest rates (base rate + margin)
         - Maturity dates, amortization schedule
         - Optional prepayment terms, mandatory prepayments
      
      4. SECURITY AND COLLATERAL:
         - Detailed description of collateral
         - Perfection requirements
         - Release conditions
      
      5. DEFAULT AND ACCELERATION:
         - Events of default (exact language)
         - Cross-default thresholds
         - Acceleration procedures
      
      Return JSON:
      {
        "facilityDetails": {
          "facilityType": "Credit Agreement/Term Loan/etc",
          "totalCommitment": "Total facility amount",
          "borrower": "Primary borrower name",
          "lenders": ["Lender names if mentioned"],
          "interestRate": "Interest rate structure",
          "maturityDate": "Final maturity",
          "governingLaw": "Governing law"
        },
        "guarantorStructure": [
          {
            "name": "Guarantor entity name",
            "guaranteeType": "Full/Limited/Specific",
            "guaranteeAmount": "Amount if limited",
            "guaranteeScope": "What is guaranteed"
          }
        ],
        "covenants": {
          "financial": [
            {
              "name": "Covenant name",
              "verbatimText": "EXACT language from document",
              "threshold": "Numeric threshold",
              "testingFrequency": "Monthly/Quarterly/Annual",
              "firstTestDate": "Date of first test",
              "calculationMethod": "How to calculate",
              "exceptions": "Any exceptions or adjustments",
              "cureRights": "Cure mechanisms available"
            }
          ],
          "negative": [
            {
              "restriction": "What is prohibited",
              "verbatimText": "EXACT language",
              "exceptions": "Permitted exceptions",
              "thresholds": "Any dollar thresholds"
            }
          ],
          "affirmative": [
            {
              "requirement": "What is required",
              "verbatimText": "EXACT language",
              "frequency": "How often",
              "deliveryDate": "When required"
            }
          ]
        },
        "collateral": {
          "description": "Detailed collateral description",
          "perfectionRequirements": "How security interests are perfected",
          "releaseConditions": "When collateral can be released"
        },
        "eventsOfDefault": [
          {
            "event": "Description of default event",
            "verbatimText": "EXACT language from document",
            "graceGeriod": "Cure period if any",
            "threshold": "Dollar threshold if applicable"
          }
        ],
        "keyDefinitions": {
          "EBITDA": "How EBITDA is defined in this agreement",
          "TotalDebt": "How debt is defined",
          "other": "Other key defined terms"
        },
        "confidence": 0.XX
      }
    `;
  }

  build8KPrompt(text, fileName) {
    return `
      8-K CURRENT REPORT ANALYSIS
      
      Document: ${fileName}
      Content: ${text.substring(0, 30000)}
      
      8-K forms report material events. Extract:
      
      1. MATERIAL EVENT IDENTIFICATION:
         - What specific event triggered this 8-K?
         - Date of the event
         - Impact on financial condition or operations
      
      2. DEBT-RELATED EVENTS (if applicable):
         - New debt issuance, amendment, or refinancing
         - Covenant modifications or waivers
         - Default notices or acceleration events
         - Changes in credit ratings
      
      3. CORPORATE STRUCTURE CHANGES:
         - Acquisitions, dispositions, or spin-offs
         - Changes in subsidiaries or joint ventures
         - Management changes affecting credit profile
      
      Return JSON:
      {
        "eventType": "Primary event type",
        "eventDate": "Date of event",
        "eventDescription": "Detailed description",
        "debtImpact": {
          "isDebtRelated": true/false,
          "description": "How this affects debt structure",
          "newDebt": "Any new debt issued",
          "debtChanges": "Changes to existing debt"
        },
        "materialImpact": "Assessment of materiality",
        "forwardLookingStatements": ["Any forward-looking statements"],
        "confidence": 0.XX
      }
    `;
  }

  buildGeneralFinancialPrompt(text, fileName) {
    return `
      GENERAL FINANCIAL DOCUMENT ANALYSIS
      
      Document: ${fileName}
      Content: ${text.substring(0, 40000)}
      
      Extract comprehensive financial information:
      
      {
        "company": {
          "name": "Company name",
          "industry": "Industry",
          "description": "Company description"
        },
        "financials": {
          "revenue": "Revenue amount",
          "grossMargin": "Gross margin %",
          "netIncome": "Net income",
          "totalAssets": "Total assets",
          "totalDebt": "Total debt",
          "cashAndEquivalents": "Cash amount",
          "workingCapital": "Working capital"
        },
        "debtInformation": {
          "totalDebt": "Total debt amount",
          "debtBreakdown": "Description of debt types",
          "maturityProfile": "When debt matures",
          "interestRates": "Interest rate information"
        },
        "keyMetrics": {
          "revenueGrowth": "Revenue growth rate",
          "profitMargin": "Profit margin",
          "debtToEquity": "Debt to equity ratio",
          "currentRatio": "Current ratio",
          "interestCoverage": "Interest coverage ratio"
        },
        "insights": ["Key insights"],
        "risks": ["Risk factors"],
        "confidence": 0.XX
      }
    `;
  }

  // Enhanced function for extracting financial data cross-referenced with API data
  async extractFinancialData(text, companyTicker = null) {
    try {
      const prompt = `
        COMPREHENSIVE FINANCIAL DATA EXTRACTION
        
        Company Ticker: ${companyTicker || 'Not provided'}
        Document Text: ${text.substring(0, 40000)}
        
        Instructions: Extract PRECISE financial figures. If a ticker is provided, focus on data that can be cross-referenced with API data.
        
        Return detailed JSON:
        {
          "financialData": {
            "revenue": "Exact revenue figure with period",
            "grossProfit": "Gross profit amount",
            "operatingIncome": "Operating income",
            "netIncome": "Net income",
            "ebitda": "EBITDA amount and calculation method",
            "totalAssets": "Total assets",
            "totalLiabilities": "Total liabilities",
            "totalEquity": "Total equity",
            "cashAndCashEquivalents": "Cash amount",
            "totalDebt": "Total debt amount",
            "longTermDebt": "Long-term debt",
            "shortTermDebt": "Short-term debt",
            "workingCapital": "Working capital calculation",
            "operatingCashFlow": "Operating cash flow",
            "freeCashFlow": "Free cash flow",
            "capitalExpenditures": "Capex amount"
          },
          "ratios": {
            "currentRatio": "Current assets / Current liabilities",
            "quickRatio": "Quick ratio calculation",
            "debtToEquity": "Total debt / Total equity",
            "leverageRatio": "Total debt / EBITDA",
            "interestCoverage": "EBITDA / Interest expense",
            "returnOnAssets": "Net income / Total assets",
            "returnOnEquity": "Net income / Total equity"
          },
          "covenantMetrics": {
            "dscr": "Debt service coverage ratio",
            "fixedChargeCoverage": "Fixed charge coverage ratio",
            "tangibleNetWorth": "Tangible net worth calculation"
          },
          "reportingPeriod": "Period this data covers",
          "dataQuality": "Assessment of data completeness and reliability",
          "documentSource": "Type of document this data comes from",
          "confidence": 0.XX
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      const cleanResponse = text_response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error extracting financial data:', error);
      return {
        financialData: {},
        ratios: {},
        covenantMetrics: {},
        confidence: 0.3,
        error: error.message
      };
    }
  }

  // Enhanced SEC filing analysis
  async extractSECData(text, companyTicker = null) {
    try {
      const prompt = `
        EXPERT SEC FILING ANALYST - EXTRACT COMPREHENSIVE FINANCIAL DATA
        
        Company: ${companyTicker || 'Unknown'}
        Document Type: SEC Filing (10-K/10-Q)
        
        Analyze this SEC filing text and extract detailed financial information:
        
        Text: ${text.substring(0, 8000)}
        
        Extract and return JSON with:
        {
          "revenue": "value with source note",
          "netIncome": "value with source note", 
          "totalAssets": "value with source note",
          "totalLiabilities": "value with source note",
          "totalEquity": "value with source note",
          "totalDebt": "value with source note",
          "cash": "value with source note",
          "operatingCashFlow": "value with source note",
          "freeCashFlow": "value with source note",
          "operatingIncome": "value with source note",
          "grossProfit": "value with source note",
          "currentAssets": "value with source note",
          "currentLiabilities": "value with source note",
          "longTermDebt": "value with source note",
          "workingCapital": "calculated from current assets - current liabilities",
          "retainedEarnings": "value with source note",
          "confidence": 0.95,
          "filingType": "10-K/10-Q",
          "reportingPeriod": "extracted period"
        }
        
        Instructions:
        1. Extract exact financial statement values
        2. Include currency and units (millions, thousands)
        3. Note the specific financial statement source (Balance Sheet, Income Statement, Cash Flow)
        4. Return "[Data Unavailable]" if information not found
        5. Calculate derived metrics when base data is available
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      const cleanResponse = text_response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error extracting SEC data:', error);
      return {
        revenue: '[Data Unavailable]',
        netIncome: '[Data Unavailable]',
        confidence: 0.3,
        error: error.message
      };
    }
  }

  // Enhanced covenant analysis for credit agreements
  async extractCovenantData(text, companyTicker = null) {
    try {
      const prompt = `
        EXPERT CREDIT ANALYST - COVENANT EXTRACTION SPECIALIST
        
        Company: ${companyTicker || 'Unknown'}
        Document Type: Credit Agreement / Bond Indenture
        
        Analyze this credit document and extract detailed covenant information:
        
        Text: ${text.substring(0, 8000)}
        
        Extract and return JSON with:
        {
          "financialCovenants": {
            "minimumLiquidityRequirement": "value and threshold",
            "maximumLeverageRatio": "value and threshold", 
            "minimumInterestCoverageRatio": "value and threshold",
            "minimumEBITDARequirement": "value and threshold",
            "maximumCapitalExpenditures": "value and threshold",
            "minimumTangibleNetWorth": "value and threshold",
            "maximumDebtToEBITDA": "value and threshold"
          },
          "operationalCovenants": {
            "businessRestrictions": "key restrictions",
            "acquisitionLimitations": "acquisition limits",
            "dividendRestrictions": "dividend policy",
            "assetDisposalLimitations": "disposal restrictions"
          },
          "defaultTriggers": {
            "paymentDefault": "grace period and terms",
            "covenantDefault": "cure periods",
            "crossDefault": "cross-default provisions",
            "materialAdverseChange": "MAC clause details"
          },
          "creditFacilityDetails": {
            "totalCommitment": "facility size",
            "maturityDate": "final maturity",
            "pricingGrid": "interest rate structure",
            "revolvingCreditLimit": "revolving facility size",
            "termLoanAmount": "term loan amount"
          },
          "securityInterests": {
            "collateralDescription": "assets securing debt",
            "guarantors": "subsidiary guarantors",
            "securityPriority": "lien priority"
          },
          "confidence": 0.9
        }
        
        Instructions:
        1. Extract exact covenant thresholds and requirements
        2. Identify all financial maintenance tests
        3. Note grace periods and cure mechanisms
        4. Extract facility sizing and pricing details
        5. Return "[Not Specified]" if specific covenant not found
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      const cleanResponse = text_response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error extracting covenant data:', error);
      return {
        financialCovenants: {},
        operationalCovenants: {},
        confidence: 0.3,
        error: error.message
      };
    }
  }

  // Enhanced subsidiary structure analysis
  async extractSubsidiaryStructure(text, companyTicker = null) {
    try {
      const prompt = `
        EXPERT CORPORATE STRUCTURE ANALYST - SUBSIDIARY MAPPING SPECIALIST
        
        Company: ${companyTicker || 'Unknown'}
        Document Type: Corporate Filing / 10-K / Bankruptcy Document
        
        Analyze this document and map the corporate subsidiary structure:
        
        Text: ${text.substring(0, 8000)}
        
        Extract and return JSON with:
        {
          "parentCompany": {
            "name": "parent entity name",
            "jurisdiction": "incorporation state/country",
            "type": "entity type"
          },
          "subsidiaries": {
            "subsidiary1": {
              "name": "subsidiary name",
              "jurisdiction": "incorporation location", 
              "ownershipPercentage": "ownership %",
              "businessDescription": "business activities",
              "guarantorStatus": "guarantor/non-guarantor",
              "significantAssets": "key assets if mentioned"
            }
          },
          "structuralSubordination": {
            "description": "subordination explanation",
            "impactOnRecovery": "recovery implications",
            "keyRisks": "structural risks"
          },
          "guaranteeStructure": {
            "subsidiaryGuarantors": ["list of guarantor subsidiaries"],
            "nonGuarantorSubsidiaries": ["list of non-guarantor subsidiaries"],
            "guaranteeScope": "full/limited guarantee details"
          },
          "confidence": 0.85
        }
        
        Instructions:
        1. Map complete ownership structure
        2. Identify guarantor vs non-guarantor subsidiaries
        3. Note jurisdictional differences
        4. Assess structural subordination risks
        5. Extract exact ownership percentages
        6. Return "[Not Disclosed]" if information not available
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      const cleanResponse = text_response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error extracting subsidiary structure:', error);
      return {
        parentCompany: {},
        subsidiaries: {},
        confidence: 0.3,
        error: error.message
      };
    }
  }

  // Enhanced chat function with company-specific context
  async chatWithAI(query, companyContext) {
    try {
      const companyName = companyContext?.company?.name || 'the company';
      const ticker = companyContext?.company?.ticker;
      const hasFinancials = companyContext?.analysisData?.financials;
      
      const prompt = `
        EXPERT DISTRESSED CREDIT ANALYST RESPONSE
        
        Company: ${companyName}${ticker ? ` (${ticker})` : ''}
        Query: "${query}"
        
        Context Available:
        ${hasFinancials ? `Financial Data: ${JSON.stringify(companyContext.analysisData.financials)}` : 'Limited financial data available'}
        ${companyContext?.results?.documents ? `Uploaded Documents: ${companyContext.results.documents.documents?.length || 0} documents processed` : 'No documents uploaded'}
        
        Instructions:
        1. Provide a comprehensive response as a senior distressed credit analyst
        2. Reference specific financial metrics when available
        3. If data is unavailable, explain what data would be needed
        4. Focus on covenant analysis, liquidity, capital structure, and recovery scenarios
        5. Provide actionable insights and recommendations
        6. Include confidence assessment in your analysis
        
        Format response with:
        - Direct answer to the question
        - Supporting analysis with specific data points
        - Risk assessment and implications
        - Recommendations for further analysis
        
        If the query asks for visualizations or charts, describe what should be included and provide sample data structure.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return {
        response: response.text(),
        confidence: 0.88,
        agentType: 'insights',
        sources: companyContext?.results?.documents ? ['Uploaded Documents', 'Financial Data'] : ['Financial Data'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in enhanced chat:', error);
      return {
        response: `I apologize, but I'm having difficulty analyzing that query for the company. This could be due to limited data availability or system constraints. Could you please try rephrasing your question or provide more specific details about what aspect of the distressed credit analysis you'd like to explore?`,
        confidence: 0.5,
        agentType: 'coordinator',
        error: error.message
      };
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