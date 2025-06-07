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
  ThumbsDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import AgentCoordinator from '../services/agentCoordinator';

const Chat = ({ companyData }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: companyData?.company?.name 
        ? `Hello! I'm your AI assistant for ${companyData.company.name}. I can help you analyze financial data, generate insights, and answer questions about the company's performance. What would you like to explore?`
        : "Hello! I'm your AI assistant. Upload documents in the Data Room first, and I'll be able to provide detailed analysis and insights about your company. What can I help you with?",
      timestamp: new Date(),
      confidence: 0.98,
      agentType: 'coordinator',
      hasCompanyContext: !!companyData
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentActivity, setAgentActivity] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const agentTypes = {
    coordinator: { name: 'Coordinator Agent', icon: Brain, color: 'blue' },
    financial: { name: 'Financial Analyst', icon: BarChart3, color: 'green' },
    research: { name: 'Research Agent', icon: FileText, color: 'purple' },
    insights: { name: 'Insights Agent', icon: TrendingUp, color: 'orange' }
  };

  const sampleQuestions = companyData?.company?.name ? [
    `What is ${companyData.company.name}'s current distress situation?`,
    "Analyze the covenant violations and their implications",
    "What's the liquidity runway and burn rate analysis?",
    "Explain the capital structure and recovery scenarios",
    "What are the most critical risk flags to monitor?",
    "Generate an investment committee memo",
    "What are potential restructuring scenarios?",
    "How does the maturity wall impact near-term liquidity?"
  ] : [
    "How does Stratum's distressed credit analysis work?",
    "What types of documents can I upload for analysis?",
    "How accurate is the covenant tracking system?",
    "What security measures protect my data?",
    "Can you integrate with my existing credit systems?",
    "How do you calculate distress scores?",
    "What makes your analysis different from others?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateAgentActivity = (query) => {
    const activities = [
      { agent: 'coordinator', action: 'Planning analysis approach', duration: 1000 },
      { agent: 'research', action: 'Searching financial documents', duration: 1500 },
      { agent: 'financial', action: 'Processing revenue data', duration: 2000 },
      { agent: 'insights', action: 'Generating insights', duration: 1000 }
    ];

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

  const generateResponse = (query) => {
    const responses = {
      distress: {
        content: "Based on the distressed credit analysis, the company shows **critical risk indicators**:\n\n🔴 **Distress Score: 73/100 (High Risk)**\n\n**Key Concerns:**\n• **Covenant Violations:** DSCR at 1.15 vs 1.25 requirement\n• **Leverage Ratio:** 6.8x vs 6.0x maximum\n• **Liquidity Runway:** Only 8.3 months remaining\n• **Debt Maturity:** $75M due March 2025\n\n**Immediate Actions Required:**\n✓ Negotiate covenant waivers\n✓ Secure additional liquidity\n✓ Develop restructuring scenarios",
        confidence: 0.94,
        agentType: 'insights'
      },
      covenant: {
        content: "**Covenant Analysis Summary:**\n\n🔴 **Active Violations (2):**\n• **DSCR:** 1.15 vs 1.25 minimum (Critical)\n• **Total Leverage:** 6.8x vs 6.0x maximum (Critical)\n\n🟡 **Watch Items (1):**\n• **Tangible Net Worth:** $185.2M vs $200M minimum\n\n🟢 **Compliant (2):**\n• Interest Coverage: 2.1x vs 2.0x minimum\n• Current Ratio: 1.3x vs 1.2x minimum\n\n**Implications:**\n• Potential acceleration rights triggered\n• Default interest rates may apply\n• Amendment/waiver negotiations likely required",
        confidence: 0.96,
        agentType: 'financial'
      },
      liquidity: {
        content: "**Liquidity Analysis:**\n\n💧 **Current Runway: 8.3 months**\n\n**Cash Flow Breakdown:**\n• Current Cash: $14.2M\n• Monthly Burn: $8.7M\n• Runway at current burn: 8.3 months\n\n**Liquidity Sources:**\n• Undrawn credit facility: $25M\n• Working capital optimization: ~$15M\n• Asset sales potential: $30-50M\n\n**Recommendations:**\n• Immediate cost reduction program\n• Draw down available credit facilities\n• Accelerate collections\n• Defer non-critical capex",
        confidence: 0.93,
        agentType: 'financial'
      },
      structure: {
        content: "**Capital Structure Analysis:**\n\n**Total Capital: $514.8M**\n\n**Debt Ranking & Recovery:**\n🥇 Senior Secured: $185.5M (85% recovery)\n🥈 Senior Unsecured: $124.8M (45% recovery)\n🥉 Subordinated: $67.2M (15% recovery)\n\n**Equity:**\n• Preferred: $45.0M (5% recovery)\n• Common: $92.3M (0% recovery)\n\n**Weighted Recovery Rate: 48%**\n\n**Strategic Implications:**\n• Senior secured lenders in strong position\n• Significant value destruction for equity\n• Potential debt-to-equity conversion scenarios",
        confidence: 0.92,
        agentType: 'research'
      },
      default: {
        content: "I can help you analyze this distressed credit situation in detail. Based on the available data, the company shows significant stress indicators with a distress score of 73/100. Would you like me to dive deeper into:\n\n🔍 **Covenant violations and implications**\n💧 **Liquidity runway analysis**\n🏗️ **Capital structure and recovery scenarios**\n⚠️ **Critical risk flags and timeline**\n📊 **Maturity wall and refinancing needs**\n\nWhich area would you like to explore first?",
        confidence: 0.90,
        agentType: 'coordinator'
      }
    };

    // Enhanced keyword matching for distressed credit
    if (query.toLowerCase().includes('distress') || query.toLowerCase().includes('risk')) {
      return responses.distress;
    } else if (query.toLowerCase().includes('covenant') || query.toLowerCase().includes('violation')) {
      return responses.covenant;
    } else if (query.toLowerCase().includes('liquidity') || query.toLowerCase().includes('cash') || query.toLowerCase().includes('runway')) {
      return responses.liquidity;
    } else if (query.toLowerCase().includes('capital') || query.toLowerCase().includes('structure') || query.toLowerCase().includes('recovery')) {
      return responses.structure;
    } else {
      return responses.default;
    }
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
      // Show agent activity simulation
      simulateAgentActivity(currentQuery);
      
      // Get AI response
      const response = await AgentCoordinator.chatWithAI(currentQuery, companyData);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response || "I apologize, but I'm having trouble processing your request at the moment. Please try again.",
        timestamp: new Date(),
        confidence: response.confidence || 0.85,
        agentType: response.agentType || 'coordinator',
        sources: response.sources || []
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: companyData 
          ? "I encountered an issue analyzing that query. Could you please rephrase your question or try asking about specific financial metrics?"
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