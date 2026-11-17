import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, Play, Star, Trophy } from 'lucide-react';
import { LevelConfig, PlayerProfile, WorldConfig } from '../types/game';
import { WorldVisualBanner } from './GameArtwork';

interface WorldsMapViewProps {
  worlds: WorldConfig[];
  levels: LevelConfig[];
  player: PlayerProfile;
  onPlayLevel: (level: LevelConfig) => void;
}

export const WorldsMapView: React.FC<WorldsMapViewProps> = ({
  worlds,
  levels,
  player,
  onPlayLevel,
}) => {
  const initialSelected =
    worlds.find(
      (w) =>
        player.highestUnlockedLevel >= w.levelStart &&
        player.highestUnlockedLevel <= w.levelEnd
    )?.id || worlds[0].id;

  const [selectedWorldId, setSelectedWorldId] = useState(initialSelected);

  const selectedWorld =
    worlds.find((w) => w.id === selectedWorldId) || worlds[0];
  const worldLevels = levels.filter((l) => l.worldId === selectedWorld.id);

  const isWorldUnlocked = (w: WorldConfig) => {
    if (w.number === 1) return true;
    return player.highestUnlockedLevel >= w.levelStart;
  };

  const getWorldCompletedCount = (w: WorldConfig) => {
    let count = 0;
    for (let lvl = w.levelStart; lvl <= w.levelEnd; lvl++) {
      if (player.completedLevels[lvl]) count++;
    }
    return count;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Mapa de Progreso · 10 Mundos y 100 Niveles
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Supera cada nivel alcanzando la cantidad mínima de aciertos para desbloquear el siguiente desafío.
          </p>
        </div>
        <div className="text-right font-mono text-sm tabular-nums text-amber-400">
          Nivel máximo desbloqueado: {player.highestUnlockedLevel} / 100
        </div>
      </div>

      {/* Interactive 10-World Connected Progress Map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {worlds.map((world) => {
          const unlocked = isWorldUnlocked(world);
          const doneCount = getWorldCompletedCount(world);
          const worldComplete = doneCount === 10;
          const pct = Math.round((doneCount / 10) * 100);
          const isSelected = world.id === selectedWorld.id;

          return (
            <button
              key={world.id}
              type="button"
              onClick={() => setSelectedWorldId(world.id)}
              className={`group text-left rounded-xl border transition-all overflow-hidden flex flex-col ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/30 bg-[#101830]'
                  : unlocked
                    ? 'border-white/10 bg-[#0d1326] hover:border-white/25'
                    : 'border-white/5 bg-[#080c19] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="relative h-28 w-full">
                <WorldVisualBanner
                  worldId={world.id}
                  accentColor={world.accentColor}
                  gradientFrom={world.gradientFrom}
                  gradientTo={world.gradientTo}
                  locked={!unlocked}
                  className="h-full w-full"
                />
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-100 drop-shadow">
                    Mundo {world.number}
                  </span>
                  {worldComplete ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completado
                    </span>
                  ) : unlocked ? (
                    <span className="text-blue-300">Desbloqueado</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Lock className="h-3 w-3" />
                      Bloqueado
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 w-full">
                <div>
                  <h2 className="font-display text-sm font-bold text-white truncate">
                    {world.name}
                  </h2>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    Niveles {world.levelStart}–{world.levelEnd} · {world.trophyName}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] tabular-nums">
                    <span className="text-slate-300">{doneCount}/10 niveles</span>
                    <span className="font-mono text-amber-400">+{world.completionRewardCoins} mon.</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: worldComplete ? '#10B981' : world.accentColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected World Detail + 10-Level Selector Grid */}
      <section className="rounded-2xl border border-white/10 bg-[#0c1122] p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="text-xs font-medium text-blue-300">
              Mundo {selectedWorld.number} · {selectedWorld.subtitle}
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              {selectedWorld.name}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              {selectedWorld.description}
            </p>
          </div>

          <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Trophy className="h-4 w-4" />
              <span>Recompensa de Mundo</span>
            </div>
            <div className="text-slate-200 tabular-nums">
              Trofeo: {selectedWorld.trophyName} · +{selectedWorld.completionRewardCoins} monedas · +{selectedWorld.completionRewardXp} XP
            </div>
          </div>
        </div>

        {!isWorldUnlocked(selectedWorld) && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 flex items-center gap-3">
            <Lock className="h-5 w-5 text-amber-400 shrink-0" />
            <span>
              Completa el nivel {selectedWorld.levelStart - 1} del mundo anterior para desbloquear {selectedWorld.name}.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {worldLevels.map((lvl) => {
            const unlocked = lvl.levelNumber <= player.highestUnlockedLevel;
            const record = player.completedLevels[lvl.levelNumber];
            const isNextTarget = lvl.levelNumber === player.highestUnlockedLevel;

            return (
              <div
                key={lvl.levelNumber}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-4 transition-colors ${
                  isNextTarget
                    ? 'border-blue-500 bg-blue-950/30'
                    : record
                      ? 'border-emerald-500/30 bg-[#0d1726]'
                      : unlocked
                        ? 'border-white/15 bg-[#0d1326]'
                        : 'border-white/5 bg-[#070a15] opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-300 tabular-nums">
                      NIVEL {lvl.levelNumber}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`h-3.5 w-3.5 ${
                            record && record.stars >= starIdx
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="font-display text-sm font-bold text-white">
                    {lvl.title}
                  </div>

                  <div className="text-xs text-slate-400 space-y-0.5 tabular-nums">
                    <div>
                      {lvl.questionCount} preguntas · Mín. {lvl.minCorrect} aciertos
                    </div>
                    <div>
                      Recompensa: +{lvl.rewardCoins} mon. / +{lvl.rewardXp} XP
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onPlayLevel(lvl)}
                  className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    !unlocked
                      ? 'bg-slate-800/70 text-slate-500 cursor-not-allowed'
                      : isNextTarget
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  {unlocked ? (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{record ? 'Rejugar' : 'Jugar'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Bloqueado</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
