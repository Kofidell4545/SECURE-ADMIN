import React, { useState, useEffect } from 'react';
import './SessionTimeout.css';

const SessionTimeout = ({ isOpen, timeRemaining, onExtend, onLogout }) => {
    const [countdown, setCountdown] = useState(timeRemaining);

    useEffect(() => {
        if (isOpen) {
            setCountdown(timeRemaining);

            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isOpen, timeRemaining]);

    if (!isOpen) return null;

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
        <div className="session-timeout-overlay">
            <div className="session-timeout-dialog">
                <div className="session-timeout-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                </div>

                <h3 className="session-timeout-title">Session Expiring Soon</h3>

                <p className="session-timeout-message">
                    Your session will expire in <strong>{minutes}:{seconds.toString().padStart(2, '0')}</strong> due to inactivity.
                </p>

                <p className="session-timeout-info">
                    For your security, we automatically log you out after 15 minutes of inactivity.
                </p>

                <div className="session-timeout-actions">
                    <button
                        className="session-timeout-btn session-timeout-btn-secondary"
                        onClick={onLogout}
                    >
                        Logout Now
                    </button>
                    <button
                        className="session-timeout-btn session-timeout-btn-primary"
                        onClick={onExtend}
                    >
                        Stay Logged In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeout;
