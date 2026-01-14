import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/SideBar';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import useDebounce from '../../hooks/useDebounce';
import './PatientPage.css';

const PatientsPage = ({ onLogout, onNavigate, activePage }) => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodType: 'A+',
    npi: '',
    email: '',
    phone: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
  });

  const { showSuccess, showError } = useToast();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);



  const loadPatients = async () => {
    try {
      setLoading(true);
      const allPatients = await apiService.patient.getAll();
      setPatients(allPatients);
    } catch (error) {
      console.error('Failed to load patients:', error);
      showError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.npi.includes(query)
      );
    }

    setFilteredPatients(filtered);
  };

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, []);

  // Filter patients when search or filter changes
  useEffect(() => {
    filterPatients();
  }, [patients, debouncedSearchQuery, statusFilter]);

  if (loading && patients.length === 0) {
    return <LoadingSpinner fullPage size="large" text="Loading Patients..." />;
  }

  const handleAddPatient = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      bloodType: 'A+',
      npi: '',
      email: '',
      phone: '',
      address: '',
      medicalHistory: '',
      allergies: '',
      currentMedications: '',
    });
    setShowAddModal(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      bloodType: patient.bloodType,
      npi: patient.npi,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      medicalHistory: patient.medicalHistory || '',
      allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : '',
      currentMedications: Array.isArray(patient.currentMedications) ? patient.currentMedications.join(', ') : '',
    });
    setShowEditModal(true);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const handleDeletePatient = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedPatient) {
      try {
        await apiService.patient.delete(selectedPatient.id);
        showSuccess(`Patient ${selectedPatient.name} deleted successfully`);
        await loadPatients();
      } catch (error) {
        console.error('Delete error:', error);
        showError('Failed to delete patient');
      }
    }
    setShowDeleteDialog(false);
    setSelectedPatient(null);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.age || !formData.email || !formData.npi) {
      showError('Please fill in all required fields');
      return;
    }

    // Prepare patient data
    const patientData = {
      ...formData,
      age: parseInt(formData.age),
      allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
      currentMedications: formData.currentMedications ? formData.currentMedications.split(',').map(m => m.trim()) : [],
      status: 'Active',
    };

    try {
      const newPatient = await apiService.patient.add(patientData);
      showSuccess(`Patient ${newPatient.name} added successfully`);
      await loadPatients();
      setShowAddModal(false);
    } catch (error) {
      console.error('Add patient error:', error);
      showError(error.response?.data?.error || 'Failed to add patient');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.age || !formData.email || !formData.npi) {
      showError('Please fill in all required fields');
      return;
    }

    const updates = {
      ...formData,
      age: parseInt(formData.age),
      allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
      currentMedications: formData.currentMedications ? formData.currentMedications.split(',').map(m => m.trim()) : [],
    };

    try {
      const updated = await apiService.patient.update(selectedPatient.id, updates);
      showSuccess(`Patient ${updated.name} updated successfully`);
      await loadPatients();
      setShowEditModal(false);
    } catch (error) {
      console.error('Update patient error:', error);
      showError('Failed to update patient');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        userData={userData}
        onLogout={onLogout}
      />

      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <h1>Patients</h1>
          <div className="top-bar-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search patients..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="add-btn" onClick={handleAddPatient}>
              + Add New Patient
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Patients</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="results-count">
            Showing {filteredPatients.length} of {patients.length} patients
          </div>
        </div>

        {/* Patients Table */}
        <div className="section">
          <div className="patients-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Blood Type</th>
                  <th>Email</th>
                  <th>Last Visit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">
                      {searchQuery || statusFilter !== 'All'
                        ? 'No patients found matching your criteria'
                        : 'No patients yet. Click "Add New Patient" to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="patient-name">{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.bloodType}</td>
                      <td>{patient.email}</td>
                      <td>{formatDate(patient.lastVisit)}</td>
                      <td>
                        <span className={`status-badge status-${patient.status.toLowerCase()}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewPatient(patient)}
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditPatient(patient)}
                          title="Edit Patient"
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeletePatient(patient)}
                          title="Delete Patient"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Patient Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Patient"
        size="large"
      >
        <form onSubmit={handleSubmitAdd} className="patient-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter patient name"
              />
            </div>

            <div className="form-group">
              <label>Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="0"
                max="150"
                placeholder="Age"
              />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Blood Type *</label>
              <select name="bloodType" value={formData.bloodType} onChange={handleInputChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="form-group">
              <label>NPI Number *</label>
              <input
                type="text"
                name="npi"
                value={formData.npi}
                onChange={handleInputChange}
                required
                placeholder="10-digit NPI"
                maxLength="10"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="patient@email.com"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address, City, State, ZIP"
              />
            </div>

            <div className="form-group full-width">
              <label>Medical History</label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                rows="3"
                placeholder="Brief medical history..."
              />
            </div>

            <div className="form-group full-width">
              <label>Allergies</label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="Comma-separated list (e.g., Penicillin, Latex)"
              />
            </div>

            <div className="form-group full-width">
              <label>Current Medications</label>
              <input
                type="text"
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleInputChange}
                placeholder="Comma-separated list (e.g., Aspirin 81mg, Lisinopril 10mg)"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Patient"
        size="large"
      >
        <form onSubmit={handleSubmitEdit} className="patient-form">
          <div className="form-grid">
            {/* Same form fields as Add Modal */}
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="0"
                max="150"
              />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Blood Type *</label>
              <select name="bloodType" value={formData.bloodType} onChange={handleInputChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="form-group">
              <label>NPI Number *</label>
              <input
                type="text"
                name="npi"
                value={formData.npi}
                onChange={handleInputChange}
                required
                maxLength="10"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Medical History</label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-group full-width">
              <label>Allergies</label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Current Medications</label>
              <input
                type="text"
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* View Patient Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Patient Details"
        size="large"
      >
        {selectedPatient && (
          <div className="patient-details">
            <div className="details-grid">
              <div className="detail-item">
                <label>Full Name:</label>
                <span>{selectedPatient.name}</span>
              </div>
              <div className="detail-item">
                <label>Age:</label>
                <span>{selectedPatient.age} years</span>
              </div>
              <div className="detail-item">
                <label>Gender:</label>
                <span>{selectedPatient.gender}</span>
              </div>
              <div className="detail-item">
                <label>Blood Type:</label>
                <span>{selectedPatient.bloodType}</span>
              </div>
              <div className="detail-item">
                <label>NPI Number:</label>
                <span>{selectedPatient.npi}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{selectedPatient.email}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{selectedPatient.phone || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status-badge status-${selectedPatient.status.toLowerCase()}`}>
                  {selectedPatient.status}
                </span>
              </div>
              <div className="detail-item full-width">
                <label>Address:</label>
                <span>{selectedPatient.address || 'N/A'}</span>
              </div>
              <div className="detail-item full-width">
                <label>Medical History:</label>
                <span>{selectedPatient.medicalHistory || 'No medical history recorded'}</span>
              </div>
              <div className="detail-item full-width">
                <label>Allergies:</label>
                <span>
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0
                    ? selectedPatient.allergies.join(', ')
                    : 'No known allergies'}
                </span>
              </div>
              <div className="detail-item full-width">
                <label>Current Medications:</label>
                <span>
                  {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0
                    ? selectedPatient.currentMedications.join(', ')
                    : 'No current medications'}
                </span>
              </div>
              <div className="detail-item">
                <label>Last Visit:</label>
                <span>{formatDate(selectedPatient.lastVisit)}</span>
              </div>
              <div className="detail-item">
                <label>Next Appointment:</label>
                <span>{formatDate(selectedPatient.nextAppointment)}</span>
              </div>
            </div>

          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Patient"
        message={`Are you sure you want to delete ${selectedPatient?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default PatientsPage;