import React, { useState } from 'react';
import LoginPage from './pages/LoginPage/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard'; 
import PatientsPage from './pages/PatientPage/PatientPage';
import ReportsPage from './pages/ReportPage/ReportPage';
import MessageEmergencyPage from './pages/MessageEmergencyPage/MessageEmergencyPage';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = () => {
    setIsLoggedIn(true);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      return <LoginPage onLogin={handleLogin} />;
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard 
                 onLogout={handleLogout} 
                 onNavigate={handleNavigate} 
                 activePage={activePage} 
               />;
      case 'patients':
        return <PatientsPage 
                 onLogout={handleLogout} 
                 onNavigate={handleNavigate} 
                 activePage={activePage} 
               />;
      case 'reports':
        return <ReportsPage 
                 onLogout={handleLogout} 
                 onNavigate={handleNavigate} 
                 activePage={activePage} 
               />;
      case 'messageemergency':
          return <MessageEmergencyPage 
                   onLogout={handleLogout} 
                   onNavigate={handleNavigate} 
                   activePage={activePage} 
                 />;
      default:
        return <Dashboard 
                 onLogout={handleLogout} 
                 onNavigate={handleNavigate} 
                 activePage={activePage} 
               />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
}

export default App;