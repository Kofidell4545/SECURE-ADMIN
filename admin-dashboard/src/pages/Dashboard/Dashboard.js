import React from 'react';
import Sidebar from '../../components/Sidebar/SideBar';
import './Dashboard.css';

const Dashboard = ({ onLogout, onNavigate, activePage }) => {
  // Placeholder data for dashboard
  const userData = {
    name: "Nhyiraba David",
    role: "Doctor",
    email: "davidnhyiraba@gmail.com",
  };

  const stats = [
    { id: 1, title: "Total Patients", value: "1,243", change: "+12%" },
    { id: 2, title: "Active Appointments", value: "78", change: "+5%" },
    { id: 3, title: "Treatment Success", value: "92%", change: "+3%" },
    { id: 4, title: "Pending Reports", value: "7", change: "-2%" },
  ];

  const recentActivity = [
    { id: 1, action: "Patient Check-in", user: "Sarah Johnson", time: "10 minutes ago" },
    { id: 2, action: "Medical Record Updated", user: "Mike Smith", time: "1 hour ago" },
    { id: 3, action: "Prescription Issued", user: "Lisa Chen", time: "3 hours ago" },
    { id: 4, action: "New Patient Registration", user: "Robert Davis", time: "Yesterday" },
  ];

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
          <h1>Dashboard</h1>
          <div className="top-bar-actions">
            
            <div className="search-container">
              <input type="text" placeholder="Search..." className="search-input" />
             
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          {stats.map(stat => (
            <div className="stat-card" key={stat.id}>
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
              <p className={`stat-change ${stat.change.includes('+') ? 'positive' : 'negative'}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-list">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map(activity => (
                  <tr key={activity.id}>
                    <td>{activity.action}</td>
                    <td>{activity.user}</td>
                    <td>{activity.time}</td>
                    <td>
                      <button className="details-btn">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;