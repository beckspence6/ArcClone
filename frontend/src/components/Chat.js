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
    `What is ${companyData.company.name}'s current financial performance?`,
    "What are the key investment risks and opportunities?",
    "How does this company compare to industry benchmarks?",
    "Generate an executive summary for the investment committee",
    "What are the main growth drivers for this business?"
  ] : [
    "How does Stratum's AI analysis work?",
    "What types of documents can I upload?",
    "How accurate is the financial analysis?",
    "What security measures protect my data?",
    "Can you integrate with my existing workflows?"
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
      revenue: {
        content: "Based on the latest financial data, BlueSky's LTM revenue is **$70.2M** as of Q3 2024, representing a **15% year-over-year growth**. The revenue has shown consistent growth over the past 5 quarters:\n\n• Q3 2023: $52M\n• Q4 2023: $54M\n• Q1 2024: $58M\n• Q2 2024: $62M\n• Q3 2024: $70M\n\nThis represents a strong upward trajectory with accelerating growth in recent quarters.",
        confidence: 0.96,
        agentType: 'financial'
      },
      margin: {
        content: "BlueSky's gross margin has shown **significant improvement** over the past 5 quarters:\n\n📈 **Current LTM Gross Margin: 81.3%**\n\n**Quarterly Trends:**\n• Q3 2023: 78%\n• Q4 2023: 76%\n• Q1 2024: 74%\n• Q2 2024: 72%\n• Q3 2024: 81%\n\nKey insights:\n✓ Strong margin expansion in Q3 2024\n✓ Improved operational efficiency\n✓ Better pricing power in the market\n✓ Above industry average of 75-80%",
        confidence: 0.94,
        agentType: 'insights'
      },
      risks: {
        content: "Based on my analysis of BlueSky's business model and financial data, here are the **key risks** to consider:\n\n🔴 **High Priority Risks:**\n• Customer concentration risk (need to verify top customer %)\n• Working capital challenges (negative working capital)\n• Debt service coverage with $15M long-term debt\n\n🟡 **Medium Priority Risks:**\n• Competitive pressure in SaaS project management space\n• Revenue predictability in subscription model\n• Talent retention in competitive tech market\n\n🟢 **Mitigating Factors:**\n• Strong cash position ($19.7M)\n• Improving margins indicate operational efficiency\n• Growing revenue base provides flexibility",
        confidence: 0.92,
        agentType: 'research'
      },
      default: {
        content: "I can help you analyze BlueSky's financial performance in detail. Based on the available data, the company shows strong fundamentals with $70.2M LTM revenue and improving 81.3% gross margins. Would you like me to dive deeper into any specific area like revenue trends, profitability, or risk assessment?",
        confidence: 0.90,
        agentType: 'coordinator'
      }
    };

    // Simple keyword matching for demo
    if (query.toLowerCase().includes('revenue') || query.toLowerCase().includes('ltm')) {
      return responses.revenue;
    } else if (query.toLowerCase().includes('margin') || query.toLowerCase().includes('gross')) {
      return responses.margin;
    } else if (query.toLowerCase().includes('risk') || query.toLowerCase().includes('challenge')) {
      return responses.risks;
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