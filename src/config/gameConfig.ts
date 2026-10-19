import { LevelConfig, GameLevelNumber, Achievement } from '../types';

export const GAME_LEVELS: Record<GameLevelNumber, LevelConfig> = {
  1: {
    level: 1,
    durationSeconds: 1.0,
    points: 100,
    label: 'Extreme',
    description: 'Listen to a razor-sharp 1-second snippet. Can your ear catch the signature chord or beat?',
    difficultyBadge: '1.0s clip · 100 pts'
  },
  2: {
    level: 2,
    durationSeconds: 3.0,
    points: 70,
    label: 'Hard',
    description: 'Listen to the 3-second excerpt. The groove and intro emerge.',
    difficultyBadge: '3.0s clip · 70 pts'
  },
  3: {
    level: 3,
    durationSeconds: 5.0,
    points: 40,
    label: 'Medium',
    description: 'Listen to 5 seconds. Melodic progression and instrumentation are recognizable.',
    difficultyBadge: '5.0s clip · 40 pts'
  },
  4: {
    level: 4,
    durationSeconds: 10.0,
    points: 20,
    label: 'Final Chance',
    description: 'Listen to the full 10-second hook. Search the international catalogue to lock in your answer.',
    difficultyBadge: '10.0s clip · 20 pts'
  }
};

export const DEFAULT_ROUNDS_PER_GAME = 5;
export const DAILY_CHALLENGE_ROUNDS = 5;

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_win',
    title: 'First Win',
    description: 'Identify your very first song correctly in any game mode.',
    iconName: 'Sparkles',
    category: 'milestone',
    tier: 'Bronze',
    points: 50,
    targetValue: 1
  },
  {
    id: 'one_second_wonder',
    title: 'One-Second Wonder',
    description: 'Guess a song correctly on Level 1 (1.0s clip) on your first attempt.',
    iconName: 'Zap',
    category: 'speed',
    tier: 'Gold',
    points: 150,
    targetValue: 1
  },
  {
    id: 'perfect_round',
    title: 'Flawless Ear',
    description: 'Complete an entire 5-round game with 100% accuracy.',
    iconName: 'Award',
    category: 'accuracy',
    tier: 'Gold',
    points: 200,
    targetValue: 5
  },
  {
    id: 'streak_master',
    title: 'On A Roll',
    description: 'Achieve a winning streak of 3 consecutive correct song guesses.',
    iconName: 'Flame',
    category: 'streak',
    tier: 'Bronze',
    points: 75,
    targetValue: 3
  },
  {
    id: 'ten_day_streak',
    title: '10-Day Streak',
    description: 'Maintain a 10-day active winning streak in SongVerse.',
    iconName: 'Flame',
    category: 'streak',
    tier: 'Platinum',
    points: 500,
    targetValue: 10
  },
  {
    id: 'genre_master',
    title: 'Genre Master',
    description: 'Correctly identify tracks across at least 5 different musical genres.',
    iconName: 'Compass',
    category: 'discovery',
    tier: 'Gold',
    points: 250,
    targetValue: 5
  },
  {
    id: 'globe_trotter',
    title: 'Globe Trotter',
    description: 'Correctly identify tracks in at least 3 distinct world languages.',
    iconName: 'Globe',
    category: 'discovery',
    tier: 'Silver',
    points: 120,
    targetValue: 3
  },
  {
    id: 'decade_hopper',
    title: 'Time Traveler',
    description: 'Identify songs spanning 3 different musical decades.',
    iconName: 'Clock',
    category: 'discovery',
    tier: 'Silver',
    points: 120,
    targetValue: 3
  },
  {
    id: 'clutch_save',
    title: 'Clutch Detective',
    description: 'Identify a song on Level 4 after missing the first three levels.',
    iconName: 'Search',
    category: 'accuracy',
    tier: 'Bronze',
    points: 60,
    targetValue: 1
  },
  {
    id: 'daily_devotee',
    title: 'Daily Virtuoso',
    description: 'Complete an official Daily Challenge.',
    iconName: 'Calendar',
    category: 'milestone',
    tier: 'Silver',
    points: 100,
    targetValue: 1
  },
  {
    id: 'multiplayer_champion',
    title: 'Social Maestro',
    description: 'Host or join a multiplayer room match with friends.',
    iconName: 'Users',
    category: 'milestone',
    tier: 'Silver',
    points: 100,
    targetValue: 1
  }
];
