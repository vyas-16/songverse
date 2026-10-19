import React, { useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Track, GameLevelNumber } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { GAME_LEVELS } from '../../config/gameConfig';

interface AudioPlayerProps {
  track: Track;
  level: GameLevelNumber;
  roundStatus: 'playing' | 'won' | 'lost';
  onClipFinished?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  level,
  roundStatus,
  onClipFinished
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(32).fill(0.18));
  const [isMuted, setIsMuted] = useState(false);

  const levelConfig = GAME_LEVELS[level];
  const maxDuration = levelConfig.durationSeconds;

  useEffect(() => {
    const unsubPlayback = audioEngine.subscribePlayback((playing, curTime) => {
      setIsPlaying(playing);
      setCurrentTime(curTime);
      if (!playing && curTime >= maxDuration - 0.05) {
        onClipFinished?.();
      }
    });

    const unsubWave = audioEngine.subscribeWaveform((amps) => {
      setWaveformBars(amps);
    });

    return () => {
      audioEngine.stop();
      unsubPlayback();
      unsubWave();
    };
  }, [level, maxDuration, onClipFinished]);

  const handlePlayClip = async () => {
    if (isPlaying) {
      audioEngine.stop();
    } else {
      await audioEngine.playClip(track, level);
    }
  };

  const progressPercent = Math.min(100, (currentTime / maxDuration) * 100);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all">
      {/* Subtle background glow based on track artwork gradient */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${track.artworkGradient} opacity-5 blur-3xl pointer-events-none rounded-full`} />

      {/* Header row: Clip duration & level */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2.5 py-1 rounded-md tabular-nums">
            Level {level} · {levelConfig.label}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Window: 0.0s – {maxDuration.toFixed(1)}s
          </span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg focus:outline-none"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Metadata-Only Audio Warning if applicable */}
      {track.playbackStatus === 'metadata_only' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <VolumeX className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-900">
              Audio Excerpt Unavailable (Metadata-Only Entry)
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              This track is currently indexed for metadata discovery only. No authorized commercial recording is cleared for trivia gameplay. SongVerse never scrapes streaming sites or plays unauthorized audio.
            </p>
          </div>
        </div>
      ) : (
        /* Waveform Visualizer Display */
        <div className="h-28 sm:h-32 bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-center gap-1.5 sm:gap-2 mb-6">
          {waveformBars.map((amp, idx) => {
            const barHeight = Math.max(12, Math.round(amp * 100));
            const isActive = isPlaying;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-center h-full"
              >
                <div
                  style={{ height: `${barHeight}%` }}
                  className={`w-full rounded-full transition-all duration-75 ${
                    isActive
                      ? 'bg-gradient-to-t from-indigo-600 to-violet-400 shadow-xs'
                      : 'bg-slate-300'
                  }`}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Track */}
      {track.playbackStatus === 'verified_audio' && (
        <div className="space-y-1.5 mb-6">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{currentTime.toFixed(1)}s</span>
            <span>{maxDuration.toFixed(1)}s max</span>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 max-w-sm">
          {track.playbackStatus === 'metadata_only' ? (
            <span className="text-slate-500">
              Audio excerpt unavailable. You may search for this track in Level 4 or skip this round.
            </span>
          ) : isPlaying ? (
            <span className="text-indigo-600 font-medium flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              Listening to {maxDuration.toFixed(1)}s audio clip...
            </span>
          ) : (
            <span>
              Press play to listen. You can replay the currently unlocked {maxDuration.toFixed(1)}s window as many times as needed.
            </span>
          )}
        </div>

        <button
          onClick={handlePlayClip}
          disabled={roundStatus !== 'playing' || track.playbackStatus === 'metadata_only'}
          className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2.5 shadow-sm transition-all cursor-pointer ${
            track.playbackStatus === 'metadata_only'
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : isPlaying
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
              : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-200'
          } ${roundStatus !== 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {track.playbackStatus === 'metadata_only' ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Audio Unavailable</span>
            </>
          ) : isPlaying ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Stop Audio</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>{currentTime > 0 ? 'Replay Clip' : `Play ${maxDuration.toFixed(1)}s Clip`}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
