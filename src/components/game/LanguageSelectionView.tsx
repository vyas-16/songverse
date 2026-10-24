import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Globe,
  Play,
  ArrowLeft,
  Check,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Disc3,
  Info
} from 'lucide-react';
import { musicCatalogue } from '../../services/musicCatalogue';

export interface SupportedLanguageInfo {
  id: string;
  name: string;
  nativeScript: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguageInfo[] = [
  { id: 'English', name: 'English', nativeScript: 'English', region: 'Global' },
  { id: 'Telugu', name: 'Telugu', nativeScript: 'తెలుగు', region: 'South India' },
  { id: 'Hindi', name: 'Hindi', nativeScript: 'हिन्दी', region: 'North / Central India' },
  { id: 'Tamil', name: 'Tamil', nativeScript: 'தமிழ்', region: 'South India' },
  { id: 'Malayalam', name: 'Malayalam', nativeScript: 'മലയാളം', region: 'South India' },
  { id: 'Kannada', name: 'Kannada', nativeScript: 'ಕನ್ನಡ', region: 'South India' },
  { id: 'Bengali', name: 'Bengali', nativeScript: 'বাংলা', region: 'East India' },
  { id: 'Punjabi', name: 'Punjabi', nativeScript: 'ਪੰਜਾਬੀ', region: 'North India' },
  { id: 'Spanish', name: 'Spanish', nativeScript: 'Español', region: 'Ibero-America' }
];

const ALL_LANGUAGE_IDS = SUPPORTED_LANGUAGES.map(l => l.id);
const STORAGE_KEY_LANGUAGES = 'songverse_preferred_languages_v1';
const STORAGE_KEY_MIX = 'songverse_mix_languages_v1';

interface LanguageSelectionViewProps {
  onStartGame: (selectedLanguages: string[]) => void;
  onBackToHome: () => void;
}

export const LanguageSelectionView: React.FC<LanguageSelectionViewProps> = ({
  onStartGame,
  onBackToHome
}) => {
  // Load saved preferences from localStorage or default to English
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANGUAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return ['English'];
  });

  const [isMixLanguages, setIsMixLanguages] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_MIX) === 'true';
    } catch {
      return false;
    }
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANGUAGES, JSON.stringify(selectedLanguages));
      localStorage.setItem(STORAGE_KEY_MIX, String(isMixLanguages));
    } catch {
      // Storage unavailable
    }
  }, [selectedLanguages, isMixLanguages]);

  // Subscribe to live catalogue changes
  const [catalogueTick, setCatalogueTick] = useState(0);
  useEffect(() => {
    const unsub = musicCatalogue.subscribe(() => setCatalogueTick(t => t + 1));
    return () => unsub();
  }, []);

  // Real catalogue query for live language counts
  const languageCounts = useMemo(() => {
    return musicCatalogue.getPlayableCountsByLanguage();
  }, [catalogueTick]);

  // Effective active languages: if Mix Languages is enabled, all languages are included
  const activeLanguages = useMemo(() => {
    return isMixLanguages ? ALL_LANGUAGE_IDS : selectedLanguages;
  }, [isMixLanguages, selectedLanguages]);

  // Calculate total playable tracks available for this session
  const totalPlayableCount = useMemo(() => {
    return musicCatalogue.getPlayableTracksByLanguages(activeLanguages).length;
  }, [activeLanguages, catalogueTick]);

  // Filter languages in dropdown search
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(
      l =>
        l.name.toLowerCase().includes(q) ||
        l.nativeScript.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleLanguage = (langId: string) => {
    if (isMixLanguages) {
      // Turning off Mix Languages when user chooses individual selection
      setIsMixLanguages(false);
      setSelectedLanguages([langId]);
      return;
    }

    setSelectedLanguages(prev => {
      if (prev.includes(langId)) {
        // Prevent deselecting last language
        if (prev.length <= 1) return prev;
        return prev.filter(id => id !== langId);
      } else {
        return [...prev, langId];
      }
    });
  };

  const removeChip = (langId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMixLanguages) {
      setIsMixLanguages(false);
      setSelectedLanguages(ALL_LANGUAGE_IDS.filter(id => id !== langId));
      return;
    }
    if (selectedLanguages.length > 1) {
      setSelectedLanguages(prev => prev.filter(id => id !== langId));
    }
  };

  const toggleMixLanguages = () => {
    const nextState = !isMixLanguages;
    setIsMixLanguages(nextState);
    if (nextState) {
      setSelectedLanguages(ALL_LANGUAGE_IDS);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMixLanguages(true);
    setSelectedLanguages(ALL_LANGUAGE_IDS);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMixLanguages(false);
    setSelectedLanguages(['English']);
  };

  const handleStartGame = () => {
    if (totalPlayableCount === 0 || activeLanguages.length === 0) return;
    onStartGame(activeLanguages);
  };

  const isCatalogueEmpty = totalPlayableCount === 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-200">
      
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Choose Your Languages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Select one or more languages for your upcoming song-guessing session.
          </p>
        </div>

        {/* Mix Languages Mode Toggle (Compact) */}
        <div
          onClick={toggleMixLanguages}
          role="switch"
          aria-checked={isMixLanguages}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMixLanguages();
            }
          }}
          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
            isMixLanguages
              ? 'bg-indigo-50/70 border-indigo-200 text-slate-900 shadow-2xs'
              : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm transition-colors ${
              isMixLanguages ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}>
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  🌍 Mix Languages
                </span>
                {isMixLanguages && (
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded">
                    All Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Include songs from every eligible language in a single global game.
              </p>
            </div>
          </div>

          {/* Toggle pill */}
          <div className={`w-10 h-5 rounded-full p-0.5 transition-colors relative shrink-0 ${
            isMixLanguages ? 'bg-indigo-600' : 'bg-slate-300'
          }`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ease-out ${
              isMixLanguages ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </div>
        </div>

        {/* Searchable Multi-Select Dropdown Container */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Language Filter
            </label>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
              >
                Select all
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-500 hover:text-slate-800 font-medium hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Dropdown Trigger Box */}
          <div
            onClick={() => setIsDropdownOpen(prev => !prev)}
            tabIndex={0}
            role="button"
            aria-expanded={isDropdownOpen}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsDropdownOpen(prev => !prev);
              }
            }}
            className={`w-full min-h-[46px] p-2 bg-white border rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              isDropdownOpen ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Chips Container */}
            <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 pr-1">
              {isMixLanguages ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  <Globe className="w-3 h-3 text-indigo-600" />
                  <span>All 9 Languages Selected</span>
                </span>
              ) : selectedLanguages.length === 0 ? (
                <span className="text-xs text-slate-400 pl-1">
                  Select languages...
                </span>
              ) : (
                selectedLanguages.map(langId => {
                  const info = SUPPORTED_LANGUAGES.find(l => l.id === langId);
                  const count = languageCounts[langId] || 0;
                  return (
                    <span
                      key={langId}
                      className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/80"
                    >
                      <span>{info?.name || langId}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({count})</span>
                      <button
                        type="button"
                        onClick={(e) => removeChip(langId, e)}
                        className="p-0.5 text-slate-400 hover:text-slate-700 rounded-sm hover:bg-slate-200/60 transition-colors"
                        aria-label={`Remove ${langId}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>

            {/* Chevron icon */}
            <div className="text-slate-400 shrink-0 pr-1">
              {isDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {/* Dropdown Menu Overlay */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
              
              {/* Search input inside dropdown */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search languages..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  autoFocus
                />
              </div>

              {/* Languages List */}
              <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
                {filteredLanguages.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No languages match &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  filteredLanguages.map((lang) => {
                    const isSelected = activeLanguages.includes(lang.id);
                    const count = languageCounts[lang.id] || 0;

                    return (
                      <div
                        key={lang.id}
                        onClick={() => toggleLanguage(lang.id)}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleLanguage(lang.id);
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer select-none ${
                          isSelected
                            ? 'bg-indigo-50/80 text-indigo-900 font-medium'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Custom Checkbox */}
                          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                          </div>

                          <div>
                            <span className="font-semibold text-slate-900">{lang.name}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5">
                              {lang.nativeScript}
                            </span>
                          </div>
                        </div>

                        {/* Count Badge */}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          count > 0
                            ? 'text-indigo-700 bg-indigo-100/70 font-semibold'
                            : 'text-slate-400 bg-slate-100'
                        }`}>
                          {count} {count === 1 ? 'song' : 'songs'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown footer summary */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>{activeLanguages.length} of 9 languages selected</span>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Done
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Empty Catalogue Polished Banner */}
        {isCatalogueEmpty ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-left space-y-2">
            <div className="flex items-center gap-2 text-slate-800">
              <Disc3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">
                Your playlist is waiting 🎵
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Songs will appear here once added. The active song catalogue has been cleared and contains 0 tracks. Add songs via CSV or catalogue ingestion to enable active rounds.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pt-1">
              <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>Available songs for all languages: 0</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/80 flex items-center justify-between text-xs">
            <span className="text-slate-600">Eligible tracks for this session:</span>
            <span className="font-bold text-indigo-700 font-mono">{totalPlayableCount} Playable Tracks</span>
          </div>
        )}

        {/* Action Button: Start Game */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleStartGame}
            disabled={isCatalogueEmpty || activeLanguages.length === 0}
            className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isCatalogueEmpty || activeLanguages.length === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm cursor-pointer'
            }`}
          >
            <Play className={`w-4 h-4 ${isCatalogueEmpty ? 'fill-slate-400' : 'fill-white'}`} />
            <span>
              {isCatalogueEmpty
                ? 'Start Game (0 Songs Available)'
                : `Start Game (${totalPlayableCount} Songs)`}
            </span>
          </button>

          {isCatalogueEmpty && (
            <p className="text-center text-[11px] text-slate-400">
              Start Game is disabled because there are no playable songs in the active catalogue.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
