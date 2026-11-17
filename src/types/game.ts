export type Difficulty = 'facil' | 'medio' | 'dificil' | 'legendario';

export type WorldId =
  | 'cultura-general'
  | 'ciencia-tecnologia'
  | 'historia'
  | 'geografia'
  | 'deportes'
  | 'matematicas'
  | 'naturaleza'
  | 'entretenimiento'
  | 'literatura'
  | 'desafio-maestro';

export type WildcardType = 'descarte' | 'pista' | 'tiempo' | 'segundaOportunidad';

export type SpecialModeId =
  | 'adventure'
  | 'category-practice'
  | 'time-attack'
  | 'survival'
  | 'duel'
  | 'daily'
  | 'legendary';

export type AppView =
  | 'home'
  | 'worlds'
  | 'categories'
  | 'challenges'
  | 'play'
  | 'profile'
  | 'leaderboard'
  | 'admin';

export interface Question {
  id: string;
  category: WorldId;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  hint: string;
}

export interface WorldConfig {
  id: WorldId;
  number: number;
  name: string;
  subtitle: string;
  description: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  levelStart: number;
  levelEnd: number;
  completionRewardCoins: number;
  completionRewardXp: number;
  trophyName: string;
  requiredWorldId?: WorldId;
}

export interface LevelConfig {
  levelNumber: number;
  worldId: WorldId;
  title: string;
  questionCount: number;
  minCorrect: number;
  difficultyBias: Difficulty;
  rewardCoins: number;
  rewardXp: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'progreso' | 'precision' | 'racha' | 'modos';
  tier: 'bronce' | 'plata' | 'oro' | 'maestro';
}

export interface MatchHistoryItem {
  id: string;
  dateIso: string;
  mode: SpecialModeId;
  label: string;
  worldId?: WorldId;
  levelNumber?: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  passed: boolean;
  xpEarned: number;
  coinsEarned: number;
}

export interface WildcardInventory {
  descarte: number;
  pista: number;
  tiempo: number;
  segundaOportunidad: number;
}

export interface RewardSettings {
  wildcardPrices: Record<WildcardType, number>;
  lifeRestorePrice: number;
  streakMultiplierStep: number;
  baseCorrectPoints: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatarId: string;
  xp: number;
  coins: number;
  totalScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  bestStreak: number;
  highestUnlockedLevel: number;
  completedLevels: Record<number, { stars: number; bestScore: number; accuracy: number }>;
  completedWorlds: WorldId[];
  unlockedBadges: string[];
  unlockedTrophies: string[];
  wildcards: WildcardInventory;
  dailyCompletedDates: string[];
  history: MatchHistoryItem[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarId: string;
  level: number;
  xp: number;
  points: number;
  accuracy: number;
  worldsCompleted: number;
  isCurrentUser?: boolean;
}

export interface ActiveMatchConfig {
  mode: SpecialModeId;
  title: string;
  worldId?: WorldId;
  levelNumber?: number;
  questions: Question[];
  minCorrectToPass?: number;
  secondsPerQuestion: number;
  totalClockSeconds?: number;
  initialLives: number;
  aiOpponentName?: string;
  aiAccuracy?: number;
}
