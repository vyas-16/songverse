import React, { useState } from 'react';
import { Music, Menu, X, Shield, Award, Users, Compass, Calendar } from 'lucide-react';
import { GameMode } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, mode?: GameMode) => void;
  userScore: number;
  streak: number;
  isGuest?: boolean;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  userScore,
  streak,
  isGuest,
  onOpenAuth
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string, mode?: GameMode) => {
    onNavigate(view, mode);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => handleNav('landing')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Music className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
            SongVerse
          </span>
        </button>

        {/* Zone 2: 4-5 Clean Nav Links (Single-line, unboxed) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNav('game', 'classic')}
            className={`whitespace-nowrap hover:text-indigo-600 transition-colors cursor-pointer py-1 ${
              currentView === 'game' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
            }`}
          >
            Play
          </button>
          <button
            onClick={() => handleNav('daily')}
            className={`whitespace-nowrap hover:text-indigo-600 transition-colors cursor-pointer py-1 ${
              currentView === 'daily' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => handleNav('multiplayer')}
            className={`whitespace-nowrap hover:text-indigo-600 transition-colors cursor-pointer py-1 ${
              currentView === 'multiplayer' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
            }`}
          >
            Multiplayer
          </button>
          <button
            onClick={() => handleNav('discovery')}
            className={`whitespace-nowrap hover:text-indigo-600 transition-colors cursor-pointer py-1 ${
              currentView === 'discovery' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => handleNav('leaderboard')}
            className={`whitespace-nowrap hover:text-indigo-600 transition-colors cursor-pointer py-1 ${
              currentView === 'leaderboard' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
            }`}
          >
            Leaderboard
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Play Now or Profile) */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {streak > 0 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 tabular-nums">
              🔥 {streak} Streak
            </span>
          )}
          {isGuest && onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200/80 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => handleNav('profile')}
            className="text-xs font-medium text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer px-2 py-1"
          >
            Profile ({userScore} pts)
          </button>
          <button
            onClick={() => handleNav('game', 'classic')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer whitespace-nowrap"
          >
            Play Now
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => handleNav('game', 'classic')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
          >
            Play
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => handleNav('game', 'classic')}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-indigo-50 rounded-lg flex items-center gap-3"
          >
            <Music className="w-4 h-4 text-indigo-600" />
            Play Classic
          </button>
          <button
            onClick={() => handleNav('daily')}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-indigo-50 rounded-lg flex items-center gap-3"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            Daily Challenge
          </button>
          <button
            onClick={() => handleNav('multiplayer')}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-indigo-50 rounded-lg flex items-center gap-3"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            Multiplayer Rooms
          </button>
          <button
            onClick={() => handleNav('discovery')}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-indigo-50 rounded-lg flex items-center gap-3"
          >
            <Compass className="w-4 h-4 text-indigo-600" />
            Song Discovery
          </button>
          <button
            onClick={() => handleNav('leaderboard')}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-indigo-50 rounded-lg flex items-center gap-3"
          >
            <Award className="w-4 h-4 text-indigo-600" />
            Global Leaderboard
          </button>
          <button
            onClick={() => handleNav('profile')}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-indigo-50 rounded-lg flex items-center gap-3"
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            Profile & Stats
          </button>
        </div>
      )}
    </header>
  );
};
