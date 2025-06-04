import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Import all components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DataRoom from './components/DataRoom';
import Reports from './components/Reports';
import Chat from './components/Chat';
import Settings from './components/Settings';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({
    name: 'Brandon Jones',
    role: 'Lender Capital',
    company: 'BlueSky',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
  });

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'dataroom':
        return <DataRoom />;
      case 'reports':
        return <Reports />;
      case 'chat':
        return <Chat />;
      case 'settings':
        return <Settings user={user} setUser={setUser} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="flex">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          user={user}
        />
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-screen overflow-y-auto"
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;