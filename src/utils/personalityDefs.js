// src/utils/personalityDefs.js

// Mappings for individual letters (High/Low scorers)
export const TRAIT_DEFINITIONS = {
  'O': ['Open', 'Imaginative, curious, and open to new experiences.'],
  'o': ['Conservative', 'Practical, traditional, and prefers routine.'],
  
  'C': ['Conscientious', 'Organized, disciplined, and goal-oriented.'],
  'c': ['Spontaneous', 'Flexible, casual, and sometimes impulsive.'],
  
  'E': ['Extraverted', 'Outgoing, energetic, and seeks social stimulation.'],
  'e': ['Introverted', 'Reserved, reflective, and enjoys solitude.'],
  
  'A': ['Agreeable', 'Compassionate, cooperative, and trusting.'],
  'a': ['Analytical', 'Skeptical, competitive, and tough-minded.'],
  
  'N': ['Reactive', 'Sensitive to stress and experiences emotions intensely.'], // High Neuroticism
  'n': ['Resilient', 'Calm, confident, and emotionally stable.'] // Low Neuroticism
};

// 32 Types based on Big 5 Combinations (SLOAN notation inspired)
// Key: O-C-E-A-N (Capital = High/Top 50%, Lowercase = Low/Bottom 50%)
export const TITLE_DEFINITIONS = {
  // --- High Openness ---
  'OCEAN': ['The Visionary', 'Creative, driven, social, and passionate.'],
  'OCEAn': ['The Director', 'Strategic, organized, and confident leader.'],
  'OCEaN': ['The Commander', 'Ambitious, competitive, and energetic.'],
  'OCEan': ['The Executive', 'Efficient, assertive, and cool-headed.'],
  
  'OCeAN': ['The Perfectionist', 'Detail-oriented, creative, but private.'],
  'OCeAn': ['The Architect', 'Imaginative, structured, and self-sufficient.'],
  'OCeaN': ['The Strategist', 'Focused, analytical, and intensely driven.'],
  'OCean': ['The Scholar', 'Intellectual, disciplined, and calm.'],
  
  'OcEAN': ['The Activist', 'Free-spirited, social, and deeply caring.'],
  'OcEAn': ['The Inspirer', 'Charismatic, creative, and confident.'],
  'OcEaN': ['The Debater', 'Energetic, argumentative, and inventive.'],
  'OcEan': ['The Entrepreneur', 'Bold, social, and adaptable.'],
  
  'OceAN': ['The Poet', 'Sensitive, creative, and introverted.'],
  'OceAn': ['The Dreamer', 'Imaginative, calm, and introspective.'],
  'OceaN': ['The Individualist', 'Unique, skeptical, and emotionally intense.'],
  'Ocean': ['The Thinker', 'Curious, flexible, and logically minded.'],

  // --- Low Openness (Practical/Conservative) ---
  'oCEAN': ['The Host', 'Traditional, organized, and very social.'],
  'oCEAn': ['The Supervisor', 'Reliable, outgoing, and confident.'],
  'oCEaN': ['The Enforcer', 'Strict, competitive, and dutiful.'],
  'oCEan': ['The Manager', 'Practical, efficient, and realistic.'],
  
  'oCeAN': ['The Defender', 'Loyal, sensitive, and hardworking.'],
  'oCeAn': ['The Traditionalist', 'Steady, calm, and highly principled.'],
  'oCeaN': ['The Specialist', 'Focused, private, and precise.'],
  'oCean': ['The Realist', 'Logical, orderly, and stoic.'],
  
  'ocEAN': ['The Performer', 'Spontaneous, fun-loving, and emotional.'],
  'ocEAn': ['The Entertainer', 'Confident, relaxed, and social.'],
  'ocEaN': ['The Competitor', 'Aggressive, energetic, and present-focused.'],
  'ocEan': ['The Realist', 'Casual, practical, and unbothered.'],
  
  'oceAN': ['The Supporter', 'Gentle, humble, and cooperative.'],
  'oceAn': ['The Peacekeeper', 'Calm, easy-going, and accepting.'],
  'oceaN': ['The Skeptic', 'Guarded, practical, and independent.'],
  'ocean': ['The Observer', 'Quiet, detached, and stable.']
};

/**
 * Helper to generate the 5-letter key from scores
 * @param {Object} scores - { O: 65, C: 40, ... }
 * @returns {String} - e.g., "OcEan"
 */
export const getPersonalityKey = (scores) => {
  let key = '';
  key += scores.O >= 50 ? 'O' : 'o';
  key += scores.C >= 50 ? 'C' : 'c';
  key += scores.E >= 50 ? 'E' : 'e';
  key += scores.A >= 50 ? 'A' : 'a';
  key += scores.N >= 50 ? 'N' : 'n';
  return key;
};