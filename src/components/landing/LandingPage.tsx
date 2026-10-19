import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Users,
  Compass,
  Calendar,
  Award,
  ChevronRight,
  Disc3,
  CheckCircle2,
  Radio,
  ArrowRight
} from 'lucide-react';
import { GameMode } from '../../types';
import { GAME_LEVELS } from '../../config/gameConfig';
import { musicCatalogue } from '../../services/musicCatalogue';
import { audioEngine } from '../../services/audioEngine';

interface LandingPageProps {
  onStartPlay: (mode?: GameMode) => void;
  onNavigate: (view: string, mode?: GameMode) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlay,
  onNavigate
}) => {
  const [demoLevel, setDemoLevel] = useState<1 | 2 | 3 | 4>(1);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const demoTrack = musicCatalogue.getAvailableTracks()[0]; // Neon Solitude

  const handleTestAudioSnippet = async (level: 1 | 2 | 3 | 4) => {
    setDemoLevel(level);
    if (isPlayingDemo) {
      audioEngine.stop();
      setIsPlayingDemo(false);
    } else {
      setIsPlayingDemo(true);
      await audioEngine.playClip(demoTrack, level);
      setIsPlayingDemo(false);
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
        
        {/* Soft Background Gradient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] bg-gradient-to-tr from-indigo-100/60 via-violet-100/40 to-amber-50/50 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Headline Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>The International Song Guessing Platform</span>
                <span aria-hidden="true">·</span>
                <span>4-Level Progressive Trivia</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 text-balance leading-[1.12]">
                Identify songs from the sharpest audio cues.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Start with a razor-thin 1-second clip for 100 points. Miss it, and the audio expands to 3, 5, and 10 seconds. How quickly can your ear recognize the groove?
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onStartPlay('classic')}
                  className="px-7 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play Classic Mode</span>
                </button>

                <button
                  onClick={() => onNavigate('daily')}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Today’s Daily Challenge</span>
                </button>
              </div>

              {/* Proof / Attributes */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Guest Play — No Login Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authorized Audio Provenance</span>
                </div>
              </div>

            </div>

            {/* Right Column: Live Interactive Gameplay Demo Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-lg shadow-indigo-950/5 relative">
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Interactive Audio Demo
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Track #{demoTrack.providerTrackId}
                  </span>
                </div>

                {/* Level Tabs (Functional interactive controls) */}
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/90 rounded-xl mb-5">
                  {([1, 2, 3, 4] as const).map((lvl) => {
                    const cfg = GAME_LEVELS[lvl];
                    const active = demoLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => handleTestAudioSnippet(lvl)}
                        className={`py-2 px-1 text-center rounded-lg transition-all cursor-pointer ${
                          active
                            ? 'bg-white text-indigo-700 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 font-medium'
                        }`}
                      >
                        <div className="text-xs">{cfg.durationSeconds}s</div>
                        <div className="text-[10px] text-slate-400 font-mono">{cfg.points}pt</div>
                      </button>
                    );
                  })}
                </div>

                {/* Waveform preview graphic */}
                <div className="h-24 bg-gradient-to-b from-indigo-50/50 to-slate-50 border border-slate-100 rounded-xl px-4 flex items-center justify-center gap-1.5 mb-5">
                  {new Array(24).fill(0).map((_, i) => {
                    const heightPercent = 25 + Math.sin(i * 0.8) * 45;
                    return (
                      <div
                        key={i}
                        style={{ height: `${heightPercent}%` }}
                        className={`flex-1 rounded-full transition-all ${
                          isPlayingDemo
                            ? 'bg-gradient-to-t from-indigo-600 to-violet-400 animate-pulse'
                            : 'bg-slate-300'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Play Button */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleTestAudioSnippet(demoLevel)}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isPlayingDemo ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>Playing {GAME_LEVELS[demoLevel].durationSeconds}s snippet...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Listen to {GAME_LEVELS[demoLevel].durationSeconds}s Clip ({GAME_LEVELS[demoLevel].points} pts)</span>
                      </>
                    )}
                  </button>

                  <div className="text-center text-[11px] text-slate-500">
                    Audio synthesized via Web Audio API. 0 external credentials needed.
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* The 4-Level Game Mechanic Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
            Authoritative Rules
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            Four Levels. One Cumulative Excerpt.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every round picks one track. Each level expands the audio window from the beginning of the clip without revealing the song until your final chance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Level 1 Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:border-indigo-300 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md">
                  Level 1 · Extreme
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  100 pts
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                1.0-Second Clip
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A single split-second burst. Perfect for signature snare hits, iconic synth stabs, or famous vocal shouts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Window: 0.0s – 1.0s
            </div>
          </div>

          {/* Level 2 Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:border-indigo-300 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-md">
                  Level 2 · Hard
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  70 pts
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                3.0-Second Clip
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The intro riff builds up. Basslines and tempo reveal themselves as the rhythm section locks in.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Window: 0.0s – 3.0s
            </div>
          </div>

          {/* Level 3 Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:border-indigo-300 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200/80 px-2.5 py-1 rounded-md">
                  Level 3 · Medium
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  40 pts
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                5.0-Second Clip
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full melodic progression is in motion. Vocal timbre or lead instruments are clearly audible.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Window: 0.0s – 5.0s
            </div>
          </div>

          {/* Level 4 Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:border-indigo-300 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200/80 px-2.5 py-1 rounded-md">
                  Level 4 · Final Chance
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  20 pts
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                10.0-Second Clip + Search
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full 10-second excerpt unlocked. Search the global catalogue to pick the exact track. Miss here, and the round is lost.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Window: 0.0s – 10.0s
            </div>
          </div>

        </div>

      </section>

      {/* Feature Bento Grid: Modes & Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Daily Challenge */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Daily Global Challenge
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A fresh, date-seeded 5-song set every 24 hours. Every player on Earth receives the exact same tracks on the same day. One official attempt per player.
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => onNavigate('daily')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Play Today’s Challenge</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Multiplayer Private Rooms */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Private Multiplayer Rooms
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create a room with a 6-character code, invite friends or challenge peers in synchronized rounds. Real-time scores and final podium rankings.
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => onNavigate('multiplayer')}
                className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Create or Join Room</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: International Discovery */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Global Music Discovery
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore Japanese City Pop, 70s Disco, Nigerian Afrobeats, French Chanson, and Latin Folk. Listen to audio previews and view full licence provenance.
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => onNavigate('discovery')}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Browse Catalogue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* Leaderboard Teaser Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-bold tracking-widest uppercase text-indigo-300">
                Global Competition
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Can you top the all-time leaderboard?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                Scores are validated authoritatively with zero client-side tampering. Build your streak, nail 1-second guesses, and climb the daily and weekly ranks.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('leaderboard')}
                  className="px-6 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shadow-sm inline-flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>View Global Rankings</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
              <div className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-2">
                Today’s Top Scorers
              </div>

              {[
                { rank: 1, name: 'Symphony_Kai', score: 480, streak: 8 },
                { rank: 2, name: 'GrooveMaster99', score: 450, streak: 6 },
                { rank: 3, name: 'VinylHunter', score: 410, streak: 5 }
              ].map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[11px]">
                      {entry.rank}
                    </span>
                    <span className="font-semibold text-white">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 font-mono">
                    <span>🔥 {entry.streak}</span>
                    <span className="font-bold text-white">{entry.score} pts</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
