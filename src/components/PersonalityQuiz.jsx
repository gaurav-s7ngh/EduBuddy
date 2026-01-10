// src/components/PersonalityQuiz.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Quiz.css';
import { questions as ipip50Questions } from '../data/ipip120'; // Importing your uploaded file

const PersonalityQuiz = ({ onClose, onComplete }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [submitting, setSubmitting] = useState(false);
  const [fadeState, setFadeState] = useState('fade-in');

  const handleOptionSelect = (val) => {
    const questionId = ipip50Questions[currentQIndex].id;
    
    // Save answer
    setAnswers(prev => ({ ...prev, [questionId]: val }));

    // Animate out
    setFadeState('fade-out');

    // Delay for animation then switch question
    setTimeout(() => {
      if (currentQIndex < ipip50Questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setFadeState('fade-in');
      } else {
        submitQuiz({ ...answers, [questionId]: val });
      }
    }, 300);
  };

  const submitQuiz = async (finalAnswers) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz/save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers: finalAnswers, 
          questions: ipip50Questions // Send definitions to backend
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Just return the raw scores; Profile.jsx will handle the "Success" popup
        onComplete(data.data); 
      } else {
        alert("Error: " + data.message);
        setSubmitting(false);
      }
    } catch (err) {
      alert("Failed to save results. Check your connection.");
      setSubmitting(false);
    }
  };

  const currentQ = ipip50Questions[currentQIndex];
  const progress = ((currentQIndex) / ipip50Questions.length) * 100;

  if (submitting) {
    return (
      <div className="quiz-modal-backdrop">
        <div className="quiz-modal-content loading-state">
          <div className="spinner"></div>
          <h3>Analyzing your psychology...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-modal-backdrop">
      <div className="quiz-modal-content">
        
        {/* Header */}
        <div className="quiz-header-minimal">
          <div className="quiz-progress-track">
             <div className="quiz-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <button onClick={onClose} className="quiz-close-btn-minimal">&times;</button>
        </div>

        {/* Question Card */}
        <div className={`quiz-body ${fadeState}`}>
          <span className="quiz-counter">QUESTION {currentQIndex + 1} OF {ipip50Questions.length}</span>
          <h2 className="quiz-statement">"{currentQ.text}"</h2>
          
          <div className="bubble-scale-container">
            <div className="scale-labels">
              <span>Disagree</span>
              <span>Agree</span>
            </div>
            
            <div className="bubble-row">
              <button 
                className="bubble-btn size-xl color-red" 
                onClick={() => handleOptionSelect(1)}
                title="Strongly Disagree"
              />
              <button 
                className="bubble-btn size-md color-red-light" 
                onClick={() => handleOptionSelect(2)}
                title="Disagree"
              />
              <button 
                className="bubble-btn size-sm color-grey" 
                onClick={() => handleOptionSelect(3)}
                title="Neutral"
              />
              <button 
                className="bubble-btn size-md color-green-light" 
                onClick={() => handleOptionSelect(4)}
                title="Agree"
              />
              <button 
                className="bubble-btn size-xl color-green" 
                onClick={() => handleOptionSelect(5)}
                title="Strongly Agree"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PersonalityQuiz;