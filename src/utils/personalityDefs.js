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
// Format: Key: ['Title', 'Short Tagline', 'Detailed Fun Description']
export const TITLE_DEFINITIONS = {
  // --- High Openness (Creative/Intellectual) ---
  'OCEAN': ['The Visionary', 'Creative, driven, social, and passionate.', 
    "You are the ultimate powerhouse! You have big ideas, the discipline to execute them, and the social skills to rally a team. Your emotions run deep, fueling your passion for changing the world."],
  
  'OCEAn': ['The Director', 'Strategic, organized, and confident leader.', 
    "You were born to lead. You combine creativity with a cool head and a solid plan. People look to you when things get chaotic because you always know exactly what to do."],

  'OCEaN': ['The Commander', 'Ambitious, competitive, and energetic.', 
    "You are a force of nature. You want to win, and you have the energy to outwork everyone else. You might be a bit blunt, but your vision and drive are undeniable."],

  'OCEan': ['The Executive', 'Efficient, assertive, and cool-headed.', 
    "The perfect CEO personality. You are innovative yet practical, social yet focused, and completely unshakeable under pressure. You get things done."],

  'OCeAN': ['The Perfectionist', 'Detail-oriented, creative, but private.', 
    "You have high standards and a rich inner world. You care deeply about your work and the people around you, often spotting details that everyone else misses."],

  'OCeAn': ['The Architect', 'Imaginative, structured, and self-sufficient.', 
    "You build systems that last. You don't need the spotlight; you just need a quiet room and a difficult problem to solve. You are the master of 'deep work'."],

  'OCeaN': ['The Strategist', 'Focused, analytical, and intensely driven.', 
    "You play the long game. You are intellectually curious and highly disciplined, often seeing patterns and solutions where others only see noise."],

  'OCean': ['The Scholar', 'Intellectual, disciplined, and calm.', 
    "The classic academic. You love learning for the sake of learning. You are reliable, logical, and composed, making you an incredible research partner."],

  'OcEAN': ['The Activist', 'Free-spirited, social, and deeply caring.', 
    "You wear your heart on your sleeve. You love people and possibilities, often jumping from one exciting cause to another. You bring the energy to every study group!"],

  'OcEAn': ['The Inspirer', 'Charismatic, creative, and confident.', 
    "You light up the room. You aren't obsessed with rules, but your confidence and creativity make people want to follow you anywhere."],

  'OcEaN': ['The Debater', 'Energetic, argumentative, and inventive.', 
    "You love a good mental sparring match. You are quick-witted and intense, always challenging the status quo and pushing for better ideas."],

  'OcEan': ['The Entrepreneur', 'Bold, social, and adaptable.', 
    "You think on your feet. You might not have the cleanest notes, but you can sell any idea to anyone. You thrive in chaos and love finding new opportunities."],

  'OceAN': ['The Poet', 'Sensitive, creative, and introverted.', 
    "You feel things deeply and see the world in a unique way. You might be quiet, but your imagination is vivid and endless. You bring heart to every project."],

  'OceAn': ['The Dreamer', 'Imaginative, calm, and introspective.', 
    "You live in a world of ideas. You are gentle and creative, preferring to work at your own pace. You are the one coming up with the 'out of the box' concepts."],

  'OceaN': ['The Individualist', 'Unique, skeptical, and emotionally intense.', 
    "You march to the beat of your own drum. You question everything and refuse to follow the crowd. Your perspective is rare and valuable."],

  'Ocean': ['The Thinker', 'Curious, flexible, and logically minded.', 
    "You are the quintessential problem solver. You keep your cool, analyze the facts, and adapt to new information instantly. Stress rarely phases you."],

  // --- Low Openness (Practical/Down-to-Earth) ---
  'oCEAN': ['The Host', 'Traditional, organized, and very social.', 
    "The glue of the friend group. You love planning events and taking care of people. You are practical, emotional, and incredibly reliable."],

  'oCEAn': ['The Supervisor', 'Reliable, outgoing, and confident.', 
    "The backbone of society. You respect rules, love clarity, and execute tasks with confidence. If there's a group project, you're probably the one managing the timeline."],

  'oCEaN': ['The Enforcer', 'Strict, competitive, and dutiful.', 
    "You mean business. You value results over feelings and discipline over creativity. You are the person who ensures the job gets done right, every time."],

  'oCEan': ['The Manager', 'Practical, efficient, and realistic.', 
    "No nonsense, just results. You are grounded and logical, preferring proven methods over wild experiments. You keep the ship steady."],

  'oCeAN': ['The Defender', 'Loyal, sensitive, and hardworking.', 
    "You are the quiet guardian. You work hard behind the scenes and care deeply about doing the right thing. You are the most loyal friend anyone could ask for."],

  'oCeAn': ['The Traditionalist', 'Steady, calm, and highly principled.', 
    "You value stability and order. You are consistent, disciplined, and unshakeable. People trust you because you always keep your word."],

  'oCeaN': ['The Specialist', 'Focused, private, and precise.', 
    "You are a master of your craft. You don't get distracted by emotions or social drama. You just focus on the facts and get the work done to perfection."],

  'oCean': ['The Realist', 'Logical, orderly, and stoic.', 
    "You see the world exactly as it is. You are immune to hype and drama. Grounded and organized, you are the voice of reason in any crisis."],

  'ocEAN': ['The Performer', 'Spontaneous, fun-loving, and emotional.', 
    "You are the life of the party! You live in the moment, love people, and feel everything intensely. You make college life unforgettable."],

  'ocEAn': ['The Entertainer', 'Confident, relaxed, and social.', 
    "Everyone loves being around you. You are chill, funny, and confident without trying too hard. You know how to have fun and get by without stressing."],

  'ocEaN': ['The Competitor', 'Aggressive, energetic, and present-focused.', 
    "You play to win. You are action-oriented and tough. You don't waste time analyzing abstract theories; you just go out there and make things happen."],

  'ocEan': ['The Operator', 'Casual, practical, and unbothered.', 
    "The ultimate chill personality. You are practical and confident, handling problems as they come without ever losing your cool. Complexity annoys you; simplicity is key."],

  'oceAN': ['The Supporter', 'Gentle, humble, and cooperative.', 
    "You are the kindest soul in the room. You put others first and avoid conflict at all costs. Your quiet strength holds your friends together."],

  'oceAn': ['The Peacekeeper', 'Calm, easy-going, and accepting.', 
    "You go with the flow. You are remarkably stable and agreeable, making you the easiest person to live with or work with. Zero drama."],

  'oceaN': ['The Skeptic', 'Guarded, practical, and independent.', 
    "You trust yourself above all else. You are wary of others' intentions and prefer to rely on your own practical skills. You are a survivor."],

  'ocean': ['The Observer', 'Quiet, detached, and stable.', 
    "The silent watcher. You stay out of the spotlight and analyze the world from a safe distance. You are self-sufficient, calm, and practically invisible until you're needed."]
};

export const getPersonalityKey = (scores) => {
  let key = '';
  key += scores.O >= 50 ? 'O' : 'o';
  key += scores.C >= 50 ? 'C' : 'c';
  key += scores.E >= 50 ? 'E' : 'e';
  key += scores.A >= 50 ? 'A' : 'a';
  key += scores.N >= 50 ? 'N' : 'n';
  return key;
};