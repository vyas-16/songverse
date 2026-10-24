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
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Layers,
  Music,
  Check,
  Info
} from 'lucide-react';
import { Track } from '../../types';
import { musicCatalogue } from '../../services/musicCatalogue';
import { audioEngine, AUDIO_PROVIDER_ADAPTERS } from '../../services/audioEngine';
import { GlobalCataloguePipeline } from './GlobalCataloguePipeline';

interface MusicSearchResultItem {
  id: string;
  providerTrackId: string;
  title: string;
  artist: string;
  album: string;
  releaseYear: number;
  country: string;
  genre: string;
  language: string;
  artworkUrl?: string;
  audioUrl?: string;
  hasAuthorizedAudio: boolean;
  playbackStatus: 'verified_audio' | 'metadata_only';
  audioAvailability: 'available' | 'restricted';
  licenceType: string;
  licenceReference: string;
  attributionText: string;
  source: string;
  isrc?: string;
}

export const DiscoveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'catalogue' | 'compliance'>('search');
  const [catalogueTick, setCatalogueTick] = useState(0);

  // Search tab state
  const [searchTitle, setSearchTitle] = useState('');
  const [searchArtist, setSearchArtist] = useState('');
  const [searchResults, setSearchResults] = useState<MusicSearchResultItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedTrackIds, setAddedTrackIds] = useState<Set<string>>(new Set());

  // Catalogue tab state
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedPlaybackFilter, setSelectedPlaybackFilter] = useState<'all' | 'verified_audio' | 'metadata_only'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Audio preview state
  const [auditioningTrackId, setAuditioningTrackId] = useState<string | null>(null);
  const [showGlobalPipeline, setShowGlobalPipeline] = useState(false);

  // Subscribe to catalogue updates
  useEffect(() => {
    const unsub = musicCatalogue.subscribe(() => {
      setCatalogueTick(t => t + 1);
    });
    return () => unsub();
  }, []);

  // Sync addedTrackIds with current catalogue
  const allSavedTracks = musicCatalogue.getAllTracks();
  const playableSavedTracks = musicCatalogue.getPlayableTracks();
  const metadataOnlySavedTracks = musicCatalogue.getMetadataOnlyTracks();

  // Helper to check if a search result is already in the catalogue
  const isTrackInCatalogue = (item: MusicSearchResultItem): boolean => {
    if (addedTrackIds.has(item.id)) return true;
    const normTitle = (item.title || '').toLowerCase().trim().replace(/[^\w\s]/g, '');
    const normArtist = (item.artist || '').toLowerCase().trim().replace(/[^\w\s]/g, '');
    return allSavedTracks.some(t => {
      if (t.id === item.id || t.providerTrackId === item.providerTrackId) return true;
      const tTitle = (t.title || '').toLowerCase().trim().replace(/[^\w\s]/g, '');
      const tArtist = (t.artist || '').toLowerCase().trim().replace(/[^\w\s]/g, '');
      return tTitle === normTitle && tArtist === normArtist;
    });
  };

  // Execute music API search
  const handleSearch = async (overrideTitle?: string, overrideArtist?: string) => {
    const title = (overrideTitle !== undefined ? overrideTitle : searchTitle).trim();
    const artist = (overrideArtist !== undefined ? overrideArtist : searchArtist).trim();

    if (!title && !artist) {
      setSearchError('Please enter a song title or artist to search.');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (title) params.append('title', title);
      if (artist) params.append('artist', artist);
      params.append('limit', '18');

      const res = await fetch(`/api/music/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Search API returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err: unknown) {
      console.error('Search error:', err);
      setSearchError((err as Error).message || 'Failed to search music catalogue API.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add search result to catalogue
  const handleAddResultToCatalogue = (item: MusicSearchResultItem) => {
    const newTrack: Track = {
      id: item.id || `trk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      provider: 'apple-itunes',
      providerTrackId: item.providerTrackId || item.id,
      title: item.title,
      artist: item.artist,
      album: item.album || 'Single',
      releaseYear: item.releaseYear || 2024,
      decade: item.releaseYear ? `${Math.floor(item.releaseYear / 10) * 10}s` : '2020s',
      country: item.country || 'Global',
      language: item.language || 'English',
      genre: item.genre || 'Pop',
      artworkUrl: item.artworkUrl,
      artworkGradient: 'from-indigo-600 via-purple-600 to-pink-500',
      audioUrl: item.audioUrl,
      audioAssetUrl: item.audioUrl,
      playbackStatus: item.playbackStatus,
      availabilityStatus: item.audioAvailability || (item.playbackStatus === 'verified_audio' ? 'available' : 'restricted'),
      durationSeconds: 210,
      clipStartSeconds: 0,
      licenceReference: item.licenceReference || `ITUNES-${item.providerTrackId}`,
      licenceType: item.licenceType || 'Apple iTunes Promotional Preview (30s)',
      attributionText: item.attributionText || `Track by ${item.artist}. Promotional audition stream.`,
      regionRestrictions: [],
      aliases: [item.title, `${item.artist} ${item.title}`],
      isrc: item.isrc
    };

    const res = musicCatalogue.addTrack(newTrack);
    if (res.added) {
      setAddedTrackIds(prev => new Set(prev).add(item.id));
    }
  };

  // Remove track from catalogue
  const handleRemoveTrack = (trackId: string) => {
    musicCatalogue.removeTrack(trackId);
    setConfirmDeleteId(null);
    if (auditioningTrackId === trackId) {
      audioEngine.stop();
      setAuditioningTrackId(null);
    }
  };

  // Audition audio sample
  const handleAudition = async (track: Track | MusicSearchResultItem) => {
    if (track.playbackStatus === 'metadata_only' || !track.audioUrl) {
      return;
    }

    if (auditioningTrackId === track.id) {
      audioEngine.stop();
      setAuditioningTrackId(null);
    } else {
      audioEngine.stop();
      setAuditioningTrackId(track.id);

      // Convert to full track format for audio engine if needed
      const playableTrack: Track = 'provider' in track ? (track as Track) : {
        id: track.id,
        provider: 'apple-itunes',
        providerTrackId: track.providerTrackId,
        title: track.title,
        artist: track.artist,
        album: track.album,
        releaseYear: track.releaseYear,
        decade: `${Math.floor(track.releaseYear / 10) * 10}s`,
        country: track.country,
        language: track.language,
        genre: track.genre,
        artworkUrl: track.artworkUrl,
        artworkGradient: 'from-indigo-600 to-purple-600',
        audioUrl: track.audioUrl,
        audioAssetUrl: track.audioUrl,
        playbackStatus: 'verified_audio',
        availabilityStatus: 'available',
        durationSeconds: 210,
        clipStartSeconds: 0,
        licenceReference: track.licenceReference,
        licenceType: track.licenceType,
        attributionText: track.attributionText,
        regionRestrictions: []
      };

      try {
        await audioEngine.playClip(playableTrack, 3); // 5s preview
      } catch {
        // Stop audio
      } finally {
        setAuditioningTrackId(null);
      }
    }
  };

  // Filter catalogue tracks
  const filteredCatalogueTracks = allSavedTracks.filter(track => {
    if (selectedPlaybackFilter !== 'all' && track.playbackStatus !== selectedPlaybackFilter) {
      return false;
    }
    if (selectedLanguage !== 'All' && track.language.toLowerCase() !== selectedLanguage.toLowerCase()) {
      return false;
    }
    if (catalogueSearch.trim()) {
      const q = catalogueSearch.toLowerCase().trim();
      const matchTitle = track.title.toLowerCase().includes(q);
      const matchArtist = track.artist.toLowerCase().includes(q);
      const matchAlbum = (track.album || '').toLowerCase().includes(q);
      if (!matchTitle && !matchArtist && !matchAlbum) return false;
    }
    return true;
  });

  const languageOptions = [
    'All',
    'English',
    'Telugu',
    'Hindi',
    'Tamil',
    'Malayalam',
    'Kannada',
    'Bengali',
    'Punjabi',
    'Spanish'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-2">
            <span>Catalogue Manager & Music Search</span>
            <span aria-hidden="true">·</span>
            <span>Live APIs Connected</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Song Search & Catalogue Management
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Search songs across global music catalogues, inspect album artwork and verified playback availability, and add tracks to your SongVerse game playlist with one click.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-xs text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-500">Playable Songs: </span>
              <strong className="text-emerald-700 font-mono text-sm">{playableSavedTracks.length}</strong>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div>
              <span className="text-slate-500">Total in Catalogue: </span>
              <strong className="text-indigo-700 font-mono text-sm">{allSavedTracks.length}</strong>
            </div>
          </div>

          <button
            onClick={() => setShowGlobalPipeline(!showGlobalPipeline)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showGlobalPipeline ? 'Hide Custom Audio' : 'Custom Audio URL'}</span>
          </button>
        </div>
      </div>

      {/* Global Ingestion Drawer if toggled */}
      {showGlobalPipeline && (
        <GlobalCataloguePipeline onSongAdded={() => setCatalogueTick(t => t + 1)} />
      )}

      {/* Primary Tab Switcher */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'search'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Automatic Song Search</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogue')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'catalogue'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Disc3 className="w-4 h-4" />
          <span>My Catalogue ({allSavedTracks.length})</span>
          {playableSavedTracks.length > 0 && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-semibold">
              {playableSavedTracks.length} Playable
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'compliance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Playback Providers & Licensing Audit</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: AUTOMATIC SONG SEARCH                                 */}
      {/* ============================================================ */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Inputs Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Search Music API for Songs & Artists</span>
              </h2>
              <p className="text-xs text-slate-500">
                Enter a song title, artist, or both. Searches authorized music APIs for matching tracks with real album artwork and preview playback.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="e.g. Blinding Lights, Flowers, Shape of You..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white text-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={searchArtist}
                    onChange={(e) => setSearchArtist(e.target.value)}
                    placeholder="e.g. The Weeknd, Miley Cyrus, Ed Sheeran..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white text-slate-900 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Popular queries:</span>
                  {[
                    { title: 'Blinding Lights', artist: 'The Weeknd' },
                    { title: 'Flowers', artist: 'Miley Cyrus' },
                    { title: 'Shape of You', artist: 'Ed Sheeran' },
                    { title: 'Despacito', artist: 'Luis Fonsi' },
                    { title: 'Naatu Naatu', artist: 'M.M. Keeravani' },
                    { title: 'Kesariya', artist: 'Arijit Singh' }
                  ].map((s) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => {
                        setSearchTitle(s.title);
                        setSearchArtist(s.artist);
                        handleSearch(s.title, s.artist);
                      }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all shrink-0"
                >
                  {searchLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>{searchLoading ? 'Searching API...' : 'Search Catalogue'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Loading State */}
          {searchLoading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Searching music catalogue API...</p>
              <p className="text-xs text-slate-400">Connecting to real music catalogue endpoints for recordings and artwork</p>
            </div>
          )}

          {/* Error Notice */}
          {searchError && !searchLoading && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-rose-900">Search Notice</h3>
                <p className="text-xs text-rose-700">{searchError}</p>
              </div>
            </div>
          )}

          {/* Empty Results Notice */}
          {!searchLoading && !searchError && hasSearched && searchResults.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-2">
              <Disc3 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No tracks found matching your query</p>
              <p className="text-xs text-slate-400">Check spelling or try a different song title or artist.</p>
            </div>
          )}

          {/* Search Results Grid */}
          {!searchLoading && searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <div>
                  Found <strong className="text-slate-800 font-mono">{searchResults.length}</strong> matching songs from music provider
                </div>
                <div className="text-[11px] text-slate-400">
                  Click &quot;Add to Catalogue&quot; to include in your game playlist
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.map((item) => {
                  const alreadySaved = isTrackInCatalogue(item);
                  const isAuditioning = auditioningTrackId === item.id;
                  const hasAudio = item.playbackStatus === 'verified_audio' && Boolean(item.audioUrl);

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Real Album Artwork */}
                            {item.artworkUrl ? (
                              <img
                                src={item.artworkUrl}
                                alt={item.album}
                                className="w-14 h-14 rounded-xl object-cover shadow-xs shrink-0 border border-slate-100"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                                <Disc3 className="w-7 h-7" />
                              </div>
                            )}

                            <div className="truncate text-left">
                              <h3 className="text-sm font-bold text-slate-900 truncate" title={item.title}>
                                {item.title}
                              </h3>
                              <p className="text-xs font-semibold text-indigo-700 truncate" title={item.artist}>
                                {item.artist}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {item.album} ({item.releaseYear})
                              </p>
                            </div>
                          </div>

                          {/* Audition Button */}
                          {hasAudio ? (
                            <button
                              onClick={() => handleAudition(item)}
                              className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs ${
                                isAuditioning
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                              }`}
                              title={isAuditioning ? 'Stop' : 'Audition Audio Clip'}
                            >
                              {isAuditioning ? (
                                <RotateCcw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4 fill-current" />
                              )}
                            </button>
                          ) : (
                            <div
                              className="p-2 rounded-xl bg-slate-100 text-slate-400 shrink-0 cursor-not-allowed"
                              title="Metadata only — no audio attached"
                            >
                              <VolumeX className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Metadata Tags & Provider Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                          <span className="font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                            {item.language}
                          </span>
                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            {item.genre}
                          </span>
                          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.country || 'Global'}
                          </span>
                        </div>

                        {/* Provider & Playback Status Distinction */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] space-y-1">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="font-semibold">Provider: Apple iTunes API</span>
                            <span className="font-mono truncate max-w-[120px]">ID: {item.providerTrackId}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Audio Playback:</span>
                            {hasAudio ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <Volume2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified Audio (30s)</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 flex items-center gap-1">
                                <VolumeX className="w-3 h-3" />
                                <span>Metadata Only</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 1-Click Add Button */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleAddResultToCatalogue(item)}
                          disabled={alreadySaved}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            alreadySaved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white cursor-pointer shadow-xs'
                          }`}
                        >
                          {alreadySaved ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>✓ In Catalogue</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Add to Catalogue</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MY CATALOGUE & PLAYABLE VAULT                         */}
      {/* ============================================================ */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={catalogueSearch}
                onChange={(e) => setCatalogueSearch(e.target.value)}
                placeholder="Search saved songs by title, artist, or album..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white text-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
                  >
                    {languageOptions.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Audio Status:</span>
                  <select
                    value={selectedPlaybackFilter}
                    onChange={(e) => setSelectedPlaybackFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
                  >
                    <option value="all">All Saved Tracks ({allSavedTracks.length})</option>
                    <option value="verified_audio">Playable in Trivia ({playableSavedTracks.length})</option>
                    <option value="metadata_only">Metadata Only ({metadataOnlySavedTracks.length})</option>
                  </select>
                </div>
              </div>

              {allSavedTracks.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your active SongVerse catalogue? This will remove all saved tracks.')) {
                      musicCatalogue.clearCatalogue();
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Entire Catalogue</span>
                </button>
              )}
            </div>
          </div>

          {/* Empty Catalogue State */}
          {allSavedTracks.length === 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                <Music className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Your playlist is waiting 🎵
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your SongVerse catalogue is currently empty. Use the Automatic Song Search tab to discover tracks from supported music providers and add them to your game playlist with one click.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('search')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search & Add Songs</span>
              </button>
            </div>
          )}

          {/* Filter Returned Zero State */}
          {allSavedTracks.length > 0 && filteredCatalogueTracks.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 max-w-md mx-auto space-y-3">
              <Disc3 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No tracks match your current filter</p>
              <p className="text-xs text-slate-400">Try changing language or audio status filters.</p>
              <button
                onClick={() => {
                  setCatalogueSearch('');
                  setSelectedLanguage('All');
                  setSelectedPlaybackFilter('all');
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Catalogue Grid */}
          {filteredCatalogueTracks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogueTracks.map((track) => {
                const isAuditioning = auditioningTrackId === track.id;
                const isPlayable = track.playbackStatus === 'verified_audio' && track.availabilityStatus === 'available';

                return (
                  <div
                    key={track.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {track.artworkUrl ? (
                            <img
                              src={track.artworkUrl}
                              alt={track.album}
                              className="w-14 h-14 rounded-xl object-cover shadow-xs shrink-0 border border-slate-100"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${track.artworkGradient} flex items-center justify-center text-white shrink-0 shadow-xs`}
                            >
                              <Disc3 className={`w-7 h-7 ${isAuditioning ? 'animate-spin' : ''}`} />
                            </div>
                          )}

                          <div className="truncate text-left">
                            <h3 className="text-sm font-bold text-slate-900 truncate" title={track.title}>
                              {track.title}
                            </h3>
                            <p className="text-xs font-semibold text-slate-700 truncate" title={track.artist}>
                              {track.artist}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {track.album} ({track.releaseYear}) · {track.country || 'Global'}
                            </p>
                          </div>
                        </div>

                        {/* Audition Button */}
                        {isPlayable ? (
                          <button
                            onClick={() => handleAudition(track)}
                            className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-xs ${
                              isAuditioning
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                            }`}
                            title={isAuditioning ? 'Stop Audition' : 'Audition 5s Audio Clip'}
                          >
                            {isAuditioning ? (
                              <RotateCcw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 fill-current" />
                            )}
                          </button>
                        ) : (
                          <div
                            className="p-2.5 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
                            title="Metadata only — audio excluded from trivia"
                          >
                            <VolumeX className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Language & Genre Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md text-[11px]">
                          {track.language}
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {track.genre}
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {track.decade}
                        </span>
                      </div>

                      {/* Decoupled Fields: Metadata vs Playback Status */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] space-y-1.5">
                        <div className="flex items-center justify-between text-slate-700 font-medium">
                          <span>Metadata Status:</span>
                          <span className="text-slate-900 font-semibold">Indexed</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Playback Status:</span>
                          {isPlayable ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                              <Volume2 className="w-3 h-3 text-emerald-600" />
                              <span>Playable in Trivia</span>
                            </span>
                          ) : (
                            <span className="text-slate-600 font-medium bg-slate-200/80 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                              <VolumeX className="w-3 h-3" />
                              <span>Metadata Only</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] pt-1 border-t border-slate-200/60">
                          <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{track.licenceType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions: ID and Remove Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] text-slate-400 truncate max-w-[130px]">
                        {track.providerTrackId}
                      </span>

                      {confirmDeleteId === track.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRemoveTrack(track.id)}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(track.id)}
                          className="text-slate-400 hover:text-rose-600 flex items-center gap-1 text-[11px] font-medium p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove from catalogue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PLAYBACK PROVIDERS & LICENSING AUDIT                 */}
      {/* ============================================================ */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Decoupled Audio Provider Adapter Architecture</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              SongVerse operates an adapter pattern separating audio playback from game mechanics. This allows the game engine to switch audio sources or enforce copyright terms without modifying gameplay rules or scoring logic.
            </p>
          </div>

          {/* Provider Adapters Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AUDIO_PROVIDER_ADAPTERS.map((adapter) => {
              const isReady = adapter.status === 'ready';
              const isProhibited = adapter.status === 'prohibited_by_policy';
              const isMissingCreds = adapter.status === 'missing_credentials';

              return (
                <div
                  key={adapter.id}
                  className={`border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 ${
                    isReady
                      ? 'bg-white border-emerald-200'
                      : isProhibited
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {adapter.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-400">
                          Adapter ID: {adapter.id}
                        </p>
                      </div>

                      {isReady && (
                        <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Active / Ready</span>
                        </span>
                      )}
                      {isProhibited && (
                        <span className="text-rose-700 bg-rose-100 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Prohibited by Policy
                        </span>
                      )}
                      {isMissingCreds && (
                        <span className="text-amber-800 bg-amber-100 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Credentials Required
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {adapter.description}
                    </p>

                    {adapter.policyNotice && (
                      <div className="bg-white/80 border border-slate-200 rounded-xl p-3 text-[11px] space-y-1">
                        <span className="font-bold text-slate-800 block">Terms & Policy Notice:</span>
                        <p className="text-slate-600 leading-relaxed">{adapter.policyNotice}</p>
                      </div>
                    )}

                    {adapter.supportedLicenceTypes.length > 0 && (
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <span className="font-semibold text-slate-700">Supported Rights Tiers:</span>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {adapter.supportedLicenceTypes.map(lic => (
                            <span key={lic} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                              {lic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Authorized for Trivia Gameplay:</span>
                    <strong className={adapter.isAuthorizedForTriviaGames ? 'text-emerald-700' : 'text-rose-600'}>
                      {adapter.isAuthorizedForTriviaGames ? 'Yes (Authorized)' : 'No (Restricted)'}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legal FAQ Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Legal Assessment & Playback Compliance</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <h4 className="font-bold text-slate-900">Can Spotify be used for game playback?</h4>
                <p>
                  <strong>No.</strong> Section II.3 of the Spotify Developer Policy explicitly forbids using the Spotify Web Playback SDK for games, quizzes, and trivia contests without custom commercial licensing. Consumer Spotify Premium accounts do not authorize interactive game synchronization.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <h4 className="font-bold text-slate-900">What about Apple MusicKit?</h4>
                <p>
                  Apple MusicKit requires an Apple Developer Program subscription, a private key (.p8), and end-user subscriptions. Standard streaming terms do not clear interactive guessing games where music is obscured for competitive trivia.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <h4 className="font-bold text-slate-900">What recordings can legally play in SongVerse?</h4>
                <p>
                  Pre-cleared 30-second promotional audition streams (Apple iTunes Search API), Creative Commons recordings (CC-BY, CC0), Open Audio Project assets, public domain works, and user-hosted custom audio URLs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <h4 className="font-bold text-slate-900">How does SongVerse enforce duration limits?</h4>
                <p>
                  Audio playback is hardware-timed in milliseconds by AudioContext and HTMLAudioElement boundaries, strictly stopping at 1.0s (Level 1), 3.0s (Level 2), 5.0s (Level 3), and 10.0s (Level 4).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
