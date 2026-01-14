import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/SideBar';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import useDebounce from '../../hooks/useDebounce';
import './ReportPage.css';

const ReportsPage = ({ onLogout, onNavigate, activePage }) => {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    category: 'Clinical Reports',
    date: new Date().toISOString().split('T')[0],
    author: userData.name,
    fileName: '',
    fileType: 'pdf',
    notes: '',
  });

  const { showSuccess, showError } = useToast();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Report categories
  const categories = [
    'All',
    'Clinical Reports',
    'Diagnostic Reports',
    'Therapeutic Reports',
    'Legal Medical Reports',
    'Specialty Reports'
  ];

  const loadPatients = async () => {
    try {
      const allPatients = await apiService.patient.getAll();
      setPatients(allPatients);
    } catch (error) {
      console.error('Failed to load patients:', error);
      showError('Failed to load patients');
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const allReports = await apiService.report.getAll();
      setReports(allReports);
    } catch (error) {
      console.error('Failed to load reports:', error);
      showError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadPatients();
    loadReports();
  }, []);

  if (loading && reports.length === 0) {
    return <LoadingSpinner fullPage size="large" text="Loading Reports..." />;
  }

  const handleUploadReport = (patient = null) => {
    setFormData({
      patientId: patient ? patient.id : '',
      title: '',
      category: 'Clinical Reports',
      date: new Date().toISOString().split('T')[0],
      author: userData.name,
      fileName: '',
      fileType: 'pdf',
      notes: '',
    });
    setSelectedPatient(patient);
    setShowUploadModal(true);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleDeleteReport = (report) => {
    setSelectedReport(report);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedReport) {
      try {
        await apiService.report.delete(selectedReport.id);
        showSuccess('Report deleted successfully');
        await loadReports();
      } catch (error) {
        console.error('Delete error:', error);
        showError('Failed to delete report');
      }
    }
    setShowDeleteDialog(false);
    setSelectedReport(null);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.patientId || !formData.title || !formData.category) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const newReport = await apiService.report.add(formData);
      showSuccess(`Report "${newReport.title}" uploaded successfully`);
      await loadReports();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      showError(error.response?.data?.error || 'Failed to upload report');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileType = file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'text';
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileType: fileType,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getFilteredReports = () => {
    let filtered = reports;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(r => {
        const patientName = getPatientName(r.patientId).toLowerCase();
        return (
          r.title.toLowerCase().includes(query) ||
          patientName.includes(query) ||
          r.category.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  };

  const filteredReports = getFilteredReports();

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
          <h1>Medical Reports</h1>
          <div className="top-bar-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search reports..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="add-btn" onClick={() => handleUploadReport()}>
              + Upload Report
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="filters-bar">
          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="results-count">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        </div>

        {/* Reports Table */}
        <div className="section">
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Patient</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Author</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {searchQuery || selectedCategory !== 'All'
                        ? 'No reports found matching your criteria'
                        : 'No reports yet. Click "Upload Report" to add one.'}
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id}>
                      <td className="report-title">{report.title}</td>
                      <td>{getPatientName(report.patientId)}</td>
                      <td>
                        <span className="category-badge">
                          {report.category}
                        </span>
                      </td>
                      <td>{formatDate(report.date)}</td>
                      <td>{report.author}</td>
                      <td>
                        <span className={`file-type-badge file-${report.fileType}`}>
                          {report.fileType.toUpperCase()}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewReport(report)}
                          title="View Report"
                        >
                          View
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteReport(report)}
                          title="Delete Report"
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

      {/* Upload Report Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Medical Report"
        size="large"
      >
        <form onSubmit={handleSubmitReport} className="report-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Select Patient *</label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select a patient --</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.age} years - {patient.npi}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Report Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.filter(c => c !== 'All').map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Report Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Report Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Annual Physical Examination"
              />
            </div>

            <div className="form-group full-width">
              <label>Upload File (Optional)</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="file-input-hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>{formData.fileName || 'Choose file to upload'}</span>
                </label>
                <p className="file-hint">Supported: PDF, JPG, PNG, DOC (Max 10MB)</p>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Report Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Additional notes or observations..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Upload Report
            </button>
          </div>
        </form>
      </Modal>

      {/* View Report Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Report Details"
        size="large"
      >
        {selectedReport && (
          <div className="report-details">
            <div className="details-grid">
              <div className="detail-item">
                <label>Title:</label>
                <span>{selectedReport.title}</span>
              </div>
              <div className="detail-item">
                <label>Patient:</label>
                <span>{getPatientName(selectedReport.patientId)}</span>
              </div>
              <div className="detail-item">
                <label>Category:</label>
                <span className="category-badge">{selectedReport.category}</span>
              </div>
              <div className="detail-item">
                <label>Date:</label>
                <span>{formatDate(selectedReport.date)}</span>
              </div>
              <div className="detail-item">
                <label>Author:</label>
                <span>{selectedReport.author}</span>
              </div>
              <div className="detail-item">
                <label>File Type:</label>
                <span className={`file-type-badge file-${selectedReport.fileType}`}>
                  {selectedReport.fileType.toUpperCase()}
                </span>
              </div>
              {selectedReport.fileName && (
                <div className="detail-item full-width">
                  <label>File Name:</label>
                  <span>{selectedReport.fileName}</span>
                </div>
              )}
              {selectedReport.notes && (
                <div className="detail-item full-width">
                  <label>Notes:</label>
                  <span>{selectedReport.notes}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
              <button className="btn-primary">
                Download
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Report"
        message={`Are you sure you want to delete "${selectedReport?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ReportsPage;