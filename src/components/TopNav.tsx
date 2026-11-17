import React from 'react';
import { AppView } from '../types/game';

interface TopNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  playerName: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onNavigate,
  playerName,
}) => {
  const navItems: { id: AppView; label: string }[] = [
    { id: 'home', label: 'Inicio' },
    { id: 'worlds', label: 'Mundos' },
    { id: 'categories', label: 'Categorías' },
    { id: 'challenges', label: 'Desafíos' },
    { id: 'leaderboard', label: 'Clasificación' },
    { id: 'admin', label: 'Administración' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060913]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="font-display text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-1"
        >
          MENTE <span className="text-amber-400">MAESTRA</span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-6 text-sm font-medium"
        >
          {navItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                  active
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className={`whitespace-nowrap shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 max-w-[180px] truncate ${
              currentView === 'profile'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            Mi Perfil · {playerName}
          </button>
        </div>
      </div>

      {/* Compact responsive nav strip for tablet/mobile */}
      <nav
        aria-label="Navegación móvil"
        className="flex lg:hidden items-center gap-4 overflow-x-auto border-t border-white/5 px-4 py-2 text-xs font-medium"
      >
        {navItems.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 px-2 rounded-md transition-colors ${
                active
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
