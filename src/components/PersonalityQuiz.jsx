import React, { useState } from 'react';
import '../styles/Quiz.css';
import { FaCheck } from 'react-icons/fa';

// The Mini-IPIP 20 Item Scale (Donnellan et al., 2006)
// key: +/- indicates if it positively or negatively correlates with the trait
// trait: O, C, E, A, N
const ipipQuestions = [
  // Extraversion
  { id: 1, text: "I am the life of the party.", trait: 'E', key: '+' },
  { id: 6, text: "I don't talk a lot.", trait: 'E', key: '-' },
  { id: 11, text: "I talk to a lot of different people at parties.", trait: 'E', key: '+' },
  { id: 16, text: "I keep in the background.", trait: 'E', key: '-' },

  // Agreeableness
  { id: 2, text: "I sympathize with others' feelings.", trait: 'A', key: '+' },
  { id: 7, text: "I am not interested in other people's problems.", trait: 'A', key: '-' },
  { id: 12, text: "I feel others' emotions.", trait: 'A', key: '+' },
  { id: 17, text: "I am not really interested in others.", trait: 'A', key: '-' },

  // Conscientiousness
  { id: 3, text: "I get chores done right away.", trait: 'C', key: '+' },
  { id: 8, text: "I often forget to put things back in their proper place.", trait: 'C', key: '-' },
  { id: 13, text: "I like order.", trait: 'C', key: '+' },
  { id: 18, text: "I make a mess of things.", trait: 'C', key: '-' },

  // Neuroticism
  { id: 4, text: "I have frequent mood swings.", trait: 'N', key: '+' },
  { id: 9, text: "I am relaxed most of the time.", trait: 'N', key: '-' },
  { id: 14, text: "I get upset easily.", trait: 'N', key: '+' },
  { id: 19, text: "I seldom feel blue.", trait: 'N', key: '-' },

  // Openness
  { id: 5, text: "I have a vivid imagination.", trait: 'O', key: '+' },
  { id: 10, text: "I am not interested in abstract ideas.", trait: 'O', key: '-' },
  { id: 15, text: "I have difficulty understanding abstract ideas.", trait: 'O', key: '-' },
  { id: 20, text: "I do not have a good imagination.", trait: 'O', key: '-' },
];

const PersonalityQuiz = ({ onClose, onComplete }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores { questionId: 1-5 }
  const [submitting, setSubmitting] = useState(false);

  const handleOptionSelect = (val) => {
    const questionId = ipipQuestions[currentQIndex].id;
    
    // Save answer and move to next immediately for smooth flow
    setAnswers(prev => ({ ...prev, [questionId]: val }));

    // Delay slighty to show visual feedback
    setTimeout(() => {
      if (currentQIndex < ipipQuestions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
      } else {
        // Quiz finished
        submitQuiz({ ...answers, [questionId]: val });
      }
    }, 150);
  };

  const submitQuiz = async (finalAnswers) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz/save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, questions: ipipQuestions }),
      });
      const data = await res.json();
      
      if (data.success) {
        onComplete(data.data); // Pass calculated scores back
      } else {
        alert("Error: " + data.message);
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save results.");
      setSubmitting(false);
    }
  };

  const currentQ = ipipQuestions[currentQIndex];
  const progress = ((currentQIndex) / ipipQuestions.length) * 100;

  if (submitting) {
    return (
      <div className="quiz-modal-backdrop">
        <div className="quiz-modal-content loading">
          <h2>Analyzing Personality...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-modal-backdrop">
      <div className="quiz-modal-content">
        <div className="quiz-header">
          <h2>Personality Assessment</h2>
          <button onClick={onClose} className="quiz-close-btn">&times;</button>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="quiz-question-container">
          <p className="quiz-counter">Statement {currentQIndex + 1} of {ipipQuestions.length}</p>
          <h3 className="quiz-statement">"{currentQ.text}"</h3>
          
          <div className="likert-scale">
            <button className="likert-btn disagree-strong" onClick={() => handleOptionSelect(1)}>Strongly Disagree</button>
            <button className="likert-btn disagree" onClick={() => handleOptionSelect(2)}>Disagree</button>
            <button className="likert-btn neutral" onClick={() => handleOptionSelect(3)}>Neutral</button>
            <button className="likert-btn agree" onClick={() => handleOptionSelect(4)}>Agree</button>
            <button className="likert-btn agree-strong" onClick={() => handleOptionSelect(5)}>Strongly Agree</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityQuiz;