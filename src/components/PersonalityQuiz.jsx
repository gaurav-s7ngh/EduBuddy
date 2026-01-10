import React, { useState } from 'react';
import '../styles/Quiz.css';
import { questions } from '../data/ipip120';
import { API_BASE_URL } from '../apiConfig';

const ITEMS_PER_PAGE = 10;

const PersonalityQuiz = ({ onClose, onComplete }) => {
  // Answers state: { 1: 5, 2: 1, ... } (QuestionID: Score 1-5)
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const currentQuestions = questions.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleSelect = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const isPageComplete = currentQuestions.every(q => answers[q.id] !== undefined);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/quiz/save.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.success) {
        onComplete(data.data); 
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("An error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="quiz-modal-backdrop">
      <div className="quiz-modal-content" style={{maxWidth: '800px'}}>
        <div className="quiz-header">
          <h2>Personality Assessment</h2>
          <button onClick={onClose} className="quiz-close-btn">&times;</button>
        </div>
        
        <div className="quiz-instructions">
          Describe yourself as you generally are now, not as you wish to be.
        </div>

        <div className="quiz-list">
          {currentQuestions.map((q) => (
            <div key={q.id} className="quiz-item-row">
              <p className="quiz-text">{q.text}</p>
              <div className="quiz-options-scale">
                {/* 1 = Inaccurate, 5 = Accurate */}
                {[1, 2, 3, 4, 5].map(val => (
                  <label key={val} className={`scale-option ${answers[q.id] === val ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name={`q${q.id}`} 
                      value={val} 
                      checked={answers[q.id] === val} 
                      onChange={() => handleSelect(q.id, val)} 
                    />
                    <span className="scale-number">{val}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="scale-labels">
          <span>Very Inaccurate</span>
          <span>Very Accurate</span>
        </div>

        <div className="quiz-navigation">
          <span className="quiz-progress">Page {currentPage + 1} of {totalPages}</span>
          
          {currentPage < totalPages - 1 ? (
            <button onClick={handleNext} disabled={!isPageComplete} className="quiz-nav-btn">
              Next Page
            </button>
          ) : (
            <button onClick={handleFinish} disabled={!isPageComplete || submitting} className="quiz-nav-btn finish">
              {submitting ? 'Analyzing...' : 'Submit & Get Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalityQuiz;