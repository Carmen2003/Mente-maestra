import React from 'react';
import { AVATAR_OPTIONS } from '../data/worlds';
import { WorldId } from '../types/game';

export const PlayerAvatar: React.FC<{
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ avatarId, size = 'md', className = '' }) => {
  const option = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
  const sizeClass =
    size === 'sm'
      ? 'w-9 h-9'
      : size === 'md'
        ? 'w-12 h-12'
        : size === 'lg'
          ? 'w-16 h-16'
          : 'w-24 h-24';

  if (option.image) {
    return (
      <div
        className={`relative rounded-xl overflow-hidden shrink-0 border border-amber-400/40 bg-[#0d1324] ${sizeClass} ${className}`}
      >
        <img
          src={option.image}
          alt={option.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Bespoke SVG geometric emblem avatars for additional selectable slots
  return (
    <div
      className={`relative rounded-xl overflow-hidden shrink-0 border border-white/15 flex items-center justify-center bg-[#0d1326] ${sizeClass} ${className}`}
      style={{
        background: `radial-gradient(circle at 30% 20%, ${option.accent}44, #090d1c 75%)`,
      }}
    >
      <svg viewBox="0 0 64 64" className="w-3/4 h-3/4" aria-hidden="true">
        {avatarId === 'orion' && (
          <g fill="none" stroke={option.accent} strokeWidth="2.5">
            <circle cx="32" cy="32" r="20" strokeOpacity="0.45" />
            <polygon points="32,10 42,32 32,54 22,32" fill={`${option.accent}33`} />
            <circle cx="32" cy="32" r="5" fill="#FBBF24" stroke="none" />
          </g>
        )}
        {avatarId === 'aegis' && (
          <g fill="none" stroke={option.accent} strokeWidth="2.5">
            <path d="M32 10 L50 18 V33 C50 44 41 51 32 55 C23 51 14 44 14 33 V18 Z" fill={`${option.accent}28`} />
            <path d="M32 18 V47 M22 28 H42" stroke="#FBBF24" strokeWidth="2.2" />
          </g>
        )}
        {avatarId !== 'orion' && avatarId !== 'aegis' && (
          <g fill="none" stroke="#FBBF24" strokeWidth="2.5">
            <polygon points="14,44 18,22 28,31 32,16 36,31 46,22 50,44" fill="#F59E0B33" />
            <line x1="14" y1="49" x2="50" y2="49" stroke="#38BDF8" strokeWidth="3" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const WorldVisualBanner: React.FC<{
  worldId: WorldId;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  locked?: boolean;
  className?: string;
}> = ({ worldId, accentColor, gradientFrom, gradientTo, locked = false, className = '' }) => {
  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      }}
    >
      {/* Subtle geometric grid backdrop */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.32) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Bespoke thematic SVG artwork per world */}
      <svg
        viewBox="0 0 240 130"
        className={`w-full h-full relative z-10 transition-transform duration-300 ${
          locked ? 'opacity-45 grayscale' : 'opacity-95'
        }`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`glow-${worldId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="120" cy="65" r="56" fill={`url(#glow-${worldId})`} />

        {worldId === 'cultura-general' && (
          <g fill="none" stroke="#F8FAFC" strokeWidth="2">
            <circle cx="120" cy="65" r="34" stroke={accentColor} strokeWidth="2.5" />
            <ellipse cx="120" cy="65" rx="16" ry="34" strokeOpacity="0.7" />
            <line x1="86" y1="65" x2="154" y2="65" strokeOpacity="0.7" />
            <path d="M92 48 H148 M92 82 H148" strokeOpacity="0.45" />
            <circle cx="120" cy="31" r="4" fill="#FBBF24" stroke="none" />
          </g>
        )}

        {worldId === 'ciencia-tecnologia' && (
          <g fill="none" stroke={accentColor} strokeWidth="2.2">
            <ellipse cx="120" cy="65" rx="42" ry="16" transform="rotate(30 120 65)" />
            <ellipse cx="120" cy="65" rx="42" ry="16" transform="rotate(-30 120 65)" />
            <ellipse cx="120" cy="65" rx="42" ry="16" transform="rotate(90 120 65)" stroke="#A855F7" />
            <circle cx="120" cy="65" r="7" fill="#FBBF24" stroke="none" />
          </g>
        )}

        {worldId === 'historia' && (
          <g fill="none" stroke="#FBBF24" strokeWidth="2.2">
            <path d="M84 96 H156 M90 88 H150 M90 42 H150" />
            <polygon points="84,42 120,22 156,42" fill="#F59E0B33" />
            <line x1="98" y1="42" x2="98" y2="88" strokeWidth="3.5" stroke="#F8FAFC" />
            <line x1="113" y1="42" x2="113" y2="88" strokeWidth="3.5" stroke="#F8FAFC" />
            <line x1="127" y1="42" x2="127" y2="88" strokeWidth="3.5" stroke="#F8FAFC" />
            <line x1="142" y1="42" x2="142" y2="88" strokeWidth="3.5" stroke="#F8FAFC" />
          </g>
        )}

        {worldId === 'geografia' && (
          <g fill="none" stroke="#34D399" strokeWidth="2.2">
            <circle cx="120" cy="65" r="35" strokeOpacity="0.5" />
            <polygon points="120,24 128,57 161,65 128,73 120,106 112,73 79,65 112,57" fill="#10B98133" />
            <circle cx="120" cy="65" r="5" fill="#FBBF24" stroke="none" />
          </g>
        )}

        {worldId === 'deportes' && (
          <g fill="none" stroke="#FBBF24" strokeWidth="2.4">
            <path d="M100 34 H140 V54 C140 69 131 78 120 78 C109 78 100 69 100 54 Z" fill="#F59E0B2E" />
            <path d="M100 40 H89 C89 54 94 60 101 60" stroke="#60A5FA" />
            <path d="M140 40 H151 C151 54 146 60 139 60" stroke="#60A5FA" />
            <line x1="120" y1="78" x2="120" y2="93" />
            <rect x="104" y="93" width="32" height="7" rx="2" fill="#FBBF24" stroke="none" />
          </g>
        )}

        {worldId === 'matematicas' && (
          <g fill="none" stroke="#C4B5FD" strokeWidth="2.2">
            <polygon points="120,24 156,45 156,85 120,106 84,85 84,45" fill="#7C3AED33" />
            <polygon points="120,24 156,85 84,85" stroke="#FBBF24" />
            <line x1="120" y1="24" x2="120" y2="106" strokeOpacity="0.5" />
            <circle cx="120" cy="65" r="4" fill="#38BDF8" stroke="none" />
          </g>
        )}

        {worldId === 'naturaleza' && (
          <g fill="none" stroke="#2DD4BF" strokeWidth="2.4">
            <path d="M120 100 C120 68 120 50 120 30" stroke="#FBBF24" />
            <path d="M120 62 C98 58 88 44 92 28 C108 32 118 44 120 62 Z" fill="#14B8A638" />
            <path d="M120 76 C142 72 152 58 148 42 C132 46 122 58 120 76 Z" fill="#14B8A638" />
            <circle cx="120" cy="28" r="4" fill="#FBBF24" stroke="none" />
          </g>
        )}

        {worldId === 'entretenimiento' && (
          <g fill="none" stroke="#E879F9" strokeWidth="2.2">
            <rect x="82" y="34" width="76" height="62" rx="8" fill="#9333EA2E" />
            <polygon points="113,52 135,65 113,78" fill="#FBBF24" stroke="none" />
            <line x1="82" y1="46" x2="158" y2="46" strokeOpacity="0.6" />
          </g>
        )}

        {worldId === 'literatura' && (
          <g fill="none" stroke="#F472B6" strokeWidth="2.2">
            <path d="M84 38 C100 32 114 36 120 44 C126 36 140 32 156 38 V92 C140 86 126 90 120 96 C114 90 100 86 84 92 Z" fill="#EC489928" />
            <line x1="120" y1="44" x2="120" y2="96" stroke="#FBBF24" />
            <line x1="94" y1="54" x2="112" y2="54" strokeOpacity="0.65" />
            <line x1="94" y1="64" x2="112" y2="64" strokeOpacity="0.65" />
            <line x1="128" y1="54" x2="146" y2="54" strokeOpacity="0.65" />
            <line x1="128" y1="64" x2="146" y2="64" strokeOpacity="0.65" />
          </g>
        )}

        {worldId === 'desafio-maestro' && (
          <g fill="none" stroke="#FBBF24" strokeWidth="2.5">
            <polygon points="84,84 92,42 108,58 120,30 132,58 148,42 156,84" fill="#F59E0B38" />
            <rect x="84" y="88" width="72" height="8" rx="3" fill="#38BDF8" stroke="none" />
            <circle cx="120" cy="26" r="4" fill="#F8FAFC" stroke="none" />
          </g>
        )}
      </svg>

      {/* Scrim for crisp contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080c19] via-transparent to-black/20 pointer-events-none" />
    </div>
  );
};
