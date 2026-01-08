// Data Service for SECURE EHR System
// Handles all data operations with localStorage persistence

const STORAGE_KEYS = {
    PATIENTS: 'secure_patients',
    REPORTS: 'secure_reports',
    TRANSFERS: 'secure_transfers',
    INITIALIZED: 'secure_initialized'
};

// ===================================
// Utility Functions
// ===================================

const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
};

const getFromStorage = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
};

// ===================================
// Mock Data Generation
// ===================================

const generateMockPatients = () => {
    return [
        {
            id: generateId(),
            name: "Emma Thompson",
            age: 34,
            gender: "Female",
            bloodType: "A+",
            npi: "1234567890",
            email: "emma.thompson@email.com",
            phone: "(555) 123-4567",
            address: "123 Main St, Boston, MA 02101",
            medicalHistory: "Regular checkups, no major conditions",
            allergies: ["Penicillin"],
            currentMedications: ["Multivitamin"],
            lastVisit: new Date(2025, 3, 15).toISOString(),
            nextAppointment: new Date(2025, 5, 10).toISOString(),
            status: "Active",
            createdAt: new Date(2024, 0, 15).toISOString(),
            updatedAt: new Date(2025, 3, 15).toISOString()
        },
        {
            id: generateId(),
            name: "James Peterson",
            age: 45,
            gender: "Male",
            bloodType: "O-",
            npi: "2345678901",
            email: "james.peterson@email.com",
            phone: "(555) 234-5678",
            address: "456 Oak Ave, Boston, MA 02102",
            medicalHistory: "Hypertension, managed with medication",
            allergies: [],
            currentMedications: ["Lisinopril 10mg"],
            lastVisit: new Date(2025, 3, 10).toISOString(),
            nextAppointment: new Date(2025, 4, 20).toISOString(),
            status: "Active",
            createdAt: new Date(2024, 1, 20).toISOString(),
            updatedAt: new Date(2025, 3, 10).toISOString()
        },
        {
            id: generateId(),
            name: "Sophia Martinez",
            age: 28,
            gender: "Female",
            bloodType: "B+",
            npi: "3456789012",
            email: "sophia.martinez@email.com",
            phone: "(555) 345-6789",
            address: "789 Pine Rd, Boston, MA 02103",
            medicalHistory: "Pregnancy - 2nd trimester",
            allergies: ["Latex"],
            currentMedications: ["Prenatal vitamins"],
            lastVisit: new Date(2025, 3, 12).toISOString(),
            nextAppointment: new Date(2025, 4, 15).toISOString(),
            status: "Active",
            createdAt: new Date(2024, 8, 10).toISOString(),
            updatedAt: new Date(2025, 3, 12).toISOString()
        },
        {
            id: generateId(),
            name: "Michael Chen",
            age: 52,
            gender: "Male",
            bloodType: "AB-",
            npi: "4567890123",
            email: "michael.chen@email.com",
            phone: "(555) 456-7890",
            address: "321 Elm St, Boston, MA 02104",
            medicalHistory: "Type 2 Diabetes, well controlled",
            allergies: [],
            currentMedications: ["Metformin 500mg", "Atorvastatin 20mg"],
            lastVisit: new Date(2025, 3, 8).toISOString(),
            nextAppointment: new Date(2025, 5, 5).toISOString(),
            status: "Active",
            createdAt: new Date(2023, 11, 5).toISOString(),
            updatedAt: new Date(2025, 3, 8).toISOString()
        },
        {
            id: generateId(),
            name: "Olivia Wilson",
            age: 19,
            gender: "Female",
            bloodType: "O+",
            npi: "5678901234",
            email: "olivia.wilson@email.com",
            phone: "(555) 567-8901",
            address: "654 Maple Dr, Boston, MA 02105",
            medicalHistory: "Annual physical exams, healthy",
            allergies: [],
            currentMedications: [],
            lastVisit: new Date(2025, 3, 5).toISOString(),
            nextAppointment: new Date(2026, 3, 5).toISOString(),
            status: "Active",
            createdAt: new Date(2024, 6, 1).toISOString(),
            updatedAt: new Date(2025, 3, 5).toISOString()
        }
    ];
};

// ===================================
// Patient Management
// ===================================

export const patientService = {
    // Get all patients
    getAll: () => {
        return getFromStorage(STORAGE_KEYS.PATIENTS) || [];
    },

    // Get patient by ID
    getById: (id) => {
        const patients = patientService.getAll();
        return patients.find(p => p.id === id);
    },

    // Add new patient
    add: (patientData) => {
        const patients = patientService.getAll();
        const newPatient = {
            ...patientData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: patientData.status || 'Active'
        };
        patients.push(newPatient);
        saveToStorage(STORAGE_KEYS.PATIENTS, patients);
        return newPatient;
    },

    // Update patient
    update: (id, updates) => {
        const patients = patientService.getAll();
        const index = patients.findIndex(p => p.id === id);
        if (index !== -1) {
            patients[index] = {
                ...patients[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            saveToStorage(STORAGE_KEYS.PATIENTS, patients);
            return patients[index];
        }
        return null;
    },

    // Delete patient
    delete: (id) => {
        const patients = patientService.getAll();
        const filtered = patients.filter(p => p.id !== id);
        saveToStorage(STORAGE_KEYS.PATIENTS, filtered);
        return filtered.length < patients.length;
    },

    // Search patients
    search: (query) => {
        const patients = patientService.getAll();
        const lowerQuery = query.toLowerCase();
        return patients.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.email.toLowerCase().includes(lowerQuery) ||
            p.npi.includes(query)
        );
    },

    // Filter by status
    filterByStatus: (status) => {
        const patients = patientService.getAll();
        return status === 'All' ? patients : patients.filter(p => p.status === status);
    }
};

// ===================================
// Report Management
// ===================================

export const reportService = {
    // Get all reports
    getAll: () => {
        return getFromStorage(STORAGE_KEYS.REPORTS) || [];
    },

    // Get reports by patient ID
    getByPatientId: (patientId) => {
        const reports = reportService.getAll();
        return reports.filter(r => r.patientId === patientId);
    },

    // Get reports by category
    getByCategory: (patientId, category) => {
        const reports = reportService.getByPatientId(patientId);
        return reports.filter(r => r.category === category);
    },

    // Add new report
    add: (reportData) => {
        const reports = reportService.getAll();
        const newReport = {
            ...reportData,
            id: generateId(),
            createdAt: new Date().toISOString()
        };
        reports.push(newReport);
        saveToStorage(STORAGE_KEYS.REPORTS, reports);
        return newReport;
    },

    // Delete report
    delete: (id) => {
        const reports = reportService.getAll();
        const filtered = reports.filter(r => r.id !== id);
        saveToStorage(STORAGE_KEYS.REPORTS, filtered);
        return filtered.length < reports.length;
    }
};

// ===================================
// Transfer Management
// ===================================

export const transferService = {
    // Get all transfers
    getAll: () => {
        return getFromStorage(STORAGE_KEYS.TRANSFERS) || [];
    },

    // Get transfer by ID
    getById: (id) => {
        const transfers = transferService.getAll();
        return transfers.find(t => t.id === id);
    },

    // Add new transfer
    add: (transferData) => {
        const transfers = transferService.getAll();
        const newTransfer = {
            ...transferData,
            id: generateId(),
            status: 'Pending',
            requestedAt: new Date().toISOString()
        };
        transfers.push(newTransfer);
        saveToStorage(STORAGE_KEYS.TRANSFERS, transfers);
        return newTransfer;
    },

    // Update transfer status
    updateStatus: (id, status, reviewedBy) => {
        const transfers = transferService.getAll();
        const index = transfers.findIndex(t => t.id === id);
        if (index !== -1) {
            transfers[index] = {
                ...transfers[index],
                status,
                reviewedBy,
                reviewedAt: new Date().toISOString()
            };
            saveToStorage(STORAGE_KEYS.TRANSFERS, transfers);
            return transfers[index];
        }
        return null;
    },

    // Filter by status
    filterByStatus: (status) => {
        const transfers = transferService.getAll();
        return status === 'All' ? transfers : transfers.filter(t => t.status === status);
    }
};

// ===================================
// Dashboard Statistics
// ===================================

export const dashboardService = {
    getStats: () => {
        const patients = patientService.getAll();
        const reports = reportService.getAll();
        const transfers = transferService.getAll();

        // Calculate appointments (patients with upcoming appointments)
        const now = new Date();
        const appointments = patients.filter(p => {
            if (!p.nextAppointment) return false;
            const appointmentDate = new Date(p.nextAppointment);
            return appointmentDate > now;
        }).length;

        // Calculate treatment success (simplified - patients with recent visits)
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const recentVisits = patients.filter(p => {
            if (!p.lastVisit) return false;
            const lastVisit = new Date(p.lastVisit);
            return lastVisit > thirtyDaysAgo;
        }).length;
        const successRate = patients.length > 0 ? Math.round((recentVisits / patients.length) * 100) : 0;

        // Pending reports
        const pendingReports = reports.filter(r => !r.reviewed).length;

        return {
            totalPatients: patients.length,
            activeAppointments: appointments,
            treatmentSuccess: successRate,
            pendingReports: pendingReports || 7 // Default to 7 for demo
        };
    },

    getRecentActivity: () => {
        const reports = reportService.getAll();
        const transfers = transferService.getAll();
        const patients = patientService.getAll();

        // Combine and sort recent activities
        const activities = [
            ...reports.slice(-5).map(r => ({
                type: 'report',
                action: 'Medical Record Updated',
                user: r.author || 'Dr. Smith',
                time: r.createdAt,
                patientId: r.patientId
            })),
            ...transfers.slice(-5).map(t => ({
                type: 'transfer',
                action: t.type === 'Emergency' ? 'Emergency Transfer' : 'Patient Referral',
                user: t.requestedBy || 'Dr. Johnson',
                time: t.requestedAt,
                patientId: t.patientId
            })),
            ...patients.slice(-3).map(p => ({
                type: 'patient',
                action: 'New Patient Registration',
                user: 'Robert Davis',
                time: p.createdAt,
                patientId: p.id
            }))
        ];

        // Sort by time (most recent first)
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        return activities.slice(0, 5);
    }
};

// ===================================
// Initialization
// ===================================

export const initializeData = () => {
    const isInitialized = getFromStorage(STORAGE_KEYS.INITIALIZED);

    if (!isInitialized) {
        // Initialize with mock data
        const mockPatients = generateMockPatients();
        saveToStorage(STORAGE_KEYS.PATIENTS, mockPatients);
        saveToStorage(STORAGE_KEYS.REPORTS, []);
        saveToStorage(STORAGE_KEYS.TRANSFERS, []);
        saveToStorage(STORAGE_KEYS.INITIALIZED, true);

        console.log('Data initialized with mock patients');
    }
};

// Auto-initialize on import
initializeData();

export default {
    patient: patientService,
    report: reportService,
    transfer: transferService,
    dashboard: dashboardService,
    initialize: initializeData
};
