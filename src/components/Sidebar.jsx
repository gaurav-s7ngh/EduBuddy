// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/SideBar.css'; // Fixed casing to match file

const Sidebar = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogoutClick = async () => {
    try {
      await fetch('/api/auth/logout.php');
      handleLogout();
      navigate('/');
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div className='sidebar'>
      <div className='logo-container'>
        <span className='logo-text'>EduBuddy</span>
      </div>
      
      <nav className='nav'>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
          Dashboard
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
          Profile
        </NavLink>
        <NavLink
          to="/Matchcard"
          className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
          MatchCard
        </NavLink>
        <NavLink
          to="/session"
          className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
          Sessions
        </NavLink>
        
        <button 
          onClick={onLogoutClick} 
          className="nav-link logout-btn"
        >
          Log Out
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;