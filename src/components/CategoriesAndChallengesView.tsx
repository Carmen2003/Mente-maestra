import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Coins,
  Crown,
  Flame,
  Play,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Swords,
  HelpCircle,
} from 'lucide-react';
import {
  PlayerProfile,
  Question,
  RewardSettings,
  WildcardType,
  WorldConfig,
  WorldId,
} from '../types/game';
import { WorldVisualBanner } from './GameArtwork';

interface CategoriesViewProps {
  worlds: WorldConfig[];
  questions: Question[];
  onPlayCategory: (worldId: WorldId) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  worlds,
  questions,
  onPlayCategory,
}) => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="border-b border-white/10 pb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Categorías del Conocimiento
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Entrena libremente en cualquiera de las diez disciplinas con preguntas aleatorias sin repetición.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {worlds.map((world) => {
          const catQuestions = questions.filter((q) => q.category === world.id);
          return (
            <div
              key={world.id}
              className="rounded-xl border border-white/10 bg-[#0d1326] overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-32 w-full relative">
                  <WorldVisualBanner
                    worldId={world.id}
                    accentColor={world.accentColor}
                    gradientFrom={world.gradientFrom}
                    gradientTo={world.gradientTo}
                    className="h-full w-full"
                  />
                  <div className="absolute bottom-2.5 left-4 text-xs font-semibold text-white">
                    Mundo {world.number} · {catQuestions.length} preguntas
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h2 className="font-display text-lg font-bold text-white">
                    {world.name}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {world.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() => onPlayCategory(world.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 px-4 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Jugar partida rápida (8 preguntas)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ChallengesViewProps {
  player: PlayerProfile;
  rewardSettings: RewardSettings;
  dailyDoneToday: boolean;
  onStartTimeAttack: () => void;
  onStartSurvival: () => void;
  onStartDuel: (rivalName: string, accuracy: number) => void;
  onStartDaily: () => void;
  onStartLegendary: () => void;
  onBuyWildcard: (type: WildcardType) => boolean;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  player,
  rewardSettings,
  dailyDoneToday,
  onStartTimeAttack,
  onStartSurvival,
  onStartDuel,
  onStartDaily,
  onStartLegendary,
  onBuyWildcard,
}) => {
  const [duelTier, setDuelTier] = useState<'atenea' | 'kronos' | 'orion'>('atenea');
  const [shopFeedback, setShopFeedback] = useState<string | null>(null);

  const duelOpponents = {
    orion: { name: 'Orión (Principiante)', accuracy: 0.58 },
    atenea: { name: 'Atenea (Estratega)', accuracy: 0.74 },
    kronos: { name: 'Kronos (Gran Maestro)', accuracy: 0.88 },
  };

  const handleBuy = (type: WildcardType, label: string) => {
    const ok = onBuyWildcard(type);
    setShopFeedback(
      ok
        ? `Comodín "${label}" añadido a tu inventario.`
        : 'No tienes suficientes monedas para esta compra.'
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Desafíos Especiales y Bóveda de Comodines
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Pon a prueba tu velocidad, resistencia y dominio multidisciplinario en cinco modos alternativos.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-2 font-mono text-sm font-bold text-amber-300 tabular-nums">
          <Coins className="h-4 w-4" />
          <span>{player.coins.toLocaleString('es-ES')} monedas</span>
        </div>
      </div>

      {/* 5 Special Game Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Reto Contra el Reloj */}
        <div className="rounded-xl border border-blue-500/25 bg-[#0d1326] p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold">
              <Clock className="h-4 w-4" />
              <span>60 Segundos Totales</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Reto Contra el Reloj
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Responde tantas preguntas como puedas antes de que el reloj de 60 segundos llegue a cero.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartTimeAttack}
            className="w-full rounded-lg bg-blue-600 py-2.5 px-4 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
          >
            Iniciar Contra el Reloj
          </button>
        </div>

        {/* Supervivencia */}
        <div className="rounded-xl border border-purple-500/25 bg-[#0d1326] p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold">
              <Flame className="h-4 w-4" />
              <span>Hasta 3 Errores</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Supervivencia
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Resiste rondas continuas de dificultad creciente. Cada fallo cuesta una vida; con tres errores finaliza la partida.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartSurvival}
            className="w-full rounded-lg bg-purple-600 py-2.5 px-4 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
          >
            Iniciar Supervivencia
          </button>
        </div>

        {/* Desafío Diario */}
        <div className="rounded-xl border border-amber-500/30 bg-[#0d1326] p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
              <Calendar className="h-4 w-4" />
              <span>{dailyDoneToday ? 'Completado Hoy' : 'Disponible Hoy'}</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Desafío Diario
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Serie especial de 8 preguntas sincronizadas para el día de hoy. Otorga monedas extra y un comodín al completarse.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartDaily}
            className="w-full rounded-lg bg-amber-500 py-2.5 px-4 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            {dailyDoneToday ? 'Volver a jugar Desafío Diario' : 'Jugar Desafío Diario'}
          </button>
        </div>

        {/* Duelo de Conocimientos */}
        <div className="rounded-xl border border-cyan-500/25 bg-[#0d1326] p-6 flex flex-col justify-between gap-5 md:col-span-2 lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
              <Swords className="h-4 w-4" />
              <span>7 Rondas Cara a Cara</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Duelo de Conocimientos
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Enfréntate en tiempo real a un oponente sintético de la arena. Quien acumule mayor puntuación tras 7 rondas gana el duelo.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(Object.keys(duelOpponents) as Array<'orion' | 'atenea' | 'kronos'>).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDuelTier(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    duelTier === key
                      ? 'border-cyan-400 bg-cyan-500/20 text-white'
                      : 'border-white/10 bg-[#070b18] text-slate-400 hover:text-white'
                  }`}
                >
                  {duelOpponents[key].name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onStartDuel(duelOpponents[duelTier].name, duelOpponents[duelTier].accuracy)
            }
            className="w-full sm:w-auto self-start rounded-lg bg-cyan-600 py-2.5 px-6 text-xs font-bold text-white hover:bg-cyan-500 transition-colors"
          >
            Iniciar Duelo contra {duelOpponents[duelTier].name}
          </button>
        </div>

        {/* Nivel Legendario */}
        <div className="rounded-xl border border-amber-400/40 bg-gradient-to-br from-[#16102b] to-[#0c1020] p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Crown className="h-4 w-4" />
              <span>Máxima Exigencia · 20s/preg</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Nivel Legendario
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Diez preguntas de dificultad legendaria y difícil seleccionadas para verdaderos especialistas.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartLegendary}
            className="w-full rounded-lg border border-amber-400/40 bg-amber-500/20 py-2.5 px-4 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-colors"
          >
            Aceptar Reto Legendario
          </button>
        </div>
      </div>

      {/* Wildcard Store / Canje de Recompensas */}
      <section className="rounded-2xl border border-white/10 bg-[#0b1022] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-xl font-bold text-white">
              Tienda de Comodines
            </h2>
          </div>
          {shopFeedback && (
            <span className="text-xs font-medium text-blue-300">{shopFeedback}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              type: 'descarte' as WildcardType,
              name: 'Descarte (50/50)',
              desc: 'Elimina dos opciones incorrectas.',
              icon: Scissors,
              color: 'text-purple-400',
            },
            {
              type: 'pista' as WildcardType,
              name: 'Pista Estratégica',
              desc: 'Muestra una clave orientativa.',
              icon: HelpCircle,
              color: 'text-amber-400',
            },
            {
              type: 'tiempo' as WildcardType,
              name: 'Tiempo Extra (+15s)',
              desc: 'Suma 15 segundos al reloj.',
              icon: Clock,
              color: 'text-blue-400',
            },
            {
              type: 'segundaOportunidad' as WildcardType,
              name: 'Segunda Oportunidad',
              desc: 'Protege una pregunta de perder vida.',
              icon: ShieldCheck,
              color: 'text-emerald-400',
            },
          ].map((item) => {
            const Icon = item.icon;
            const price = rewardSettings.wildcardPrices[item.type];
            const owned = player.wildcards[item.type];
            return (
              <div
                key={item.type}
                className="rounded-xl border border-white/10 bg-[#070a16] p-4 flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-mono text-xs text-slate-300 tabular-nums">
                      En inventario: {owned}
                    </span>
                  </div>
                  <div className="font-display text-sm font-bold text-white">
                    {item.name}
                  </div>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>

                <button
                  type="button"
                  disabled={player.coins < price}
                  onClick={() => handleBuy(item.type, item.name)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/15 py-2 px-3 text-xs font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors tabular-nums"
                >
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  <span>Obtener por {price} mon.</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
