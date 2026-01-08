import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
    size = 'medium',
    overlay = false,
    text = 'Loading...',
    fullPage = false
}) => {
    const spinnerContent = (
        <div className={`loading-spinner-wrapper ${fullPage ? 'full-page' : ''}`}>
            <div className={`loading-spinner loading-spinner-${size}`}>
                <div className="spinner-circle"></div>
                <div className="spinner-circle"></div>
                <div className="spinner-circle"></div>
            </div>
            {text && <p className="loading-text">{text}</p>}
        </div>
    );

    if (overlay || fullPage) {
        return (
            <div className={`loading-overlay ${fullPage ? 'full-page' : ''}`}>
                {spinnerContent}
            </div>
        );
    }

    return spinnerContent;
};

export default LoadingSpinner;
