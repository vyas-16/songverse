import React, { useState, useEffect } from 'react';
import { Users, Play, Crown, Check, X, ArrowRight, RotateCcw, Trophy, Copy, Volume2, Sparkles, Disc3, Lock, LogIn, Shield } from 'lucide-react';
import { MultiplayerRoom, Track } from '../../types';
import { multiplayerEngine } from '../../services/multiplayerEngine';
import { gameEngine } from '../../services/gameEngine';
import { audioEngine } from '../../services/audioEngine';
import { SongSearchInput } from '../game/SongSearchInput';
import { GAME_LEVELS } from '../../config/gameConfig';
import { AuthModal } from '../auth/AuthModal';

interface MultiplayerViewProps {
  onOpenAuth?: () => void;
  onNavigateHome?: () => void;
}

export const MultiplayerView: React.FC<MultiplayerViewProps> = ({ onOpenAuth, onNavigateHome }) => {
  const [profile, setProfile] = useState(gameEngine.getUserProfile());
  const [room, setRoom] = useState<MultiplayerRoom | null>(multiplayerEngine.getActiveRoom());
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const userProfile = profile;


  useEffect(() => {
    const unsub = multiplayerEngine.subscribeRoom((updatedRoom) => {
      setRoom({ ...updatedRoom });
    });
    return () => unsub();
  }, []);

  const handleCreateRoom = () => {
    const newRoom = multiplayerEngine.createRoom(userProfile.displayName, userProfile.id);
    setRoom(newRoom);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const joined = multiplayerEngine.joinRoom(joinCodeInput, userProfile.displayName, userProfile.id);
    setRoom(joined);
    setJoinCodeInput('');
  };

  const handleCopyCode = () => {
    if (room?.roomCode) {
      navigator.clipboard.writeText(room.roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleToggleReady = () => {
    multiplayerEngine.toggleReady(userProfile.id);
  };

  const handleStartGame = () => {
    if (room) {
      multiplayerEngine.startMatch(room.hostId);
    }
  };

  const handlePlayMultiplayerAudio = async () => {
    const track = multiplayerEngine.getCurrentTrack();
    if (!track) return;

    if (isPlayingAudio) {
      audioEngine.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      await audioEngine.playClip(track, 2); // 3s clip
      setIsPlayingAudio(false);
    }
  };

  const handleSubmitMultiplayerGuess = () => {
    if (!selectedTrack || !room) return;
    const currentTrack = multiplayerEngine.getCurrentTrack();
    const isCorrect = selectedTrack.id === currentTrack?.id;
    const points = isCorrect ? 70 : 0;

    multiplayerEngine.submitPlayerGuess(userProfile.id, isCorrect, points);
    setSelectedTrack(null);
  };

  const handleNextRound = () => {
    multiplayerEngine.nextRound();
  };

  const handleLeaveRoom = () => {
    audioEngine.stop();
    multiplayerEngine.leaveRoom();
    setRoom(null);
  };

  // --- Guest Gate: Multiplayer is exclusively available for signed-in accounts ---
  if (profile.isGuest) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Verified Account Required
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Multiplayer Is Available For Signed-In Accounts
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            To prevent room code spoofing, protect leaderboard integrity, and ensure smooth real-time synchronization, private multiplayer matches require an authenticated Apple or Google account.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-left text-xs space-y-2 shadow-xs max-w-md mx-auto">
          <div className="font-semibold text-slate-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Why an account is required for multiplayer:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-[11px]">
            <li>Unique player identity across game rooms and devices</li>
            <li>Prevents anonymous griefing and unauthorized lobby takeovers</li>
            <li>Cross-session match history and head-to-head statistics</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => (onOpenAuth ? onOpenAuth() : setAuthModalOpen(true))}
            className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Play Multiplayer</span>
          </button>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-5 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <span>Play Solo (Classic / Daily)</span>
            </button>
          )}
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            const updated = gameEngine.getUserProfile();
            setProfile(updated);
          }}
        />
      </div>
    );
  }

  // --- View 1: Not in room (Create or Join) ---
  if (!room) {

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span>Private Multiplayer Rooms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Challenge Your Friends
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Create a custom room, share the 6-character room code, and compete in synchronized rounds with live answer timing and scoreboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          
          {/* Create Room Box */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Host a New Room
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate a private lobby. You decide when to start the countdown once your peers are ready.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handleCreateRoom}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Create Room
              </button>
            </div>
          </div>

          {/* Join Room Box */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Join with Room Code
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter the 6-character invite code provided by your game host (e.g. SONG42).
              </p>

              <form onSubmit={handleJoinRoom} className="space-y-3 pt-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SONG42"
                  maxLength={8}
                  className="w-full px-3 py-2 text-sm uppercase font-mono tracking-wider bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  disabled={!joinCodeInput.trim()}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  Join Room
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    );
  }

  const isHost = room.hostId === userProfile.id;
  const myPlayer = room.players.find(p => p.id === userProfile.id);

  // --- View 2: In Lobby ---
  if (room.status === 'lobby') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Private Room Lobby
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-2xl font-bold font-mono tracking-wider text-indigo-600">
                  {room.roomCode}
                </h2>
                <button
                  onClick={handleCopyCode}
                  className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                  title="Copy Code"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleLeaveRoom}
              className="text-xs text-rose-600 hover:underline cursor-pointer"
            >
              Leave Room
            </button>
          </div>

          {/* Player Cards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Players In Room ({room.players.length})
            </h4>
            
            <div className="space-y-2">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
                      {p.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{p.displayName}</span>
                        {p.isHost && (
                          <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-sans">
                            Host
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.id === userProfile.id ? 'You' : 'Peer Player'}
                      </div>
                    </div>
                  </div>

                  <div>
                    {p.isReady ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-slate-400 bg-slate-200/60 px-2 py-1 rounded-md font-semibold">
                        Waiting...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lobby Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleToggleReady}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                myPlayer?.isReady
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {myPlayer?.isReady ? 'Cancel Ready' : 'I am Ready!'}
            </button>

            {isHost && (
              <button
                onClick={handleStartGame}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Match</span>
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // --- View 3: In Active Match ---
  const currentTrack = multiplayerEngine.getCurrentTrack();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Match HUD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 mb-6 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Round {room.currentRoundIndex + 1} of {room.trackIds.length} · Room {room.roomCode}
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            {room.status === 'round-summary' ? 'Round Review' : 'Listen & Guess Fast!'}
          </h2>
        </div>

        <button
          onClick={handleLeaveRoom}
          className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          Leave Match
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Play Area */}
        <div className="md:col-span-8 space-y-6">
          
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Volume2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Synchronized 3.0s Excerpt
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                All players hear the same audio clip simultaneously.
              </p>
            </div>

            <button
              onClick={handlePlayMultiplayerAudio}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              {isPlayingAudio ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Playing clip...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Listen to 3.0s Clip</span>
                </>
              )}
            </button>
          </div>

          {room.status === 'playing' && !myPlayer?.hasGuessedThisRound && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                Submit Your Track Selection
              </h4>
              <SongSearchInput
                selectedTrack={selectedTrack}
                onSelectTrack={(t) => setSelectedTrack(t)}
                onClearSelection={() => setSelectedTrack(null)}
              />
              <button
                onClick={handleSubmitMultiplayerGuess}
                disabled={!selectedTrack}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:cursor-not-allowed shadow-xs"
              >
                Lock In Answer
              </button>
            </div>
          )}

          {myPlayer?.hasGuessedThisRound && room.status === 'playing' && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <div className="text-sm font-bold text-indigo-700">
                Answer Locked In!
              </div>
              <p className="text-xs text-slate-500">
                Waiting for remaining players to submit their guesses...
              </p>
            </div>
          )}

          {/* Round Summary Card */}
          {room.status === 'round-summary' && currentTrack && (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${currentTrack.artworkGradient} flex items-center justify-center text-white shrink-0`}>
                  <Disc3 className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs text-indigo-600 font-semibold uppercase">Target Song</div>
                  <div className="text-base font-bold text-slate-900">{currentTrack.title}</div>
                  <div className="text-xs text-slate-600">{currentTrack.artist} — {currentTrack.album}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleNextRound}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {room.currentRoundIndex < room.trackIds.length - 1 ? 'Next Round' : 'View Final Podium'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Live Scoreboard Column */}
        <div className="md:col-span-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Live Room Scoreboard
            </h4>

            <div className="space-y-2">
              {[...room.players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-slate-400 font-bold w-4">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-900 truncate">
                        {p.displayName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {p.hasGuessedThisRound && (
                        <span className="text-[10px] text-emerald-700 font-bold">
                          {p.lastGuessCorrect ? '✓ Correct' : '✗ Miss'}
                        </span>
                      )}
                      <span className="font-bold text-indigo-600 font-mono tabular-nums">
                        {p.score} pts
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
