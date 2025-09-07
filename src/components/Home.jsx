import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Home.css';
import image from '../assets/image.png'

const Home = ({onSignIn}) => {

  return (
    <div className='landing-page'>
        <header className='header'>
            <nav className='nav-container'>
                <NavLink
                to="/"
                className="logo">
                EduBuddy
                </NavLink>

                <div className='nav-links'>
                    <a href="#techniques" className="nav-link-item">
                    Study Techniques
                    </a>
                    <button onClick={onSignIn} className='nav-link-item'>Log In</button>
                </div>

                <button onClick={onSignIn}
                className='cta-button'>
                Get Started
                </button>
            </nav>
        </header>
        <main>
            <section className='section-hero'>
                <div className='hero-context'>
                    <div className='text-context'>
                        <h1 className='hero-heading'>
                            Level Up Your Study Game<br /> with <span className="text-gradient">
                                EduBuddy
                            </span>
                        </h1>
                        <p className='her-subheading'>
                            Find your perfect study buddy, collaborate on projects, and ace your exams together. No more solo struggles!
                        </p>
    <div className="hero-cta-group">
    <button onClick={onSignIn} className="primary-cta">
      Join the EduBuddy
    </button>
    </div>
  </div>
  <div className="image-container">
    <img src={image} className="hero-image" />
  </div>
  </div>
</section>

<section id="techniques" className="techniques-section">
  <div className="techniques-container">
    <h2 className="techniques-heading">Study Techniques to Ace Your Exams 🚀</h2>
    <div className="techniques-grid">
      <div className="technique-card">
        <div className="technique-icon">⏱️</div>
        <h3 className="technique-heading">The Pomodoro Technique</h3>
        <p className="technique-description">Work in focused 25-minute intervals, followed by a 5-minute break. This boosts focus and prevents burnout.</p>
      </div>
      <div className="technique-card">
        <div className="technique-icon">🧠</div>
        <h3 className="technique-heading">Active Recall</h3>
        <p className="technique-description">Instead of passively re-reading, actively retrieve information from your memory. Ask yourself questions after each chapter.</p>
      </div>
      <div className="technique-card">
        <div className="technique-icon">⏳</div>
        <h3 className="technique-heading">Spaced Repetition</h3>
        <p className="technique-description">Review material at increasing intervals to move information from your short-term to long-term memory. It's a game-changer!</p>
      </div>
    </div>
  </div>
</section>

<section id="cta" className="cta-section">
  <div className="cta-container">
    <h2 className="cta-heading">Ready to Join the EduBuddy?</h2>
    <p className="cta-subheading">Sign up now and find your study-life balance. It's free to get started!</p>
    <button onClick={onSignIn} className="cta-button-white">
      Sign Up Now
    </button>
  </div>
</section>
</main>

<footer className="footer">
  <div className="footer-container">
    <p className="mb-4">&copy; 2024 StudyHive. All rights reserved.</p>
    <div className="footer-links">
      <a href="#" className="footer-link">Privacy Policy</a>
      <a href="#" className="footer-link">Terms of Service</a>
      <a href="#" className="footer-link">Contact Us</a>
    </div>
  </div>
</footer>
</div>
);
};

export default Home;
