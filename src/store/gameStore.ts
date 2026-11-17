import { DEFAULT_QUESTIONS } from '../data/questions';
import {
  BADGES_CATALOG,
  computePlayerLevel,
  DEFAULT_WORLDS,
  generateDefaultLevels,
} from '../data/worlds';
import {
  Difficulty,
  LeaderboardEntry,
  LevelConfig,
  MatchHistoryItem,
  PlayerProfile,
  Question,
  RewardSettings,
  SpecialModeId,
  WildcardType,
  WorldConfig,
  WorldId,
} from '../types/game';

export interface PersistentGameState {
  player: PlayerProfile;
  questions: Question[];
  worlds: WorldConfig[];
  levels: LevelConfig[];
  rewardSettings: RewardSettings;
  rivals: LeaderboardEntry[];
}

const STORAGE_KEY = 'mente_maestra_state_v1';

export const INITIAL_REWARD_SETTINGS: RewardSettings = {
  wildcardPrices: {
    descarte: 40,
    pista: 30,
    tiempo: 35,
    segundaOportunidad: 55,
  },
  lifeRestorePrice: 50,
  streakMultiplierStep: 0.2,
  baseCorrectPoints: 100,
};

export const INITIAL_RIVALS: LeaderboardEntry[] = [
  {
    id: 'rival-1',
    name: 'Valeria Quintero',
    avatarId: 'luminary',
    level: 28,
    xp: 61400,
    points: 98450,
    accuracy: 92,
    worldsCompleted: 9,
  },
  {
    id: 'rival-2',
    name: 'Mateo Valderrama',
    avatarId: 'sentinel',
    level: 24,
    xp: 45200,
    points: 76300,
    accuracy: 89,
    worldsCompleted: 7,
  },
  {
    id: 'rival-3',
    name: 'Sofía Alarcón',
    avatarId: 'orion',
    level: 19,
    xp: 28900,
    points: 54120,
    accuracy: 87,
    worldsCompleted: 6,
  },
  {
    id: 'rival-4',
    name: 'Daniel Mendoza',
    avatarId: 'aegis',
    level: 15,
    xp: 18400,
    points: 38900,
    accuracy: 83,
    worldsCompleted: 4,
  },
  {
    id: 'rival-5',
    name: 'Camila Serrano',
    avatarId: 'solaris',
    level: 11,
    xp: 9800,
    points: 24600,
    accuracy: 81,
    worldsCompleted: 3,
  },
  {
    id: 'rival-6',
    name: 'Lucas Navarro',
    avatarId: 'strategist',
    level: 7,
    xp: 4250,
    points: 12800,
    accuracy: 78,
    worldsCompleted: 1,
  },
];

export const INITIAL_PLAYER: PlayerProfile = {
  id: 'player-local',
  name: 'Estratega Alfa',
  avatarId: 'strategist',
  xp: 0,
  coins: 150,
  totalScore: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  bestStreak: 0,
  highestUnlockedLevel: 1,
  completedLevels: {},
  completedWorlds: [],
  unlockedBadges: [],
  unlockedTrophies: [],
  wildcards: {
    descarte: 3,
    pista: 3,
    tiempo: 2,
    segundaOportunidad: 2,
  },
  dailyCompletedDates: [],
  history: [],
};

export function createInitialGameState(): PersistentGameState {
  return {
    player: { ...INITIAL_PLAYER, wildcards: { ...INITIAL_PLAYER.wildcards } },
    questions: [...DEFAULT_QUESTIONS],
    worlds: DEFAULT_WORLDS.map((w) => ({ ...w })),
    levels: generateDefaultLevels(DEFAULT_WORLDS),
    rewardSettings: {
      ...INITIAL_REWARD_SETTINGS,
      wildcardPrices: { ...INITIAL_REWARD_SETTINGS.wildcardPrices },
    },
    rivals: INITIAL_RIVALS.map((r) => ({ ...r })),
  };
}

export function loadGameState(): PersistentGameState {
  if (typeof window === 'undefined') return createInitialGameState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialGameState();
    const parsed = JSON.parse(raw) as Partial<PersistentGameState>;
    const fallback = createInitialGameState();
    return {
      player: {
        ...fallback.player,
        ...(parsed.player || {}),
        wildcards: {
          ...fallback.player.wildcards,
          ...(parsed.player?.wildcards || {}),
        },
        completedLevels: parsed.player?.completedLevels || {},
        completedWorlds: parsed.player?.completedWorlds || [],
        unlockedBadges: parsed.player?.unlockedBadges || [],
        unlockedTrophies: parsed.player?.unlockedTrophies || [],
        dailyCompletedDates: parsed.player?.dailyCompletedDates || [],
        history: parsed.player?.history || [],
      },
      questions:
        Array.isArray(parsed.questions) && parsed.questions.length >= 100
          ? parsed.questions
          : fallback.questions,
      worlds:
        Array.isArray(parsed.worlds) && parsed.worlds.length === 10
          ? parsed.worlds
          : fallback.worlds,
      levels:
        Array.isArray(parsed.levels) && parsed.levels.length === 100
          ? parsed.levels
          : fallback.levels,
      rewardSettings: parsed.rewardSettings || fallback.rewardSettings,
      rivals: Array.isArray(parsed.rivals) ? parsed.rivals : fallback.rivals,
    };
  } catch {
    return createInitialGameState();
  }
}

export function saveGameState(state: PersistentGameState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  facil: 1,
  medio: 2,
  dificil: 3,
  legendario: 4,
};

export function pickQuestionsForLevel(
  allQuestions: Question[],
  level: LevelConfig
): Question[] {
  const worldPool = allQuestions.filter((q) => q.category === level.worldId);
  const targetRank = DIFFICULTY_RANK[level.difficultyBias];

  // Prioritize questions matching target difficulty, then adjacent difficulty, without repeating
  const exact = shuffleArray(
    worldPool.filter((q) => DIFFICULTY_RANK[q.difficulty] === targetRank)
  );
  const near = shuffleArray(
    worldPool.filter((q) => Math.abs(DIFFICULTY_RANK[q.difficulty] - targetRank) === 1)
  );
  const rest = shuffleArray(
    worldPool.filter((q) => Math.abs(DIFFICULTY_RANK[q.difficulty] - targetRank) > 1)
  );

  const combined = [...exact, ...near, ...rest];
  if (combined.length >= level.questionCount) {
    return combined.slice(0, level.questionCount);
  }
  // Fallback if admin deleted too many questions in one world
  const extra = shuffleArray(allQuestions.filter((q) => q.category !== level.worldId));
  return [...combined, ...extra].slice(0, level.questionCount);
}

export function pickQuestionsForCategory(
  allQuestions: Question[],
  worldId: WorldId,
  count = 8
): Question[] {
  const pool = shuffleArray(allQuestions.filter((q) => q.category === worldId));
  if (pool.length >= count) return pool.slice(0, count);
  const fallback = shuffleArray(allQuestions.filter((q) => q.category !== worldId));
  return [...pool, ...fallback].slice(0, count);
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function pickDailyQuestions(allQuestions: Question[], count = 8): Question[] {
  const dateKey = getTodayDateKey();
  // Deterministic PRNG seeded by date string
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) {
    seed = (seed * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  const pool = [...allQuestions];
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function pickLegendaryQuestions(allQuestions: Question[], count = 10): Question[] {
  const legendary = shuffleArray(allQuestions.filter((q) => q.difficulty === 'legendario'));
  const hard = shuffleArray(allQuestions.filter((q) => q.difficulty === 'dificil'));
  return [...legendary, ...hard].slice(0, count);
}

export interface MatchOutcomeInput {
  mode: SpecialModeId;
  label: string;
  worldId?: WorldId;
  levelNumber?: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  maxStreakInMatch: number;
  passed: boolean;
  xpEarned: number;
  coinsEarned: number;
}

export function applyMatchOutcome(
  state: PersistentGameState,
  outcome: MatchOutcomeInput
): {
  nextState: PersistentGameState;
  newlyUnlockedBadges: string[];
  newlyUnlockedWorld?: WorldConfig;
  newlyUnlockedTrophy?: string;
  bonusWildcardGranted?: WildcardType;
} {
  const prev = state.player;
  const accuracy =
    outcome.totalQuestions > 0
      ? Math.round((outcome.correctCount / outcome.totalQuestions) * 100)
      : 0;

  let totalXpEarned = outcome.xpEarned;
  let totalCoinsEarned = outcome.coinsEarned;
  let bonusWildcardGranted: WildcardType | undefined;

  const completedLevels = { ...prev.completedLevels };
  let highestUnlockedLevel = prev.highestUnlockedLevel;
  const completedWorlds = [...prev.completedWorlds];
  const unlockedTrophies = [...prev.unlockedTrophies];
  const dailyCompletedDates = [...prev.dailyCompletedDates];
  let newlyUnlockedWorld: WorldConfig | undefined;
  let newlyUnlockedTrophy: string | undefined;

  if (outcome.mode === 'adventure' && outcome.levelNumber && outcome.passed) {
    const stars = accuracy === 100 ? 3 : accuracy >= 80 ? 2 : 1;
    const existing = completedLevels[outcome.levelNumber];
    completedLevels[outcome.levelNumber] = {
      stars: Math.max(stars, existing?.stars || 0),
      bestScore: Math.max(outcome.score, existing?.bestScore || 0),
      accuracy: Math.max(accuracy, existing?.accuracy || 0),
    };

    if (outcome.levelNumber >= highestUnlockedLevel && outcome.levelNumber < 100) {
      highestUnlockedLevel = outcome.levelNumber + 1;
    }

    // Check if world completed
    const world = state.worlds.find((w) => w.id === outcome.worldId);
    if (world) {
      let allWorldLevelsDone = true;
      for (let lvl = world.levelStart; lvl <= world.levelEnd; lvl++) {
        if (!completedLevels[lvl]) {
          allWorldLevelsDone = false;
          break;
        }
      }
      if (allWorldLevelsDone && !completedWorlds.includes(world.id)) {
        completedWorlds.push(world.id);
        totalCoinsEarned += world.completionRewardCoins;
        totalXpEarned += world.completionRewardXp;
        if (!unlockedTrophies.includes(world.trophyName)) {
          unlockedTrophies.push(world.trophyName);
          newlyUnlockedTrophy = world.trophyName;
        }
        const nextWorld = state.worlds.find((w) => w.requiredWorldId === world.id);
        if (nextWorld) {
          newlyUnlockedWorld = nextWorld;
        }
        // Grant a wildcard reward for world completion
        bonusWildcardGranted = 'segundaOportunidad';
      }
    }

    // Grant wildcard reward every 5 newly completed levels
    if (!existing && outcome.levelNumber % 5 === 0 && !bonusWildcardGranted) {
      const types: WildcardType[] = ['descarte', 'pista', 'tiempo', 'segundaOportunidad'];
      bonusWildcardGranted = types[(outcome.levelNumber / 5) % types.length];
    }
  }

  if (outcome.mode === 'daily' && outcome.passed) {
    const today = getTodayDateKey();
    if (!dailyCompletedDates.includes(today)) {
      dailyCompletedDates.push(today);
      bonusWildcardGranted = 'descarte';
    }
  }

  const nextWildcards = { ...prev.wildcards };
  if (bonusWildcardGranted) {
    nextWildcards[bonusWildcardGranted] = (nextWildcards[bonusWildcardGranted] || 0) + 1;
  }

  const newTotalCorrect = prev.correctAnswers + outcome.correctCount;
  const newBestStreak = Math.max(prev.bestStreak, outcome.maxStreakInMatch);

  // Badge evaluation
  const candidateBadges = new Set(prev.unlockedBadges);
  const beforeCount = candidateBadges.size;

  if (Object.keys(completedLevels).length >= 1) candidateBadges.add('primera-victoria');
  if (newBestStreak >= 5) candidateBadges.add('racha-5');
  if (newBestStreak >= 10) candidateBadges.add('racha-10');
  if (completedWorlds.length >= 1) candidateBadges.add('mundo-1');
  if (outcome.passed && accuracy === 100 && outcome.totalQuestions >= 5) {
    candidateBadges.add('perfeccionista');
  }
  if (newTotalCorrect >= 50) candidateBadges.add('explorador-50');
  if (outcome.mode === 'time-attack' && outcome.correctCount >= 12) {
    candidateBadges.add('relampago');
  }
  if (outcome.mode === 'survival' && outcome.correctCount >= 15) {
    candidateBadges.add('superviviente');
  }
  if (outcome.mode === 'duel' && outcome.passed) {
    candidateBadges.add('duelista');
  }
  if (outcome.mode === 'daily' && outcome.passed) {
    candidateBadges.add('constancia-diaria');
  }
  if (outcome.mode === 'legendary' && outcome.correctCount >= 7) {
    candidateBadges.add('leyenda-viva');
  }
  if (completedLevels[100] && completedWorlds.length >= 10) {
    candidateBadges.add('mente-maestra-100');
  }

  const unlockedBadges = Array.from(candidateBadges);
  const newlyUnlockedBadges =
    unlockedBadges.length > beforeCount
      ? unlockedBadges.filter((id) => !prev.unlockedBadges.includes(id))
      : [];

  const historyItem: MatchHistoryItem = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    dateIso: new Date().toISOString(),
    mode: outcome.mode,
    label: outcome.label,
    worldId: outcome.worldId,
    levelNumber: outcome.levelNumber,
    score: outcome.score,
    correctCount: outcome.correctCount,
    totalQuestions: outcome.totalQuestions,
    accuracy,
    passed: outcome.passed,
    xpEarned: totalXpEarned,
    coinsEarned: totalCoinsEarned,
  };

  const nextPlayer: PlayerProfile = {
    ...prev,
    xp: prev.xp + totalXpEarned,
    coins: prev.coins + totalCoinsEarned,
    totalScore: prev.totalScore + outcome.score,
    questionsAnswered: prev.questionsAnswered + outcome.totalQuestions,
    correctAnswers: newTotalCorrect,
    bestStreak: newBestStreak,
    highestUnlockedLevel,
    completedLevels,
    completedWorlds,
    unlockedBadges,
    unlockedTrophies,
    wildcards: nextWildcards,
    dailyCompletedDates,
    history: [historyItem, ...prev.history].slice(0, 40),
  };

  const nextState: PersistentGameState = {
    ...state,
    player: nextPlayer,
  };

  saveGameState(nextState);
  return {
    nextState,
    newlyUnlockedBadges,
    newlyUnlockedWorld,
    newlyUnlockedTrophy,
    bonusWildcardGranted,
  };
}

export function getLeaderboardEntries(state: PersistentGameState): LeaderboardEntry[] {
  const { player, rivals } = state;
  const levelInfo = computePlayerLevel(player.xp);
  const accuracy =
    player.questionsAnswered > 0
      ? Math.round((player.correctAnswers / player.questionsAnswered) * 100)
      : 0;

  const currentEntry: LeaderboardEntry = {
    id: player.id,
    name: player.name,
    avatarId: player.avatarId,
    level: levelInfo.level,
    xp: player.xp,
    points: player.totalScore,
    accuracy,
    worldsCompleted: player.completedWorlds.length,
    isCurrentUser: true,
  };

  return [currentEntry, ...rivals];
}

export function getBadgeById(id: string) {
  return BADGES_CATALOG.find((b) => b.id === id);
}
