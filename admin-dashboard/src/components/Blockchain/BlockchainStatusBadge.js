import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import './BlockchainStatusBadge.css';

const BlockchainStatusBadge = () => {
    const [status, setStatus] = useState({
        connected: false,
        channel: 'ehr-channel',
        status: 'checking'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkBlockchainStatus();
        // Check status every 30 seconds
        const interval = setInterval(checkBlockchainStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const checkBlockchainStatus = async () => {
        try {
            const response = await apiService.audit.getBlockchainStatus();
            if (response.success) {
                setStatus(response.data);
            }
        } catch (error) {
            console.error('Failed to check blockchain status:', error);
            setStatus({
                connected: false,
                channel: 'ehr-channel',
                status: 'offline'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = () => {
        if (loading) return 'gray';
        return status.connected ? 'green' : 'red';
    };

    const getStatusText = () => {
        if (loading) return 'Checking...';
        return status.connected ? 'Online' : 'Offline';
    };

    return (
        <div className="blockchain-status-badge" title={`Blockchain: ${getStatusText()}\nChannel: ${status.channel}`}>
            <div className={`status-indicator ${getStatusColor()}`}></div>
            <span className="status-text">Blockchain</span>
        </div>
    );
};

export default BlockchainStatusBadge;
