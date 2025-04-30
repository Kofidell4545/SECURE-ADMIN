import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/SideBar';
import './ReportPage.css';

const ReportsPage = ({ onLogout, onNavigate, activePage }) => {
  const userData = {
    name: "Nhyiraba David",
    role: "Doctor",
    email: "davidnhyiraba@gmail.com",
  };

  // Sample patient data
  const [patients, setPatients] = useState([
    { 
      id: 1, 
      name: "Emma Thompson", 
      age: 34,
      gender: "Female",
      bloodType: "A+",
      condition: "Regular Checkup",
      lastVisit: "15 April 2025"
    },
    { 
      id: 2, 
      name: "James Peterson", 
      age: 45,
      gender: "Male",
      bloodType: "O-",
      condition: "Hypertension Follow-up",
      lastVisit: "10 April 2025"
    },
    { 
      id: 3, 
      name: "Sophia Martinez", 
      age: 28,
      gender: "Female",
      bloodType: "B+",
      condition: "Pregnancy Check",
      lastVisit: "12 April 2025"
    },
    { 
      id: 4, 
      name: "Michael Chen", 
      age: 52,
      gender: "Male",
      bloodType: "AB-",
      condition: "Diabetes Management",
      lastVisit: "8 April 2025"
    },
    { 
      id: 5, 
      name: "Olivia Wilson", 
      age: 19,
      gender: "Female",
      bloodType: "O+",
      condition: "Annual Physical",
      lastVisit: "5 April 2025"
    }
  ]);

  // Sample report data
  const [reports, setReports] = useState({
    1: { // Patient ID
      "Clinical Reports": [
        { id: 101, title: "Annual Physical Examination", date: "15 April 2025", author: "Dr. Sarah Williams" },
        { id: 102, title: "Follow-up Consultation", date: "1 March 2025", author: "Dr. Nhyiraba David" }
      ],
      "Diagnostic Reports": [
        { id: 201, title: "Blood Test Results", date: "15 April 2025", author: "Lab Technician John Smith" },
        { id: 202, title: "Chest X-Ray Analysis", date: "10 February 2025", author: "Dr. Patricia Lee" }
      ],
      "Therapeutic Reports": [],
      "Legal Medical Reports": [],
      "Specialty Reports": [
        { id: 501, title: "Cardiology Assessment", date: "20 January 2025", author: "Dr. Michael Rodriguez" }
      ]
    },
    2: {
      "Clinical Reports": [
        { id: 103, title: "Hypertension Follow-up", date: "10 April 2025", author: "Dr. Nhyiraba David" }
      ],
      "Diagnostic Reports": [
        { id: 203, title: "Blood Pressure Monitoring", date: "10 April 2025", author: "Nurse Jessica Thompson" },
        { id: 204, title: "ECG Analysis", date: "10 April 2025", author: "Dr. Elizabeth Chen" }
      ],
      "Therapeutic Reports": [
        { id: 301, title: "Medication Review", date: "10 April 2025", author: "Dr. Nhyiraba David" }
      ],
      "Legal Medical Reports": [],
      "Specialty Reports": []
    },
    3: {
      "Clinical Reports": [
        { id: 104, title: "Prenatal Checkup", date: "12 April 2025", author: "Dr. Lisa Johnson" }
      ],
      "Diagnostic Reports": [
        { id: 205, title: "Ultrasound Report", date: "12 April 2025", author: "Dr. Lisa Johnson" }
      ],
      "Therapeutic Reports": [],
      "Legal Medical Reports": [],
      "Specialty Reports": [
        { id: 502, title: "Obstetrics Assessment", date: "12 April 2025", author: "Dr. Lisa Johnson" }
      ]
    }
  });

  // State for views
  const [view, setView] = useState('list'); // 'list', 'view', 'upload'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Report categories
  const categories = [
    "Clinical Reports", 
    "Diagnostic Reports", 
    "Therapeutic Reports", 
    "Legal Medical Reports", 
    "Specialty Reports"
  ];

  // Handler for viewing reports
  const handleViewReports = (patient) => {
    setSelectedPatient(patient);
    setView('view');
  };

  // Handler for uploading reports
  const handleUploadReports = (patient) => {
    setSelectedPatient(patient);
    setView('upload');
    setUploadCategory('');
    setReportContent('');
    setSelectedFile(null);
  };

  // Handler for saving the report
  const handleSaveReport = () => {
    if (!uploadCategory) {
      alert('Please select a category');
      return;
    }

    // Create a new report object
    const newReport = {
      id: Date.now(), // Generate a unique ID
      title: selectedFile ? selectedFile.name : "Text Report",
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      author: userData.name,
      content: reportContent
    };

    // Update reports state
    setReports(prevReports => {
      const patientReports = prevReports[selectedPatient.id] || {
        "Clinical Reports": [],
        "Diagnostic Reports": [],
        "Therapeutic Reports": [],
        "Legal Medical Reports": [],
        "Specialty Reports": []
      };

      return {
        ...prevReports,
        [selectedPatient.id]: {
          ...patientReports,
          [uploadCategory]: [...(patientReports[uploadCategory] || []), newReport]
        }
      };
    });

    // Show success message
    alert('Report saved successfully!');
    
    // Reset form
    setUploadCategory('');
    setReportContent('');
    setSelectedFile(null);
    
    // Return to list view
    setView('list');
  };

  // Handler for file selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Render back button
  const renderBackButton = () => (
    <button 
      className="back-button"
      onClick={() => {
        setView('list');
        setSelectedPatient(null);
      }}
    >
      <i className="icon back-icon"></i> Back to Reports List
    </button>
  );

  // Render the list view
  const renderListView = () => (
    <>
      <div className="section-header">
        <h2>Patient Reports</h2>
        <div className="search-container">
          <input type="text" placeholder="Search patients..." className="search-input" />
         
        </div>
      </div>

      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Last Visit</th>
              <th>Condition</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.lastVisit}</td>
                <td>{patient.condition}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewReports(patient)}
                    >
                      View Reports
                    </button>
                    <button 
                      className="upload-btn"
                      onClick={() => handleUploadReports(patient)}
                    >
                      Upload Report
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  // Render the view reports view
  const renderViewReportsView = () => {
    const patientReports = reports[selectedPatient.id] || {};
    
    return (
      <>
        {renderBackButton()}
        
        <div className="patient-info-card">
          <h2>{selectedPatient.name}'s Reports</h2>
          <div className="patient-details">
            <div className="detail-item">
              <span className="detail-label">Age:</span>
              <span className="detail-value">{selectedPatient.age}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Gender:</span>
              <span className="detail-value">{selectedPatient.gender}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Blood Type:</span>
              <span className="detail-value">{selectedPatient.bloodType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Condition:</span>
              <span className="detail-value">{selectedPatient.condition}</span>
            </div>
          </div>
        </div>

        <div className="reports-categories">
          {categories.map(category => {
            const categoryReports = patientReports[category] || [];
            return (
              <div key={category} className="report-category">
                <h3>{category}</h3>
                {categoryReports.length > 0 ? (
                  <div className="category-reports">
                    {categoryReports.map(report => (
                      <div key={report.id} className="report-item">
                        <div className="report-title">{report.title}</div>
                        <div className="report-meta">
                          <span>{report.date}</span>
                          <span> | </span>
                          <span>{report.author}</span>
                        </div>
                        <button className="view-report-btn">Open Report</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-reports">No reports in this category</p>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Render the upload report view
  const renderUploadReportView = () => (
    <>
      {renderBackButton()}
      
      <div className="patient-info-card">
        <h2>Upload Report for {selectedPatient.name}</h2>
        <div className="patient-details">
          <div className="detail-item">
            <span className="detail-label">Age:</span>
            <span className="detail-value">{selectedPatient.age}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Gender:</span>
            <span className="detail-value">{selectedPatient.gender}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Blood Type:</span>
            <span className="detail-value">{selectedPatient.bloodType}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Condition:</span>
            <span className="detail-value">{selectedPatient.condition}</span>
          </div>
        </div>
      </div>

      <div className="upload-form">
        <div className="form-group">
          <label htmlFor="category-select">Select Report Category:</label>
          {!uploadCategory ? (
            <div className="category-buttons">
              {categories.map(category => (
                <button 
                  key={category} 
                  className="category-button"
                  onClick={() => setUploadCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          ) : (
            <div className="selected-category">
              <p>{uploadCategory}</p>
              <button 
                className="change-category"
                onClick={() => setUploadCategory('')}
              >
                Change
              </button>
            </div>
          )}
        </div>

        {uploadCategory && (
          <>
            <div className="form-group">
              <label htmlFor="file-upload">Upload File:</label>
              <div className="file-upload-container">
                <input 
                  type="file" 
                  id="file-upload" 
                  onChange={handleFileChange}
                  className="file-input"
                />
                <div className="file-upload-label">
                  {selectedFile ? selectedFile.name : "Choose file"}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="report-content">Report Notes:</label>
              <textarea 
                id="report-content"
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Enter additional notes or transcribe report content here..."
                rows={6}
                className="report-textarea"
              />
            </div>

            <div className="form-actions">
              <button 
                className="cancel-btn"
                onClick={() => setView('list')}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleSaveReport}
              >
                Save Report
              </button>
            </div>
          </>
        )}
      </div>
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
          <h1>Reports</h1>
          <div className="top-bar-actions">
            
            <div className="search-container">
              
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="section reports-section">
          {view === 'list' && renderListView()}
          {view === 'view' && selectedPatient && renderViewReportsView()}
          {view === 'upload' && selectedPatient && renderUploadReportView()}
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;