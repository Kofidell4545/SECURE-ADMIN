import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/SideBar';
import './PatientPage.css';

const PatientsPage = ({ onLogout, onNavigate, activePage }) => {
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
      appointmentTime: "09:30 AM, Today", 
      status: "Checked In",
      age: 34,
      condition: "Regular Checkup"
    },
    { 
      id: 2, 
      name: "James Peterson", 
      appointmentTime: "10:15 AM, Today", 
      status: "Waiting",
      age: 45,
      condition: "Hypertension Follow-up"
    },
    { 
      id: 3, 
      name: "Sophia Martinez", 
      appointmentTime: "11:00 AM, Today", 
      status: "In Treatment",
      age: 28,
      condition: "Pregnancy Check"
    },
    { 
      id: 4, 
      name: "Michael Chen", 
      appointmentTime: "12:30 PM, Today", 
      status: "Scheduled",
      age: 52,
      condition: "Diabetes Management"
    },
    { 
      id: 5, 
      name: "Olivia Wilson", 
      appointmentTime: "01:45 PM, Today", 
      status: "Scheduled",
      age: 19,
      condition: "Annual Physical"
    },
    { 
      id: 6, 
      name: "Robert Garcia", 
      appointmentTime: "03:00 PM, Today", 
      status: "Cancelled",
      age: 67,
      condition: "Cardiac Assessment"
    },
    { 
      id: 7, 
      name: "Ava Johnson", 
      appointmentTime: "09:15 AM, Tomorrow", 
      status: "Scheduled",
      age: 5,
      condition: "Pediatric Checkup"
    },
    { 
      id: 8, 
      name: "William Brown", 
      appointmentTime: "10:45 AM, Tomorrow", 
      status: "Scheduled",
      age: 39,
      condition: "Physical Therapy"
    }
  ]);

  // Filter patients by status
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPatients = statusFilter === 'All' 
    ? patients 
    : patients.filter(patient => patient.status === statusFilter);

  // Get unique statuses for filter options
  const statuses = ['All', ...new Set(patients.map(patient => patient.status))];

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
          <h1>My Patients</h1>
          <div className="top-bar-actions">
            
            <div className="search-container">
              <input type="text" placeholder="Search patients..." className="search-input" />
             
            </div>
          </div>
        </div>

        {/* Patients Section */}
        <div className="section patients-section">
          <div className="section-header">
            <div className="filters">
              <label htmlFor="status-filter">Filter by status:</label>
              <select 
                id="status-filter" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <button className="add-patient-btn">
              <i className="icon add-icon"></i> Add New Patient
            </button>
          </div>

          <div className="patients-table-container">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Appointment Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id} className={`status-${patient.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    <td>
                      <div className="patient-name">{patient.name}</div>
                      <div className="patient-detail">Age: {patient.age} | {patient.condition}</div>
                    </td>
                    <td>{patient.appointmentTime}</td>
                    <td>
                      <span className={`status-badge ${patient.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-btn">View</button>
                        <button className="edit-btn">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button className="pagination-btn">&lt; Previous</button>
            <div className="page-numbers">
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
            </div>
            <button className="pagination-btn">Next &gt;</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientsPage;