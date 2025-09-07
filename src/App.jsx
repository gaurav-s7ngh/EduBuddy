import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import Home from './components/Home';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

const MatchCard = () => <h1>MatchCard Page</h1>;
const Session = () => <h1>Session Page</h1>;

const HomeWrapper = ({ onSignIn }) => {
  return <Home onSignIn={onSignIn} />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  const handleSignIn = () => {
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');  
  };

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh' }}>
      {isLoggedIn && !isHomePage ? (
        <>
          <Sidebar onLogout={handleLogout} />
          <main className="main-content-area" style={{ flexGrow: 1, padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard user="Alex" />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/matchcard" element={<MatchCard />} />
              <Route path="/session" element={<Session />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<HomeWrapper onSignIn={handleSignIn} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
