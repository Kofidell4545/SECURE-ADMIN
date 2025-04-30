import React from 'react';
import logo from "../../assets/images/logo.svg";
import './Sidebar.css';

const Sidebar = ({ activePage, onNavigate, userData, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard-icon' },
    { id: 'patients', label: 'Patients', icon: 'users-icon' },
    
    { id: 'reports', label: 'Reports', icon: 'reports-icon' },
    { id: 'messageemergency', label: 'MessageEmergency', icon: 'settings-icon' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Secure Logo" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li 
              key={item.id}
              className={activePage === item.id ? 'active' : ''}
              onClick={() => onNavigate(item.id)}
            >
              <i className={`icon ${item.icon}`}></i> {item.label}
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {userData.name.split(' ').map(name => name[0]).join('')}
          </div>
          <div className="user-info">
            <p className="user-name">{userData.name}</p>
            <p className="user-role">{userData.role}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;