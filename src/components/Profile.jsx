import React, { useState, useEffect, useRef } from 'react';
import '../styles/Profile.css';
import PersonalityQuiz from './PersonalityQuiz';
import { 
  FaGithub, FaLinkedin, FaDiscord, FaTwitter, 
  FaInstagram, FaCamera, FaSave, FaUserGraduate, FaBrain, FaClock, FaCheckCircle
} from 'react-icons/fa';
import defaultAvatar from '/avatar.png'; 
import { getPersonalityKey, TITLE_DEFINITIONS } from '../utils/personalityDefs'; // Import new helpers

// --- Pretty Success Popup Component ---
const SuccessPopup = ({ message, onClose }) => (
  <div className="success-popup-backdrop">
    <div className="success-popup-card">
      <div className="icon-circle">
        <FaCheckCircle />
      </div>
      <h3>Success!</h3>
      <p>{message}</p>
      <button onClick={onClose}>Awesome</button>
    </div>
  </div>
);

// ... (CheckboxGrid and RadioGroup components remain the same) ...
const CheckboxGrid = ({ title, prefix, items, selectedItems, onChange }) => (
  <div className="form-group-card">
    <label className="section-title">{title}</label>
    <div className="tag-grid">
      {items.map(item => {
        const id = (prefix === 'subject') ? item.subject_id : item.hobby_id;
        const name = (prefix === 'subject') ? item.subject_name : item.hobby_name;
        const isChecked = selectedItems.some(s => (prefix === 'subject' && s.subject_id === id) || (prefix === 'hobby' && s.hobby_id === id));
        return (
          <label key={`${prefix}-${id}`} className={`tag-checkbox ${isChecked ? 'active' : ''}`}>
            <input type="checkbox" checked={isChecked} onChange={(e) => onChange(e, item)} />
            {name}
          </label>
        );
      })}
    </div>
  </div>
);

const RadioGroup = ({ title, name, options, selectedValue, onChange }) => (
  <div className="form-group-card">
    <label className="section-title">{title}</label>
    <div className="radio-grid">
      {options.map(opt => (
        <label key={opt.value} className={`radio-card ${selectedValue === opt.value ? 'active' : ''}`}>
          <input type="radio" name={name} value={opt.value} checked={selectedValue === opt.value} onChange={onChange} />
          <span className="radio-label">{opt.label}</span>
        </label>
      ))}
    </div>
  </div>
);

const Profile = () => {
  // ... (State mostly the same, add showSuccess) ...
  const [profile, setProfile] = useState({
    full_name: "", college: "", bio: "", preferred_study_time: "00:00:00",
    goal: "", focus_time: "flexible", session_length: "flexible",
    openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50,
    course: "", year_of_passing: "", 
    whatsapp: "", instagram: "", discord: "", github: "", linkedin: "", twitter: "",
    subjects: [], hobbies: [],
    profile_pic_url: defaultAvatar 
  });
  
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultAvatar);
  const fileInputRef = useRef(null);

  const [allSubjects, setAllSubjects] = useState([]); 
  const [allHobbies, setAllHobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(""); // For inline errors
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // NEW state for popup

  useEffect(() => {
    // ... (Fetch logic remains exactly the same) ...
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile.php');
        const data = await res.json();
        if (data.success) {
          const fetchedProfile = { ...profile, ...data.data };
          fetchedProfile.whatsapp = data.data.socials?.whatsapp || "";
          fetchedProfile.instagram = data.data.socials?.instagram || "";
          fetchedProfile.discord = data.data.socials?.discord || "";
          fetchedProfile.github = data.data.socials?.github || "";
          fetchedProfile.linkedin = data.data.socials?.linkedin || "";
          fetchedProfile.twitter = data.data.socials?.twitter || "";
          
          setProfile(fetchedProfile);
          if (fetchedProfile.profile_pic_url) setImagePreview('/api/' + fetchedProfile.profile_pic_url);
        }
      } catch (error) { console.error(error); }
    };
    const fetchAllSubjects = async () => {
         try { const res = await fetch('/api/subjects.php'); const d = await res.json(); if(d.success) setAllSubjects(d.data); } catch(e){}
    };
    const fetchAllHobbies = async () => {
         try { const res = await fetch('/api/hobbies.php'); const d = await res.json(); if(d.success) setAllHobbies(d.data); } catch(e){}
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchAllSubjects(), fetchAllHobbies()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handlers
  const handleChange = (e) => { const { name, value } = e.target; setProfile(prev => ({ ...prev, [name]: value })); };
  const handleSubjectChange = (e, subject) => {
    const { checked } = e.target;
    setProfile(prev => ({...prev, subjects: checked ? [...prev.subjects, subject] : prev.subjects.filter(s => s.subject_id !== subject.subject_id)}));
  };
  const handleHobbyChange = (e, hobby) => {
    const { checked } = e.target;
    setProfile(prev => ({...prev, hobbies: checked ? [...prev.hobbies, hobby] : prev.hobbies.filter(h => h.hobby_id !== hobby.hobby_id)}));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setProfilePictureFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleQuizComplete = (newScores) => {
    // newScores contains { openness: 80, ... }
    setProfile(prev => ({ ...prev, ...newScores }));
    setShowQuiz(false);
    setShowSuccess(true); // Show success popup
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear errors
    
    const formData = new FormData();
    for (const key in profile) {
      if (key !== 'subjects' && key !== 'hobbies' && key !== 'profile_pic_url') {
        formData.append(key, profile[key]);
      }
    }
    formData.append('subjects', JSON.stringify(profile.subjects));
    formData.append('hobbies', JSON.stringify(profile.hobbies));
    if (profilePictureFile) formData.append('profile_picture', profilePictureFile);
    
    try {
      const res = await fetch('/api/profile.php', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        setShowSuccess(true); // Show success popup
        if (result.data && result.data.new_image_url) {
          setImagePreview('/api/' + result.data.new_image_url);
          setProfilePictureFile(null);
        }
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch (error) { setMessage("Error connecting to server."); }
  };

  // Determine Title based on current profile state
  // We construct the key (e.g., "OcEan") and look it up
  const personalityKey = getPersonalityKey({
      O: profile.openness, C: profile.conscientiousness, 
      E: profile.extraversion, A: profile.agreeableness, N: profile.neuroticism
  });
  // Safely get title or fallback
  const personalityTitle = (TITLE_DEFINITIONS[personalityKey] && TITLE_DEFINITIONS[personalityKey][0]) || "The Student";

  if (loading) return <div className='loading-screen'>Loading...</div>;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container glass-panel">
        
        {/* Header */}
        <div className="profile-header">
          <div className="profile-pic-wrapper">
            <img src={imagePreview} alt="Profile" className="profile-pic" />
            <button type="button" className="camera-btn" onClick={() => fileInputRef.current.click()}>
              <FaCamera />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />
          </div>
          <div className="header-text">
            <h2>{profile.full_name || "Your Name"}</h2>
            <p>{profile.college || "Your University"}</p>
            {/* Display the calculated Personality Title */}
            <div className="personality-badge">{personalityTitle}</div>
          </div>
        </div>

        {message && <div className="alert-message error">{message}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
           {/* ... (Academic Profile Section - same as before) ... */}
           <div className="form-section">
            <div className="section-header"><FaUserGraduate /> <h3>Academic Profile</h3></div>
            <div className="input-row">
                <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" name="full_name" value={profile.full_name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>College</label>
                    <input type="text" name="college" value={profile.college} onChange={handleChange} />
                </div>
            </div>
            {/* ... rest of academic inputs ... */}
            <div className="input-group full-width">
                <label>Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
            </div>
          </div>

          {/* Personality Section */}
          <div className="form-section">
            <div className="section-header">
              <FaBrain /> 
              <h3>Personality Profile</h3>
              <button type="button" className="quiz-retake-btn" onClick={() => setShowQuiz(true)}>
                Start Analysis (IPIP-50)
              </button>
            </div>
            
            <p className="section-subtitle">
              Based on the IPIP-50 Scientific Assessment.
            </p>

            <div className="traits-display-grid">
              {[
                { label: 'Openness', val: profile.openness, desc: 'Creativity & Curiosity' },
                { label: 'Conscientiousness', val: profile.conscientiousness, desc: 'Discipline & Order' },
                { label: 'Extraversion', val: profile.extraversion, desc: 'Social Energy' },
                { label: 'Agreeableness', val: profile.agreeableness, desc: 'Cooperation' },
                { label: 'Neuroticism', val: profile.neuroticism, desc: 'Sensitivity' }
              ].map((trait) => (
                <div key={trait.label} className="trait-bar-container">
                  <div className="trait-info">
                    <span className="trait-label">{trait.label}</span>
                    <span className="trait-score">{trait.val}%</span>
                  </div>
                  <div className="trait-progress-track">
                    <div 
                      className="trait-progress-fill" 
                      style={{ 
                        width: `${trait.val}%`,
                        backgroundColor: `hsl(${140 + (trait.val * 0.4)}, 70%, 50%)`
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ... (Study Habits, Interests, Socials sections remain the same) ... */}
           <div className="form-section">
            <div className="section-header"><FaClock /> <h3>Study Habits</h3></div>
            <RadioGroup
              title="When do you focus best?" name="focus_time" selectedValue={profile.focus_time} onChange={handleChange}
              options={[
                { label: '☀️ Early Bird', value: 'early_bird' },
                { label: '😎 Day Tripper', value: 'day_tripper' },
                { label: '🌙 Night Owl', value: 'night_owl' },
                { label: '🔄 Flexible', value: 'flexible' }
              ]}
            />
             <RadioGroup
              title="Session Style" name="session_length" selectedValue={profile.session_length} onChange={handleChange}
              options={[
                { label: '⏱️ Pomodoro (25m)', value: 'pomodoro' },
                { label: '📚 Medium (1h)', value: 'medium' },
                { label: '🏋️ Marathon (2h+)', value: 'marathon' },
                { label: '🔄 Flexible', value: 'flexible' }
              ]}
            />
          </div>

          <div className="form-section">
            <CheckboxGrid title="Subjects" prefix="subject" items={allSubjects} selectedItems={profile.subjects} onChange={handleSubjectChange} />
            <CheckboxGrid title="Hobbies" prefix="hobby" items={allHobbies} selectedItems={profile.hobbies} onChange={handleHobbyChange} />
          </div>

          <div className="form-section">
             <div className="section-header"><h3>Social Links</h3></div>
             <div className="socials-grid">
                <div className="social-item"><FaGithub/><input name="github" value={profile.github} onChange={handleChange} placeholder="GitHub User" /></div>
                <div className="social-item"><FaLinkedin/><input name="linkedin" value={profile.linkedin} onChange={handleChange} placeholder="LinkedIn URL" /></div>
                <div className="social-item"><FaTwitter/><input name="twitter" value={profile.twitter} onChange={handleChange} placeholder="Twitter Handle" /></div>
                <div className="social-item"><FaInstagram/><input name="instagram" value={profile.instagram} onChange={handleChange} placeholder="Instagram" /></div>
             </div>
          </div>

          <button type='submit' className="save-btn"><FaSave /> Save Profile</button>
        </form>
      </div>

      {/* Modals */}
      {showQuiz && <PersonalityQuiz onClose={() => setShowQuiz(false)} onComplete={handleQuizComplete} />}
      {showSuccess && <SuccessPopup message="Profile Saved Successfully!" onClose={() => setShowSuccess(false)} />}
    </div>
  );
};

export default Profile;