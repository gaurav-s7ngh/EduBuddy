import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaCalendarCheck, FaCheck, FaTimes, FaBrain } from 'react-icons/fa';
import { TRAIT_DEFINITIONS, TITLE_DEFINITIONS } from '../utils/personalityDefs';
import { API_BASE_URL, getImagePath } from '../apiConfig'; 
import UpcomingSessionCard from './UpcomingSessionCard'; 

// --- UPDATED PERSONALITY BANNER ---
const PersonalityDisplay = ({ profile }) => {
  // CRITICAL FIX: Safety check to prevent crashing if data is missing
  if (!profile || !profile.personality_title || !profile.personality_type) return null; 

  const typeKey = profile.personality_type;
  
  // Get definitions safely
  const title = TITLE_DEFINITIONS[typeKey] ? TITLE_DEFINITIONS[typeKey][0] : profile.personality_title;
  // Index 2 is the new "Fun Description" we added
  const description = TITLE_DEFINITIONS[typeKey] ? TITLE_DEFINITIONS[typeKey][2] : "Your unique personality type.";

  // Safe split for traits
  const decodedTraits = typeKey.split('').map(letter => ({
    letter,
    name: TRAIT_DEFINITIONS[letter] ? TRAIT_DEFINITIONS[letter][0] : 'Unknown'
  }));

  return (
    <div className="personality-banner">
      <div className="personality-banner-header">
        <FaBrain className="icon" />
        <div>
            <h3>{title}</h3>
            <span className="personality-code">({typeKey})</span>
        </div>
      </div>
      
      {/* Display the new detailed description */}
      <p className="personality-description">
        {description}
      </p>

      <ul className="personality-trait-list">
        {decodedTraits.map((trait, index) => (
          <li key={index} className="personality-trait-item">
            <strong>{trait.name}</strong> <span>({trait.letter})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
// ----------------------------------

const MiniMatchcard = ({ match }) => (
  <div className='card mini-match-card'>
    <img src={getImagePath(match.profile_pic_url)} alt={match.full_name} className='match-image-mini' />
    <div className="match-info">
      <div className="match-name">{match.full_name}</div>
      <div className="match-detail">{match.college}</div>
    </div>
  </div>
);

const PendingRequestCard = ({ request, onRespond }) => (
  <div className="session-card">
    <img src={getImagePath(request.profile_pic_url)} alt={request.full_name} className='match-image-mini' />
    <div className="session-info"><strong>{request.full_name}</strong> wants to connect!</div>
    <div className="session-actions">
      <button className="respond-btn accept" onClick={() => onRespond(request.user_id, 'connect')}><FaCheck /> Accept</button>
      <button className="respond-btn dismiss" onClick={() => onRespond(request.user_id, 'dismiss')}><FaTimes /> Dismiss</button>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [sessionData, setSessionData] = useState({ 
    pending_requests: [], 
    planned_sessions: [] 
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [matchesRes, sessionsRes, profileRes] = await Promise.all([
        fetch(`${API_BASE_URL}/matches.php?limit=5`), 
        fetch(`${API_BASE_URL}/sessions.php`),      
        fetch(`${API_BASE_URL}/profile.php`)        
      ]);
      const matchesData = await matchesRes.json();
      if (matchesData.success) setTopMatches(matchesData.data);
      
      const sessionsData = await sessionsRes.json();
      if (sessionsData.success) setSessionData(sessionsData.data);
      
      const profileData = await profileRes.json();
      if (profileData.success) setProfile(profileData.data);
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRequestResponse = async (targetUserId, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/interact.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetUserId, action: action })
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData(); 
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("A network error occurred.");
    }
  };

  if (loading) {
    return <div className='dash-main'><h2>Loading your dashboard...</h2></div>;
  }

  return (
    <div className='dash-main'>
      <div className='dash-header'>
        <h2>Hey there, {user?.full_name || 'Buddy'}! 👋</h2>
        <Link to="/profile" className='about-btn'>Edit Profile</Link>
      </div>
      
      {/* Updated PersonalityDisplay handles the missing data check internally now */}
      <PersonalityDisplay profile={profile} />

      {sessionData.pending_requests && sessionData.pending_requests.length > 0 && (
        <div className="dashboard-section">
          <h3><FaUserPlus /> New Buddy Requests</h3>
          <div className='session-list'>
            {sessionData.pending_requests.map(req => (
              <PendingRequestCard key={req.user_id} request={req} onRespond={handleRequestResponse} />
            ))}
          </div>
        </div>
      )}

      {sessionData.planned_sessions && sessionData.planned_sessions.length > 0 && (
        <div className="dashboard-section">
          <h3><FaCalendarCheck /> Upcoming Sessions</h3>
          <div className='session-list'>
            {sessionData.planned_sessions.map(sess => (
              <UpcomingSessionCard 
                key={sess.buddy_user_id} 
                session={sess} 
                onLinkSaved={fetchDashboardData} 
              />
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>Top New Matches for You</h3>
          <Link to="/Matchcard" className="view-all-link">View All &rarr;</Link>
        </div>
        <div className='matches-row'>
          {topMatches.length > 0 ? (
            topMatches.map((m) => (
              <MiniMatchCard match={m} key={m.user_id} />
            ))
          ) : (
            <p>No new matches. Complete your profile to get more!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;