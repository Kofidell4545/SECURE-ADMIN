import React from 'react';
import './FileIntegrityBadge.css';

const FileIntegrityBadge = ({ verified, hash }) => {
    const getStatusInfo = () => {
        if (verified === null || verified === undefined) {
            return {
                icon: '🔒',
                text: 'Unknown',
                className: 'unknown',
                title: 'File integrity status unknown'
            };
        }

        if (verified) {
            return {
                icon: '✓',
                text: 'Verified',
                className: 'verified',
                title: `File integrity verified\nSHA-256: ${hash?.substring(0, 16)}...`
            };
        }

        return {
            icon: '⚠',
            text: 'Tampered',
            className: 'tampered',
            title: 'File integrity check failed! File may have been modified.'
        };
    };

    const status = getStatusInfo();

    return (
        <div className={`file-integrity-badge ${status.className}`} title={status.title}>
            <span className="badge-icon">{status.icon}</span>
            <span className="badge-text">{status.text}</span>
        </div>
    );
};

export default FileIntegrityBadge;
