import React, { useState, useEffect, useRef } from 'react';
import '../styles/Profile.css';
import PersonalityQuiz from './PersonalityQuiz';
import { 
  FaGithub, FaLinkedin, FaDiscord, FaTwitter, 
  FaInstagram, FaWhatsapp, FaCamera, FaSave, FaUserGraduate, FaBrain, FaClock
} from 'react-icons/fa';
import defaultAvatar from '/avatar.png'; 

{/* REPLACE THE OLD SLIDER SECTION WITH THIS */}
<div className="form-section">
  <div className="section-header">
    <FaBrain /> 
    <h3>Personality Profile</h3>
    <button 
      type="button" 
      className="quiz-retake-btn" 
      onClick={() => setShowQuiz(true)}
    >
      {profile.openness ? 'Retake Analysis' : 'Start Analysis'}
    </button>
  </div>
  
  <p className="section-subtitle">
    Based on the IPIP-20 Scientific Assessment. These scores are calculated automatically.
  </p>

  <div className="traits-display-grid">
    {/* Reusable Read-Only Bar Component */}
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
              backgroundColor: `hsl(${trait.val * 1.2}, 70%, 50%)`
            }} 
          />
        </div>
        <span className="trait-desc">{trait.desc}</span>
      </div>
    ))}
  </div>
</div>

// CheckboxGrid Component
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

// RadioGroup Component
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
  // ... (State initialization remains exactly the same as your code) ...
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
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  // ... (Keep your useEffect and fetch logic exactly as it is) ...
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile.php');
        const data = await res.json();
        if (data.success) {
          const fetchedProfile = { ...profile, ...data.data };
          // Map socials...
          fetchedProfile.whatsapp = data.data.socials?.whatsapp || "";
          fetchedProfile.instagram = data.data.socials?.instagram || "";
          fetchedProfile.discord = data.data.socials?.discord || "";
          fetchedProfile.github = data.data.socials?.github || "";
          fetchedProfile.linkedin = data.data.socials?.linkedin || "";
          fetchedProfile.twitter = data.data.socials?.twitter || "";
          
          setProfile(fetchedProfile);
          
          if (fetchedProfile.profile_pic_url) {
            setImagePreview('/api/' + fetchedProfile.profile_pic_url);
          } else {
            setImagePreview(defaultAvatar);
          }
        }
      } catch (error) { setMessage("Error loading profile"); }
    };
    
    const fetchAllSubjects = async () => { 
        const res = await fetch('/api/subjects.php');
        const data = await res.json();
        if (data.success) setAllSubjects(data.data);
    };
    const fetchAllHobbies = async () => {
        const res = await fetch('/api/hobbies.php');
        const data = await res.json();
        if (data.success) setAllHobbies(data.data);
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchAllSubjects(), fetchAllHobbies()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // ... (Keep your handlers: handleChange, handleSubjectChange, etc.) ...
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
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
    if (file) {
      setProfilePictureFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Saving..."); setMessageType("info");
    
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
        setMessage("Profile saved successfully!"); setMessageType('success');
        if (result.data && result.data.new_image_url) {
          setImagePreview('/api/' + result.data.new_image_url);
          setProfilePictureFile(null);
        }
      } else {
        setMessage(`Error: ${result.message}`); setMessageType('error');
      }
    } catch (error) { setMessage("Error connecting to server."); setMessageType('error'); }
  };

  if (loading) return <div className='loading-screen'>Loading...</div>;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container glass-panel">
        
        {/* Header Section */}
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
          </div>
        </div>

        {message && <div className={`alert-message ${messageType}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          
          {/* 1. Academic & Bio */}
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
            <div className="input-row">
                <div className="input-group">
                    <label>Course</label>
                    <input type="text" name="course" value={profile.course} onChange={handleChange} placeholder="e.g. B.Tech" />
                </div>
                <div className="input-group">
                    <label>Passing Year</label>
                    <input type="number" name="year_of_passing" value={profile.year_of_passing} onChange={handleChange} />
                </div>
            </div>
            <div className="input-group full-width">
                <label>Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
            </div>
            <div className="input-group full-width">
                <label>Primary Goal</label>
                <input type="text" name="goal" value={profile.goal} onChange={handleChange} placeholder="e.g. Hackathons, Research, Study Buddy" />
            </div>
          </div>

          {/* 2. Personality Sliders (The Big 5) */}
          <div className="form-section">
            <div className="section-header"><FaBrain /> <h3>Personality (The Big 5)</h3></div>
            <p className="section-subtitle">Adjust sliders to find your psychological twin.</p>
            
            <div className="sliders-grid">
                <PersonalitySlider label="Openness" name="openness" value={profile.openness} onChange={handleChange} description="Curiosity & Creativity" />
                <PersonalitySlider label="Conscientiousness" name="conscientiousness" value={profile.conscientiousness} onChange={handleChange} description="Organization & Discipline" />
                <PersonalitySlider label="Extraversion" name="extraversion" value={profile.extraversion} onChange={handleChange} description="Social Energy" />
                <PersonalitySlider label="Agreeableness" name="agreeableness" value={profile.agreeableness} onChange={handleChange} description="Cooperation & Trust" />
                <PersonalitySlider label="Neuroticism" name="neuroticism" value={profile.neuroticism} onChange={handleChange} description="Sensitivity to Stress" />
            </div>
          </div>

          {/* 3. Study Habits */}
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

          {/* 4. Interests */}
          <div className="form-section">
            <CheckboxGrid title="Subjects" prefix="subject" items={allSubjects} selectedItems={profile.subjects} onChange={handleSubjectChange} />
            <CheckboxGrid title="Hobbies" prefix="hobby" items={allHobbies} selectedItems={profile.hobbies} onChange={handleHobbyChange} />
          </div>

          {/* 5. Socials */}
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
    </div>
  );
};

export default Profile;