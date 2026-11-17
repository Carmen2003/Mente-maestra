/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPanelView } from './components/AdminPanelView';
import {
  CategoriesView,
  ChallengesView,
} from './components/CategoriesAndChallengesView';
import { GameplayArena, MatchFinishedSummary } from './components/GameplayArena';
import { HomeView } from './components/HomeView';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { TopNav } from './components/TopNav';
import { WorldsMapView } from './components/WorldsMapView';
import {
  applyMatchOutcome,
  createInitialGameState,
  getLeaderboardEntries,
  getTodayDateKey,
  loadGameState,
  PersistentGameState,
  pickDailyQuestions,
  pickLegendaryQuestions,
  pickQuestionsForCategory,
  pickQuestionsForLevel,
  saveGameState,
  shuffleArray,
} from './store/gameStore';
import {
  ActiveMatchConfig,
  AppView,
  LeaderboardEntry,
  LevelConfig,
  Question,
  RewardSettings,
  WildcardType,
  WorldConfig,
  WorldId,
} from './types/game';
import { gameAudio } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<PersistentGameState>(() =>
    loadGameState()
  );
  const [view, setView] = useState<AppView>('home');
  const [previousView, setPreviousView] = useState<AppView>('home');
  const [activeMatch, setActiveMatch] = useState<ActiveMatchConfig | null>(null);
  const [matchSessionKey, setMatchSessionKey] = useState(0);
  const [musicOn, setMusicOn] = useState(false);

  // Auto-save whenever state changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const dailyDoneToday = useMemo(() => {
    const today = getTodayDateKey();
    return gameState.player.dailyCompletedDates.includes(today);
  }, [gameState.player.dailyCompletedDates]);

  const leaderboardEntries = useMemo(
    () => getLeaderboardEntries(gameState),
    [gameState]
  );

  const handleToggleMusic = () => {
    const active = gameAudio.toggleMusic();
    setMusicOn(active);
  };

  const handleNavigate = (target: AppView) => {
    gameAudio.playSelect();
    if (target !== 'play') {
      setActiveMatch(null);
    }
    setView(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const launchAdventureLevel = useCallback(
    (level: LevelConfig, returnTo: AppView = 'worlds') => {
      const world = gameState.worlds.find((w) => w.id === level.worldId);
      const questions = pickQuestionsForLevel(gameState.questions, level);
      setPreviousView(returnTo);
      setActiveMatch({
        mode: 'adventure',
        title: `Nivel ${level.levelNumber} · ${world?.name || ''}`,
        worldId: level.worldId,
        levelNumber: level.levelNumber,
        questions,
        minCorrectToPass: level.minCorrect,
        secondsPerQuestion: 30,
        initialLives: 3,
      });
      setMatchSessionKey((k) => k + 1);
      setView('play');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [gameState.questions, gameState.worlds]
  );

  const handleStartNextAdventureLevel = () => {
    const targetLevel =
      gameState.levels.find(
        (l) => l.levelNumber === gameState.player.highestUnlockedLevel
      ) || gameState.levels[0];
    launchAdventureLevel(targetLevel, 'home');
  };

  const handleStartCategoryPractice = (worldId: WorldId) => {
    const world = gameState.worlds.find((w) => w.id === worldId);
    const questions = pickQuestionsForCategory(gameState.questions, worldId, 8);
    setPreviousView('categories');
    setActiveMatch({
      mode: 'category-practice',
      title: `Categoría · ${world?.name || ''}`,
      worldId,
      questions,
      minCorrectToPass: 5,
      secondsPerQuestion: 30,
      initialLives: 3,
    });
    setMatchSessionKey((k) => k + 1);
    setView('play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTimeAttack = () => {
    const questions = shuffleArray(gameState.questions).slice(0, 60);
    setPreviousView('challenges');
    setActiveMatch({
      mode: 'time-attack',
      title: 'Reto Contra el Reloj · 60s',
      questions,
      secondsPerQuestion: 60,
      totalClockSeconds: 60,
      initialLives: 99,
    });
    setMatchSessionKey((k) => k + 1);
    setView('play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartSurvival = () => {
    const questions = shuffleArray(gameState.questions);
    setPreviousView('challenges');
    setActiveMatch({
      mode: 'survival',
      title: 'Modo Supervivencia',
      questions,
      secondsPerQuestion: 30,
      initialLives: 3,
    });
    setMatchSessionKey((k) => k + 1);
    setView('play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartDuel = (rivalName: string, accuracy: number) => {
    const questions = shuffleArray(gameState.questions).slice(0, 7);
    setPreviousView('challenges');
    setActiveMatch({
      mode: 'duel',
      title: `Duelo contra ${rivalName}`,
      questions,
      secondsPerQuestion: 30,
      initialLives: 3,
      aiOpponentName: rivalName,
      aiAccuracy: accuracy,
    });
    setMatchSessionKey((k) => k + 1);
    setView('play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartDaily = () => {
    const questions = pickDailyQuestions(gameState.questions, 8);
    setPreviousView(view === 'home' ? 'home' : 'challenges');
    setActiveMatch({
      mode: 'daily',
      title: `Desafío Diario · ${getTodayDateKey()}`,
      questions,
      minCorrectToPass: 5,
      secondsPerQuestion: 30,
      initialLives: 3,
    });
    setMatchSessionKey((k) => k + 1);
    setView('play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartLegendary = () => {
    const questions = pickLegendaryQuestions(gameState.questions, 10);
    setPreviousView('challenges');
    setActiveMatch({
      mode: 'legendary',
      title: 'Nivel Legendario',
      questions,
      minCorrectToPass: 6,
      secondsPerQuestion: 20,
      initialLives: 3,
    });
    setMatchSessionKey((k) => k + 1);
    setView('play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUseWildcard = (type: WildcardType): boolean => {
    if ((gameState.player.wildcards[type] || 0) <= 0) return false;
    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        wildcards: {
          ...prev.player.wildcards,
          [type]: Math.max(0, prev.player.wildcards[type] - 1),
        },
      },
    }));
    return true;
  };

  const handleBuyWildcard = (type: WildcardType): boolean => {
    const price = gameState.rewardSettings.wildcardPrices[type];
    if (gameState.player.coins < price) return false;
    gameAudio.playWildcard();
    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        coins: prev.player.coins - price,
        wildcards: {
          ...prev.player.wildcards,
          [type]: (prev.player.wildcards[type] || 0) + 1,
        },
      },
    }));
    return true;
  };

  const handleRestoreLifeWithCoins = (): boolean => {
    const price = gameState.rewardSettings.lifeRestorePrice;
    if (gameState.player.coins < price) return false;
    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        coins: prev.player.coins - price,
      },
    }));
    return true;
  };

  const handleMatchComplete = useCallback(
    (summary: MatchFinishedSummary) => {
      if (!activeMatch) {
        return { newlyUnlockedBadges: [] };
      }

      const result = applyMatchOutcome(gameState, {
        mode: activeMatch.mode,
        label: activeMatch.title,
        worldId: activeMatch.worldId,
        levelNumber: activeMatch.levelNumber,
        score: summary.score,
        correctCount: summary.correctCount,
        totalQuestions: summary.totalQuestions,
        maxStreakInMatch: summary.maxStreakInMatch,
        passed: summary.passed,
        xpEarned: summary.xpEarned,
        coinsEarned: summary.coinsEarned,
      });

      setGameState(result.nextState);
      return {
        newlyUnlockedBadges: result.newlyUnlockedBadges,
        newlyUnlockedWorldName: result.newlyUnlockedWorld?.name,
        newlyUnlockedTrophy: result.newlyUnlockedTrophy,
        bonusWildcardGranted: result.bonusWildcardGranted,
      };
    },
    [activeMatch, gameState]
  );

  const handleReplayActiveMatch = () => {
    if (!activeMatch) return;
    if (activeMatch.mode === 'adventure' && activeMatch.levelNumber) {
      const lvl = gameState.levels.find(
        (l) => l.levelNumber === activeMatch.levelNumber
      );
      if (lvl) {
        launchAdventureLevel(lvl, previousView);
        return;
      }
    }
    if (activeMatch.mode === 'category-practice' && activeMatch.worldId) {
      handleStartCategoryPractice(activeMatch.worldId);
      return;
    }
    if (activeMatch.mode === 'time-attack') {
      handleStartTimeAttack();
      return;
    }
    if (activeMatch.mode === 'survival') {
      handleStartSurvival();
      return;
    }
    if (activeMatch.mode === 'duel') {
      handleStartDuel(
        activeMatch.aiOpponentName || 'Atenea',
        activeMatch.aiAccuracy || 0.74
      );
      return;
    }
    if (activeMatch.mode === 'daily') {
      handleStartDaily();
      return;
    }
    if (activeMatch.mode === 'legendary') {
      handleStartLegendary();
    }
  };

  const handleNextAdventureLevelAfterWin =
    activeMatch?.mode === 'adventure' &&
    activeMatch.levelNumber &&
    activeMatch.levelNumber < 100
      ? () => {
          const nextLvl = gameState.levels.find(
            (l) => l.levelNumber === (activeMatch.levelNumber || 0) + 1
          );
          if (nextLvl) {
            launchAdventureLevel(nextLvl, previousView);
          }
        }
      : undefined;

  // Admin & Profile mutation handlers
  const handleUpdateIdentity = (name: string, avatarId: string) => {
    setGameState((prev) => ({
      ...prev,
      player: { ...prev.player, name, avatarId },
    }));
  };

  const handleSaveQuestion = (q: Question) => {
    setGameState((prev) => {
      const exists = prev.questions.some((item) => item.id === q.id);
      const nextQuestions = exists
        ? prev.questions.map((item) => (item.id === q.id ? q : item))
        : [q, ...prev.questions];
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleDeleteQuestion = (id: string) => {
    setGameState((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const handleUpdateWorld = (world: WorldConfig) => {
    setGameState((prev) => ({
      ...prev,
      worlds: prev.worlds.map((w) => (w.id === world.id ? world : w)),
    }));
  };

  const handleUpdateLevel = (level: LevelConfig) => {
    setGameState((prev) => ({
      ...prev,
      levels: prev.levels.map((l) =>
        l.levelNumber === level.levelNumber ? level : l
      ),
    }));
  };

  const handleUpdateRewards = (settings: RewardSettings) => {
    setGameState((prev) => ({ ...prev, rewardSettings: settings }));
  };

  const handleUpsertRival = (entry: LeaderboardEntry) => {
    setGameState((prev) => {
      const exists = prev.rivals.some((r) => r.id === entry.id);
      const nextRivals = exists
        ? prev.rivals.map((r) => (r.id === entry.id ? entry : r))
        : [...prev.rivals, entry];
      return { ...prev, rivals: nextRivals };
    });
  };

  const handleDeleteRival = (id: string) => {
    setGameState((prev) => ({
      ...prev,
      rivals: prev.rivals.filter((r) => r.id !== id),
    }));
  };

  const handleUpdatePlayerAdmin = (
    coins: number,
    xp: number,
    highestUnlockedLevel: number
  ) => {
    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        coins: Math.max(0, coins),
        xp: Math.max(0, xp),
        highestUnlockedLevel: Math.min(100, Math.max(1, highestUnlockedLevel)),
      },
    }));
  };

  const handleResetAllData = () => {
    const fresh = createInitialGameState();
    setGameState(fresh);
    saveGameState(fresh);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100">
      <TopNav
        currentView={view}
        onNavigate={handleNavigate}
        playerName={gameState.player.name}
      />

      <main className="flex-1">
        {view === 'home' && (
          <HomeView
            player={gameState.player}
            worlds={gameState.worlds}
            levels={gameState.levels}
            musicOn={musicOn}
            onToggleMusic={handleToggleMusic}
            onStartNextLevel={handleStartNextAdventureLevel}
            onNavigate={handleNavigate}
            onStartDaily={handleStartDaily}
            dailyDoneToday={dailyDoneToday}
          />
        )}

        {view === 'worlds' && (
          <WorldsMapView
            worlds={gameState.worlds}
            levels={gameState.levels}
            player={gameState.player}
            onPlayLevel={(lvl) => launchAdventureLevel(lvl, 'worlds')}
          />
        )}

        {view === 'categories' && (
          <CategoriesView
            worlds={gameState.worlds}
            questions={gameState.questions}
            onPlayCategory={handleStartCategoryPractice}
          />
        )}

        {view === 'challenges' && (
          <ChallengesView
            player={gameState.player}
            rewardSettings={gameState.rewardSettings}
            dailyDoneToday={dailyDoneToday}
            onStartTimeAttack={handleStartTimeAttack}
            onStartSurvival={handleStartSurvival}
            onStartDuel={handleStartDuel}
            onStartDaily={handleStartDaily}
            onStartLegendary={handleStartLegendary}
            onBuyWildcard={handleBuyWildcard}
          />
        )}

        {view === 'play' && activeMatch && (
          <GameplayArena
            key={matchSessionKey}
            match={activeMatch}
            player={gameState.player}
            rewardSettings={gameState.rewardSettings}
            onUseWildcard={handleUseWildcard}
            onRestoreLifeWithCoins={handleRestoreLifeWithCoins}
            onMatchComplete={handleMatchComplete}
            onExit={() => handleNavigate(previousView)}
            onNextLevel={handleNextAdventureLevelAfterWin}
            onReplay={handleReplayActiveMatch}
          />
        )}

        {view === 'profile' && (
          <ProfileView
            player={gameState.player}
            worlds={gameState.worlds}
            onUpdateIdentity={handleUpdateIdentity}
          />
        )}

        {view === 'leaderboard' && (
          <LeaderboardView entries={leaderboardEntries} />
        )}

        {view === 'admin' && (
          <AdminPanelView
            state={gameState}
            onSaveQuestion={handleSaveQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onUpdateWorld={handleUpdateWorld}
            onUpdateLevel={handleUpdateLevel}
            onUpdateRewards={handleUpdateRewards}
            onUpsertRival={handleUpsertRival}
            onDeleteRival={handleDeleteRival}
            onUpdatePlayerAdmin={handleUpdatePlayerAdmin}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#050710] py-5 px-4 sm:px-6 text-center text-xs text-slate-500">
        Mente Maestra – El Desafío del Conocimiento · 10 Mundos · 100 Niveles · {gameState.questions.length} Preguntas Originales
      </footer>
    </div>
  );
}
