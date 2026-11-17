import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  Flame,
  Heart,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Scissors,
  ShieldCheck,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getBadgeById } from '../store/gameStore';
import {
  ActiveMatchConfig,
  PlayerProfile,
  RewardSettings,
  WildcardType,
} from '../types/game';
import { gameAudio } from '../utils/audio';

export interface MatchFinishedSummary {
  score: number;
  correctCount: number;
  totalQuestions: number;
  maxStreakInMatch: number;
  passed: boolean;
  xpEarned: number;
  coinsEarned: number;
  aiScore?: number;
  reason?: string;
}

interface GameplayArenaProps {
  match: ActiveMatchConfig;
  player: PlayerProfile;
  rewardSettings: RewardSettings;
  onUseWildcard: (type: WildcardType) => boolean;
  onRestoreLifeWithCoins: () => boolean;
  onMatchComplete: (summary: MatchFinishedSummary) => {
    newlyUnlockedBadges: string[];
    newlyUnlockedWorldName?: string;
    newlyUnlockedTrophy?: string;
    bonusWildcardGranted?: WildcardType;
  };
  onExit: () => void;
  onNextLevel?: () => void;
  onReplay: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export const GameplayArena: React.FC<GameplayArenaProps> = ({
  match,
  player,
  rewardSettings,
  onUseWildcard,
  onRestoreLifeWithCoins,
  onMatchComplete,
  onExit,
  onNextLevel,
  onReplay,
}) => {
  const isTimeAttack = match.mode === 'time-attack';
  const isSurvival = match.mode === 'survival';
  const isDuel = match.mode === 'duel';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [phase, setPhase] = useState<'answering' | 'validated' | 'out-of-lives' | 'finished'>('answering');

  const [lives, setLives] = useState(match.initialLives);
  const [timeLeft, setTimeLeft] = useState(
    isTimeAttack ? match.totalClockSeconds || 60 : match.secondsPerQuestion
  );
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Wildcard states for current question
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [hintVisible, setHintVisible] = useState(false);
  const [secondChanceArmed, setSecondChanceArmed] = useState(false);
  const [secondChanceTriggeredMessage, setSecondChanceTriggeredMessage] = useState<string | null>(null);
  const [usedWildcardsThisQuestion, setUsedWildcardsThisQuestion] = useState<Record<WildcardType, boolean>>({
    descarte: false,
    pista: false,
    tiempo: false,
    segundaOportunidad: false,
  });

  // Duel AI state
  const [aiScore, setAiScore] = useState(0);
  const [aiRoundStatus, setAiRoundStatus] = useState<'thinking' | 'correct' | 'wrong'>('thinking');

  // Final result metadata after saving
  const [endRewards, setEndRewards] = useState<{
    summary: MatchFinishedSummary;
    newlyUnlockedBadges: string[];
    newlyUnlockedWorldName?: string;
    newlyUnlockedTrophy?: string;
    bonusWildcardGranted?: WildcardType;
  } | null>(null);

  const finalizedRef = useRef(false);
  const currentQuestion = match.questions[currentIndex];

  const resetQuestionHelpers = useCallback(() => {
    setSelectedOption(null);
    setEliminatedOptions([]);
    setHintVisible(false);
    setSecondChanceArmed(false);
    setSecondChanceTriggeredMessage(null);
    setUsedWildcardsThisQuestion({
      descarte: false,
      pista: false,
      tiempo: false,
      segundaOportunidad: false,
    });
    if (!isTimeAttack) {
      setTimeLeft(match.secondsPerQuestion);
    }
    setAiRoundStatus('thinking');
  }, [isTimeAttack, match.secondsPerQuestion]);

  const finalizeMatch = useCallback(
    (
      finalScore: number,
      finalCorrect: number,
      finalAnswered: number,
      finalMaxStreak: number,
      finalLives: number,
      finalAiScore: number,
      reason?: string
    ) => {
      if (finalizedRef.current) return;
      finalizedRef.current = true;

      let passed = false;
      if (match.mode === 'adventure') {
        const req = match.minCorrectToPass || 1;
        passed = finalLives > 0 && finalCorrect >= req;
      } else if (isDuel) {
        passed = finalScore >= finalAiScore;
      } else if (isTimeAttack) {
        passed = finalCorrect >= 5;
      } else if (isSurvival) {
        passed = finalCorrect >= 5;
      } else if (match.mode === 'daily') {
        passed = finalLives > 0 && finalCorrect >= 5;
      } else if (match.mode === 'legendary') {
        passed = finalLives > 0 && finalCorrect >= 6;
      } else {
        passed = finalCorrect >= Math.ceil(finalAnswered * 0.6);
      }

      const xpEarned =
        finalCorrect * 18 +
        (passed ? 60 + (match.levelNumber || 1) * 2 : 15) +
        finalMaxStreak * 5;
      const coinsEarned =
        finalCorrect * 6 +
        (passed ? 30 + Math.floor((match.levelNumber || 1) * 1.5) : 5);

      if (passed) {
        gameAudio.playVictory();
      } else {
        gameAudio.playDefeat();
      }

      const summary: MatchFinishedSummary = {
        score: finalScore,
        correctCount: finalCorrect,
        totalQuestions: Math.max(finalAnswered, isTimeAttack || isSurvival ? finalAnswered : match.questions.length),
        maxStreakInMatch: finalMaxStreak,
        passed,
        xpEarned,
        coinsEarned,
        aiScore: isDuel ? finalAiScore : undefined,
        reason,
      };

      const rewards = onMatchComplete(summary);
      setEndRewards({ summary, ...rewards });
      setPhase('finished');
    },
    [isDuel, isSurvival, isTimeAttack, match, onMatchComplete]
  );

  // Countdown Timer Effect
  useEffect(() => {
    if (phase !== 'answering' && !(isTimeAttack && phase === 'validated')) {
      return;
    }
    if (!isTimeAttack && phase !== 'answering') return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        if (prev <= 6 && phase === 'answering') {
          gameAudio.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase, isTimeAttack]);

  // Handle Time Expiration
  useEffect(() => {
    if (timeLeft !== 0) return;
    if (isTimeAttack && phase !== 'finished') {
      finalizeMatch(score, correctCount, answeredCount, maxStreak, lives, aiScore, 'Tiempo de 60 segundos completado');
      return;
    }
    if (!isTimeAttack && phase === 'answering' && currentQuestion) {
      // Timeout counts as wrong answer
      gameAudio.playWrong();
      const nextLives = lives - 1;
      const nextAnswered = answeredCount + 1;
      setLives(nextLives);
      setAnsweredCount(nextAnswered);
      setStreak(0);

      if (isDuel) {
        const aiHits = Math.random() < (match.aiAccuracy || 0.72);
        setAiRoundStatus(aiHits ? 'correct' : 'wrong');
        if (aiHits) setAiScore((s) => s + 110);
      }

      if (nextLives <= 0 && !isDuel) {
        setPhase('out-of-lives');
      } else {
        setPhase('validated');
      }
    }
  }, [
    timeLeft,
    isTimeAttack,
    phase,
    currentQuestion,
    score,
    correctCount,
    answeredCount,
    maxStreak,
    lives,
    aiScore,
    isDuel,
    match.aiAccuracy,
    finalizeMatch,
  ]);

  // Duel AI Opponent Automatic Turn
  useEffect(() => {
    if (!isDuel || phase !== 'answering' || !currentQuestion) return;
    setAiRoundStatus('thinking');
    const delay = 850 + Math.floor(Math.random() * 750);
    const t = window.setTimeout(() => {
      const aiHits = Math.random() < (match.aiAccuracy || 0.72);
      setAiRoundStatus(aiHits ? 'correct' : 'wrong');
      if (aiHits) {
        setAiScore((prev) => prev + 115);
      }
    }, delay);
    return () => window.clearTimeout(t);
  }, [isDuel, currentIndex, phase, currentQuestion, match.aiAccuracy]);

  const handleConfirmAnswer = useCallback(() => {
    if (phase !== 'answering' || selectedOption === null || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;

    if (!isCorrect && secondChanceArmed) {
      // Shield absorbs the error!
      gameAudio.playWildcard();
      setSecondChanceArmed(false);
      setEliminatedOptions((prev) =>
        prev.includes(selectedOption) ? prev : [...prev, selectedOption]
      );
      setSelectedOption(null);
      setSecondChanceTriggeredMessage(
        'Segunda Oportunidad activada: esa opción fue descartada sin perder vida. Elige otra respuesta.'
      );
      return;
    }

    const nextAnswered = answeredCount + 1;
    setAnsweredCount(nextAnswered);

    if (isCorrect) {
      gameAudio.playCorrect();
      const nextStreak = streak + 1;
      const nextMaxStreak = Math.max(maxStreak, nextStreak);
      const streakMult = 1 + Math.min(1, Math.floor(nextStreak / 2) * rewardSettings.streakMultiplierStep);
      const timeBonus = isTimeAttack ? 15 : Math.round(timeLeft * 2);
      const earnedPts = Math.round((rewardSettings.baseCorrectPoints + timeBonus) * streakMult);

      setStreak(nextStreak);
      setMaxStreak(nextMaxStreak);
      setCorrectCount((c) => c + 1);
      setScore((s) => s + earnedPts);
      setPhase('validated');
    } else {
      gameAudio.playWrong();
      setStreak(0);
      const nextLives = isTimeAttack || isDuel ? lives : lives - 1;
      setLives(nextLives);

      if (!isTimeAttack && !isDuel && nextLives <= 0) {
        setPhase('out-of-lives');
      } else {
        setPhase('validated');
      }
    }
  }, [
    phase,
    selectedOption,
    currentQuestion,
    secondChanceArmed,
    answeredCount,
    streak,
    maxStreak,
    rewardSettings,
    isTimeAttack,
    timeLeft,
    isDuel,
    lives,
  ]);

  const handleNextQuestion = useCallback(() => {
    const isLast = currentIndex + 1 >= match.questions.length;
    if (isLast) {
      finalizeMatch(
        score,
        correctCount,
        answeredCount,
        maxStreak,
        lives,
        aiScore
      );
      return;
    }
    setCurrentIndex((i) => i + 1);
    resetQuestionHelpers();
    setPhase('answering');
  }, [
    currentIndex,
    match.questions.length,
    finalizeMatch,
    score,
    correctCount,
    answeredCount,
    maxStreak,
    lives,
    aiScore,
    resetQuestionHelpers,
  ]);

  // Keyboard shortcuts (1-4 select, Enter confirm/next)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phase === 'answering') {
        const idx = ['1', '2', '3', '4'].indexOf(e.key);
        if (idx !== -1 && !eliminatedOptions.includes(idx)) {
          gameAudio.playSelect();
          setSelectedOption(idx);
        } else if (e.key === 'Enter' && selectedOption !== null) {
          e.preventDefault();
          handleConfirmAnswer();
        }
      } else if (phase === 'validated' && e.key === 'Enter') {
        e.preventDefault();
        handleNextQuestion();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, eliminatedOptions, selectedOption, handleConfirmAnswer, handleNextQuestion]);

  const triggerWildcard = (type: WildcardType) => {
    if (phase !== 'answering' || !currentQuestion) return;
    if (usedWildcardsThisQuestion[type]) return;
    if ((player.wildcards[type] || 0) <= 0) return;

    const ok = onUseWildcard(type);
    if (!ok) return;

    gameAudio.playWildcard();
    setUsedWildcardsThisQuestion((prev) => ({ ...prev, [type]: true }));

    if (type === 'descarte') {
      const wrongIndices = [0, 1, 2, 3].filter(
        (idx) => idx !== currentQuestion.correctIndex && !eliminatedOptions.includes(idx)
      );
      const shuffled = [...wrongIndices].sort(() => Math.random() - 0.5).slice(0, 2);
      setEliminatedOptions((prev) => [...prev, ...shuffled]);
      if (selectedOption !== null && shuffled.includes(selectedOption)) {
        setSelectedOption(null);
      }
    } else if (type === 'pista') {
      setHintVisible(true);
    } else if (type === 'tiempo') {
      setTimeLeft((t) => t + 15);
    } else if (type === 'segundaOportunidad') {
      setSecondChanceArmed(true);
    }
  };

  const handleContinueWithCoins = () => {
    const ok = onRestoreLifeWithCoins();
    if (!ok) return;
    gameAudio.playWildcard();
    setLives(1);
    setPhase('validated');
  };

  const handleGiveUpAfterLives = () => {
    finalizeMatch(
      score,
      correctCount,
      answeredCount,
      maxStreak,
      0,
      aiScore,
      'Te quedaste sin vidas en este intento'
    );
  };

  const difficultyLabel = useMemo(() => {
    if (!currentQuestion) return '';
    const map = {
      facil: 'Fácil',
      medio: 'Media',
      dificil: 'Difícil',
      legendario: 'Legendaria',
    };
    return map[currentQuestion.difficulty];
  }, [currentQuestion]);

  if (!currentQuestion && phase !== 'finished') {
    return null;
  }

  // Victory / Summary Screen
  if (phase === 'finished' && endRewards) {
    const { summary } = endRewards;
    const accuracy =
      summary.totalQuestions > 0
        ? Math.round((summary.correctCount / summary.totalQuestions) * 100)
        : 0;

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-2xl border border-white/15 bg-[#0b1022] p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                {match.title}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {summary.passed ? '¡Desafío Superado!' : 'Intento Finalizado'}
              </h1>
              {summary.reason && (
                <p className="text-sm text-slate-400 mt-1">{summary.reason}</p>
              )}
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
                summary.passed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}
            >
              {summary.passed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span>{summary.passed ? 'Victoria' : 'No superado'}</span>
            </div>
          </div>

          {isDuel && summary.aiScore !== undefined && (
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-purple-500/30 bg-purple-950/20 p-4">
              <div>
                <div className="text-xs text-slate-400">{player.name}</div>
                <div className="font-mono text-2xl font-bold text-blue-300 tabular-nums">
                  {summary.score} pts
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">{match.aiOpponentName}</div>
                <div className="font-mono text-2xl font-bold text-purple-300 tabular-nums">
                  {summary.aiScore} pts
                </div>
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/10 bg-[#070a16] p-4">
              <div className="text-xs text-slate-400">Puntuación</div>
              <div className="font-mono text-xl font-bold text-white tabular-nums mt-1">
                {summary.score}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#070a16] p-4">
              <div className="text-xs text-slate-400">Aciertos</div>
              <div className="font-mono text-xl font-bold text-emerald-300 tabular-nums mt-1">
                {summary.correctCount} / {summary.totalQuestions}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#070a16] p-4">
              <div className="text-xs text-slate-400">Precisión</div>
              <div className="font-mono text-xl font-bold text-blue-300 tabular-nums mt-1">
                {accuracy}%
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#070a16] p-4">
              <div className="text-xs text-slate-400">Mejor racha</div>
              <div className="font-mono text-xl font-bold text-amber-400 tabular-nums mt-1">
                {summary.maxStreakInMatch}
              </div>
            </div>
          </div>

          {/* Rewards Unlocked */}
          <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-5 space-y-3">
            <div className="text-xs font-semibold text-amber-300">
              Recompensas Obtenidas
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold tabular-nums">
              <span className="text-white">+{summary.xpEarned} XP</span>
              <span className="text-amber-300 inline-flex items-center gap-1.5">
                <Coins className="h-4 w-4" />+{summary.coinsEarned} monedas
              </span>
              {endRewards.bonusWildcardGranted && (
                <span className="text-purple-300">
                  +1 Comodín de regalo ({endRewards.bonusWildcardGranted})
                </span>
              )}
            </div>

            {endRewards.newlyUnlockedWorldName && (
              <div className="text-xs font-semibold text-emerald-300">
                ¡Nuevo mundo desbloqueado: {endRewards.newlyUnlockedWorldName}!
              </div>
            )}
            {endRewards.newlyUnlockedTrophy && (
              <div className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                Trofeo obtenido: {endRewards.newlyUnlockedTrophy}
              </div>
            )}
            {endRewards.newlyUnlockedBadges.length > 0 && (
              <div className="pt-1 space-y-1">
                {endRewards.newlyUnlockedBadges.map((bId) => {
                  const badge = getBadgeById(bId);
                  return badge ? (
                    <div key={bId} className="text-xs text-blue-200">
                      Insignia desbloqueada: <span className="font-semibold text-white">{badge.name}</span> — {badge.description}
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onExit}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors"
            >
              Volver
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onReplay}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Volver a jugar</span>
              </button>

              {summary.passed && onNextLevel && (
                <button
                  type="button"
                  onClick={onNextLevel}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
                >
                  <span>Siguiente nivel</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const timerMax = isTimeAttack ? match.totalClockSeconds || 60 : match.secondsPerQuestion;
  const timerPct = Math.min(100, Math.round((timeLeft / timerMax) * 100));

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-5">
      {/* Top Match HUD */}
      <div className="rounded-xl border border-white/10 bg-[#0b1022] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-xs text-slate-400">
            {match.title} · Dificultad {difficultyLabel}
          </div>
          <div className="font-display text-base font-bold text-white tabular-nums">
            {isSurvival
              ? `Pregunta ${currentIndex + 1} · Racha ${streak}`
              : isTimeAttack
                ? `Respondidas: ${answeredCount} · Aciertos: ${correctCount}`
                : `Pregunta ${currentIndex + 1} de ${match.questions.length}`}
            {match.minCorrectToPass ? ` · Meta: ${match.minCorrectToPass}` : ''}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          {/* Lives indicator (for modes with lives) */}
          {!isTimeAttack && !isDuel && (
            <div className="flex items-center gap-1.5" aria-label={`Vidas restantes: ${lives}`}>
              {Array.from({ length: match.initialLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`h-5 w-5 transition-transform ${
                    i < lives
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Streak */}
          {streak >= 2 && (
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 tabular-nums">
              <Flame className="h-4 w-4" />
              <span>Racha x{streak}</span>
            </div>
          )}

          {/* Score */}
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Puntos</div>
            <div className="font-mono text-lg font-bold text-white tabular-nums">
              {score}
            </div>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-base font-bold tabular-nums ${
              timeLeft <= 7
                ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                : 'border-blue-500/30 bg-blue-500/10 text-blue-200'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{timeLeft}s</span>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Duel Live Comparison Bar */}
      {isDuel && (
        <div className="rounded-xl border border-purple-500/25 bg-[#0f1328] px-4 py-3 flex items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-semibold text-blue-300">{player.name}:</span>{' '}
            <span className="font-mono font-bold text-white tabular-nums">{score} pts</span>
          </div>
          <div className="text-slate-300">
            {match.aiOpponentName}:{' '}
            <span className="font-medium text-purple-300">
              {aiRoundStatus === 'thinking'
                ? 'Analizando pregunta...'
                : aiRoundStatus === 'correct'
                  ? 'Acertó la ronda'
                  : 'Falló la ronda'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-purple-300">{match.aiOpponentName}:</span>{' '}
            <span className="font-mono font-bold text-white tabular-nums">{aiScore} pts</span>
          </div>
        </div>
      )}

      {/* Smooth Timer Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full transition-all duration-300 ${
            timeLeft <= 7 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id + '-' + currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-white/10 bg-[#0c1224] p-6 sm:p-8 space-y-6"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Categoría: {currentQuestion.category.replace('-', ' ')}</span>
              {secondChanceArmed && (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                  <ShieldCheck className="h-4 w-4" />
                  Segunda Oportunidad Activa
                </span>
              )}
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug text-white">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Wildcard Hint or Shield Notice */}
          {hintVisible && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100 flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Pista: </span>
                {currentQuestion.hint}
              </div>
            </div>
          )}

          {secondChanceTriggeredMessage && (
            <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-3.5 text-xs font-medium text-blue-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
              <span>{secondChanceTriggeredMessage}</span>
            </div>
          )}

          {/* 4 Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQuestion.options.map((opt, idx) => {
              const isEliminated = eliminatedOptions.includes(idx);
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctIndex;

              let styleClass =
                'border-white/10 bg-[#070b17] text-slate-100 hover:border-blue-500/60 hover:bg-[#111933]';

              if (isEliminated) {
                styleClass =
                  'border-white/5 bg-[#060913] text-slate-600 opacity-40 cursor-not-allowed line-through';
              } else if (phase === 'validated' || phase === 'out-of-lives') {
                if (isCorrectOption) {
                  styleClass =
                    'border-emerald-400 bg-emerald-500/20 text-white ring-2 ring-emerald-400/30';
                } else if (isSelected && !isCorrectOption) {
                  styleClass =
                    'border-rose-500 bg-rose-500/20 text-rose-100 ring-2 ring-rose-500/30';
                } else {
                  styleClass = 'border-white/5 bg-[#070a15] text-slate-500';
                }
              } else if (isSelected) {
                styleClass =
                  'border-blue-400 bg-blue-600/25 text-white ring-2 ring-blue-400/40';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={phase !== 'answering' || isEliminated}
                  onClick={() => {
                    gameAudio.playSelect();
                    setSelectedOption(idx);
                  }}
                  className={`flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${styleClass}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                      phase !== 'answering' && isCorrectOption
                        ? 'bg-emerald-500 text-slate-950'
                        : isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {OPTION_LETTERS[idx]}
                  </span>
                  <span className="text-sm sm:text-base font-medium leading-snug">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Wildcards Toolbar (during answering) */}
          {phase === 'answering' && (
            <div className="border-t border-white/10 pt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={usedWildcardsThisQuestion.descarte || player.wildcards.descarte <= 0}
                  onClick={() => triggerWildcard('descarte')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                >
                  <Scissors className="h-3.5 w-3.5 text-purple-400" />
                  <span>Descarte</span>
                  <span className="font-mono text-amber-300 tabular-nums">({player.wildcards.descarte})</span>
                </button>

                <button
                  type="button"
                  disabled={usedWildcardsThisQuestion.pista || player.wildcards.pista <= 0}
                  onClick={() => triggerWildcard('pista')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Pista</span>
                  <span className="font-mono text-amber-300 tabular-nums">({player.wildcards.pista})</span>
                </button>

                <button
                  type="button"
                  disabled={usedWildcardsThisQuestion.tiempo || player.wildcards.tiempo <= 0}
                  onClick={() => triggerWildcard('tiempo')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                >
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span>+15s</span>
                  <span className="font-mono text-amber-300 tabular-nums">({player.wildcards.tiempo})</span>
                </button>

                <button
                  type="button"
                  disabled={
                    usedWildcardsThisQuestion.segundaOportunidad ||
                    secondChanceArmed ||
                    player.wildcards.segundaOportunidad <= 0
                  }
                  onClick={() => triggerWildcard('segundaOportunidad')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>2.ª Oportunidad</span>
                  <span className="font-mono text-amber-300 tabular-nums">
                    ({player.wildcards.segundaOportunidad})
                  </span>
                </button>
              </div>

              <button
                type="button"
                disabled={selectedOption === null}
                onClick={handleConfirmAnswer}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                <span>Confirmar respuesta</span>
              </button>
            </div>
          )}

          {/* Validation + Educational Explanation */}
          {phase === 'validated' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="border-t border-white/10 pt-5 space-y-4"
            >
              <div
                className={`rounded-xl border p-4 space-y-1.5 ${
                  selectedOption === currentQuestion.correctIndex
                    ? 'border-emerald-500/35 bg-emerald-500/10'
                    : 'border-rose-500/35 bg-rose-500/10'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  {selectedOption === currentQuestion.correctIndex ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300">¡Respuesta correcta!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-rose-400" />
                      <span className="text-rose-300">
                        {selectedOption === null ? 'Tiempo agotado.' : 'Respuesta incorrecta.'} La opción correcta es:{' '}
                        {currentQuestion.options[currentQuestion.correctIndex]}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
                >
                  <span>
                    {currentIndex + 1 >= match.questions.length
                      ? 'Ver resultados'
                      : 'Siguiente pregunta'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Out of Lives Recovery Modal */}
          {phase === 'out-of-lives' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-rose-500/40 bg-[#140d1a] p-5 space-y-4"
            >
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-white">
                  Sin vidas restantes
                </h3>
                <p className="text-sm text-slate-300">
                  La respuesta correcta era:{' '}
                  <span className="font-semibold text-emerald-300">
                    {currentQuestion.options[currentQuestion.correctIndex]}
                  </span>
                  . {currentQuestion.explanation}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleGiveUpAfterLives}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  Finalizar intento
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={player.coins < rewardSettings.lifeRestorePrice}
                    onClick={handleContinueWithCoins}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Coins className="h-4 w-4 text-amber-400" />
                    <span>
                      Recuperar 1 vida ({rewardSettings.lifeRestorePrice} monedas)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onReplay}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reintentar nivel</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
