import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  ChevronRight, 
  Play, 
  BarChart3, 
  Brain, 
  Shield, 
  Zap,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  Check,
  Star,
  Clock,
  Target,
  Lightbulb,
  Rocket,
  Award
} from 'lucide-react';
import StratumLogo from './Logo';

const LandingPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze financial documents and generate comprehensive insights in seconds.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Real-Time Data",
      description: "Live market data integration with automated financial metrics calculation and trend analysis.",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 compliant with advanced encryption, multi-factor authentication, and complete data ownership.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process complex financial analysis that traditionally takes hours in just minutes with our agentic AI system.",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const stats = [
    { number: "10x", label: "Faster Analysis", icon: TrendingUp },
    { number: "99.9%", label: "Accuracy Rate", icon: Check },
    { number: "500+", label: "Companies Analyzed", icon: Building2 },
    { number: "24/7", label: "AI Availability", icon: Brain }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Investment Director",
      company: "Venture Capital Firm",
      quote: "Stratum has revolutionized our due diligence process. What used to take weeks now takes hours.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Credit Analyst",
      company: "Private Equity Fund",
      quote: "The AI insights are incredibly accurate and have helped us identify opportunities we would have missed.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Portfolio Manager",
      company: "Asset Management",
      quote: "The real-time financial data integration is a game-changer for our investment decisions.",
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    const userData = {
      email: email || 'demo@stratum.ai',
      name: 'Demo User',
      company: 'Stratum Demo',
      role: 'Analyst',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    };
    onLogin(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <StratumLogo size="medium" />
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#demo" className="text-gray-300 hover:text-white transition-colors">Demo</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <motion.button
                onClick={handleGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 backdrop-blur-lg rounded-full px-4 py-2 border border-blue-500/20 mb-6">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">AI-Powered Financial Intelligence</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-none">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Transform
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Hours Into
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Seconds
                </span>
              </h1>
            </motion.div>

            <motion.p 
              className="text-xl text-gray-300 leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Revolutionary AI agents analyze financial documents, extract insights, and generate comprehensive investment reports in seconds—not hours.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row items-start gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
                <input
                  type="email"
                  placeholder="Enter your email to get started"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent px-6 py-4 text-white placeholder-gray-400 outline-none w-80"
                />
                <motion.button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Start Analysis</span>
                  <Rocket className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-8 pt-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { icon: Clock, label: "10x Faster", value: "Analysis" },
                { icon: Target, label: "99.9%", value: "Accuracy" },
                { icon: Brain, label: "5 AI", value: "Agents" }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-2xl font-bold text-white">{stat.label}</span>
                    </div>
                    <p className="text-sm text-gray-400">{stat.value}</p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* 3D Interactive Spline Model */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-lg border border-white/10">
              {/* Spline 3D Model */}
              <iframe 
                src='https://my.spline.design/stockicon-VZD2Lap19cSFZNNjcZR9zgEC/' 
                frameBorder='0' 
                width='100%' 
                height='100%'
                className="rounded-3xl"
                title="Interactive Stock Market Visualization"
              />
              
              {/* Overlay with interaction hint */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Interactive • Click and drag to explore</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Value Propositions Floating Cards */}
        <motion.div 
          className="absolute top-1/4 left-8 hidden xl:block"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-white font-semibold">AI Insights</p>
                <p className="text-gray-300 text-sm">Instant Analysis</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="absolute top-1/3 right-8 hidden xl:block"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-white font-semibold">Enterprise Grade</p>
                <p className="text-gray-300 text-sm">SOC 2 Compliant</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of financial analysis with our comprehensive AI-powered platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              See It In Action
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Watch how Stratum transforms complex financial analysis into actionable insights
            </p>
          </motion.div>

          <motion.div 
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="aspect-video bg-black/30 rounded-xl flex items-center justify-center relative overflow-hidden">
              <motion.button
                onClick={handleGetStarted}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center hover:bg-white/30 transition-colors group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
              </motion.button>
              
              {/* Mock Dashboard Preview */}
              <div className="absolute inset-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg opacity-60">
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <StratumLogo size="small" />
                    <div className="h-4 bg-white/20 rounded w-32"></div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 bg-blue-500/20 rounded"></div>
                    ))}
                  </div>
                  <div className="h-32 bg-white/10 rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Trusted by Leaders
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  <p className="text-gray-500 text-sm">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Transform Your Analysis?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join hundreds of investment professionals who trust Stratum for their financial analysis needs.
            </p>
            
            <motion.button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Start Your Free Trial</span>
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <StratumLogo size="medium" />
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400">© 2024 Stratum. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;