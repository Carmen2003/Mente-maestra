import React, { useMemo, useState } from 'react';
import { ArrowDownWideNarrow, Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';
import { PlayerAvatar } from './GameArtwork';

type SortKey = 'points' | 'level' | 'xp' | 'accuracy' | 'worldsCompleted';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ entries }) => {
  const [sortBy, setSortBy] = useState<SortKey>('points');

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (b[sortBy] !== a[sortBy]) return b[sortBy] - a[sortBy];
      return b.xp - a.xp;
    });
  }, [entries, sortBy]);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'points', label: 'Puntos' },
    { key: 'level', label: 'Nivel alcanzado' },
    { key: 'xp', label: 'Experiencia' },
    { key: 'accuracy', label: '% de aciertos' },
    { key: 'worldsCompleted', label: 'Mundos completados' },
  ];

  const myRank = sorted.findIndex((e) => e.isCurrentUser) + 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Clasificación de Mentes Maestras
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Compara tu posición frente a otros competidores de la arena según tus métricas de dominio.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 tabular-nums">
          <Trophy className="h-4 w-4" />
          <span>Tu posición actual: #{myRank}</span>
        </div>
      </div>

      {/* Sort Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-2">
          <ArrowDownWideNarrow className="h-4 w-4" />
          <span>Ordenar por:</span>
        </span>
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSortBy(opt.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              sortBy === opt.key
                ? 'bg-blue-600 text-white'
                : 'border border-white/10 bg-[#0d1326] text-slate-300 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1326] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#080c19] text-xs font-semibold text-slate-400">
                <th className="py-3.5 px-4">Puesto</th>
                <th className="py-3.5 px-4">Jugador</th>
                <th className="py-3.5 px-4 text-right">Nivel</th>
                <th className="py-3.5 px-4 text-right">Experiencia</th>
                <th className="py-3.5 px-4 text-right">Puntos</th>
                <th className="py-3.5 px-4 text-right">Precisión</th>
                <th className="py-3.5 px-4 text-right">Mundos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 tabular-nums">
              {sorted.map((entry, idx) => {
                const rank = idx + 1;
                return (
                  <tr
                    key={entry.id}
                    className={
                      entry.isCurrentUser
                        ? 'bg-blue-600/15 text-white'
                        : 'hover:bg-white/[0.02] text-slate-200'
                    }
                  >
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className={
                          rank === 1
                            ? 'text-amber-400'
                            : rank === 2
                              ? 'text-slate-200'
                              : rank === 3
                                ? 'text-amber-600'
                                : 'text-slate-400'
                        }
                      >
                        #{rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar avatarId={entry.avatarId} size="sm" />
                        <div>
                          <div className="font-semibold text-white">
                            {entry.name}
                            {entry.isCurrentUser && (
                              <span className="ml-2 text-xs font-medium text-blue-300">
                                (Tú)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">{entry.level}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {entry.xp.toLocaleString('es-ES')} XP
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {entry.points.toLocaleString('es-ES')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-300">
                      {entry.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-amber-300">
                      {entry.worldsCompleted} / 10
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
