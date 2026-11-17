import React from 'react';
import {
  Award,
  Calendar,
  Compass,
  Coins,
  Layers,
  Play,
  Trophy,
  User,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import arenaHeroStageImg from '../assets/images/arena_hero_stage_1794851672005.jpg';
import masterCrownTrophyImg from '../assets/images/master_crown_trophy_1794851673243.jpg';
import { computePlayerLevel } from '../data/worlds';
import { AppView, LevelConfig, PlayerProfile, WorldConfig } from '../types/game';
import { PlayerAvatar } from './GameArtwork';

interface HomeViewProps {
  player: PlayerProfile;
  worlds: WorldConfig[];
  levels: LevelConfig[];
  musicOn: boolean;
  onToggleMusic: () => void;
  onStartNextLevel: () => void;
  onNavigate: (view: AppView) => void;
  onStartDaily: () => void;
  dailyDoneToday: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  player,
  worlds,
  levels,
  musicOn,
  onToggleMusic,
  onStartNextLevel,
  onNavigate,
  onStartDaily,
  dailyDoneToday,
}) => {
  const levelInfo = computePlayerLevel(player.xp);
  const nextAdventureLevel =
    levels.find((l) => l.levelNumber === player.highestUnlockedLevel) || levels[0];
  const currentWorld =
    worlds.find((w) => w.id === nextAdventureLevel.worldId) || worlds[0];
  const accuracy =
    player.questionsAnswered > 0
      ? Math.round((player.correctAnswers / player.questionsAnswered) * 100)
      : 0;
  const completedCount = Object.keys(player.completedLevels).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
      {/* Main Hero & Player Command Center */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1022]">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Brand Identity, Player HUD & Primary CTAs */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-8 relative z-10">
            <div className="space-y-6">
              {/* Logo & Ambient Audio Control */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-amber-500 p-[1px]">
                    <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#070b18]">
                      <Zap className="h-5 w-5 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      MENTE MAESTRA
                    </h1>
                    <p className="text-xs font-medium tracking-wide text-blue-300">
                      EL DESAFÍO DEL CONOCIMIENTO
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleMusic}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                >
                  {musicOn ? (
                    <>
                      <Volume2 className="h-4 w-4 text-blue-400" />
                      <span>Música ambiental activa</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4 text-slate-400" />
                      <span>Activar música</span>
                    </>
                  )}
                </button>
              </div>

              {/* Player Identity + Level + Score + XP Bar */}
              <div className="rounded-xl border border-white/10 bg-[#070a16]/90 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <PlayerAvatar avatarId={player.avatarId} size="lg" />
                    <div>
                      <div className="text-xs text-slate-400">
                        {levelInfo.rankTitle} · Mundo {currentWorld.number}
                      </div>
                      <div className="font-display text-xl font-bold text-white">
                        {player.name}
                      </div>
                      <div className="text-xs text-amber-400 font-medium tabular-nums">
                        Nivel de jugador {levelInfo.level} · Aventura {player.highestUnlockedLevel}/100
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Puntos acumulados</div>
                      <div className="font-mono text-xl font-bold text-white tabular-nums">
                        {player.totalScore.toLocaleString('es-ES')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Monedas</div>
                      <div className="font-mono text-xl font-bold text-amber-400 tabular-nums flex items-center justify-end gap-1.5">
                        <Coins className="h-4 w-4 text-amber-400" />
                        {player.coins.toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      Experiencia total: <span className="font-mono tabular-nums text-white">{player.xp} XP</span>
                    </span>
                    <span className="font-mono tabular-nums text-blue-300">
                      {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800/90">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progressPercent}%` }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-amber-400"
                    />
                  </div>
                </div>
              </div>

              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300" style={{ textWrap: 'balance' }}>
                Pon a prueba tu ingenio a través de 10 mundos temáticos y 100 niveles progresivos.
                Administra tus tres vidas, activa comodines estratégicos y escala en la clasificación global.
              </p>
            </div>

            {/* Required 5 Primary Buttons */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onStartNextLevel}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 active:scale-[0.99] transition-all whitespace-nowrap shrink-0"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>COMENZAR AVENTURA · NIVEL {player.highestUnlockedLevel}</span>
                </button>

                <button
                  type="button"
                  onClick={onStartDaily}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/15 px-5 py-3.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/25 transition-colors whitespace-nowrap shrink-0"
                >
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span>
                    {dailyDoneToday ? 'RETOS DIARIOS · COMPLETADO' : 'RETOS DIARIOS'}
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('categories')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-100 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                >
                  <Layers className="h-4 w-4 text-purple-400" />
                  <span>CATEGORÍAS</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-100 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                >
                  <User className="h-4 w-4 text-blue-400" />
                  <span>MI PERFIL</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('leaderboard')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-100 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>CLASIFICACIÓN</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('worlds')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-100 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                >
                  <Compass className="h-4 w-4 text-cyan-400" />
                  <span>MAPA DE 10 MUNDOS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Arena Visual Artwork */}
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-white/10 overflow-hidden bg-[#060913]">
            <img
              src={arenaHeroStageImg}
              alt="Arena futurista de Mente Maestra"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b18] via-[#070b18]/45 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/15 bg-[#060913]/85 backdrop-blur-md p-4">
              <div className="text-xs text-amber-400 font-medium">
                Siguiente etapa · Mundo {currentWorld.number}
              </div>
              <div className="font-display text-lg font-bold text-white mt-0.5">
                Nivel {nextAdventureLevel.levelNumber}: {nextAdventureLevel.title}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-300 tabular-nums">
                <span>{currentWorld.name}</span>
                <span aria-hidden="true">·</span>
                <span>{nextAdventureLevel.questionCount} preguntas</span>
                <span aria-hidden="true">·</span>
                <span>Mínimo {nextAdventureLevel.minCorrect} aciertos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Summary KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#0d1326] p-5">
          <div className="text-xs text-slate-400">Progreso de Aventura</div>
          <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
            {completedCount} / 100
          </div>
          <div className="mt-1 text-xs text-blue-300">Niveles superados</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0d1326] p-5">
          <div className="text-xs text-slate-400">Precisión Global</div>
          <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
            {accuracy}%
          </div>
          <div className="mt-1 text-xs text-slate-400 tabular-nums">
            {player.correctAnswers} de {player.questionsAnswered} aciertos
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0d1326] p-5">
          <div className="text-xs text-slate-400">Mundos Conquistados</div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-400 tabular-nums">
            {player.completedWorlds.length} / 10
          </div>
          <div className="mt-1 text-xs text-slate-400 tabular-nums">
            Trofeos: {player.unlockedTrophies.length}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0d1326] p-5">
          <div className="text-xs text-slate-400">Insignias y Racha</div>
          <div className="mt-1 font-mono text-2xl font-bold text-purple-300 tabular-nums">
            {player.unlockedBadges.length} / 12
          </div>
          <div className="mt-1 text-xs text-slate-400 tabular-nums">
            Mejor racha: {player.bestStreak} seguidas
          </div>
        </div>
      </section>

      {/* Quick Spotlight: Special Modes & Trophy */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#0d1326] p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <h2 className="font-display text-xl font-bold text-white">
              Desafíos Especiales y Modos de Juego
            </h2>
            <p className="text-sm text-slate-300">
              Además de la campaña de 100 niveles, entrena reflejos y estrategia en cuatro arenas independientes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: 'Contra el Reloj',
                desc: '60 segundos continuos para acumular el máximo puntaje posible.',
              },
              {
                title: 'Supervivencia',
                desc: 'Preguntas sin límite hasta perder tus tres vidas.',
              },
              {
                title: 'Duelo de Conocimientos',
                desc: 'Enfrenta en 7 rondas a un rival inteligente de la arena.',
              },
              {
                title: 'Nivel Legendario',
                desc: '10 preguntas de máxima complejidad con recompensas dobles.',
              },
            ].map((mode) => (
              <div
                key={mode.title}
                className="rounded-lg border border-white/8 bg-[#070a16] p-3.5"
              >
                <div className="text-sm font-semibold text-white">{mode.title}</div>
                <div className="mt-1 text-xs text-slate-400">{mode.desc}</div>
              </div>
            ))}
          </div>
          <div>
            <button
              type="button"
              onClick={() => onNavigate('challenges')}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 transition-colors whitespace-nowrap shrink-0"
            >
              <Award className="h-4 w-4" />
              <span>Explorar todos los desafíos</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/25 bg-[#0d1326] overflow-hidden flex flex-col">
          <div className="relative h-44 bg-[#060913]">
            <img
              src={masterCrownTrophyImg}
              alt="Trofeo Corona Mente Maestra"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1326] via-transparent to-transparent" />
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-amber-400">Meta Suprema · Nivel 100</div>
              <h3 className="font-display text-lg font-bold text-white mt-0.5">
                Corona Mente Maestra
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                Supera los diez mundos del saber para forjar los diez trofeos temáticos y desbloquear el título supremo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('worlds')}
              className="w-full rounded-lg border border-amber-400/30 bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              Ver Mapa de Progreso
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
