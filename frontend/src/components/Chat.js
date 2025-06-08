import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  FileText, 
  BarChart3, 
  TrendingUp,
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  Copy,
  ThumbsUp,
  ThumbsDown,
  PieChart,
  Target,
  Calculator,
  Lightbulb,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import AgentCoordinator from '../services/agentCoordinator';

const Chat = ({ companyData }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentActivity, setAgentActivity] = useState([]);
  const [contextualSuggestions, setContextualSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize chat with company-specific context
  useEffect(() => {
    const initializeChat = () => {
      const hasCompanyData = !!companyData?.company?.name;
      const companyName = companyData?.company?.name || 'your company';
      const ticker = companyData?.company?.ticker;
      const isPublic = !!ticker;

      let welcomeMessage = '';
      
      if (hasCompanyData) {
        welcomeMessage = `Hello! I'm your AI assistant specializing in distressed credit analysis for **${companyName}**${ticker ? ` (${ticker})` : ''}. 

I have access to ${isPublic ? 'real-time financial data and ' : ''}your uploaded documents and can help you with:

🔍 **Covenant violation analysis** - Track DSCR, leverage ratios, and compliance
💧 **Liquidity runway modeling** - Cash burn analysis and scenario planning  
🏗️ **Capital structure optimization** - Recovery waterfalls and restructuring scenarios
⚠️ **Risk flag monitoring** - Early warning systems and distress indicators
📊 **Dynamic visualizations** - I can generate charts and models on demand

What specific aspect of ${companyName}'s credit situation would you like to explore?`;
      } else {
        welcomeMessage = `Hello! I'm your AI assistant specializing in distressed credit analysis. 

To provide tailored analysis, please upload company documents in the Data Room first. Once you do, I'll be able to:

🔍 **Analyze covenant violations** with specific thresholds from your credit agreements
💧 **Model liquidity scenarios** based on your actual cash flows  
🏗️ **Map capital structure** from your debt documents
⚠️ **Generate risk alerts** tailored to your situation
📊 **Create visualizations** specific to your data

I can also explain general distressed credit concepts and methodologies. How can I help you today?`;
      }

      const initialMessage = {
        id: 1,
        type: 'bot',
        content: welcomeMessage,
        timestamp: new Date(),
        confidence: 0.98,
        agentType: 'coordinator',
        hasCompanyContext: hasCompanyData,
        capabilities: ['covenant_analysis', 'liquidity_modeling', 'visualization_generation', 'scenario_planning']
      };

      setMessages([initialMessage]);
      generateContextualSuggestions();
    };

    initializeChat();
  }, [companyData]);

  // Generate dynamic suggestions based on company data
  const generateContextualSuggestions = () => {
    if (!companyData?.company?.name) {
      setContextualSuggestions([
        "How does distressed credit analysis work?",
        "What documents do I need for covenant tracking?",
        "Explain debt recovery waterfalls",
        "What are typical distress indicators?",
        "How do you calculate liquidity runways?",
        "Generate a sample restructuring scenario"
      ]);
      return;
    }

    const companyName = companyData.company.name;
    const ticker = companyData.company.ticker;
    const hasFinancials = !!companyData.results?.financials;
    
    const suggestions = [
      `Analyze ${companyName}'s current distress level and key risk factors`,
      `What covenant violations is ${companyName} currently experiencing?`,
      `Calculate ${companyName}'s liquidity runway and burn rate analysis`,
      `Show me ${companyName}'s capital structure and recovery scenarios`,
      `Generate a debt maturity wall chart for ${companyName}`,
      `What are the most critical risk flags for ${companyName}?`,
      `Create an investment committee memo for ${companyName}`,
      `Model potential restructuring scenarios for ${companyName}`
    ];

    if (ticker) {
      suggestions.push(
        `Compare ${companyName} (${ticker}) to industry distress benchmarks`,
        `Generate a real-time distress score visualization for ${ticker}`
      );
    }

    if (hasFinancials) {
      suggestions.push(
        `Create a cash flow waterfall chart showing ${companyName}'s burn rate`,
        `Generate covenant compliance trend analysis for ${companyName}`
      );
    }

    setContextualSuggestions(suggestions);
  };

  const agentTypes = {
    coordinator: { name: 'Coordinator Agent', icon: Brain, color: 'blue' },
    financial: { name: 'Financial Analyst', icon: BarChart3, color: 'green' },
    research: { name: 'Research Agent', icon: FileText, color: 'purple' },
    insights: { name: 'Insights Agent', icon: TrendingUp, color: 'orange' },
    distressed: { name: 'Distressed Credit Specialist', icon: AlertTriangle, color: 'red' },
    visualization: { name: 'Visualization Engine', icon: PieChart, color: 'teal' }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateEnhancedAgentActivity = (query) => {
    const hasCompanyData = !!companyData?.company?.name;
    const isVisualizationRequest = query.toLowerCase().includes('chart') || 
                                    query.toLowerCase().includes('graph') || 
                                    query.toLowerCase().includes('visualiz');
    
    let activities = [
      { agent: 'coordinator', action: 'Planning enhanced analysis approach', duration: 800 }
    ];

    if (hasCompanyData) {
      activities.push(
        { agent: 'research', action: 'Accessing company documents and API data', duration: 1200 },
        { agent: 'financial', action: 'Processing real-time financial metrics', duration: 1500 },
        { agent: 'distressed', action: 'Analyzing covenant violations and distress indicators', duration: 1800 }
      );
    } else {
      activities.push(
        { agent: 'research', action: 'Searching general knowledge base', duration: 1000 },
        { agent: 'financial', action: 'Preparing generic financial analysis', duration: 1200 }
      );
    }

    if (isVisualizationRequest) {
      activities.push(
        { agent: 'visualization', action: 'Generating dynamic charts and models', duration: 2000 }
      );
    }

    activities.push(
      { agent: 'insights', action: 'Synthesizing actionable recommendations', duration: 1000 }
    );

    let currentDelay = 500;
    
    activities.forEach((activity, index) => {
      setTimeout(() => {
        setAgentActivity(prev => [...prev, { 
          ...activity, 
          id: Date.now() + index,
          status: 'active'
        }]);
        
        setTimeout(() => {
          setAgentActivity(prev => prev.map(item => 
            item.id === Date.now() + index 
              ? { ...item, status: 'completed' }
              : item
          ));
        }, activity.duration);
      }, currentDelay);
      
      currentDelay += activity.duration + 200;
    });

    return currentDelay;
  };

  const generateEnhancedResponse = async (query, hasCompanyData) => {
    if (!hasCompanyData) {
      return {
        content: `I'd be happy to help with general distressed credit analysis! However, for specific insights about a company, I need access to financial data and documents.

**I can help you with general topics like:**
• Understanding distressed credit methodologies
• Covenant analysis frameworks  
• Liquidity modeling approaches
• Capital structure theory
• Restructuring process guides

**For company-specific analysis, please:**
1. Upload financial statements, credit agreements, and other relevant documents in the Data Room
2. Provide the company ticker (for public companies) to access real-time data
3. Then I can generate detailed covenant tracking, liquidity projections, and risk assessments

What general distressed credit topic would you like to explore?`,
        confidence: 0.95,
        agentType: 'coordinator'
      };
    }

    // Enhanced responses with real data context
    const companyName = companyData.company.name;
    const ticker = companyData.company.ticker;

    // Use AgentCoordinator to get real insights with company context
    try {
      const response = await AgentCoordinator.chatWithAI(query, {
        ...companyData,
        enhancedCapabilities: true,
        requestVisualization: query.toLowerCase().includes('chart') || 
                             query.toLowerCase().includes('graph') || 
                             query.toLowerCase().includes('visualiz')
      });

      return {
        content: response.response || generateFallbackResponse(query, companyName, ticker),
        confidence: response.confidence || 0.88,
        agentType: response.agentType || 'insights',
        sources: response.sources || [],
        visualizations: response.visualizations || null
      };
    } catch (error) {
      console.error('Enhanced chat error:', error);
      return generateFallbackResponse(query, companyName, ticker);
    }
  };

  const generateFallbackResponse = (query, companyName, ticker) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('distress') || lowerQuery.includes('score')) {
      return {
        content: `**${companyName} Distress Analysis:**

Based on available data, I'm analyzing multiple distress indicators:

🔴 **Key Risk Factors:**
• Covenant compliance status (DSCR, leverage ratios)
• Liquidity runway and cash burn analysis  
• Debt maturity wall and refinancing needs
• Market conditions and sector trends

💡 **Next Steps:**
• Would you like me to dive deeper into specific covenant violations?
• Shall I model various liquidity scenarios?
• Do you need a comprehensive restructuring analysis?

I can generate detailed charts and projections for any of these areas.`,
        confidence: 0.92,
        agentType: 'distressed'
      };
    }

    if (lowerQuery.includes('covenant') || lowerQuery.includes('violation')) {
      return {
        content: `**${companyName} Covenant Analysis:**

I'm analyzing covenant compliance across multiple credit facilities:

📊 **Tracking Items:**
• Debt Service Coverage Ratio (DSCR)
• Total Leverage Ratio
• Interest Coverage Ratio  
• Current Ratio
• Tangible Net Worth
• Fixed Charge Coverage

⚠️ **Violation Analysis:**
For each covenant, I examine:
• Current calculated value vs. threshold
• Trend analysis and forward projections
• Cure requirements and timeline
• Waiver negotiation strategies

Would you like me to generate a detailed covenant compliance dashboard or focus on specific ratios?`,
        confidence: 0.94,
        agentType: 'financial'
      };
    }

    if (lowerQuery.includes('liquidity') || lowerQuery.includes('cash') || lowerQuery.includes('runway')) {
      return {
        content: `**${companyName} Liquidity Analysis:**

💧 **Comprehensive Runway Modeling:**

**Current Position:**
• Available cash and cash equivalents
• Undrawn credit facility capacity
• Working capital optimization potential

**Burn Rate Analysis:**
• Monthly operating cash requirements
• Debt service obligations  
• Critical payment priorities

**Scenario Planning:**
• Base case: Current operational trajectory
• Upside case: Cost reduction and revenue improvement
• Downside case: Accelerated stress scenarios

I can generate detailed cash flow waterfalls and 13-week cash forecasts. Would you like me to create visual projections?`,
        confidence: 0.91,
        agentType: 'financial'
      };
    }

    if (lowerQuery.includes('capital') || lowerQuery.includes('structure') || lowerQuery.includes('recovery')) {
      return {
        content: `**${companyName} Capital Structure Analysis:**

🏗️ **Comprehensive Stack Review:**

**Debt Hierarchy:**
• Senior Secured (Asset-backed, typically 70-90% recovery)
• Senior Unsecured (30-60% recovery)  
• Subordinated Debt (5-25% recovery)
• Mezzanine/Preferred (0-15% recovery)
• Common Equity (0-5% recovery)

**Recovery Analysis:**
• Enterprise value scenarios
• Asset liquidation values
• Going concern vs. liquidation
• Intercreditor dynamics

**Strategic Implications:**
• Control dynamics and voting thresholds
• Amendment and waiver requirements
• Potential debt-to-equity conversions

Would you like me to model specific restructuring scenarios or generate recovery waterfall charts?`,
        confidence: 0.93,
        agentType: 'research'
      };
    }

    // Default enhanced response
    return {
      content: `I'm ready to provide detailed analysis for **${companyName}**${ticker ? ` (${ticker})` : ''}. 

**Available Analysis Capabilities:**
🔍 **Real-time covenant tracking** with violation alerts
💧 **Dynamic liquidity modeling** with scenario analysis
🏗️ **Capital structure optimization** with recovery projections  
⚠️ **Distress monitoring** with early warning indicators
📊 **Custom visualizations** for any metric or trend

**I can generate:**
• Interactive covenant compliance dashboards
• Cash flow waterfall charts
• Debt maturity wall visualizations  
• Recovery scenario models
• Investment committee presentations

What specific analysis would you like me to prepare? I can create both detailed reports and visual presentations.`,
      confidence: 0.90,
      agentType: 'coordinator'
    };
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    setAgentActivity([]);

    try {
      // Show enhanced agent activity simulation
      simulateEnhancedAgentActivity(currentQuery);
      
      // Get enhanced AI response with company context
      const response = await generateEnhancedResponse(currentQuery, !!companyData?.company?.name);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        confidence: response.confidence,
        agentType: response.agentType,
        sources: response.sources || [],
        visualizations: response.visualizations
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Generate new contextual suggestions after response
      setTimeout(() => {
        generateContextualSuggestions();
      }, 1000);
      
    } catch (error) {
      console.error('Enhanced chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: companyData?.company?.name 
          ? `I encountered an issue analyzing that query for ${companyData.company.name}. Could you please rephrase your question or try asking about specific financial metrics, covenant violations, or liquidity analysis?`
          : "I'd be happy to help! However, I need company data to provide specific analysis. Please upload documents in the Data Room first, then I can give you detailed insights about your company.",
        timestamp: new Date(),
        confidence: 0.5,
        agentType: 'coordinator',
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setAgentActivity([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content) => {
    // Enhanced markdown-like formatting for better readability
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/🔍|💧|🏗️|⚠️|📊|🔴|💡|⚡/g, '<span style="font-size: 1.1em;">$&</span>')
      .replace(/\n/g, '<br/>');
  };

  const getPlaceholderText = () => {
    if (companyData?.company?.name) {
      return `Ask me about ${companyData.company.name}'s financials, covenants, liquidity, or risk factors...`;
    }
    return "Ask me about distressed credit analysis, covenant tracking, or financial modeling...";
  };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setAgentActivity([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-600">Natural language financial analysis</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-br from-purple-500 to-blue-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-4 rounded-xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <div 
                        className={`${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                    </div>

                    {/* Message Meta */}
                    <div className={`mt-2 text-xs text-gray-500 ${message.type === 'user' ? 'text-right' : ''}`}>
                      {message.type === 'bot' && (
                        <>
                          <div className="flex items-center space-x-2">
                            {agentTypes[message.agentType] && (
                              <>
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-${agentTypes[message.agentType].color}-100`}>
                                  {React.createElement(agentTypes[message.agentType].icon, { 
                                    className: `w-3 h-3 text-${agentTypes[message.agentType].color}-600` 
                                  })}
                                  <span className={`text-${agentTypes[message.agentType].color}-700 text-xs font-medium`}>
                                    {agentTypes[message.agentType].name}
                                  </span>
                                </div>
                              </>
                            )}
                            {message.confidence && (
                              <span className="text-green-600 font-medium">
                                {Math.round(message.confidence * 100)}% confidence
                              </span>
                            )}
                          </div>
                        </>
                      )}
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-gray-600">AI agents are analyzing...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          {/* Sample Questions */}
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.slice(0, 3).map((question, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about BlueSky's financials, trends, or risks..."
                className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                rows="1"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                disabled={isTyping}
              />
            </div>
            <motion.button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Agent Activity Sidebar */}
      <AnimatePresence>
        {agentActivity.length > 0 && (
          <motion.div
            className="w-80 bg-white border-l border-gray-200 p-6"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Agent Activity</h3>
            </div>

            <div className="space-y-4">
              {agentActivity.map((activity) => {
                const agentInfo = agentTypes[activity.agent];
                const Icon = agentInfo?.icon || Brain;
                
                return (
                  <motion.div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.status === 'completed' 
                        ? 'bg-green-100' 
                        : 'bg-blue-100'
                    }`}>
                      {activity.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Icon className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {agentInfo?.name || 'Agent'}
                      </p>
                      <p className="text-xs text-gray-600">{activity.action}</p>
                      {activity.status === 'active' && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;