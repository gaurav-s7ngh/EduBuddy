import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { FaUserPlus, FaCalendarCheck, FaCheck, FaTimes, FaComments } from 'react-icons/fa';
import PlanSessionModal from './PlanSessionModal'; 
import UpcomingSessionCard from './UpcomingSessionCard'; // <-- Import NEW Component
import { API_BASE_URL, getImagePath } from '../apiConfig'; // <-- Import NEW Config

const PendingRequestCard = ({ request, onRespond }) => (
  <div className="session-card">
    <img src={getImagePath(request.profile_pic_url)} alt={request.full_name} className='match-image-mini' />
    <div className="session-info">
      <strong>{request.full_name}</strong> wants to connect!
    </div>
    <div className="session-actions">
      <button className="respond-btn accept" onClick={() => onRespond(request.user_id, 'connect')}>
        <FaCheck /> Accept
      </button>
      <button className="respond-btn dismiss" onClick={() => onRespond(request.user_id, 'dismiss')}>
        <FaTimes /> Dismiss
      </button>
    </div>
  </div>
);

const ConnectionCard = ({ buddy, onPlan }) => (
  <div className="connection-card">
    <img src={getImagePath(buddy.buddy_profile_pic)} alt={buddy.buddy_full_name} className='match-image-mini' />
    <div className="connection-info">
      <strong>{buddy.buddy_full_name}</strong>
      <span>{buddy.college}</span>
      {buddy.personality_title && (
        <span className="connection-personality">{buddy.personality_title}</span>
      )}
    </div>
    <div className="connection-actions">
      <button className="plan-btn" onClick={() => onPlan(buddy)}>
        <FaComments /> Plan Session
      </button>
    </div>
  </div>
);

const Session = () => {
  const [sessionData, setSessionData] = useState({ 
    pending_requests: [], 
    planned_sessions: [],
    my_connections: [] 
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [buddyToPlan, setBuddyToPlan] = useState(null);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      // FIX: Use API_BASE_URL
      const sessionsRes = await fetch(`${API_BASE_URL}/sessions.php`);
      const data = await sessionsRes.json();
      if (data.success) {
        setSessionData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, []);

  const handleRequestResponse = async (targetUserId, action) => {
    try {
      // FIX: Use API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/matches/interact.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetUserId, action: action })
      });
      const data = await res.json();
      if (data.success) {
        fetchSessionData(); 
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("A network error occurred.");
    }
  };

  const handleOpenModal = (buddy) => {
    setBuddyToPlan(buddy);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setBuddyToPlan(null);
  };
  const handlePlanSuccess = () => {
    handleCloseModal();
    fetchSessionData(); 
  };

  if (loading) {
    return <div className="dash-main"><h2>Loading Sessions...</h2></div>;
  }

  return (
    <>
      {showModal && (
        <PlanSessionModal 
          buddy={buddyToPlan}
          onClose={handleCloseModal}
          onPlanSuccess={handlePlanSuccess}
        />
      )}
    
      <div className="dash-main">
        <div className="dash-header">
          <h2>My Sessions</h2>
        </div>

        {sessionData.pending_requests.length > 0 && (
          <div className="dashboard-section">
            <h3><FaUserPlus /> New Buddy Requests</h3>
            <div className='session-list'>
              {sessionData.pending_requests.map(req => (
                <PendingRequestCard key={req.user_id} request={req} onRespond={handleRequestResponse} />
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-section">
          <h3><FaCalendarCheck /> Upcoming Planned Sessions</h3>
          <div className='session-list'>
            {sessionData.planned_sessions.length > 0 ? (
              sessionData.planned_sessions.map(sess => (
                <UpcomingSessionCard 
                  key={sess.buddy_user_id} 
                  session={sess} 
                  onLinkSaved={fetchSessionData} 
                />
              ))
            ) : (
              <p>You have no sessions planned. Plan one with a connection below!</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h3><FaComments /> My Connections</h3>
          <div className='connection-grid'>
            {sessionData.my_connections.length > 0 ? (
              sessionData.my_connections.map(buddy => (
                <ConnectionCard key={buddy.buddy_user_id} buddy={buddy} onPlan={handleOpenModal} />
              ))
            ) : (
              <p>You haven't matched with anyone yet. Go to the "MatchCard" page to find buddies!</p>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default Session;