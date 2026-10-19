import React, { useState } from 'react';
import { Calendar, Play, Trophy, Sparkles, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { gameEngine } from '../../services/gameEngine';
import { GameMode } from '../../types';

interface DailyChallengeViewProps {
  onStartDaily: () => void;
  onNavigateLeaderboard: () => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  onStartDaily,
  onNavigateLeaderboard
}) => {
  const today = new Date().toISOString().split('T')[0];
  const dailyStatus = gameEngine.getDailyChallengeStatus(today);
  const userProfile = gameEngine.getUserProfile();

  // Format date nicely
  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Today’s Global Daily Challenge
        </h1>
        
        <p className="text-sm text-slate-600 leading-relaxed">
          5 songs selected from a single date-based seed. Every player worldwide gets the exact same tracks in the exact same sequence today.
        </p>
      </div>

      {/* Main Challenge Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xs mb-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">
                Challenge Ver. 2026.1 · 5 Tracks
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Official Daily Round
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rules: 4 levels per track (1s, 3s, 5s, 10s). You have 1 official attempt per day that counts toward your global daily leaderboard rank.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Synchronized worldwide at 00:00 UTC</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Deterministic date seed — zero answer leaks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Streak multiplies your profile prestige</span>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-4">
            {dailyStatus.completed ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Challenge Completed!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    You scored <strong className="text-indigo-600 font-mono text-sm">{dailyStatus.score} pts</strong> ({dailyStatus.roundsWon} / 5 correct).
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={onNavigateLeaderboard}
                    className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    View Daily Leaderboard Rank
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Ready for Today’s Test?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Current Streak: <strong className="text-amber-700 font-mono">{userProfile.currentStreak}</strong> days
                  </p>
                </div>
                <button
                  onClick={onStartDaily}
                  className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Official Challenge</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
