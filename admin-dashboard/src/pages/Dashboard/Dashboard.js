import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/SideBar';
import apiService from '../../services/apiService';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';

const Dashboard = ({ onLogout, onNavigate, activePage }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeAppointments: 0,
    treatmentSuccess: 0,
    pendingReports: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Get stats from API
        const dashboardStats = await apiService.dashboard.getStats();
        setStats(dashboardStats);

        // Get recent activity
        const activity = await apiService.dashboard.getRecentActivity();
        setRecentActivity(activity);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [showError]);

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const statsData = [
    {
      id: 1,
      title: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      change: "+12%",
      isPositive: true
    },
    {
      id: 2,
      title: "Active Appointments",
      value: stats.activeAppointments,
      change: "+5%",
      isPositive: true
    },
    {
      id: 3,
      title: "Treatment Success",
      value: `${stats.treatmentSuccess}%`,
      change: "+3%",
      isPositive: true
    },
    {
      id: 4,
      title: "Pending Reports",
      value: stats.pendingReports,
      change: "-2%",
      isPositive: false
    },
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
          {statsData.map((stat) => (
            <div key={stat.id} className="stat-card">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
              <p className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="view-all-btn" onClick={() => onNavigate('patients')}>
              View All
            </button>
          </div>
          <div className="activity-list">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity, index) => (
                  <tr key={index}>
                    <td>{activity.action}</td>
                    <td>{activity.user}</td>
                    <td>{formatTimeAgo(activity.time)}</td>
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