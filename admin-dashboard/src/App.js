import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import PatientsPage from './pages/PatientPage/PatientPage';
import ReportsPage from './pages/ReportPage/ReportPage';
import MessageEmergencyPage from './pages/MessageEmergencyPage/MessageEmergencyPage';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import SessionTimeout from './components/SessionTimeout/SessionTimeout';
import { ToastProvider, useToast } from './context/ToastContext';
import sessionManager from './services/sessionManager';
import './App.css';

function AppContent() {
  // Initialize state from localStorage or use defaults
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    return savedLoginState === 'true';
  });

  const [activePage, setActivePage] = useState(() => {
    const savedActivePage = localStorage.getItem('activePage');
    return savedActivePage || 'dashboard';
  });

  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const { showWarning, showInfo } = useToast();

  // Persist login state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  // Persist active page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activePage', activePage);
  }, [activePage]);

  // Initialize session management when logged in
  useEffect(() => {
    if (isLoggedIn) {
      // Initialize session manager
      sessionManager.init(
        // On timeout callback
        () => {
          handleSessionTimeout();
        },
        // On warning callback
        () => {
          setShowTimeoutWarning(true);
        }
      );

      return () => {
        // Cleanup on unmount or logout
        sessionManager.stopMonitoring();
      };
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setActivePage('dashboard');
    showInfo('Welcome! Your session will expire after 15 minutes of inactivity.');
  };

  const handleLogout = () => {
    sessionManager.endSession();
    setIsLoggedIn(false);
    setActivePage('dashboard');
    setShowTimeoutWarning(false);
    // Clear localStorage on logout
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('activePage');
  };

  const handleSessionTimeout = () => {
    setShowTimeoutWarning(false);
    handleLogout();
    showWarning('Your session has expired due to inactivity. Please log in again.');
  };

  const handleExtendSession = () => {
    sessionManager.extendSession();
    setShowTimeoutWarning(false);
    showInfo('Session extended. You will remain logged in.');
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
    <>
      <div className="app">
        {renderPage()}
      </div>

      {/* Session Timeout Warning */}
      {isLoggedIn && (
        <SessionTimeout
          isOpen={showTimeoutWarning}
          timeRemaining={120} // 2 minutes in seconds
          onExtend={handleExtendSession}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;