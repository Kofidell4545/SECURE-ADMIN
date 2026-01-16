import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

const apiService = {
    // Authentication
    auth: {
        login: async (email, password) => {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        },

        register: async (userData) => {
            const response = await api.post('/auth/register', userData);
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        },

        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },

        getCurrentUser: async () => {
            const response = await api.get('/auth/me');
            return response.data;
        },
    },

    // Patients
    patient: {
        getAll: async (params = {}) => {
            const response = await api.get('/patients', { params });
            return response.data.data;
        },

        getById: async (id) => {
            const response = await api.get(`/patients/${id}`);
            return response.data.data;
        },

        add: async (patientData) => {
            const response = await api.post('/patients', patientData);
            return response.data.data;
        },

        update: async (id, patientData) => {
            const response = await api.put(`/patients/${id}`, patientData);
            return response.data.data;
        },

        delete: async (id) => {
            const response = await api.delete(`/patients/${id}`);
            return response.data.success;
        },

        search: async (query) => {
            const response = await api.get('/patients', { params: { search: query } });
            return response.data.data;
        },

        filter: async (status) => {
            const response = await api.get('/patients', { params: { status } });
            return response.data.data;
        },
    },

    // Reports
    report: {
        getAll: async (params = {}) => {
            const response = await api.get('/reports', { params });
            return response.data.data;
        },

        getById: async (id) => {
            const response = await api.get(`/reports/${id}`);
            return response.data.data;
        },

        add: async (reportData) => {
            const response = await api.post('/reports', reportData);
            return response.data.data;
        },

        addWithFile: async (formData) => {
            const response = await api.post('/reports', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        },

        download: async (id) => {
            const response = await api.get(`/reports/${id}/download`, {
                responseType: 'blob',
            });
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers['content-disposition'];
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : 'report.pdf';
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },

        delete: async (id) => {
            const response = await api.delete(`/reports/${id}`);
            return response.data.success;
        },

        getByPatient: async (patientId) => {
            const response = await api.get('/reports', { params: { patientId } });
            return response.data.data;
        },

        getByCategory: async (category) => {
            const response = await api.get('/reports', { params: { category } });
            return response.data.data;
        },
    },

    // Transfers
    transfer: {
        getAll: async (params = {}) => {
            const response = await api.get('/transfers', { params });
            return response.data.data;
        },

        getById: async (id) => {
            const response = await api.get(`/transfers/${id}`);
            return response.data.data;
        },

        add: async (transferData) => {
            const response = await api.post('/transfers', transferData);
            return response.data.data;
        },

        updateStatus: async (id, status, reviewedBy) => {
            const response = await api.put(`/transfers/${id}/status`, {
                status,
                reviewedBy,
            });
            return response.data.data;
        },

        delete: async (id) => {
            const response = await api.delete(`/transfers/${id}`);
            return response.data.success;
        },

        getByStatus: async (status) => {
            const response = await api.get('/transfers', { params: { status } });
            return response.data.data;
        },
    },

    // Dashboard stats
    dashboard: {
        getStats: async () => {
            // Get all data and calculate stats
            const [patients, reports, transfers] = await Promise.all([
                api.get('/patients'),
                api.get('/reports'),
                api.get('/transfers'),
            ]);

            const activePatients = patients.data.data.filter(p => p.status === 'Active').length;
            const pendingReports = reports.data.data.length;
            const pendingTransfers = transfers.data.data.filter(t => t.status === 'Pending').length;

            return {
                totalPatients: patients.data.count,
                activeAppointments: activePatients,
                treatmentSuccess: 0, // Calculate based on your logic
                pendingReports: pendingReports,
            };
        },

        getRecentActivity: async () => {
            // Get recent patients and format as activity
            const response = await api.get('/patients', { params: { limit: 5 } });
            return response.data.data.map(patient => ({
                action: 'New Patient Registration',
                user: 'Robert Davis',
                time: patient.createdAt,
                details: patient.name,
            }));
        },
    },

    // Audit & Blockchain
    audit: {
        getAuditTrail: async (resourceId) => {
            const response = await api.get(`/audit/trail/${resourceId}`);
            return response.data;
        },

        getPatientHistory: async (patientId) => {
            const response = await api.get(`/audit/patient/${patientId}/history`);
            return response.data;
        },

        getBlockchainStatus: async () => {
            const response = await api.get('/audit/blockchain/status');
            return response.data;
        },
    },
};

export default apiService;
