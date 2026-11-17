import { Badge, LevelConfig, WorldConfig, WorldId } from '../types/game';

export interface AvatarOption {
  id: string;
  name: string;
  title: string;
  image?: string;
  accent: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'strategist',
    name: 'Estratega Azul',
    title: 'Analista Táctico',
    image: '/src/assets/images/avatar_strategist_1794851672182.jpg',
    accent: '#2563EB',
  },
  {
    id: 'luminary',
    name: 'Luminaria Púrpura',
    title: 'Erudita Estelar',
    image: '/src/assets/images/avatar_luminary_1794851671829.jpg',
    accent: '#7C3AED',
  },
  {
    id: 'sentinel',
    name: 'Centinela Dorado',
    title: 'Guardián del Saber',
    image: '/src/assets/images/avatar_sentinel_1794851672781.jpg',
    accent: '#F59E0B',
  },
  {
    id: 'orion',
    name: 'Oráculo Orión',
    title: 'Navegante Lógico',
    accent: '#0EA5E9',
  },
  {
    id: 'aegis',
    name: 'Égida Real',
    title: 'Maestro de Arena',
    accent: '#A855F7',
  },
  {
    id: 'solaris',
    name: 'Corona Solaris',
    title: 'Campeón Dorado',
    accent: '#EAB308',
  },
];

export const DEFAULT_WORLDS: WorldConfig[] = [
  {
    id: 'cultura-general',
    number: 1,
    name: 'Cultura General',
    subtitle: 'Los Cimientos del Saber',
    description: 'Tradiciones, artes, inventos cotidianos, gastronomía y conocimientos universales esenciales.',
    accentColor: '#3B82F6',
    gradientFrom: '#1D4ED8',
    gradientTo: '#1E293B',
    levelStart: 1,
    levelEnd: 10,
    completionRewardCoins: 200,
    completionRewardXp: 350,
    trophyName: 'Prisma del Conocimiento',
  },
  {
    id: 'ciencia-tecnologia',
    number: 2,
    name: 'Ciencia y Tecnología',
    subtitle: 'Fronteras del Universo',
    description: 'Física, química, astronomía, computación, ingeniería y descubrimientos científicos clave.',
    accentColor: '#06B6D4',
    gradientFrom: '#0284C7',
    gradientTo: '#1E1B4B',
    levelStart: 11,
    levelEnd: 20,
    completionRewardCoins: 240,
    completionRewardXp: 420,
    trophyName: 'Núcleo Cuántico',
    requiredWorldId: 'cultura-general',
  },
  {
    id: 'historia',
    number: 3,
    name: 'Historia',
    subtitle: 'Crónicas de Civilizaciones',
    description: 'Imperios antiguos, revoluciones, tratados, personajes históricos y momentos decisivos.',
    accentColor: '#F59E0B',
    gradientFrom: '#B45309',
    gradientTo: '#1C1917',
    levelStart: 21,
    levelEnd: 30,
    completionRewardCoins: 280,
    completionRewardXp: 500,
    trophyName: 'Astrolabio del Tiempo',
    requiredWorldId: 'ciencia-tecnologia',
  },
  {
    id: 'geografia',
    number: 4,
    name: 'Geografía',
    subtitle: 'Atlas Planetario',
    description: 'Capitales, cordilleras, océanos, ríos legendarios, fronteras y maravillas naturales.',
    accentColor: '#10B981',
    gradientFrom: '#047857',
    gradientTo: '#0F172A',
    levelStart: 31,
    levelEnd: 40,
    completionRewardCoins: 320,
    completionRewardXp: 580,
    trophyName: 'Brújula Meridiana',
    requiredWorldId: 'historia',
  },
  {
    id: 'deportes',
    number: 5,
    name: 'Deportes',
    subtitle: 'Espíritu Olímpico',
    description: 'Juegos Olímpicos, campeonatos mundiales, marcas históricas y disciplinas de todo el planeta.',
    accentColor: '#6366F1',
    gradientFrom: '#4338CA',
    gradientTo: '#0F172A',
    levelStart: 41,
    levelEnd: 50,
    completionRewardCoins: 360,
    completionRewardXp: 650,
    trophyName: 'Laurel Olímpico',
    requiredWorldId: 'geografia',
  },
  {
    id: 'matematicas',
    number: 6,
    name: 'Matemáticas',
    subtitle: 'Arquitectura Numérica',
    description: 'Aritmética ágil, geometría, lógica, probabilidad, teoremas y secuencias fascinantes.',
    accentColor: '#8B5CF6',
    gradientFrom: '#6D28D9',
    gradientTo: '#090D16',
    levelStart: 51,
    levelEnd: 60,
    completionRewardCoins: 400,
    completionRewardXp: 720,
    trophyName: 'Poliedro Áureo',
    requiredWorldId: 'deportes',
  },
  {
    id: 'naturaleza',
    number: 7,
    name: 'Naturaleza',
    subtitle: 'Biomas y Ecosistemas',
    description: 'Fauna extraordinaria, botánica, biología marina, ecología y fenómenos del planeta vivo.',
    accentColor: '#14B8A6',
    gradientFrom: '#0F766E',
    gradientTo: '#0B1324',
    levelStart: 61,
    levelEnd: 70,
    completionRewardCoins: 450,
    completionRewardXp: 800,
    trophyName: 'Esfera de Gaia',
    requiredWorldId: 'matematicas',
  },
  {
    id: 'entretenimiento',
    number: 8,
    name: 'Entretenimiento',
    subtitle: 'Cine, Música y Arte',
    description: 'Séptimo arte, compositores, videojuegos clásicos, arquitectura musical y cultura pop.',
    accentColor: '#A855F7',
    gradientFrom: '#7E22CE',
    gradientTo: '#111827',
    levelStart: 71,
    levelEnd: 80,
    completionRewardCoins: 500,
    completionRewardXp: 880,
    trophyName: 'Emblema Escénico',
    requiredWorldId: 'naturaleza',
  },
  {
    id: 'literatura',
    number: 9,
    name: 'Literatura',
    subtitle: 'Biblioteca Universal',
    description: 'Grandes novelas, poesía universal, mitología comparada y autores inmortales.',
    accentColor: '#EC4899',
    gradientFrom: '#9D174D',
    gradientTo: '#111827',
    levelStart: 81,
    levelEnd: 90,
    completionRewardCoins: 580,
    completionRewardXp: 960,
    trophyName: 'Pluma Inmortal',
    requiredWorldId: 'entretenimiento',
  },
  {
    id: 'desafio-maestro',
    number: 10,
    name: 'Desafío Maestro',
    subtitle: 'La Cúspide del Intelecto',
    description: 'Pruebas multidisciplinarias de máxima exigencia reservadas para verdaderas Mentes Maestras.',
    accentColor: '#F59E0B',
    gradientFrom: '#D97706',
    gradientTo: '#1E1B4B',
    levelStart: 91,
    levelEnd: 100,
    completionRewardCoins: 1000,
    completionRewardXp: 1500,
    trophyName: 'Corona Mente Maestra',
    requiredWorldId: 'literatura',
  },
];

export function generateDefaultLevels(worlds: WorldConfig[] = DEFAULT_WORLDS): LevelConfig[] {
  const levels: LevelConfig[] = [];
  worlds.forEach((world, wIdx) => {
    for (let offset = 0; offset < 10; offset++) {
      const levelNumber = world.levelStart + offset;
      // 5 to 10 questions progressively
      const questionCount = offset < 2 ? 5 : offset < 5 ? 6 : offset < 8 ? 8 : 10;
      // Required correct answers scales smoothly (e.g. 3/5, 4/6, 6/8, 8/10)
      const minCorrect =
        questionCount === 5
          ? 3
          : questionCount === 6
            ? 4
            : questionCount === 8
              ? offset >= 7 ? 6 : 5
              : offset === 9 ? 8 : 7;

      const difficultyBias =
        wIdx >= 8 || offset >= 8
          ? 'legendario'
          : offset >= 5 || wIdx >= 5
            ? 'dificil'
            : offset >= 2 || wIdx >= 2
              ? 'medio'
              : 'facil';

      const phaseLabel =
        offset === 9
          ? `Prueba Final: ${world.name}`
          : offset >= 6
            ? `Maestría ${offset + 1}`
            : offset >= 3
              ? `Desafío ${offset + 1}`
              : `Etapa ${offset + 1}`;

      levels.push({
        levelNumber,
        worldId: world.id,
        title: phaseLabel,
        questionCount,
        minCorrect,
        difficultyBias,
        rewardCoins: 25 + levelNumber * 3,
        rewardXp: 40 + levelNumber * 6,
      });
    }
  });
  return levels;
}

export const BADGES_CATALOG: Badge[] = [
  {
    id: 'primera-victoria',
    name: 'Primer Paso Brillante',
    description: 'Completa tu primer nivel en el modo Aventura.',
    category: 'progreso',
    tier: 'bronce',
  },
  {
    id: 'racha-5',
    name: 'Mente Encendida',
    description: 'Logra 5 respuestas correctas consecutivas en una partida.',
    category: 'racha',
    tier: 'bronce',
  },
  {
    id: 'racha-10',
    name: 'Corriente Imparable',
    description: 'Alcanza una racha de 10 aciertos seguidos.',
    category: 'racha',
    tier: 'plata',
  },
  {
    id: 'mundo-1',
    name: 'Guardián del Saber',
    description: 'Completa los 10 niveles de un mundo temático.',
    category: 'progreso',
    tier: 'plata',
  },
  {
    id: 'perfeccionista',
    name: 'Precisión Absoluta',
    description: 'Supera un nivel con el 100% de respuestas correctas.',
    category: 'precision',
    tier: 'plata',
  },
  {
    id: 'explorador-50',
    name: 'Veterano del Conocimiento',
    description: 'Responde correctamente al menos 50 preguntas acumuladas.',
    category: 'precision',
    tier: 'plata',
  },
  {
    id: 'relampago',
    name: 'Velocista Mental',
    description: 'Supera 12 o más aciertos en el Reto Contra el Reloj.',
    category: 'modos',
    tier: 'oro',
  },
  {
    id: 'superviviente',
    name: 'Resistencia Inquebrantable',
    description: 'Alcanza 15 aciertos en una sola partida de Supervivencia.',
    category: 'modos',
    tier: 'oro',
  },
  {
    id: 'duelista',
    name: 'Vencedor de la Arena',
    description: 'Derrota a un oponente en el Duelo de Conocimientos.',
    category: 'modos',
    tier: 'plata',
  },
  {
    id: 'constancia-diaria',
    name: 'Ritual de Sabiduría',
    description: 'Completa un Desafío Diario.',
    category: 'modos',
    tier: 'bronce',
  },
  {
    id: 'leyenda-viva',
    name: 'Intelecto Legendario',
    description: 'Supera el Nivel Legendario con al menos 7 aciertos.',
    category: 'modos',
    tier: 'oro',
  },
  {
    id: 'mente-maestra-100',
    name: 'Mente Maestra Suprema',
    description: 'Conquista el Nivel 100 y completa los 10 mundos.',
    category: 'progreso',
    tier: 'maestro',
  },
];

export function computePlayerLevel(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  rankTitle: string;
} {
  // Clean progressive curve: level L requires 150 * L XP
  let level = 1;
  let remaining = Math.max(0, xp);
  while (remaining >= level * 150) {
    remaining -= level * 150;
    level += 1;
  }
  const nextLevelXp = level * 150;
  const progressPercent = Math.min(100, Math.round((remaining / nextLevelXp) * 100));

  const rankTitle =
    level >= 30
      ? 'Gran Maestro Supremo'
      : level >= 20
        ? 'Sabio Astral'
        : level >= 12
          ? 'Erudito Élite'
          : level >= 6
            ? 'Estratega del Saber'
            : level >= 3
              ? 'Explorador Curioso'
              : 'Iniciado del Conocimiento';

  return {
    level,
    currentLevelXp: remaining,
    nextLevelXp,
    progressPercent,
    rankTitle,
  };
}

export function getWorldById(worlds: WorldConfig[], id: WorldId): WorldConfig {
  return worlds.find((w) => w.id === id) || worlds[0];
}
