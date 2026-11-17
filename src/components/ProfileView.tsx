import React, { useState } from 'react';
import { Award, Check, Coins, History, Shield, Trophy } from 'lucide-react';
import { AVATAR_OPTIONS, BADGES_CATALOG, computePlayerLevel } from '../data/worlds';
import { PlayerProfile, WorldConfig } from '../types/game';
import { PlayerAvatar } from './GameArtwork';

interface ProfileViewProps {
  player: PlayerProfile;
  worlds: WorldConfig[];
  onUpdateIdentity: (name: string, avatarId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  player,
  worlds,
  onUpdateIdentity,
}) => {
  const [nameInput, setNameInput] = useState(player.name);
  const [avatarInput, setAvatarInput] = useState(player.avatarId);
  const [savedNotice, setSavedNotice] = useState(false);

  const levelInfo = computePlayerLevel(player.xp);
  const accuracy =
    player.questionsAnswered > 0
      ? Math.round((player.correctAnswers / player.questionsAnswered) * 100)
      : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameInput.trim().slice(0, 28) || 'Estratega Alfa';
    onUpdateIdentity(cleaned, avatarInput);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="border-b border-white/10 pb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Mi Perfil de Jugador
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Personaliza tu identidad, consulta tus estadísticas acumuladas, trofeos e historial de partidas.
        </p>
      </div>

      {/* Identity Editor & Core KPI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSave}
          className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-5"
        >
          <div className="flex items-center gap-4">
            <PlayerAvatar avatarId={avatarInput} size="xl" />
            <div>
              <div className="text-xs text-blue-300 font-medium">{levelInfo.rankTitle}</div>
              <div className="font-display text-xl font-bold text-white">{player.name}</div>
              <div className="text-xs text-amber-400 font-mono tabular-nums mt-0.5">
                Nivel {levelInfo.level} · {player.xp.toLocaleString('es-ES')} XP
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="player-name-input" className="block text-xs font-semibold text-slate-300">
              Nombre del jugador
            </label>
            <input
              id="player-name-input"
              type="text"
              maxLength={28}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Seleccionar avatar</div>
            <div className="grid grid-cols-3 gap-2.5">
              {AVATAR_OPTIONS.map((opt) => {
                const selected = avatarInput === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAvatarInput(opt.id)}
                    className={`rounded-xl border p-2 flex flex-col items-center gap-1.5 transition-colors ${
                      selected
                        ? 'border-blue-500 bg-blue-600/20'
                        : 'border-white/10 bg-[#070a16] hover:border-white/25'
                    }`}
                  >
                    <PlayerAvatar avatarId={opt.id} size="md" />
                    <span className="text-[11px] font-medium text-slate-200 truncate w-full text-center">
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Guardar perfil</span>
            </button>
            {savedNotice && (
              <span className="text-xs font-medium text-emerald-300">
                Cambios guardados automáticamente
              </span>
            )}
          </div>
        </form>

        {/* Detailed Stats */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
          {[
            { label: 'Nivel actual', value: `${levelInfo.level}`, sub: levelInfo.rankTitle },
            { label: 'Experiencia total', value: `${player.xp.toLocaleString('es-ES')} XP`, sub: `Siguiente: ${levelInfo.nextLevelXp} XP` },
            { label: 'Monedas virtuales', value: `${player.coins.toLocaleString('es-ES')}`, sub: 'Disponibles en tienda', gold: true },
            { label: 'Preguntas contestadas', value: `${player.questionsAnswered}`, sub: 'Historial acumulado' },
            { label: 'Respuestas correctas', value: `${player.correctAnswers}`, sub: `Mejor racha: ${player.bestStreak}` },
            { label: 'Porcentaje de precisión', value: `${accuracy}%`, sub: 'Exactitud global' },
            { label: 'Mundos completados', value: `${player.completedWorlds.length} / 10`, sub: `Nivel aventura ${player.highestUnlockedLevel}/100` },
            { label: 'Insignias obtenidas', value: `${player.unlockedBadges.length} / ${BADGES_CATALOG.length}`, sub: 'Logros desbloqueados' },
            { label: 'Trofeos de mundo', value: `${player.unlockedTrophies.length} / 10`, sub: 'Colección de arena' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-[#0d1326] p-4 space-y-1"
            >
              <div className="text-xs text-slate-400">{stat.label}</div>
              <div
                className={`font-mono text-xl font-bold tabular-nums flex items-center gap-1.5 ${
                  stat.gold ? 'text-amber-400' : 'text-white'
                }`}
              >
                {stat.gold && <Coins className="h-4 w-4" />}
                <span>{stat.value}</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">{stat.sub}</div>
            </div>
          ))}

          {/* Wildcard Inventory */}
          <div className="col-span-2 sm:col-span-3 rounded-xl border border-white/10 bg-[#0d1326] p-4">
            <div className="text-xs font-semibold text-slate-300 mb-3">
              Comodines en inventario
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
              <div className="rounded-lg bg-[#070a16] px-3 py-2 flex items-center justify-between">
                <span className="text-slate-300">Descarte</span>
                <span className="font-mono font-bold text-purple-300">{player.wildcards.descarte}</span>
              </div>
              <div className="rounded-lg bg-[#070a16] px-3 py-2 flex items-center justify-between">
                <span className="text-slate-300">Pista</span>
                <span className="font-mono font-bold text-amber-300">{player.wildcards.pista}</span>
              </div>
              <div className="rounded-lg bg-[#070a16] px-3 py-2 flex items-center justify-between">
                <span className="text-slate-300">Tiempo Extra</span>
                <span className="font-mono font-bold text-blue-300">{player.wildcards.tiempo}</span>
              </div>
              <div className="rounded-lg bg-[#070a16] px-3 py-2 flex items-center justify-between">
                <span className="text-slate-300">2.ª Oportunidad</span>
                <span className="font-mono font-bold text-emerald-300">
                  {player.wildcards.segundaOportunidad}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & World Trophies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-400" />
            <h2 className="font-display text-lg font-bold text-white">Insignias de Logro</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGES_CATALOG.map((badge) => {
              const unlocked = player.unlockedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-3.5 space-y-1 ${
                    unlocked
                      ? 'border-blue-500/35 bg-blue-950/25'
                      : 'border-white/5 bg-[#070a16] opacity-55'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{badge.name}</span>
                    <span className="text-[11px] font-medium text-amber-300 capitalize">
                      {unlocked ? badge.tier : 'Bloqueada'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-lg font-bold text-white">Sala de Trofeos por Mundo</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {worlds.map((world) => {
              const earned = player.unlockedTrophies.includes(world.trophyName);
              return (
                <div
                  key={world.id}
                  className={`rounded-xl border p-3.5 flex items-center gap-3 ${
                    earned
                      ? 'border-amber-400/35 bg-amber-500/10'
                      : 'border-white/5 bg-[#070a16] opacity-55'
                  }`}
                >
                  {earned ? (
                    <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
                  ) : (
                    <Shield className="h-5 w-5 text-slate-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {world.trophyName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Mundo {world.number}: {world.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Match History */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-400" />
          <h2 className="font-display text-lg font-bold text-white">Historial de Partidas</h2>
        </div>

        {player.history.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-[#070a16] p-6 text-center text-sm text-slate-400">
            Aún no has completado ninguna partida. Inicia un nivel o un desafío especial para registrar tu historial.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2.5 pr-4 font-semibold">Partida</th>
                  <th className="py-2.5 px-4 font-semibold">Resultado</th>
                  <th className="py-2.5 px-4 font-semibold">Aciertos</th>
                  <th className="py-2.5 px-4 font-semibold">Precisión</th>
                  <th className="py-2.5 px-4 font-semibold">Puntos</th>
                  <th className="py-2.5 pl-4 font-semibold">Recompensa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 tabular-nums">
                {player.history.map((item) => (
                  <tr key={item.id} className="text-slate-200">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(item.dateIso).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={item.passed ? 'text-emerald-300' : 'text-rose-300'}>
                        {item.passed ? 'Superado' : 'Fallido'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.correctCount}/{item.totalQuestions}
                    </td>
                    <td className="py-3 px-4 font-mono">{item.accuracy}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{item.score}</td>
                    <td className="py-3 pl-4 font-mono text-amber-300">
                      +{item.xpEarned} XP · +{item.coinsEarned} mon.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
