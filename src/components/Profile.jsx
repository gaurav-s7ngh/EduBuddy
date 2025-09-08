import React, { useState } from 'react';
import '../styles/Profile.css';


const Profile = () => {
  const [User, setUser] = useState({
    name: '',
    email: '',
    bio: 'Passionate Developer And Booom',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('Profile Updated Successfully!');
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">User Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <label className="profile-label">
          Name:
          <input
            type="text"
            name="name"
            value={User.name}
            onChange={handleChange}
            required
            placeholder="Your full name"
            className="profile-input"
          />
        </label>

        <label className="profile-label">
          Email:
          <input
            type="email"
            name="email"
            value={User.email}
            onChange={handleChange}
            required
            placeholder="email@example.com"
            className="profile-input"
          />
        </label>

        <label className="profile-label">
          Bio:
          <textarea
            name="bio"
            value={User.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about yourself"
            className="profile-textarea"
          />
        </label>

        <button type="submit" className="profile-button">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
