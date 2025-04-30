import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/SideBar';
import './MessageEmergencyPage.css';

const MessageEmergencyPage = ({ onLogout, onNavigate, activePage }) => {
  const userData = {
    name: "Nhyiraba David",
    role: "Doctor",
    email: "davidnhyiraba@gmail.com",
    contactNumber: "123-456-7890",
    hospitalName: "City Medical Center",
    hospitalNumber: "555-123-4567",
  };

  // Sample transfer requests data
  const [transferRequests, setTransferRequests] = useState([
    { 
      id: 1, 
      patientName: "Emma Thompson",
      patientId: "PT-20250412-001",
      age: 34,
      condition: "Post-surgery complications",
      requestingHospital: "Regional Medical Center",
      doctorName: "Dr. Maria Johnson",
      urgency: "High",
      status: "Pending",
      dateReceived: "April 29, 2025, 14:23",
      type: "Emergency"
    },
    { 
      id: 2, 
      patientName: "Michael Chen",
      patientId: "PT-20250405-015",
      age: 52,
      condition: "Diabetic ketoacidosis",
      requestingHospital: "Community Health Hospital",
      doctorName: "Dr. James Wilson",
      urgency: "Medium",
      status: "Pending",
      dateReceived: "April 28, 2025, 09:15",
      type: "Referral"
    },
    { 
      id: 3, 
      patientName: "Sophia Martinez",
      patientId: "PT-20250410-008",
      age: 28,
      condition: "High-risk pregnancy",
      requestingHospital: "Women's Health Clinic",
      doctorName: "Dr. Ana Rodriguez",
      urgency: "Medium",
      status: "Approved",
      dateReceived: "April 27, 2025, 11:30",
      dateResponded: "April 27, 2025, 12:45",
      type: "Referral"
    },
    { 
      id: 4, 
      patientName: "James Peterson",
      patientId: "PT-20250408-023",
      age: 45,
      condition: "Acute myocardial infarction",
      requestingHospital: "Heart Institute",
      doctorName: "Dr. Robert Lee",
      urgency: "Critical",
      status: "Approved",
      dateReceived: "April 26, 2025, 22:10",
      dateResponded: "April 26, 2025, 22:15",
      type: "Emergency"
    },
    { 
      id: 5, 
      patientName: "Olivia Wilson",
      patientId: "PT-20250415-031",
      age: 19,
      condition: "Appendicitis",
      requestingHospital: "University Hospital",
      doctorName: "Dr. Emily Chang",
      urgency: "High",
      status: "Denied",
      dateReceived: "April 25, 2025, 18:40",
      dateResponded: "April 25, 2025, 19:20",
      reason: "Patient condition manageable at current facility",
      type: "Referral"
    }
  ]);

  // Sample list of your patients
  const [yourPatients, setYourPatients] = useState([
    { 
      id: 1, 
      name: "Emma Thompson", 
      patientId: "PT-20250412-001",
      age: 34,
      gender: "Female",
      condition: "Regular Checkup",
      lastVisit: "April 15, 2025"
    },
    { 
      id: 2, 
      name: "James Peterson", 
      patientId: "PT-20250408-023",
      age: 45,
      gender: "Male",
      condition: "Hypertension Follow-up",
      lastVisit: "April 10, 2025"
    },
    { 
      id: 3, 
      name: "Sophia Martinez", 
      patientId: "PT-20250410-008",
      age: 28,
      gender: "Female",
      condition: "Pregnancy Check",
      lastVisit: "April 12, 2025"
    },
    { 
      id: 4, 
      name: "Michael Chen", 
      patientId: "PT-20250405-015",
      age: 52,
      gender: "Male",
      condition: "Diabetes Management",
      lastVisit: "April 8, 2025"
    },
    { 
      id: 5, 
      name: "Olivia Wilson", 
      patientId: "PT-20250415-031",
      age: 19,
      gender: "Female",
      condition: "Annual Physical",
      lastVisit: "April 5, 2025"
    }
  ]);

  // State for different views
  const [view, setView] = useState('inbox'); // 'inbox', 'new', 'details', 'sent'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [transferType, setTransferType] = useState('');

  // Form state for new transfer
  const [newTransfer, setNewTransfer] = useState({
    patientId: '',
    receivingHospital: '',
    receivingDoctor: '',
    reason: '',
    urgency: 'Medium',
    additionalNotes: '',
    type: ''
  });

  // Template messages for referrals and emergencies
  const referralTemplate = `This is to confirm that the patient has been referred to your facility for specialized care. 
  Please find attached all relevant medical records. 
  For any further inquiries, please contact ${userData.name} at ${userData.contactNumber} or our hospital at ${userData.hospitalNumber}.`;

  const emergencyTemplate = `EMERGENCY TRANSFER: This patient requires immediate specialized care not available at our facility. 
  Critical medical information has been shared. 
  For urgent consultation, please contact Dr. ${userData.name} directly at ${userData.contactNumber} or our emergency department at ${userData.hospitalNumber}.`;

  // Handler for showing request details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setView('details');
  };

  // Handler for creating new transfer request
  const handleNewTransfer = () => {
    setView('new');
    setSelectedRequest(null);
    setSelectedPatient(null);
    setTransferType('');
    setNewTransfer({
      patientId: '',
      receivingHospital: '',
      receivingDoctor: '',
      reason: '',
      urgency: 'Medium',
      additionalNotes: '',
      type: ''
    });
  };

  // Handler for selecting a patient for the new transfer
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setNewTransfer({
      ...newTransfer,
      patientId: patient.patientId
    });
  };

  // Handler for selecting transfer type
  const handleSelectTransferType = (type) => {
    setTransferType(type);
    setNewTransfer({
      ...newTransfer,
      type: type,
      additionalNotes: type === 'Emergency' ? emergencyTemplate : referralTemplate
    });
  };

  // Handler for approving a transfer request
  const handleApprove = () => {
    const updatedRequests = transferRequests.map(req => {
      if (req.id === selectedRequest.id) {
        return {
          ...req,
          status: 'Approved',
          dateResponded: new Date().toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        };
      }
      return req;
    });
    
    setTransferRequests(updatedRequests);
    alert("Transfer request approved successfully!");
    setView('inbox');
  };

  // Handler for denying a transfer request
  const handleDeny = () => {
    const reason = prompt("Please provide a reason for denying this transfer request:");
    
    if (reason) {
      const updatedRequests = transferRequests.map(req => {
        if (req.id === selectedRequest.id) {
          return {
            ...req,
            status: 'Denied',
            reason: reason,
            dateResponded: new Date().toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          };
        }
        return req;
      });
      
      setTransferRequests(updatedRequests);
      alert("Transfer request denied.");
      setView('inbox');
    }
  };

  // Handler for sending a new transfer request
  const handleSendTransfer = (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      alert("Please select a patient");
      return;
    }
    
    if (!newTransfer.receivingHospital) {
      alert("Please enter the receiving hospital");
      return;
    }
    
    if (!newTransfer.reason) {
      alert("Please enter a reason for the transfer");
      return;
    }
    
    if (!transferType) {
      alert("Please select a transfer type");
      return;
    }
    
    // Create a new transfer request object
    const newRequest = {
      id: Date.now(),
      patientName: selectedPatient.name,
      patientId: selectedPatient.patientId,
      age: selectedPatient.age,
      condition: newTransfer.reason,
      requestingHospital: userData.hospitalName,
      doctorName: userData.name,
      urgency: newTransfer.urgency,
      status: 'Sent',
      dateSent: new Date().toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      receivingHospital: newTransfer.receivingHospital,
      receivingDoctor: newTransfer.receivingDoctor,
      additionalNotes: newTransfer.additionalNotes,
      type: transferType
    };
    
    // Here you would typically send this to an API
    // For now, we'll just log it and go back to inbox
    console.log("New transfer request:", newRequest);
    alert("Transfer request sent successfully!");
    setView('inbox');
  };

  // Filter requests based on search term and status
  const filteredRequests = transferRequests.filter(request => {
    const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestingHospital.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Render the inbox view
  const renderInboxView = () => (
    <>
      <div className="section-header">
        <h2>Transfer & Emergency Requests</h2>
        <div className="filter-container">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search patients or hospitals..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="icon search-icon"></i>
          </div>
        </div>
      </div>

      <div className="actions-bar">
        <button className="primary-btn" onClick={handleNewTransfer}>
          <i className="icon plus-icon"></i> New Transfer/Emergency
        </button>
        <button className="secondary-btn" onClick={() => setView('sent')}>
          View Sent Requests
        </button>
      </div>

      <div className="transfers-table-container">
        <table className="transfers-table">
          <thead>
            <tr>
              <th>Request Type</th>
              <th>Patient Name</th>
              <th>Condition</th>
              <th>From Hospital</th>
              <th>Urgency</th>
              <th>Date Received</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(request => (
                <tr key={request.id} className={request.urgency === 'Critical' ? 'critical-row' : ''}>
                  <td>
                    <span className={`type-badge ${request.type.toLowerCase()}`}>
                      {request.type}
                    </span>
                  </td>
                  <td>{request.patientName}</td>
                  <td>{request.condition}</td>
                  <td>{request.requestingHospital}</td>
                  <td>
                    <span className={`urgency-badge ${request.urgency.toLowerCase()}`}>
                      {request.urgency}
                    </span>
                  </td>
                  <td>{request.dateReceived}</td>
                  <td>
                    <span className={`status-badge ${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(request)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No transfer requests found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  // Render the sent requests view
  const renderSentRequestsView = () => (
    <>
      <div className="section-header">
        <h2>Sent Transfer Requests</h2>
        <button className="back-button" onClick={() => setView('inbox')}>
          <i className="icon back-icon"></i> Back to Inbox
        </button>
      </div>

      <div className="transfers-table-container">
        <table className="transfers-table">
          <thead>
            <tr>
              <th>Request Type</th>
              <th>Patient Name</th>
              <th>To Hospital</th>
              <th>Date Sent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="type-badge emergency">Emergency</span>
              </td>
              <td>Olivia Wilson</td>
              <td>University Hospital</td>
              <td>April 24, 2025, 15:30</td>
              <td>
                <span className="status-badge approved">Approved</span>
              </td>
              <td>
                <button className="view-details-btn">View Details</button>
              </td>
            </tr>
            <tr>
              <td>
                <span className="type-badge referral">Referral</span>
              </td>
              <td>James Peterson</td>
              <td>Heart Institute</td>
              <td>April 20, 2025, 09:45</td>
              <td>
                <span className="status-badge pending">Pending</span>
              </td>
              <td>
                <button className="view-details-btn">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );

  // Render the details view of a transfer request
  const renderDetailsView = () => (
    <>
      <div className="section-header">
        <h2>Transfer Request Details</h2>
        <button className="back-button" onClick={() => setView('inbox')}>
          <i className="icon back-icon"></i> Back to Requests
        </button>
      </div>

      <div className="request-details-container">
        <div className="request-header">
          <div className="request-title">
            <span className={`type-badge large ${selectedRequest.type.toLowerCase()}`}>
              {selectedRequest.type}
            </span>
            <h3>{selectedRequest.patientName} - {selectedRequest.patientId}</h3>
          </div>
          
          <div className="request-meta">
            <span className={`status-badge large ${selectedRequest.status.toLowerCase()}`}>
              {selectedRequest.status}
            </span>
            <span className={`urgency-badge large ${selectedRequest.urgency.toLowerCase()}`}>
              {selectedRequest.urgency}
            </span>
          </div>
        </div>

        <div className="request-details-grid">
          <div className="detail-section">
            <h4>Patient Information</h4>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{selectedRequest.patientName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{selectedRequest.patientId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Age:</span>
              <span className="detail-value">{selectedRequest.age}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Condition:</span>
              <span className="detail-value">{selectedRequest.condition}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4>Request Information</h4>
            <div className="detail-item">
              <span className="detail-label">From Hospital:</span>
              <span className="detail-value">{selectedRequest.requestingHospital}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Requesting Doctor:</span>
              <span className="detail-value">{selectedRequest.doctorName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date Received:</span>
              <span className="detail-value">{selectedRequest.dateReceived}</span>
            </div>
            {selectedRequest.dateResponded && (
              <div className="detail-item">
                <span className="detail-label">Date Responded:</span>
                <span className="detail-value">{selectedRequest.dateResponded}</span>
              </div>
            )}
            {selectedRequest.reason && (
              <div className="detail-item">
                <span className="detail-label">Denial Reason:</span>
                <span className="detail-value">{selectedRequest.reason}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section full-width">
          <h4>Transfer Notes</h4>
          <div className="transfer-notes">
            {selectedRequest.type === "Emergency" ? emergencyTemplate : referralTemplate}
          </div>
        </div>

        <div className="medical-records-section">
          <h4>Medical Records</h4>
          <div className="records-list">
            <div className="record-item">
              <i className="icon pdf-icon"></i>
              <span>Patient History.pdf</span>
              <button className="view-file-btn">View</button>
            </div>
            <div className="record-item">
              <i className="icon image-icon"></i>
              <span>Latest X-Ray.jpg</span>
              <button className="view-file-btn">View</button>
            </div>
            <div className="record-item">
              <i className="icon pdf-icon"></i>
              <span>Lab Results.pdf</span>
              <button className="view-file-btn">View</button>
            </div>
          </div>
        </div>

        {selectedRequest.status === "Pending" && (
          <div className="approval-actions">
            <button className="deny-btn" onClick={handleDeny}>Deny Transfer</button>
            <button className="approve-btn" onClick={handleApprove}>Approve Transfer</button>
          </div>
        )}
      </div>
    </>
  );

  // Render the new transfer request view
  const renderNewTransferView = () => (
    <>
      <div className="section-header">
        <h2>New Transfer Request</h2>
        <button className="back-button" onClick={() => setView('inbox')}>
          <i className="icon back-icon"></i> Cancel
        </button>
      </div>

      {!transferType ? (
        <div className="transfer-type-selection">
          <h3>Select Transfer Type:</h3>
          <div className="type-buttons">
            <button 
              className="type-button emergency"
              onClick={() => handleSelectTransferType('Emergency')}
            >
              <i className="icon emergency-icon"></i>
              <span>Emergency Transfer</span>
              <p>For urgent cases requiring immediate care at another facility</p>
            </button>
            <button 
              className="type-button referral"
              onClick={() => handleSelectTransferType('Referral')}
            >
              <i className="icon referral-icon"></i>
              <span>Patient Referral</span>
              <p>For non-urgent transfers to specialists or other facilities</p>
            </button>
          </div>
        </div>
      ) : (
        <form className="transfer-form" onSubmit={handleSendTransfer}>
          <div className="form-header">
            <h3>
              <span className={`type-badge large ${transferType.toLowerCase()}`}>
                {transferType}
              </span>
              {transferType === 'Emergency' ? 'Emergency Transfer' : 'Patient Referral'}
            </h3>
            <button 
              type="button" 
              className="change-type"
              onClick={() => setTransferType('')}
            >
              Change Type
            </button>
          </div>

          <div className="form-section">
            <h4>1. Select Patient</h4>
            {!selectedPatient ? (
              <div className="patient-selection">
                <div className="search-container">
                  <input type="text" placeholder="Search patients..." className="search-input" />
                  
                </div>
                <div className="patients-list">
                  {yourPatients.map(patient => (
                    <div 
                      key={patient.id} 
                      className="patient-item"
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <div className="patient-info">
                        <div className="patient-name">{patient.name}</div>
                        <div className="patient-meta">
                          {patient.patientId} · {patient.age} years · {patient.gender}
                        </div>
                      </div>
                      <button type="button" className="select-btn">Select</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="selected-patient">
                <div className="patient-card">
                  <div className="patient-info">
                    <div className="patient-name">{selectedPatient.name}</div>
                    <div className="patient-meta">
                      {selectedPatient.patientId} · {selectedPatient.age} years · {selectedPatient.gender}
                    </div>
                    <div className="patient-condition">
                      Current condition: {selectedPatient.condition}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="change-selection"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedPatient && (
            <>
              <div className="form-section">
                <h4>2. Receiving Facility</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="receiving-hospital">Receiving Hospital:</label>
                    <input 
                      type="text" 
                      id="receiving-hospital" 
                      placeholder="Enter hospital name"
                      value={newTransfer.receivingHospital}
                      onChange={(e) => setNewTransfer({...newTransfer, receivingHospital: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="receiving-doctor">Receiving Doctor (if known):</label>
                    <input 
                      type="text" 
                      id="receiving-doctor" 
                      placeholder="Enter doctor's name"
                      value={newTransfer.receivingDoctor}
                      onChange={(e) => setNewTransfer({...newTransfer, receivingDoctor: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>3. Transfer Details</h4>
                <div className="form-group">
                  <label htmlFor="reason">Reason for Transfer:</label>
                  <input 
                    type="text" 
                    id="reason" 
                    placeholder="Enter the medical reason for this transfer"
                    value={newTransfer.reason}
                    onChange={(e) => setNewTransfer({...newTransfer, reason: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="urgency">Urgency Level:</label>
                  <select 
                    id="urgency"
                    value={newTransfer.urgency}
                    onChange={(e) => setNewTransfer({...newTransfer, urgency: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Additional Notes:</label>
                  <textarea 
                    id="notes"
                    rows="6"
                    value={newTransfer.additionalNotes}
                    onChange={(e) => setNewTransfer({...newTransfer, additionalNotes: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="form-section">
                <h4>4. Attach Medical Records</h4>
                <div className="file-upload-area">
                  <div className="file-upload-button">
                    <i className="icon upload-icon"></i>
                    <span>Upload Files</span>
                    <input type="file" multiple className="file-input" />
                  </div>
                  <p className="upload-hint">Upload relevant patient records (PDF, JPG, PNG)</p>
                </div>
                <div className="attached-files">
                  <div className="file-item">
                    <i className="icon pdf-icon"></i>
                    <span>Patient History.pdf</span>
                    <button type="button" className="remove-file">×</button>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setView('inbox')}>Cancel</button>
                <button type="submit" className="send-btn">Send Transfer Request</button>
              </div>
            </>
          )}
        </form>
      )}
    </>
  );

  return (
    <div className="dashboard-container">
      <Sidebar 
        activePage={activePage} 
        onNavigate={onNavigate} 
        userData={userData} 
        onLogout={onLogout} 
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <h1>Messages & Emergency</h1>
          <div className="top-bar-actions">
            <button className="notification-btn">
              <i className="icon notification-icon"></i>
              <span className="notification-badge">3</span>
            </button>
            <div className="user-info-mini">
              <div className="user-avatar mini">{userData.name.split(' ').map(name => name[0]).join('')}</div>
              <span>{userData.name}</span>
            </div>
          </div>
        </div>

        {/* Messages/Transfer Section */}
        <div className="section message-section">
          {view === 'inbox' && renderInboxView()}
          {view === 'sent' && renderSentRequestsView()}
          {view === 'details' && selectedRequest && renderDetailsView()}
          {view === 'new' && renderNewTransferView()}
        </div>
      </main>
    </div>
  );
};

export default MessageEmergencyPage;