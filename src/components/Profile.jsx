import React, { useState } from 'react';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    course: "",
    whatsapp: "",
    instagram: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // backend api call to save data 
    alert('Profile saved: ' + JSON.stringify(profile, null, 2));
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Full Name: <br />
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
          />
        </label>

        <label>
          Course: <br />
          <input
            type="text"
            name="course"
            value={profile.course}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
          />
        </label>

        <label>
          Whatsapp: <br />
          <input
            type="text"
            name="whatsapp"
            value={profile.whatsapp}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
          />
        </label>

        <label>
          Instagram: <br />
          <input
            type="text"
            name="instagram"
            value={profile.instagram}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
          />
        </label>

        <button
          type='submit'
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
