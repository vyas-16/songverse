import React, { useState, useEffect, useRef } from 'react';
import { Search, Music, Check, Disc3, X } from 'lucide-react';
import { Track } from '../../types';
import { musicCatalogue } from '../../services/musicCatalogue';

interface SongSearchInputProps {
  onSelectTrack: (track: Track) => void;
  selectedTrack: Track | null;
  onClearSelection: () => void;
  disabled?: boolean;
}

export const SongSearchInput: React.FC<SongSearchInputProps> = ({
  onSelectTrack,
  selectedTrack,
  onClearSelection,
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (selectedTrack) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      const found = musicCatalogue.searchTracks(query, 8);
      setResults(found);
      setIsOpen(true);
      setSelectedIndex(-1);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, selectedTrack]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handlePick(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handlePick = (track: Track) => {
    onSelectTrack(track);
    setQuery(`${track.title} – ${track.artist}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onClearSelection();
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={selectedTrack ? `${selectedTrack.title} — ${selectedTrack.artist}` : query}
          onChange={(e) => {
            if (selectedTrack) onClearSelection();
            setQuery(e.target.value);
          }}
          onFocus={() => {
            if (query.trim().length > 0 && results.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Search by song title, artist, or album..."
          className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-slate-300 rounded-xl shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
          aria-label="Search catalogue for song"
          autoComplete="off"
        />

        {(query || selectedTrack) && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-md focus:outline-none cursor-pointer"
            title="Clear"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && !selectedTrack && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2"
        >
          {results.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {results.map((track, idx) => {
                const isHighlighted = idx === selectedIndex;
                return (
                  <li
                    key={track.id}
                    onClick={() => handlePick(track)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isHighlighted ? 'bg-indigo-50/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${track.artworkGradient} flex items-center justify-center text-white shrink-0 shadow-xs`}
                      >
                        <Disc3 className="w-4 h-4 opacity-90" />
                      </div>
                      <div className="truncate text-left">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {track.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {track.artist} · <span className="text-slate-400">{track.album} ({track.releaseYear})</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {track.genre}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-xs text-slate-500">
              No matching tracks found in the catalogue. Try another spelling or artist name.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
