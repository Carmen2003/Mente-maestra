import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Coins,
  Layers,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sliders,
  Trash2,
  Users,
} from 'lucide-react';
import { PersistentGameState } from '../store/gameStore';
import {
  Difficulty,
  LeaderboardEntry,
  LevelConfig,
  Question,
  RewardSettings,
  WorldConfig,
  WorldId,
} from '../types/game';

type AdminTab = 'questions' | 'worlds' | 'levels' | 'rewards' | 'users' | 'stats';

interface AdminPanelViewProps {
  state: PersistentGameState;
  onSaveQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onUpdateWorld: (world: WorldConfig) => void;
  onUpdateLevel: (level: LevelConfig) => void;
  onUpdateRewards: (settings: RewardSettings) => void;
  onUpsertRival: (entry: LeaderboardEntry) => void;
  onDeleteRival: (id: string) => void;
  onUpdatePlayerAdmin: (coins: number, xp: number, highestUnlockedLevel: number) => void;
  onResetAllData: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  state,
  onSaveQuestion,
  onDeleteQuestion,
  onUpdateWorld,
  onUpdateLevel,
  onUpdateRewards,
  onUpsertRival,
  onDeleteRival,
  onUpdatePlayerAdmin,
  onResetAllData,
}) => {
  const [tab, setTab] = useState<AdminTab>('questions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorld, setFilterWorld] = useState<string>('all');
  const [filterDiff, setFilterDiff] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Question form state
  const [qCategory, setQCategory] = useState<WorldId>('cultura-general');
  const [qDifficulty, setQDifficulty] = useState<Difficulty>('medio');
  const [qPrompt, setQPrompt] = useState('');
  const [qOpts, setQOpts] = useState<[string, string, string, string]>(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState<0 | 1 | 2 | 3>(0);
  const [qExplanation, setQExplanation] = useState('');
  const [qHint, setQHint] = useState('');

  // Level selector for admin
  const [selectedLevelWorld, setSelectedLevelWorld] = useState<WorldId>('cultura-general');

  // Reward form state
  const [rewardsDraft, setRewardsDraft] = useState<RewardSettings>(state.rewardSettings);
  const [rewardSavedMsg, setRewardSavedMsg] = useState(false);

  // Player & Rival edit state
  const [playerCoinsDraft, setPlayerCoinsDraft] = useState(state.player.coins);
  const [playerXpDraft, setPlayerXpDraft] = useState(state.player.xp);
  const [playerMaxLvlDraft, setPlayerMaxLvlDraft] = useState(state.player.highestUnlockedLevel);
  const [newRivalName, setNewRivalName] = useState('');
  const [newRivalPoints, setNewRivalPoints] = useState(15000);
  const [newRivalLevel, setNewRivalLevel] = useState(10);

  const filteredQuestions = useMemo(() => {
    const qLower = searchTerm.trim().toLowerCase();
    return state.questions.filter((q) => {
      if (filterWorld !== 'all' && q.category !== filterWorld) return false;
      if (filterDiff !== 'all' && q.difficulty !== filterDiff) return false;
      if (qLower && !q.question.toLowerCase().includes(qLower)) return false;
      return true;
    });
  }, [state.questions, searchTerm, filterWorld, filterDiff]);

  const openNewQuestionForm = () => {
    setEditingQuestion(null);
    setQCategory('cultura-general');
    setQDifficulty('medio');
    setQPrompt('');
    setQOpts(['', '', '', '']);
    setQCorrect(0);
    setQExplanation('');
    setQHint('');
    setShowQuestionForm(true);
  };

  const openEditQuestionForm = (q: Question) => {
    setEditingQuestion(q);
    setQCategory(q.category);
    setQDifficulty(q.difficulty);
    setQPrompt(q.question);
    setQOpts([...q.options] as [string, string, string, string]);
    setQCorrect(q.correctIndex);
    setQExplanation(q.explanation);
    setQHint(q.hint);
    setShowQuestionForm(true);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qPrompt.trim() || qOpts.some((o) => !o.trim())) return;
    const item: Question = {
      id: editingQuestion ? editingQuestion.id : `custom-${Date.now()}`,
      category: qCategory,
      difficulty: qDifficulty,
      question: qPrompt.trim(),
      options: [qOpts[0].trim(), qOpts[1].trim(), qOpts[2].trim(), qOpts[3].trim()],
      correctIndex: qCorrect,
      explanation: qExplanation.trim() || 'Explicación educativa registrada por el administrador.',
      hint: qHint.trim() || 'Analiza cuidadosamente las cuatro opciones.',
    };
    onSaveQuestion(item);
    setShowQuestionForm(false);
  };

  const tabs: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'questions', label: 'Preguntas', icon: BookOpen },
    { id: 'worlds', label: 'Categorías y Mundos', icon: Layers },
    { id: 'levels', label: 'Niveles', icon: Sliders },
    { id: 'rewards', label: 'Recompensas', icon: Coins },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
  ];

  const statsByWorld = useMemo(() => {
    return state.worlds.map((w) => {
      const qs = state.questions.filter((q) => q.category === w.id);
      return {
        world: w,
        total: qs.length,
        facil: qs.filter((q) => q.difficulty === 'facil').length,
        medio: qs.filter((q) => q.difficulty === 'medio').length,
        dificil: qs.filter((q) => q.difficulty === 'dificil').length,
        legendario: qs.filter((q) => q.difficulty === 'legendario').length,
      };
    });
  }, [state.worlds, state.questions]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Administra preguntas, respuestas, categorías, 100 niveles, dificultades, recompensas y usuarios en tiempo real.
          </p>
        </div>
        <div className="font-mono text-xs text-blue-300 tabular-nums">
          Banco activo: {state.questions.length} preguntas · 10 mundos · 100 niveles
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'border border-white/10 bg-[#0d1326] text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: QUESTIONS */}
      {tab === 'questions' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-[#0d1326] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar enunciado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#070a16] pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <select
                value={filterWorld}
                onChange={(e) => setFilterWorld(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#070a16] px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="all">Todas las categorías</option>
                {state.worlds.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <select
                value={filterDiff}
                onChange={(e) => setFilterDiff(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#070a16] px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="all">Todas las dificultades</option>
                <option value="facil">Fácil</option>
                <option value="medio">Media</option>
                <option value="dificil">Difícil</option>
                <option value="legendario">Legendaria</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openNewQuestionForm}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva pregunta</span>
            </button>
          </div>

          {showQuestionForm && (
            <form
              onSubmit={handleQuestionSubmit}
              className="rounded-2xl border border-blue-500/40 bg-[#0b1124] p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">
                  {editingQuestion ? 'Editar pregunta' : 'Agregar nueva pregunta'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Categoría / Mundo
                  </label>
                  <select
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value as WorldId)}
                    className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-xs text-white"
                  >
                    {state.worlds.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Dificultad
                  </label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as Difficulty)}
                    className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-xs text-white"
                  >
                    <option value="facil">Fácil</option>
                    <option value="medio">Media</option>
                    <option value="dificil">Difícil</option>
                    <option value="legendario">Legendaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enunciado de la pregunta
                </label>
                <input
                  type="text"
                  required
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Opción {idx + 1}</span>
                      <label className="inline-flex items-center gap-1.5 text-emerald-300 cursor-pointer">
                        <input
                          type="radio"
                          name="correct-option"
                          checked={qCorrect === idx}
                          onChange={() => setQCorrect(idx as 0 | 1 | 2 | 3)}
                        />
                        <span>Correcta</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={qOpts[idx]}
                      onChange={(e) => {
                        const copy = [...qOpts] as [string, string, string, string];
                        copy[idx] = e.target.value;
                        setQOpts(copy);
                      }}
                      className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Explicación educativa
                  </label>
                  <input
                    type="text"
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pista (para comodín Pista)
                  </label>
                  <input
                    type="text"
                    value={qHint}
                    onChange={(e) => setQHint(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500"
                >
                  {editingQuestion ? 'Guardar cambios' : 'Crear pregunta'}
                </button>
              </div>
            </form>
          )}

          <div className="rounded-xl border border-white/10 bg-[#0d1326] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/10 text-xs text-slate-400 tabular-nums">
              Mostrando {Math.min(50, filteredQuestions.length)} de {filteredQuestions.length} preguntas coincidentes
            </div>
            <div className="divide-y divide-white/5 max-h-[520px] overflow-y-auto">
              {filteredQuestions.slice(0, 50).map((q) => (
                <div
                  key={q.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02]"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-[11px] font-medium text-blue-300">
                      {q.category} · {q.difficulty} · ID {q.id}
                    </div>
                    <div className="text-sm font-semibold text-white">{q.question}</div>
                    <div className="text-xs text-emerald-300">
                      Respuesta: {q.options[q.correctIndex]}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditQuestionForm(q)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORLDS & CATEGORIES */}
      {tab === 'worlds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.worlds.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border border-white/10 bg-[#0d1326] p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-300">
                  MUNDO {w.number} · Niveles {w.levelStart}–{w.levelEnd}
                </span>
                <span className="text-xs text-amber-300">Trofeo: {w.trophyName}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={w.name}
                    onChange={(e) => onUpdateWorld({ ...w, name: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Monedas al completar
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={w.completionRewardCoins}
                    onChange={(e) =>
                      onUpdateWorld({
                        ...w,
                        completionRewardCoins: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Descripción</label>
                <input
                  type="text"
                  value={w.description}
                  onChange={(e) => onUpdateWorld({ ...w, description: e.target.value })}
                  className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: LEVELS (100 LEVELS) */}
      {tab === 'levels' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {state.worlds.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedLevelWorld(w.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  selectedLevelWorld === w.id
                    ? 'bg-blue-600 text-white'
                    : 'border border-white/10 bg-[#0d1326] text-slate-300'
                }`}
              >
                M{w.number}: {w.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.levels
              .filter((l) => l.worldId === selectedLevelWorld)
              .map((lvl) => (
                <div
                  key={lvl.levelNumber}
                  className="rounded-xl border border-white/10 bg-[#0d1326] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-300">
                      NIVEL {lvl.levelNumber}
                    </span>
                    <span className="text-xs text-slate-400">{lvl.title}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Preguntas</label>
                      <input
                        type="number"
                        min={5}
                        max={10}
                        value={lvl.questionCount}
                        onChange={(e) =>
                          onUpdateLevel({
                            ...lvl,
                            questionCount: Math.min(10, Math.max(5, Number(e.target.value) || 5)),
                          })
                        }
                        className="w-full rounded border border-white/15 bg-[#070a16] px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Mín. aciertos</label>
                      <input
                        type="number"
                        min={1}
                        max={lvl.questionCount}
                        value={lvl.minCorrect}
                        onChange={(e) =>
                          onUpdateLevel({
                            ...lvl,
                            minCorrect: Math.min(
                              lvl.questionCount,
                              Math.max(1, Number(e.target.value) || 1)
                            ),
                          })
                        }
                        className="w-full rounded border border-white/15 bg-[#070a16] px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Dificultad</label>
                      <select
                        value={lvl.difficultyBias}
                        onChange={(e) =>
                          onUpdateLevel({
                            ...lvl,
                            difficultyBias: e.target.value as Difficulty,
                          })
                        }
                        className="w-full rounded border border-white/15 bg-[#070a16] px-2 py-1.5 text-white"
                      >
                        <option value="facil">Fácil</option>
                        <option value="medio">Media</option>
                        <option value="dificil">Difícil</option>
                        <option value="legendario">Legendaria</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Monedas</label>
                      <input
                        type="number"
                        min={10}
                        value={lvl.rewardCoins}
                        onChange={(e) =>
                          onUpdateLevel({
                            ...lvl,
                            rewardCoins: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-full rounded border border-white/15 bg-[#070a16] px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: REWARDS */}
      {tab === 'rewards' && (
        <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 max-w-2xl space-y-5">
          <h2 className="font-display text-lg font-bold text-white">
            Configuración de Economía y Recompensas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Precio Descarte (monedas)</label>
              <input
                type="number"
                value={rewardsDraft.wildcardPrices.descarte}
                onChange={(e) =>
                  setRewardsDraft({
                    ...rewardsDraft,
                    wildcardPrices: {
                      ...rewardsDraft.wildcardPrices,
                      descarte: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Precio Pista (monedas)</label>
              <input
                type="number"
                value={rewardsDraft.wildcardPrices.pista}
                onChange={(e) =>
                  setRewardsDraft({
                    ...rewardsDraft,
                    wildcardPrices: {
                      ...rewardsDraft.wildcardPrices,
                      pista: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Precio Tiempo Extra (monedas)</label>
              <input
                type="number"
                value={rewardsDraft.wildcardPrices.tiempo}
                onChange={(e) =>
                  setRewardsDraft({
                    ...rewardsDraft,
                    wildcardPrices: {
                      ...rewardsDraft.wildcardPrices,
                      tiempo: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Precio 2.ª Oportunidad (monedas)</label>
              <input
                type="number"
                value={rewardsDraft.wildcardPrices.segundaOportunidad}
                onChange={(e) =>
                  setRewardsDraft({
                    ...rewardsDraft,
                    wildcardPrices: {
                      ...rewardsDraft.wildcardPrices,
                      segundaOportunidad: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Costo recuperar vida</label>
              <input
                type="number"
                value={rewardsDraft.lifeRestorePrice}
                onChange={(e) =>
                  setRewardsDraft({
                    ...rewardsDraft,
                    lifeRestorePrice: Number(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Puntos base por acierto</label>
              <input
                type="number"
                value={rewardsDraft.baseCorrectPoints}
                onChange={(e) =>
                  setRewardsDraft({
                    ...rewardsDraft,
                    baseCorrectPoints: Number(e.target.value) || 50,
                  })
                }
                className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onUpdateRewards(rewardsDraft);
                setRewardSavedMsg(true);
                window.setTimeout(() => setRewardSavedMsg(false), 2000);
              }}
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500"
            >
              Guardar configuración
            </button>
            {rewardSavedMsg && (
              <span className="text-xs text-emerald-300">Parámetros actualizados</span>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: USERS */}
      {tab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#0d1326] p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-white">
              Ajustar Jugador Activo ({state.player.name})
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Monedas</label>
                <input
                  type="number"
                  value={playerCoinsDraft}
                  onChange={(e) => setPlayerCoinsDraft(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Experiencia (XP)</label>
                <input
                  type="number"
                  value={playerXpDraft}
                  onChange={(e) => setPlayerXpDraft(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Nivel máximo desbloqueado (1–100)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={playerMaxLvlDraft}
                  onChange={(e) =>
                    setPlayerMaxLvlDraft(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
                  }
                  className="w-full rounded-lg border border-white/15 bg-[#070a16] px-3 py-2 text-white font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdatePlayerAdmin(playerCoinsDraft, playerXpDraft, playerMaxLvlDraft)
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
              >
                Aplicar cambios al jugador
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-white/10 bg-[#0d1326] p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-white">
              Competidores de la Clasificación
            </h2>
            <div className="flex flex-wrap items-end gap-2 text-xs">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-slate-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newRivalName}
                  onChange={(e) => setNewRivalName(e.target.value)}
                  placeholder="Ej. Elena Ríos"
                  className="w-full rounded border border-white/15 bg-[#070a16] px-3 py-1.5 text-white"
                />
              </div>
              <div className="w-24">
                <label className="block text-slate-400 mb-1">Nivel</label>
                <input
                  type="number"
                  min={1}
                  value={newRivalLevel}
                  onChange={(e) => setNewRivalLevel(Number(e.target.value) || 1)}
                  className="w-full rounded border border-white/15 bg-[#070a16] px-3 py-1.5 text-white font-mono"
                />
              </div>
              <div className="w-28">
                <label className="block text-slate-400 mb-1">Puntos</label>
                <input
                  type="number"
                  min={0}
                  value={newRivalPoints}
                  onChange={(e) => setNewRivalPoints(Number(e.target.value) || 0)}
                  className="w-full rounded border border-white/15 bg-[#070a16] px-3 py-1.5 text-white font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newRivalName.trim()) return;
                  onUpsertRival({
                    id: `rival-${Date.now()}`,
                    name: newRivalName.trim(),
                    avatarId: 'orion',
                    level: newRivalLevel,
                    xp: newRivalLevel * 1400,
                    points: newRivalPoints,
                    accuracy: 84,
                    worldsCompleted: Math.min(10, Math.floor(newRivalLevel / 3)),
                  });
                  setNewRivalName('');
                }}
                className="rounded-lg bg-purple-600 px-3.5 py-1.5 font-bold text-white hover:bg-purple-500"
              >
                Agregar
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {state.rivals.map((r) => (
                <div
                  key={r.id}
                  className="py-2.5 flex items-center justify-between text-xs tabular-nums"
                >
                  <div>
                    <span className="font-semibold text-white">{r.name}</span>
                    <span className="ml-2 text-slate-400">
                      Nvl {r.level} · {r.points.toLocaleString('es-ES')} pts · {r.accuracy}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteRival(r.id)}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STATS */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 tabular-nums">
            <div className="rounded-xl border border-white/10 bg-[#0d1326] p-4">
              <div className="text-xs text-slate-400">Total preguntas</div>
              <div className="font-mono text-2xl font-bold text-white mt-1">
                {state.questions.length}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0d1326] p-4">
              <div className="text-xs text-slate-400">Partidas registradas</div>
              <div className="font-mono text-2xl font-bold text-blue-300 mt-1">
                {state.player.history.length}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0d1326] p-4">
              <div className="text-xs text-slate-400">Niveles superados</div>
              <div className="font-mono text-2xl font-bold text-emerald-300 mt-1">
                {Object.keys(state.player.completedLevels).length} / 100
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0d1326] p-4">
              <div className="text-xs text-slate-400">Competidores activos</div>
              <div className="font-mono text-2xl font-bold text-amber-300 mt-1">
                {state.rivals.length + 1}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d1326] overflow-hidden">
            <table className="w-full text-left text-xs tabular-nums">
              <thead>
                <tr className="border-b border-white/10 bg-[#080c19] text-slate-400">
                  <th className="py-3 px-4">Mundo / Categoría</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Fácil</th>
                  <th className="py-3 px-4 text-right">Media</th>
                  <th className="py-3 px-4 text-right">Difícil</th>
                  <th className="py-3 px-4 text-right">Legendaria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {statsByWorld.map((row) => (
                  <tr key={row.world.id}>
                    <td className="py-2.5 px-4 font-semibold text-white">
                      Mundo {row.world.number}: {row.world.name}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">{row.total}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{row.facil}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{row.medio}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{row.dificil}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{row.legendario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onResetAllData}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restablecer progreso y banco predeterminado</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
