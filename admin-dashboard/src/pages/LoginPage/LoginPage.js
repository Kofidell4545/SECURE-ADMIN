import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import apiService from '../../services/apiService';
import logo from "../../assets/images/logo.svg";
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      showError('Please enter both email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      showError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Call real API
      const response = await apiService.auth.login(email, password);

      if (response.success) {
        showSuccess(`Welcome back, ${response.user.name}!`);

        // Call the onLogin function to update state in parent component
        setTimeout(() => {
          onLogin();
        }, 500);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 'Login failed. Please check your credentials.';
      showError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container">
          <img src={logo} alt="Secure Logo" className="logo" />
        </div>

        <h1>Welcome</h1>
        <p>Log in to continue to Secure.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address*</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(''); // Clear error on input change
            }}
            disabled={isLoading}
            className={error ? 'input-error' : ''}
            placeholder="Enter your email"
            autoComplete="email"
          />

          <label htmlFor="password">Password*</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(''); // Clear error on input change
            }}
            disabled={isLoading}
            className={error ? 'input-error' : ''}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className={`continue-btn ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button className="google-btn" disabled={isLoading}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
            <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
          </svg>
          Sign in with GMDC/Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;