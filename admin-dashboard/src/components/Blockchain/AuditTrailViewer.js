import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './AuditTrailViewer.css';

const AuditTrailViewer = ({ resourceId, resourceType = 'patient' }) => {
    const [auditTrail, setAuditTrail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (resourceId) {
            fetchAuditTrail();
        }
    }, [resourceId]);

    const fetchAuditTrail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.audit.getAuditTrail(`${resourceType}:${resourceId}`);

            if (response.success) {
                setAuditTrail(response.data || []);
            } else {
                setAuditTrail([]);
            }
        } catch (err) {
            console.error('Failed to fetch audit trail:', err);
            setError('Failed to load audit trail. Blockchain may be unavailable.');
            setAuditTrail([]);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionIcon = (action) => {
        const icons = {
            'CREATE_PATIENT': '➕',
            'UPDATE_PATIENT': '✏️',
            'VIEW_PATIENT': '👁️',
            'CREATE_REPORT': '📄',
            'VIEW_REPORT': '👁️',
            'DOWNLOAD_REPORT': '⬇️',
            'CREATE_TRANSFER': '🔄',
            'APPROVE_TRANSFER': '✅',
            'DENY_TRANSFER': '❌'
        };
        return icons[action] || '📝';
    };

    const getActionLabel = (action) => {
        return action.replace(/_/g, ' ').toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const copyTxId = (txId) => {
        navigator.clipboard.writeText(txId);
        // Could add a toast notification here
    };

    if (loading) {
        return (
            <div className="audit-trail-loading">
                <LoadingSpinner size="small" />
                <p>Loading audit trail...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="audit-trail-error">
                <p>{error}</p>
            </div>
        );
    }

    if (auditTrail.length === 0) {
        return (
            <div className="audit-trail-empty">
                <p>No audit trail available. Blockchain may be offline.</p>
            </div>
        );
    }

    return (
        <div className="audit-trail-viewer">
            <div className="audit-trail-header">
                <h3>Audit Trail</h3>
                <span className="audit-count">{auditTrail.length} events</span>
            </div>

            <div className="audit-trail-timeline">
                {auditTrail.map((event, index) => (
                    <div key={index} className="audit-event">
                        <div className="event-marker">
                            <span className="event-icon">{getActionIcon(event.action)}</span>
                        </div>

                        <div className="event-content">
                            <div className="event-header">
                                <span className="event-action">{getActionLabel(event.action)}</span>
                                <span className="event-time">{formatTimestamp(event.timestamp)}</span>
                            </div>

                            <div className="event-details">
                                <div className="event-detail">
                                    <span className="detail-label">User:</span>
                                    <span className="detail-value">{event.userId || 'System'}</span>
                                </div>

                                {event.txId && (
                                    <div className="event-detail">
                                        <span className="detail-label">TX ID:</span>
                                        <span
                                            className="detail-value tx-id"
                                            onClick={() => copyTxId(event.txId)}
                                            title="Click to copy"
                                        >
                                            {event.txId.substring(0, 16)}...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuditTrailViewer;
