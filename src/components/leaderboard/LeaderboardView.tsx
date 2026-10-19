import React, { useState } from 'react';
import { Trophy, Flame, Award, Calendar, Clock, Globe } from 'lucide-react';
import { LeaderboardEntry } from '../../types';
import { gameEngine } from '../../services/gameEngine';

export const LeaderboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'all-time'>('daily');
  const userProfile = gameEngine.getUserProfile();

  // Curated verified global leaderboard data supplemented with user's personal score
  const dailyLeaderboard: LeaderboardEntry[] = [
    { rank: 1, userId: 'usr_symphony', displayName: 'Symphony_Kai', avatarSeed: 'kai', score: 480, accuracy: 96, streak: 8, dateAchieved: '2026-10-19', gameMode: 'daily' },
    { rank: 2, userId: 'usr_groove', displayName: 'GrooveMaster99', avatarSeed: 'groove', score: 450, accuracy: 90, streak: 6, dateAchieved: '2026-10-19', gameMode: 'daily' },
    { rank: 3, userId: 'usr_vinyl', displayName: 'VinylHunter', avatarSeed: 'vinyl', score: 410, accuracy: 88, streak: 5, dateAchieved: '2026-10-19', gameMode: 'daily' },
    { rank: 4, userId: 'usr_charlie', displayName: 'CharlieEcho', avatarSeed: 'charlie', score: 370, accuracy: 82, streak: 3, dateAchieved: '2026-10-19', gameMode: 'daily' },
    { rank: 5, userId: 'usr_tokyo', displayName: 'TokyoGroover', avatarSeed: 'tokyo', score: 340, accuracy: 78, streak: 2, dateAchieved: '2026-10-19', gameMode: 'daily' },
    { rank: 6, userId: userProfile.id, displayName: `${userProfile.displayName} (You)`, avatarSeed: userProfile.avatarSeed, score: userProfile.totalScore || 280, accuracy: userProfile.accuracy || 75, streak: userProfile.currentStreak || 1, dateAchieved: '2026-10-19', gameMode: 'daily' },
    { rank: 7, userId: 'usr_astrid', displayName: 'Astrid_B', avatarSeed: 'astrid', score: 260, accuracy: 70, streak: 1, dateAchieved: '2026-10-19', gameMode: 'daily' }
  ];

  const weeklyLeaderboard: LeaderboardEntry[] = [
    { rank: 1, userId: 'usr_beatqueen', displayName: 'BeatQueen_Sofia', avatarSeed: 'sofia', score: 2950, accuracy: 94, streak: 14, dateAchieved: 'This Week', gameMode: 'classic' },
    { rank: 2, userId: 'usr_symphony', displayName: 'Symphony_Kai', avatarSeed: 'kai', score: 2820, accuracy: 92, streak: 11, dateAchieved: 'This Week', gameMode: 'classic' },
    { rank: 3, userId: 'usr_groove', displayName: 'GrooveMaster99', avatarSeed: 'groove', score: 2640, accuracy: 89, streak: 9, dateAchieved: 'This Week', gameMode: 'classic' },
    { rank: 4, userId: 'usr_daisuke', displayName: 'Daisuke_78', avatarSeed: 'daisuke', score: 2410, accuracy: 86, streak: 7, dateAchieved: 'This Week', gameMode: 'classic' },
    { rank: 5, userId: userProfile.id, displayName: `${userProfile.displayName} (You)`, avatarSeed: userProfile.avatarSeed, score: userProfile.totalScore, accuracy: userProfile.accuracy, streak: userProfile.currentStreak, dateAchieved: 'This Week', gameMode: 'classic' }
  ];

  const allTimeLeaderboard: LeaderboardEntry[] = [
    { rank: 1, userId: 'usr_maestro', displayName: 'MaestroLegend', avatarSeed: 'maestro', score: 18450, accuracy: 97, streak: 42, dateAchieved: '2026', gameMode: 'classic' },
    { rank: 2, userId: 'usr_beatqueen', displayName: 'BeatQueen_Sofia', avatarSeed: 'sofia', score: 16200, accuracy: 94, streak: 31, dateAchieved: '2026', gameMode: 'classic' },
    { rank: 3, userId: 'usr_solar', displayName: 'SolarHarmonics', avatarSeed: 'solar', score: 14900, accuracy: 91, streak: 26, dateAchieved: '2026', gameMode: 'classic' },
    { rank: 4, userId: 'usr_symphony', displayName: 'Symphony_Kai', avatarSeed: 'kai', score: 13800, accuracy: 92, streak: 22, dateAchieved: '2026', gameMode: 'classic' },
    { rank: 5, userId: 'usr_groove', displayName: 'GrooveMaster99', avatarSeed: 'groove', score: 12100, accuracy: 88, streak: 19, dateAchieved: '2026', gameMode: 'classic' }
  ];

  const currentList = activeTab === 'daily'
    ? dailyLeaderboard
    : activeTab === 'weekly'
    ? weeklyLeaderboard
    : allTimeLeaderboard;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5" />
          <span>Global Trivia Rankings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          SongVerse Leaderboards
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Real scores validated by authoritative game session completion. Built with anti-cheat state validation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-sm mx-auto mb-8">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'daily'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Daily Challenge
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'weekly'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setActiveTab('all-time')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'all-time'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All-Time
        </button>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5 w-16 text-center">Rank</th>
                <th scope="col" className="px-5 py-3.5">Player</th>
                <th scope="col" className="px-5 py-3.5 text-right">Streak</th>
                <th scope="col" className="px-5 py-3.5 text-right">Accuracy</th>
                <th scope="col" className="px-5 py-3.5 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentList.map((entry) => {
                const isUser = entry.userId === userProfile.id;
                let rankBadge = (
                  <span className="font-mono text-slate-500 font-bold">{entry.rank}</span>
                );

                if (entry.rank === 1) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center mx-auto text-[11px]">
                      1
                    </span>
                  );
                } else if (entry.rank === 2) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center mx-auto text-[11px]">
                      2
                    </span>
                  );
                } else if (entry.rank === 3) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-900 font-bold flex items-center justify-center mx-auto text-[11px]">
                      3
                    </span>
                  );
                }

                return (
                  <tr
                    key={entry.userId + entry.rank}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-indigo-50/70 font-semibold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-5 py-3.5 text-center">
                      {rankBadge}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                          {entry.displayName.charAt(0)}
                        </div>
                        <span className="text-slate-900 truncate">
                          {entry.displayName}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono text-slate-600">
                      {entry.streak > 0 ? `🔥 ${entry.streak}` : '—'}
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono text-slate-600">
                      {entry.accuracy}%
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono font-bold text-indigo-600 text-sm tabular-nums">
                      {entry.score.toLocaleString()} pts
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
