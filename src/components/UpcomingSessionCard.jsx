// src/components/UpcomingSessionCard.jsx
import React, { useState } from 'react';
import { FaCalendarCheck, FaLink, FaSave } from 'react-icons/fa';
import { getImagePath, API_BASE_URL } from '../apiConfig';

const UpcomingSessionCard = ({ session, onLinkSaved }) => {
  const [linkInput, setLinkInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const formatDate = (datetime) => {
    try {
      const date = new Date(datetime);
      return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) { return datetime; }
  };

  const handleSaveLink = async () => {
    // 1. Strict Frontend Validation
    const googleMeetRegex = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
    
    if (!googleMeetRegex.test(linkInput)) {
      alert('Please paste a valid Google Meet link (e.g., https://meet.google.com/abc-defg-hij).');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/update_link.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buddy_user_id: session.buddy_user_id,
          meet_link: linkInput
        })
      });
      const data = await res.json();
      if (data.success) {
        onLinkSaved(); 
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert('A network error occurred.');
    }
    setIsSaving(false);
  };

  return (
    <div className="session-card">
      <img src={getImagePath(session.buddy_profile_pic)} alt={session.buddy_full_name} className='match-image-mini' />
      
      <div className="session-info">
        <div className="session-text">
          <strong>{session.session_topic}</strong>
          <span>with {session.buddy_full_name}</span>
          <span className="session-time">{formatDate(session.session_datetime)}</span>
        </div>
      </div>
      
      <div className="session-actions-vertical">
        {session.google_meet_link ? (
          <a href={session.google_meet_link} target="_blank" rel="noopener noreferrer" className="meet-link-btn">
            <FaCalendarCheck /> Join Meet
          </a>
        ) : (
          <>
            <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer" className="meet-link-btn create">
              <FaLink /> Create Meet & Copy Link
            </a>
            <div className="save-link-wrapper">
              <input 
                type="text" 
                placeholder="Paste link here..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
              />
              <button onClick={handleSaveLink} disabled={isSaving}>
                <FaSave />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingSessionCard;