import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/SideBar';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import useDebounce from '../../hooks/useDebounce';
import './MessageEmergencyPage.css';

const MessageEmergencyPage = ({ onLogout, onNavigate, activePage }) => {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  const [transfers, setTransfers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'Referral',
    urgency: 'Medium',
    fromHospital: 'City Medical Center',
    toHospital: '',
    reason: '',
    notes: '',
    requestedBy: userData.name,
  });

  const { showSuccess, showError } = useToast();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const allTransfers = await apiService.transfer.getAll();
      setTransfers(allTransfers);
    } catch (error) {
      console.error('Failed to load transfers:', error);
      showError('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const allPatients = await apiService.patient.getAll();
      setPatients(allPatients);
    } catch (error) {
      console.error('Failed to load patients:', error);
      showError('Failed to load patients');
    }
  };

  const filterTransfers = () => {
    let filtered = transfers;

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const patient = patients.find(p => p.id === t.patientId);
        return (
          (patient && patient.name.toLowerCase().includes(query)) ||
          t.toHospital.toLowerCase().includes(query) ||
          t.fromHospital.toLowerCase().includes(query)
        );
      });
    }

    setFilteredTransfers(filtered);
  };

  // Load data on mount
  useEffect(() => {
    loadTransfers();
    loadPatients();
  }, []);

  // Filter transfers when search or filter changes
  useEffect(() => {
    filterTransfers();
  }, [transfers, debouncedSearchQuery, statusFilter]);

  if (loading && transfers.length === 0) {
    return <LoadingSpinner fullPage size="large" text="Loading Transfers..." />;
  }

  const handleNewTransfer = () => {
    setFormData({
      patientId: '',
      type: 'Referral',
      urgency: 'Medium',
      fromHospital: 'City Medical Center',
      toHospital: '',
      reason: '',
      notes: '',
      requestedBy: userData.name,
    });
    setShowNewModal(true);
  };

  const handleViewTransfer = (transfer) => {
    setSelectedTransfer(transfer);
    setShowViewModal(true);
  };

  const handleApproveTransfer = (transfer) => {
    setSelectedTransfer(transfer);
    setShowApproveDialog(true);
  };

  const handleDenyTransfer = (transfer) => {
    setSelectedTransfer(transfer);
    setShowDenyDialog(true);
  };

  const confirmApprove = async () => {
    if (selectedTransfer) {
      try {
        await apiService.transfer.updateStatus(
          selectedTransfer.id,
          'Approved',
          userData.name
        );
        showSuccess(`Transfer for patient approved successfully`);
        await loadTransfers();
      } catch (error) {
        console.error('Approve error:', error);
        showError('Failed to approve transfer');
      }
    }
    setShowApproveDialog(false);
    setSelectedTransfer(null);
  };

  const confirmDeny = async () => {
    if (selectedTransfer) {
      try {
        await apiService.transfer.updateStatus(
          selectedTransfer.id,
          'Denied',
          userData.name
        );
        showSuccess(`Transfer for patient denied`);
        await loadTransfers();
      } catch (error) {
        console.error('Deny error:', error);
        showError('Failed to deny transfer');
      }
    }
    setShowDenyDialog(false);
    setSelectedTransfer(null);
  };

  const handleSubmitTransfer = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.patientId || !formData.toHospital || !formData.reason) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const newTransfer = await apiService.transfer.add(formData);
      showSuccess(`${formData.type} request created successfully`);
      await loadTransfers();
      setShowNewModal(false);
    } catch (error) {
      console.error('Create transfer error:', error);
      showError(error.response?.data?.error || 'Failed to create transfer');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'critical';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'medium';
    }
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
          <h1>Emergency & Transfers</h1>
          <div className="top-bar-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search transfers..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="add-btn" onClick={handleNewTransfer}>
              + New Transfer Request
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
              <option value="All">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Denied">Denied</option>
              <option value="Sent">Sent</option>
            </select>
          </div>
          <div className="results-count">
            Showing {filteredTransfers.length} of {transfers.length} transfers
          </div>
        </div>

        {/* Transfers Table */}
        <div className="section">
          <div className="transfers-table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Patient</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Urgency</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">
                      {searchQuery || statusFilter !== 'All'
                        ? 'No transfers found matching your criteria'
                        : 'No transfer requests yet. Click "New Transfer Request" to create one.'}
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((transfer) => (
                    <tr key={transfer.id}>
                      <td>
                        <span className={`type-badge type-${transfer.type.toLowerCase()}`}>
                          {transfer.type}
                        </span>
                      </td>
                      <td className="patient-name">{getPatientName(transfer.patientId)}</td>
                      <td>{transfer.fromHospital}</td>
                      <td>{transfer.toHospital}</td>
                      <td>
                        <span className={`urgency-badge urgency-${getUrgencyColor(transfer.urgency)}`}>
                          {transfer.urgency}
                        </span>
                      </td>
                      <td>{formatDate(transfer.requestedAt)}</td>
                      <td>
                        <span className={`status-badge status-${transfer.status.toLowerCase()}`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewTransfer(transfer)}
                          title="View Details"
                        >
                          View
                        </button>
                        {transfer.status === 'Pending' && (
                          <>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleApproveTransfer(transfer)}
                              title="Approve Transfer"
                            >
                              Approve
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDenyTransfer(transfer)}
                              title="Deny Transfer"
                            >
                              Deny
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* New Transfer Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="New Transfer Request"
        size="large"
      >
        <form onSubmit={handleSubmitTransfer} className="transfer-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Transfer Type *</label>
              <select name="type" value={formData.type} onChange={handleInputChange} required>
                <option value="Referral">Patient Referral</option>
                <option value="Emergency">Emergency Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Urgency Level *</label>
              <select name="urgency" value={formData.urgency} onChange={handleInputChange} required>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Select Patient *</label>
              <select name="patientId" value={formData.patientId} onChange={handleInputChange} required>
                <option value="">-- Select a patient --</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.age} years - {patient.npi}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>From Hospital *</label>
              <input
                type="text"
                name="fromHospital"
                value={formData.fromHospital}
                onChange={handleInputChange}
                required
                placeholder="Current hospital"
              />
            </div>

            <div className="form-group">
              <label>To Hospital *</label>
              <input
                type="text"
                name="toHospital"
                value={formData.toHospital}
                onChange={handleInputChange}
                required
                placeholder="Receiving hospital"
              />
            </div>

            <div className="form-group full-width">
              <label>Reason for Transfer *</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                placeholder="Medical reason for transfer"
              />
            </div>

            <div className="form-group full-width">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Any additional information..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => setShowNewModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Transfer Request
            </button>
          </div>
        </form>
      </Modal>

      {/* View Transfer Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Transfer Request Details"
        size="large"
      >
        {selectedTransfer && (
          <div className="transfer-details">
            <div className="details-grid">
              <div className="detail-item">
                <label>Type:</label>
                <span className={`type-badge type-${selectedTransfer.type.toLowerCase()}`}>
                  {selectedTransfer.type}
                </span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status-badge status-${selectedTransfer.status.toLowerCase()}`}>
                  {selectedTransfer.status}
                </span>
              </div>
              <div className="detail-item">
                <label>Patient:</label>
                <span>{getPatientName(selectedTransfer.patientId)}</span>
              </div>
              <div className="detail-item">
                <label>Urgency:</label>
                <span className={`urgency-badge urgency-${getUrgencyColor(selectedTransfer.urgency)}`}>
                  {selectedTransfer.urgency}
                </span>
              </div>
              <div className="detail-item">
                <label>From Hospital:</label>
                <span>{selectedTransfer.fromHospital}</span>
              </div>
              <div className="detail-item">
                <label>To Hospital:</label>
                <span>{selectedTransfer.toHospital}</span>
              </div>
              <div className="detail-item full-width">
                <label>Reason:</label>
                <span>{selectedTransfer.reason}</span>
              </div>
              <div className="detail-item full-width">
                <label>Additional Notes:</label>
                <span>{selectedTransfer.notes || 'No additional notes'}</span>
              </div>
              <div className="detail-item">
                <label>Requested By:</label>
                <span>{selectedTransfer.requestedBy}</span>
              </div>
              <div className="detail-item">
                <label>Requested At:</label>
                <span>{formatDate(selectedTransfer.requestedAt)}</span>
              </div>
              {selectedTransfer.reviewedBy && (
                <>
                  <div className="detail-item">
                    <label>Reviewed By:</label>
                    <span>{selectedTransfer.reviewedBy}</span>
                  </div>
                  <div className="detail-item">
                    <label>Reviewed At:</label>
                    <span>{formatDate(selectedTransfer.reviewedAt)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
              {selectedTransfer.status === 'Pending' && (
                <>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      setShowViewModal(false);
                      handleDenyTransfer(selectedTransfer);
                    }}
                  >
                    Deny Transfer
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowViewModal(false);
                      handleApproveTransfer(selectedTransfer);
                    }}
                  >
                    Approve Transfer
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={confirmApprove}
        title="Approve Transfer"
        message={`Are you sure you want to approve this ${selectedTransfer?.type.toLowerCase()} request for ${getPatientName(selectedTransfer?.patientId)}?`}
        confirmText="Approve"
        cancelText="Cancel"
        type="info"
      />

      {/* Deny Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDenyDialog}
        onClose={() => setShowDenyDialog(false)}
        onConfirm={confirmDeny}
        title="Deny Transfer"
        message={`Are you sure you want to deny this ${selectedTransfer?.type.toLowerCase()} request for ${getPatientName(selectedTransfer?.patientId)}?`}
        confirmText="Deny"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default MessageEmergencyPage;