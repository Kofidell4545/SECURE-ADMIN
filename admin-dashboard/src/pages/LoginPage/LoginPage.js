import React, { useState } from 'react';
import logo from "../../assets/images/logo.svg";
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username) {
      alert('Please enter your NPI or email address');
      return;
    }
    
    // In a real application, you would validate credentials here
    console.log('Login attempt with:', username);
    
    // Call the onLogin function to update state in parent component
    onLogin();
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
          <label htmlFor="username">NPI or email address*</label>
          <input 
            type="text" 
            id="username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <button type="submit" className="continue-btn">Continue</button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button className="google-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
            <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
          </svg>
          Sign in with GMDC/Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;