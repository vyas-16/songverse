import React, { useState, useEffect } from 'react';
import {
  Search,
  Disc3,
  Play,
  RotateCcw,
  Globe,
  ShieldCheck,
  VolumeX,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Database,
  Info,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Track } from '../../types';
import { musicCatalogue } from '../../services/musicCatalogue';
import { audioEngine } from '../../services/audioEngine';
import { GlobalCataloguePipeline } from './GlobalCataloguePipeline';
import { musicBrainzService, MusicBrainzRecording } from '../../services/musicbrainzService';

export const DiscoveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vault' | 'musicbrainz'>('vault');

  // Local vault state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'verified_audio' | 'metadata_only'>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 9;

  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [showGlobalPipeline, setShowGlobalPipeline] = useState(false);
  const [catalogueVersion, setCatalogueVersion] = useState(0);

  // MusicBrainz live search state
  const [mbQuery, setMbQuery] = useState('Blinding Lights');
  const [mbResults, setMbResults] = useState<MusicBrainzRecording[]>([]);
  const [mbLoading, setMbLoading] = useState(false);
  const [mbError, setMbError] = useState<string | null>(null);
  const [mbTotalCount, setMbTotalCount] = useState<number>(0);
  const [mbPage, setMbPage] = useState<number>(1);
  const mbPageSize = 10;
  const [ingestedMbIds, setIngestedMbIds] = useState<Set<string>>(new Set());

  const allTracks = musicCatalogue.getAllTracks();

  // Extract unique filters
  const genres = ['All', ...Array.from(new Set(allTracks.map(t => t.genre))).sort()];
  const languages = [
    'All',
    'English',
    'Hindi',
    'Telugu',
    'Tamil',
    'Korean',
    'Japanese',
    'Spanish',
    'French',
    'German',
    'Portuguese',
    'Gaelic',
    'Zulu',
    'Tamasheq',
    'Arabic'
  ];
  const countries = ['All', ...Array.from(new Set(allTracks.map(t => t.country || 'Global'))).sort()];

  // Paginated query for local vault
  const paginatedResult = musicCatalogue.getPaginatedTracks({
    searchQuery,
    genre: selectedGenre,
    language: selectedLanguage,
    country: selectedCountry,
    playbackStatus: selectedStatus,
    alphabetLetter: selectedLetter,
    page: currentPage,
    pageSize
  });

  const alphabetList = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'];

  // Perform initial search on mount for MusicBrainz so user sees real data immediately
  useEffect(() => {
    executeMusicBrainzSearch('Blinding Lights', 1);
  }, []);

  const executeMusicBrainzSearch = async (queryText: string, targetPage: number) => {
    const q = queryText.trim();
    if (!q) return;

    setMbLoading(true);
    setMbError(null);
    const offset = (targetPage - 1) * mbPageSize;

    try {
      const result = await musicBrainzService.searchRecordings({
        query: q,
        limit: mbPageSize,
        offset
      });

      setMbResults(result.recordings);
      setMbTotalCount(result.count);
      setMbPage(targetPage);
    } catch (err: unknown) {
      setMbError((err as Error).message || 'Failed to fetch recordings from MusicBrainz API.');
      setMbResults([]);
    } finally {
      setMbLoading(false);
    }
  };

  const handleMbSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeMusicBrainzSearch(mbQuery, 1);
  };

  const handleMbPageChange = (newPage: number) => {
    executeMusicBrainzSearch(mbQuery, newPage);
  };

  const handleIngestMbTrack = (rec: MusicBrainzRecording) => {
    musicCatalogue.addMusicBrainzTrack({
      id: rec.id,
      title: rec.title,
      artist: rec.artist,
      album: rec.album,
      releaseYear: rec.releaseYear,
      country: rec.country,
      disambiguation: rec.disambiguation
    });

    setIngestedMbIds(prev => new Set(prev).add(rec.id));
    setCatalogueVersion(v => v + 1);
  };

  const handleAuditionTrack = async (track: Track) => {
    if (track.playbackStatus === 'metadata_only') {
      return;
    }

    if (activePlayingId === track.id) {
      audioEngine.stop();
      setActivePlayingId(null);
    } else {
      audioEngine.stop();
      setActivePlayingId(track.id);
      await audioEngine.playClip(track, 3);
      setActivePlayingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedCountry('All');
    setSelectedStatus('all');
    setSelectedLetter('ALL');
    setCurrentPage(1);
  };

  const mbTotalPages = Math.min(Math.ceil(mbTotalCount / mbPageSize), 50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header and Ingestion Triggers */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-2">
            <span>Verified Music Catalogue & Live Open Metadata</span>
            <span aria-hidden="true">·</span>
            <span>MusicBrainz Connected</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            SongVerse Song Catalogue
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Search verified playable trivia tracks or query millions of open metadata records via the live MusicBrainz Recording Search API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowGlobalPipeline(!showGlobalPipeline)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>{showGlobalPipeline ? 'Close Ingestion Portal' : 'Add Community Track'}</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('vault')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'vault'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Disc3 className="w-4 h-4" />
          <span>Curated SongVerse Vault ({allTracks.length} tracks)</span>
        </button>

        <button
          onClick={() => setActiveTab('musicbrainz')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'musicbrainz'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-purple-600" />
          <span>Live MusicBrainz API Search</span>
          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-mono font-semibold">
            Real Metadata
          </span>
        </button>
      </div>

      {/* Catalogue Coverage & Legal Boundary Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Catalogue Coverage & Licensing Transparency: </span>
          SongVerse explicitly indexes authorized recordings and open encyclopedic metadata. We <strong>never claim that the catalogue contains every song in the world</strong>. Playable audio clips are strictly limited to recordings approved for trivia gameplay to respect copyright holders. Metadata-only entries do not provide audio playback.
        </div>
      </div>

      {/* Global Ingestion Pipeline Drawer */}
      {showGlobalPipeline && (
        <GlobalCataloguePipeline onSongAdded={() => setCatalogueVersion(v => v + 1)} />
      )}

      {/* VIEW 1: Live MusicBrainz Recording Search API */}
      {activeTab === 'musicbrainz' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Database className="w-4 h-4 text-purple-600" />
                <span>Search Live MusicBrainz Recordings</span>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-mono">
                  1 req/sec rate limited & cached
                </span>
              </div>
              <a
                href="https://musicbrainz.org/doc/MusicBrainz_API"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>MusicBrainz API Specs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <form onSubmit={handleMbSearchSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={mbQuery}
                  onChange={(e) => setMbQuery(e.target.value)}
                  placeholder="Search real songs or artists (e.g. Blinding Lights, The Weeknd, Dua Lipa)..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={mbLoading}
                  className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {mbLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>{mbLoading ? 'Querying API...' : 'Search MusicBrainz'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMbQuery('The Weeknd');
                    executeMusicBrainzSearch('The Weeknd', 1);
                  }}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                  title="Try searching The Weeknd"
                >
                  The Weeknd
                </button>
              </div>
            </form>

            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>
                Try searching <strong>&quot;Blinding Lights&quot;</strong>, <strong>&quot;The Weeknd&quot;</strong>, or <strong>&quot;Blinding Lights by The Weeknd&quot;</strong> to view real MusicBrainz recording IDs (MBIDs), releases, and verified metadata.
              </span>
            </div>
          </div>

          {/* MusicBrainz Results Section */}
          {mbLoading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Connecting to MusicBrainz Recording API...</p>
              <p className="text-xs text-slate-400">Fetching live verified metadata with rate limit compliance (User-Agent: SongVerse/1.0.0)</p>
            </div>
          )}

          {mbError && !mbLoading && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-rose-900">MusicBrainz Query Notice</h3>
                <p className="text-xs text-rose-700">{mbError}</p>
              </div>
              <button
                onClick={() => executeMusicBrainzSearch(mbQuery, mbPage)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
              >
                Retry Search
              </button>
            </div>
          )}

          {!mbLoading && !mbError && mbResults.length === 0 && mbQuery && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-2">
              <p className="text-sm font-semibold text-slate-700">No recordings matched &quot;{mbQuery}&quot;</p>
              <p className="text-xs text-slate-400">Try searching with alternative artist or track spelling.</p>
            </div>
          )}

          {!mbLoading && mbResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <div>
                  Showing <strong>{(mbPage - 1) * mbPageSize + 1}</strong> – <strong>{Math.min(mbPage * mbPageSize, mbTotalCount)}</strong> of <strong>{mbTotalCount.toLocaleString()}</strong> real recordings from MusicBrainz
                </div>
                <div className="font-mono">
                  Page {mbPage} of {mbTotalPages}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {mbResults.map((rec) => {
                  const isIngested = ingestedMbIds.has(rec.id) || allTracks.some(t => t.providerTrackId === rec.id);

                  return (
                    <div
                      key={rec.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-slate-700 flex items-center justify-center text-white shrink-0 shadow-sm">
                              <Database className="w-6 h-6 opacity-90" />
                            </div>
                            <div className="truncate text-left">
                              <h3 className="text-sm font-bold text-slate-900 truncate" title={rec.title}>
                                {rec.title}
                              </h3>
                              <p className="text-xs font-semibold text-purple-700 truncate" title={rec.artist}>
                                {rec.artist}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {rec.album} {rec.releaseYear ? `(${rec.releaseYear})` : ''} · {rec.country || 'Global'}
                              </p>
                            </div>
                          </div>

                          <div
                            className="p-2 rounded-xl bg-slate-100 text-slate-400 shrink-0 cursor-not-allowed"
                            title="Metadata only — audio not cleared for trivia playback"
                          >
                            <VolumeX className="w-4 h-4" />
                          </div>
                        </div>

                        {rec.disambiguation && (
                          <div className="text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1.5">
                            <span className="font-semibold">Version:</span>
                            <span className="truncate">{rec.disambiguation}</span>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-500 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                          <div className="truncate">
                            <span className="font-semibold text-slate-600">MBID:</span> {rec.id}
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Licence: ODbL Open Metadata</span>
                            <span>Score: {rec.score}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <VolumeX className="w-3 h-3 text-slate-400" />
                          <span>Metadata Only</span>
                        </span>

                        <button
                          onClick={() => handleIngestMbTrack(rec)}
                          disabled={isIngested}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isIngested
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white cursor-pointer shadow-xs'
                          }`}
                        >
                          {isIngested ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>In Vault</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Save to Vault</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MusicBrainz Pagination Controls */}
              {mbTotalPages > 1 && (
                <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <button
                    onClick={() => handleMbPageChange(Math.max(1, mbPage - 1))}
                    disabled={mbPage <= 1}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-600">
                      Page <strong>{mbPage}</strong> of <strong>{mbTotalPages}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => handleMbPageChange(Math.min(mbTotalPages, mbPage + 1))}
                    disabled={mbPage >= mbTotalPages}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SongVerse Vault (Local Curated Catalogue) */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Alphabetical Browsing Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Index:
              </span>
              {alphabetList.map((letter) => {
                const isSelected = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => {
                      setSelectedLetter(letter);
                      setCurrentPage(1);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter and Search Controls */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search vault by song title, artist, or album across all languages..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all text-slate-900"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Audio:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as 'all' | 'verified_audio' | 'metadata_only');
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
                >
                  <option value="all">All Entries</option>
                  <option value="verified_audio">Verified Audio (Playable)</option>
                  <option value="metadata_only">Metadata Only (No Audio)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Genre:</span>
                <select
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
                >
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Country:</span>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {(selectedGenre !== 'All' || selectedLanguage !== 'All' || selectedCountry !== 'All' || selectedStatus !== 'all' || selectedLetter !== 'ALL' || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer ml-auto"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Catalogue Metrics & Pagination Status Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div>
              Showing <strong className="text-slate-800 font-mono">{paginatedResult.items.length > 0 ? (paginatedResult.page - 1) * pageSize + 1 : 0}</strong> – <strong className="text-slate-800 font-mono">{Math.min(paginatedResult.page * pageSize, paginatedResult.total)}</strong> of <strong className="text-slate-800 font-mono">{paginatedResult.total}</strong> tracks
            </div>
            <div className="font-mono">
              Page {paginatedResult.page} of {paginatedResult.totalPages}
            </div>
          </div>

          {/* Catalogue Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResult.items.map((track) => {
              const isPlaying = activePlayingId === track.id;
              const isPlayable = track.playbackStatus === 'verified_audio';

              return (
                <div
                  key={track.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                    isPlayable
                      ? 'border-slate-200/90 hover:border-indigo-300'
                      : 'border-slate-200/70 bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${track.artworkGradient} flex items-center justify-center text-white shrink-0 shadow-sm`}
                        >
                          <Disc3 className={`w-7 h-7 ${isPlaying ? 'animate-spin' : ''}`} />
                        </div>

                        <div className="truncate text-left">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {track.title}
                          </h3>
                          <p className="text-xs text-slate-600 truncate">
                            {track.artist}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {track.album} ({track.releaseYear}) · {track.country || 'Global'}
                          </p>
                        </div>
                      </div>

                      {isPlayable ? (
                        <button
                          onClick={() => handleAuditionTrack(track)}
                          className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-xs ${
                            isPlaying
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                          }`}
                          title={isPlaying ? 'Stop' : 'Audition 5s Sample'}
                        >
                          {isPlaying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>
                      ) : (
                        <div
                          className="p-2.5 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
                          title="Audio not cleared for trivia playback"
                        >
                          <VolumeX className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      <span>{track.genre}</span>
                      <span aria-hidden="true">·</span>
                      <span>{track.language}</span>
                      <span aria-hidden="true">·</span>
                      <span>{track.decade}</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <ShieldCheck className={`w-3.5 h-3.5 ${isPlayable ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>Licence: {track.licenceType}</span>
                      </div>
                      <p className="text-slate-500 text-[10px] leading-tight">
                        {track.attributionText}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="truncate max-w-[150px]">{track.providerTrackId}</span>
                    {isPlayable ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-sans text-[10px] font-bold flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        <span>Verified Audio</span>
                      </span>
                    ) : (
                      <span className="text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded font-sans text-[10px] font-medium flex items-center gap-1">
                        <VolumeX className="w-3 h-3" />
                        <span>Metadata Only</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {paginatedResult.items.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 max-w-md mx-auto my-12 space-y-3">
              <p className="text-sm font-semibold text-slate-700">No tracks match your query</p>
              <p className="text-xs text-slate-400">Try adjusting your language, genre, or alphabetical filter.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination Bar */}
          {paginatedResult.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: paginatedResult.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pageNum === currentPage
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(paginatedResult.totalPages, p + 1))}
                disabled={currentPage >= paginatedResult.totalPages}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
