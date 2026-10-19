import { Track, PaginatedResult, CatalogueFilterOptions, CSVImportValidationResult } from '../types';

export const INITIAL_TRACK_CATALOGUE: Track[] = [
  // --- English Tracks (Verified Audio) ---
  {
    id: 'trk_neon_solitude',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-001',
    title: 'Neon Solitude',
    artist: 'Aura Cascade',
    album: 'Prismatic Horizons',
    language: 'English',
    genre: 'Synthwave',
    releaseYear: 2023,
    decade: '2020s',
    country: 'United States',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-violet-500 via-indigo-600 to-purple-700',
    audioSynthesizerPreset: 'synthpop',
    durationSeconds: 184,
    clipStartSeconds: 15,
    licenceReference: 'SV-LIC-2024-CC0',
    licenceType: 'Creative Commons 0',
    attributionText: 'Produced under CC0 Public Domain Dedication for SongVerse Open Music Initiative.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Neon Solitude', 'Solitude Neon', 'Aura Cascade - Neon']
  },
  {
    id: 'trk_velvet_echo',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-005',
    title: 'Velvet Echoes',
    artist: 'Luna Meridian',
    album: 'Starlight Almanac',
    language: 'English',
    genre: 'Indie Pop',
    releaseYear: 2021,
    decade: '2020s',
    country: 'United Kingdom',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-fuchsia-500 via-purple-600 to-indigo-800',
    audioSynthesizerPreset: 'indie-acoustic',
    durationSeconds: 210,
    clipStartSeconds: 18,
    licenceReference: 'SV-LIC-2021-CCBY',
    licenceType: 'CC-BY-4.0',
    attributionText: 'Luna Meridian Music / SongVerse Creative Commons Open Music Release.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Velvet Echoes', 'Luna Meridian Velvet']
  },
  {
    id: 'trk_disco_fever_79',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-008',
    title: 'Electric Rollerdisco',
    artist: 'The Studio 54 Revival',
    album: 'Mirrorball Symphony',
    language: 'English',
    genre: 'Disco',
    releaseYear: 1979,
    decade: '1970s',
    country: 'United States',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-yellow-400 via-pink-500 to-purple-600',
    audioSynthesizerPreset: 'disco-groove',
    durationSeconds: 240,
    clipStartSeconds: 30,
    licenceReference: 'SV-LIC-1979-OA',
    licenceType: 'Open Audio Project',
    attributionText: 'Classic funk rhythm and bass recordings, Creative Commons Music Project.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Electric Rollerdisco', 'Studio 54 Revival Rollerdisco']
  },
  {
    id: 'trk_grunge_horizon',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-012',
    title: 'Rain on Pine Street',
    artist: 'The Seattle Drift',
    album: 'Sub-Zero Flannel',
    language: 'English',
    genre: 'Alternative Rock',
    releaseYear: 1994,
    decade: '1990s',
    country: 'United States',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-stone-500 via-zinc-700 to-neutral-900',
    audioSynthesizerPreset: 'indie-acoustic',
    durationSeconds: 212,
    clipStartSeconds: 15,
    licenceReference: 'SV-LIC-1994-CCBY',
    licenceType: 'CC-BY-4.0',
    attributionText: 'Alternative rock heritage recordings licensed under Creative Commons Attribution 4.0.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Rain on Pine Street', 'Seattle Drift Pine Street']
  },

  // --- Telugu Tracks (Preservation & Verified Audio) ---
  {
    id: 'trk_telugu_folk_rhythm',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-023',
    title: 'Dheemthanana (Godavari Beats)',
    artist: 'Kalyan & The Deccan Strings',
    album: 'Andhra Acoustic Rhythms',
    language: 'Telugu',
    genre: 'Folk / Regional',
    releaseYear: 2021,
    decade: '2020s',
    country: 'India',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-amber-500 via-red-600 to-emerald-700',
    audioSynthesizerPreset: 'latin-guitar',
    durationSeconds: 215,
    clipStartSeconds: 16,
    licenceReference: 'SV-LIC-2021-CCBY',
    licenceType: 'CC-BY-4.0',
    attributionText: 'Traditional Telugu folk percussion and acoustic violin, Open Heritage Project.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Dheemthanana', 'Godavari Beats', 'Kalyan Deccan Strings']
  },
  {
    id: 'trk_telugu_mandolin',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-024',
    title: 'Konaseema Twilight',
    artist: 'Srinivas Mandolin Ensemble',
    album: 'Delta Melodies',
    language: 'Telugu',
    genre: 'Fusion',
    releaseYear: 2017,
    decade: '2010s',
    country: 'India',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-yellow-500 via-emerald-600 to-teal-800',
    audioSynthesizerPreset: 'latin-guitar',
    durationSeconds: 204,
    clipStartSeconds: 18,
    licenceReference: 'SV-LIC-2017-CCBY',
    licenceType: 'CC-BY-4.0',
    attributionText: 'Electric mandolin and Telugu folk syncopation licensed under CC-BY 4.0.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Konaseema Twilight', 'Srinivas Mandolin']
  },

  // --- Tamil Tracks (Verified Audio) ---
  {
    id: 'trk_carnatic_fusion',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-022',
    title: 'Raga Waves',
    artist: 'Priya Sundaram & The Bangalore Collective',
    album: 'Deccan Echoes',
    language: 'Tamil',
    genre: 'Fusion',
    releaseYear: 2022,
    decade: '2020s',
    country: 'India',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-teal-500 via-indigo-600 to-violet-800',
    audioSynthesizerPreset: 'latin-guitar',
    durationSeconds: 220,
    clipStartSeconds: 18,
    licenceReference: 'SV-LIC-2022-CCBY',
    licenceType: 'CC-BY-4.0',
    attributionText: 'Carnatic violin and mridangam rhythm fusion, released under CC-BY 4.0.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Raga Waves', 'Priya Sundaram']
  },
  {
    id: 'trk_tamil_chennai_nights',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-025',
    title: 'Marina Beach Breeze',
    artist: 'Anand & Madras Brass',
    album: 'Kalluri Days',
    language: 'Tamil',
    genre: 'Pop / Brass',
    releaseYear: 2019,
    decade: '2010s',
    country: 'India',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-sky-400 via-blue-600 to-indigo-800',
    audioSynthesizerPreset: 'disco-groove',
    durationSeconds: 210,
    clipStartSeconds: 20,
    licenceReference: 'SV-LIC-2019-CCBY',
    licenceType: 'CC-BY-4.0',
    attributionText: 'South Indian brass band recordings, Creative Commons Attribution 4.0.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Marina Beach Breeze', 'Anand Madras Brass']
  },

  // --- Hindi Tracks (Verified Audio) ---
  {
    id: 'trk_mumbai_monsoon',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-009',
    title: 'Monsoon Chai',
    artist: 'Aarav Sharma & Sound of Raag',
    album: 'Echoes of Marine Drive',
    language: 'Hindi',
    genre: 'Fusion',
    releaseYear: 2016,
    decade: '2010s',
    country: 'India',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-amber-500 via-orange-600 to-red-700',
    audioSynthesizerPreset: 'latin-guitar',
    durationSeconds: 204,
    clipStartSeconds: 16,
    licenceReference: 'SV-LIC-2016-CCBY',
    licenceType: 'CC-BY-4.0',
    attributionText: 'Indo-Western acoustic fusion recorded at Sound of Raag Studios under CC-BY 4.0.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Monsoon Chai', 'Aarav Sharma Monsoon']
  },
  {
    id: 'trk_delhi_sufi',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-026',
    title: 'Sufi Soul of Nizamuddin',
    artist: 'Farhan Qawwali Ensemble',
    album: 'Dargah Echoes',
    language: 'Hindi',
    genre: 'Sufi / Devotional',
    releaseYear: 2014,
    decade: '2010s',
    country: 'India',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-orange-500 via-amber-600 to-yellow-700',
    audioSynthesizerPreset: 'latin-guitar',
    durationSeconds: 238,
    clipStartSeconds: 22,
    licenceReference: 'SV-LIC-2014-OA',
    licenceType: 'Open Audio Project',
    attributionText: 'Traditional Delhi Sufi harmonium and tabla open heritage recording.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Sufi Soul', 'Farhan Qawwali']
  },

  // --- Japanese Tracks (Verified Audio) ---
  {
    id: 'trk_tokyo_dusk',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-002',
    title: 'Midnight in Shinjuku',
    artist: 'Yuki Tanaka & The Groove',
    album: 'Pacific Echoes',
    language: 'Japanese',
    genre: 'City Pop',
    releaseYear: 1984,
    decade: '1980s',
    country: 'Japan',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-amber-400 via-rose-500 to-indigo-600',
    audioSynthesizerPreset: 'city-pop',
    durationSeconds: 215,
    clipStartSeconds: 20,
    licenceReference: 'SV-LIC-1984-OA',
    licenceType: 'Open Audio Project',
    attributionText: 'Archived under open Japanese City Pop Preservation Audio Archive (CC-BY-4.0).',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Midnight in Shinjuku', 'Shinjuku Midnight', 'Yuki Tanaka Midnight']
  },

  // --- Korean Tracks (Verified Audio) ---
  {
    id: 'trk_seoul_rain',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-007',
    title: 'Midnight Coffee in Gangnam',
    artist: 'Haneul Trio',
    album: 'Blue Metro Diary',
    language: 'Korean',
    genre: 'R&B / Soul',
    releaseYear: 2018,
    decade: '2010s',
    country: 'South Korea',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-rose-400 via-purple-500 to-sky-600',
    audioSynthesizerPreset: 'lofi-piano',
    durationSeconds: 195,
    clipStartSeconds: 14,
    licenceReference: 'SV-LIC-2018-CCBY',
    licenceType: 'CC-BY-4.0',
    attributionText: 'Seoul Independent Music Collective. Released under CC-BY 4.0 license.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Midnight Coffee in Gangnam', 'Haneul Trio Midnight']
  },

  // --- Spanish Tracks (Verified Audio) ---
  {
    id: 'trk_sol_de_verano',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-003',
    title: 'Sol de Verano',
    artist: 'Mateo & Las Olas',
    album: 'Costas Doradas',
    language: 'Spanish',
    genre: 'Latin Pop',
    releaseYear: 2019,
    decade: '2010s',
    country: 'Spain',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-orange-400 via-amber-500 to-emerald-600',
    audioSynthesizerPreset: 'latin-guitar',
    durationSeconds: 198,
    clipStartSeconds: 12,
    licenceReference: 'SV-LIC-2019-CCBY',
    licenceType: 'CC-BY-4.0',
    attributionText: 'Licensed under Creative Commons Attribution 4.0 International by Mateo Valdés.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Sol de Verano', 'Summer Sun', 'Mateo Las Olas', 'Mateo y Las Olas']
  },
  {
    id: 'trk_havana_bolero',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-021',
    title: 'Bésame en el Malecón',
    artist: 'Orquesta Tropicana de Cuba',
    album: 'Noches Antillanas',
    language: 'Spanish',
    genre: 'Latin Pop',
    releaseYear: 1987,
    decade: '1980s',
    country: 'Cuba',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-rose-500 via-red-600 to-amber-600',
    audioSynthesizerPreset: 'latin-guitar',
    durationSeconds: 205,
    clipStartSeconds: 15,
    licenceReference: 'SV-LIC-1987-OA',
    licenceType: 'Open Audio Project',
    attributionText: 'Traditional Cuban son and bolero arrangement from Havana Open Preservation Archives.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Besame en el Malecon', 'Orquesta Tropicana']
  },

  // --- French & Portuguese Tracks (Verified Audio) ---
  {
    id: 'trk_paris_pluie',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-004',
    title: 'Sous la Pluie Douce',
    artist: 'Camille Laurent',
    album: 'Café de Montmartre',
    language: 'French',
    genre: 'Chanson',
    releaseYear: 1978,
    decade: '1970s',
    country: 'France',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-teal-500 via-sky-600 to-slate-700',
    audioSynthesizerPreset: 'chanson-strings',
    durationSeconds: 165,
    clipStartSeconds: 10,
    licenceReference: 'SV-LIC-1978-PD',
    licenceType: 'Public Domain Dedication',
    attributionText: 'French Heritage Folk Sound Recording, Open Public Domain Preservation Repository.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Sous la Pluie Douce', 'Under Soft Rain', 'Camille Laurent']
  },
  {
    id: 'trk_rio_bossa',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-011',
    title: 'Brisa de Copacabana',
    artist: 'Clara Rios Quarteto',
    album: 'Tardes Cariocas',
    language: 'Portuguese',
    genre: 'Bossa Nova',
    releaseYear: 1992,
    decade: '1990s',
    country: 'Brazil',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-lime-400 via-emerald-500 to-teal-700',
    audioSynthesizerPreset: 'latin-guitar',
    durationSeconds: 188,
    clipStartSeconds: 10,
    licenceReference: 'SV-LIC-1992-OA',
    licenceType: 'Open Audio Project',
    attributionText: 'Traditional Brazilian nylon guitar and percussion collection, Open Audio Archive.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Brisa de Copacabana', 'Clara Rios Brisa']
  },

  // --- Additional Global Tracks (Verified Audio) ---
  {
    id: 'trk_celtic_mist',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-014',
    title: 'Highland Mist',
    artist: 'Fiona MacLeod & The Celts',
    album: 'Isles of Mist',
    language: 'Gaelic',
    genre: 'Celtic Folk',
    releaseYear: 1998,
    decade: '1990s',
    country: 'United Kingdom',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-emerald-700 via-teal-800 to-slate-900',
    audioSynthesizerPreset: 'chanson-strings',
    durationSeconds: 228,
    clipStartSeconds: 12,
    licenceReference: 'SV-LIC-1998-PD',
    licenceType: 'Public Domain Dedication',
    attributionText: 'Scottish Highland folk ballad collection, Cultural Heritage Audio Archive.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Highland Mist', 'Fiona MacLeod']
  },
  {
    id: 'trk_berlin_minimal',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-015',
    title: 'Subway Minimalist',
    artist: 'Klangfabrik',
    album: 'Beton & Licht',
    language: 'German',
    genre: 'Electronic',
    releaseYear: 2023,
    decade: '2020s',
    country: 'Germany',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-slate-600 via-indigo-900 to-black',
    audioSynthesizerPreset: 'electronic-bass',
    durationSeconds: 245,
    clipStartSeconds: 32,
    licenceReference: 'SV-LIC-2023-CC0',
    licenceType: 'Creative Commons 0',
    attributionText: 'Minimalist modular synth recording dedicated to Public Domain under CC0.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Subway Minimalist', 'Klangfabrik']
  },
  {
    id: 'trk_amapiano_johannesburg',
    provider: 'songverse-authorized',
    providerTrackId: 'SV-AUTH-020',
    title: 'Soweto Sunset',
    artist: 'Themba & Deep Piano Crew',
    album: 'Gauteng Rhythms',
    language: 'Zulu',
    genre: 'Amapiano',
    releaseYear: 2023,
    decade: '2020s',
    country: 'South Africa',
    playbackStatus: 'verified_audio',
    artworkGradient: 'from-purple-600 via-pink-600 to-amber-500',
    audioSynthesizerPreset: 'electronic-bass',
    durationSeconds: 250,
    clipStartSeconds: 28,
    licenceReference: 'SV-LIC-2023-CCBY',
    licenceType: 'CC-BY-4.0',
    attributionText: 'Log drum and soulful jazz piano recordings, South African Open Creative Commons.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Soweto Sunset', 'Themba Deep Piano']
  },

  // --- Sample Metadata-Only Tracks (Strictly No Audio / Open Metadata Archive) ---
  {
    id: 'trk_meta_rrr_telugu',
    provider: 'musicbrainz-open-metadata',
    providerTrackId: 'MB-REC-892184',
    title: 'Naatu Naatu',
    artist: 'Rahul Sipligunj & Kaala Bhairava',
    album: 'RRR (Original Motion Picture Soundtrack)',
    language: 'Telugu',
    genre: 'Soundtrack',
    releaseYear: 2022,
    decade: '2020s',
    country: 'India',
    playbackStatus: 'metadata_only',
    artworkGradient: 'from-slate-400 to-slate-600',
    durationSeconds: 215,
    clipStartSeconds: 0,
    licenceReference: 'ODbL-MUSICBRAINZ',
    licenceType: 'Metadata Only (MusicBrainz ODbL)',
    attributionText: 'Metadata provided by MusicBrainz under Open Database License (ODbL). Audio recording not licensed for trivia playback.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Naatu Naatu', 'RRR Naatu', 'Rahul Sipligunj Naatu']
  },
  {
    id: 'trk_meta_kesariya_hindi',
    provider: 'musicbrainz-open-metadata',
    providerTrackId: 'MB-REC-773121',
    title: 'Kesariya',
    artist: 'Arijit Singh & Pritam',
    album: 'Brahmāstra: Part One – Shiva',
    language: 'Hindi',
    genre: 'Bollywood',
    releaseYear: 2022,
    decade: '2020s',
    country: 'India',
    playbackStatus: 'metadata_only',
    artworkGradient: 'from-slate-400 to-slate-600',
    durationSeconds: 268,
    clipStartSeconds: 0,
    licenceReference: 'ODbL-MUSICBRAINZ',
    licenceType: 'Metadata Only (MusicBrainz ODbL)',
    attributionText: 'Encyclopedic metadata indexed from MusicBrainz. Recording unavailable without master rights deal.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Kesariya', 'Arijit Singh Kesariya']
  },
  {
    id: 'trk_meta_plastic_love',
    provider: 'musicbrainz-open-metadata',
    providerTrackId: 'MB-REC-441092',
    title: 'Plastic Love',
    artist: 'Mariya Takeuchi',
    album: 'Variety',
    language: 'Japanese',
    genre: 'City Pop',
    releaseYear: 1984,
    decade: '1980s',
    country: 'Japan',
    playbackStatus: 'metadata_only',
    artworkGradient: 'from-slate-400 to-slate-600',
    durationSeconds: 293,
    clipStartSeconds: 0,
    licenceReference: 'ODbL-MUSICBRAINZ',
    licenceType: 'Metadata Only (MusicBrainz ODbL)',
    attributionText: 'Japanese City Pop open metadata reference. Commercial audio playback restricted.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Plastic Love', 'Mariya Takeuchi Plastic Love']
  },
  {
    id: 'trk_meta_spring_day_korean',
    provider: 'musicbrainz-open-metadata',
    providerTrackId: 'MB-REC-621980',
    title: 'Spring Day (봄날)',
    artist: 'BTS',
    album: 'You Never Walk Alone',
    language: 'Korean',
    genre: 'K-Pop',
    releaseYear: 2017,
    decade: '2010s',
    country: 'South Korea',
    playbackStatus: 'metadata_only',
    artworkGradient: 'from-slate-400 to-slate-600',
    durationSeconds: 274,
    clipStartSeconds: 0,
    licenceReference: 'ODbL-MUSICBRAINZ',
    licenceType: 'Metadata Only (MusicBrainz ODbL)',
    attributionText: 'MusicBrainz open metadata entry. Playback requires commercial mechanical licence.',
    availabilityStatus: 'available',
    regionRestrictions: [],
    aliases: ['Spring Day', 'BTS Spring Day', 'Bomnal']
  }
];

class MusicCatalogueService {
  private tracks: Track[] = [...INITIAL_TRACK_CATALOGUE];

  public getAllTracks(): Track[] {
    return [...this.tracks];
  }

  /**
   * Only returns tracks approved with VERIFIED AUDIO for active gameplay rounds.
   * Guarantees gameplay never encounters unauthorized audio.
   */
  public getPlayableTracks(): Track[] {
    return this.tracks.filter(
      t => t.availabilityStatus === 'available' && t.playbackStatus === 'verified_audio'
    );
  }

  // Alias for backward compatibility with gameEngine
  public getAvailableTracks(): Track[] {
    return this.getPlayableTracks();
  }

  public getMetadataOnlyTracks(): Track[] {
    return this.tracks.filter(t => t.playbackStatus === 'metadata_only');
  }

  public getTrackById(id: string): Track | undefined {
    return this.tracks.find(t => t.id === id);
  }

  /**
   * Fast, paginated query engine with multi-language, genre, alphabet, and status filters.
   */
  public getPaginatedTracks(options: CatalogueFilterOptions = {}): PaginatedResult<Track> {
    const {
      searchQuery = '',
      language = 'All',
      genre = 'All',
      decade = 'All',
      country = 'All',
      playbackStatus = 'all',
      alphabetLetter = 'ALL',
      page = 1,
      pageSize = 9,
      sortBy = 'title',
      sortOrder = 'asc'
    } = options;

    let filtered = [...this.tracks];

    // Playback status filter
    if (playbackStatus !== 'all') {
      filtered = filtered.filter(t => t.playbackStatus === playbackStatus);
    }

    // Language filter
    if (language !== 'All') {
      filtered = filtered.filter(t => t.language.toLowerCase() === language.toLowerCase());
    }

    // Genre filter
    if (genre !== 'All') {
      filtered = filtered.filter(t => t.genre.toLowerCase() === genre.toLowerCase());
    }

    // Decade filter
    if (decade !== 'All') {
      filtered = filtered.filter(t => t.decade === decade);
    }

    // Country filter
    if (country !== 'All') {
      filtered = filtered.filter(t => (t.country || '').toLowerCase() === country.toLowerCase());
    }

    // Alphabetical Letter Filter (A-Z or # for numbers/symbols)
    if (alphabetLetter !== 'ALL') {
      if (alphabetLetter === '#') {
        filtered = filtered.filter(t => {
          const firstChar = t.title.trim().charAt(0).toUpperCase();
          return !/[A-Z]/.test(firstChar);
        });
      } else {
        filtered = filtered.filter(t => {
          const firstChar = t.title.trim().charAt(0).toUpperCase();
          return firstChar === alphabetLetter.toUpperCase();
        });
      }
    }

    // Search query with tokenized normalization
    if (searchQuery.trim().length > 0) {
      filtered = this.searchTracksInternal(searchQuery, filtered);
    } else {
      // Sort
      filtered.sort((a, b) => {
        let valA = (a[sortBy] || '').toString().toLowerCase();
        let valB = (b[sortBy] || '').toString().toLowerCase();
        if (sortBy === 'releaseYear') {
          return sortOrder === 'asc' ? a.releaseYear - b.releaseYear : b.releaseYear - a.releaseYear;
        }
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIdx = (safePage - 1) * pageSize;
    const items = filtered.slice(startIdx, startIdx + pageSize);

    return {
      items,
      total,
      page: safePage,
      pageSize,
      totalPages,
      hasMore: safePage < totalPages
    };
  }

  public getTracksByFilter(filter?: {
    genre?: string;
    decade?: string;
    language?: string;
    searchQuery?: string;
  }): Track[] {
    const res = this.getPaginatedTracks({
      genre: filter?.genre,
      decade: filter?.decade,
      language: filter?.language,
      searchQuery: filter?.searchQuery,
      pageSize: 100
    });
    return res.items;
  }

  public searchTracks(query: string, limit: number = 8): Track[] {
    const scored = this.searchTracksInternal(query, this.tracks);
    return scored.slice(0, limit);
  }

  private searchTracksInternal(query: string, pool: Track[]): Track[] {
    const cleanQuery = this.normalizeString(query);
    if (!cleanQuery) return pool;

    const queryTokens = cleanQuery.split(' ').filter(t => t.length > 1 && t !== 'and' && t !== 'the');

    return pool
      .map(track => {
        let score = 0;
        const normTitle = this.normalizeString(track.title);
        const normArtist = this.normalizeString(track.artist);
        const normAlbum = this.normalizeString(track.album);
        const combined = `${normTitle} ${normArtist} ${normAlbum}`;

        // Exact match
        if (normTitle === cleanQuery) score += 100;
        else if (normTitle.startsWith(cleanQuery)) score += 60;
        else if (normTitle.includes(cleanQuery)) score += 40;

        // Artist match
        if (normArtist === cleanQuery) score += 80;
        else if (normArtist.startsWith(cleanQuery)) score += 50;
        else if (normArtist.includes(cleanQuery)) score += 30;

        // Album match
        if (normAlbum.includes(cleanQuery)) score += 20;

        // Tokenized word matching
        let matchedTokens = 0;
        for (const token of queryTokens) {
          if (combined.includes(token)) {
            matchedTokens++;
          }
        }
        if (matchedTokens > 0) {
          score += matchedTokens * 25;
        }

        // Aliases match
        if (track.aliases) {
          for (const alias of track.aliases) {
            const normAlias = this.normalizeString(alias);
            if (normAlias.includes(cleanQuery) || cleanQuery.includes(normAlias)) {
              score += 35;
              break;
            }
          }
        }

        return { track, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.track);
  }

  public normalizeString(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  // --- Admin CSV Import / Export Capability ---

  /**
   * Export entire catalogue to CSV format with safe quoting
   */
  public exportToCSV(): string {
    const headers = [
      'id',
      'title',
      'artist',
      'album',
      'language',
      'genre',
      'releaseYear',
      'country',
      'playbackStatus',
      'licenceType',
      'attributionText'
    ];

    const rows = this.tracks.map(t => [
      t.providerTrackId,
      this.escapeCsvCell(t.title),
      this.escapeCsvCell(t.artist),
      this.escapeCsvCell(t.album),
      t.language,
      t.genre,
      t.releaseYear,
      t.country || 'Global',
      t.playbackStatus,
      t.licenceType,
      this.escapeCsvCell(t.attributionText)
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  private escapeCsvCell(text: string): string {
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  /**
   * Import batch of songs from CSV with strict row validation, duplicate detection, and detailed error diagnostics
   */
  public importFromCSV(csvText: string, dryRun: boolean = false): CSVImportValidationResult {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    const validRows: Track[] = [];
    const invalidRows: { rowNumber: number; data: Record<string, string>; errors: string[] }[] = [];
    let duplicateCount = 0;

    if (lines.length < 2) {
      return {
        validRows: [],
        invalidRows: [{ rowNumber: 1, data: {}, errors: ['CSV contains no data rows or missing header.'] }],
        duplicateCount: 0,
        importedCount: 0
      };
    }

    const headerTokens = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const requiredFields = ['title', 'artist'];

    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i + 1;
      const cells = this.parseCsvLine(lines[i]);
      const rowData: Record<string, string> = {};

      headerTokens.forEach((header, idx) => {
        rowData[header] = cells[idx] ? cells[idx].trim() : '';
      });

      const rowErrors: string[] = [];

      // Validate required fields
      for (const req of requiredFields) {
        if (!rowData[req]) {
          rowErrors.push(`Missing required field: '${req}'`);
        }
      }

      // Validate year
      let year = parseInt(rowData['releaseyear'] || rowData['year'] || '2024', 10);
      if (isNaN(year) || year < 1900 || year > 2030) {
        rowErrors.push(`Invalid release year: '${rowData['releaseyear'] || rowData['year']}'`);
        year = 2024;
      }

      if (rowErrors.length > 0) {
        invalidRows.push({ rowNumber, data: rowData, errors: rowErrors });
        continue;
      }

      const title = rowData['title'];
      const artist = rowData['artist'];
      const album = rowData['album'] || 'Single';
      const language = rowData['language'] || 'English';
      const genre = rowData['genre'] || 'Pop';
      const country = rowData['country'] || 'Global';
      const playbackStatus = rowData['playbackstatus'] === 'verified_audio' ? 'verified_audio' : 'metadata_only';

      // Duplicate detection against existing catalogue & current batch
      const isDuplicate = this.tracks.some(
        t => t.title.toLowerCase() === title.toLowerCase() && t.artist.toLowerCase() === artist.toLowerCase()
      ) || validRows.some(
        t => t.title.toLowerCase() === title.toLowerCase() && t.artist.toLowerCase() === artist.toLowerCase()
      );

      if (isDuplicate) {
        duplicateCount++;
        invalidRows.push({
          rowNumber,
          data: rowData,
          errors: [`Duplicate song entry detected: '${title}' by '${artist}' already exists in catalogue.`]
        });
        continue;
      }

      // Generate decade
      const decade = `${Math.floor(year / 10) * 10}s`;

      const newTrack: Track = {
        id: `trk_import_${Date.now()}_${i}`,
        provider: 'community-submission',
        providerTrackId: rowData['id'] || `SV-CSV-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        artist,
        album,
        language,
        genre,
        releaseYear: year,
        decade,
        country,
        playbackStatus,
        artworkGradient: 'from-indigo-500 via-purple-600 to-pink-500',
        audioSynthesizerPreset: 'synthpop',
        durationSeconds: 210,
        clipStartSeconds: 15,
        licenceReference: rowData['licencetype'] || 'CSV-BATCH-IMPORT',
        licenceType: 'Open Audio Project',
        attributionText: rowData['attributiontext'] || `Imported via Admin CSV Batch by catalogue administrator.`,
        availabilityStatus: 'available',
        regionRestrictions: []
      };

      validRows.push(newTrack);
    }

    if (!dryRun) {
      validRows.forEach(t => this.addTrack(t));
    }

    return {
      validRows,
      invalidRows,
      duplicateCount,
      importedCount: dryRun ? 0 : validRows.length
    };
  }

  private parseCsvLine(text: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  }

  /**
   * Safe track insertion with multi-level duplicate prevention:
   * 1. Unique MusicBrainz Recording ID (MBID / providerTrackId)
   * 2. Internal track ID
   * 3. Normalized title + artist + album (prevents identical repeated entries while preserving distinct recordings)
   */
  public addTrack(track: Track): { added: boolean; track: Track; reason?: string } {
    // 1. Check for match by providerTrackId (e.g. MBID)
    if (track.providerTrackId) {
      const existingByProviderId = this.tracks.find(
        t => t.providerTrackId && t.providerTrackId.toLowerCase() === track.providerTrackId.toLowerCase()
      );
      if (existingByProviderId) {
        // Update in-place without duplicating
        const idx = this.tracks.indexOf(existingByProviderId);
        this.tracks[idx] = { ...existingByProviderId, ...track, id: existingByProviderId.id };
        return { added: false, track: this.tracks[idx], reason: 'Updated existing record matching MusicBrainz ID' };
      }
    }

    // 2. Check for match by primary id
    const existingByIdIndex = this.tracks.findIndex(t => t.id === track.id);
    if (existingByIdIndex >= 0) {
      this.tracks[existingByIdIndex] = { ...this.tracks[existingByIdIndex], ...track };
      return { added: false, track: this.tracks[existingByIdIndex], reason: 'Updated existing track ID' };
    }

    // 3. Check for exact title + artist + album duplicate (preserves different recordings / covers)
    const normTitle = this.normalizeString(track.title);
    const normArtist = this.normalizeString(track.artist);
    const normAlbum = this.normalizeString(track.album || '');
    const existingDuplicate = this.tracks.find(t => {
      const tTitle = this.normalizeString(t.title);
      const tArtist = this.normalizeString(t.artist);
      const tAlbum = this.normalizeString(t.album || '');
      return tTitle === normTitle && tArtist === normArtist && (!normAlbum || !tAlbum || normAlbum === tAlbum);
    });

    if (existingDuplicate) {
      return { added: false, track: existingDuplicate, reason: 'Duplicate recording already exists in catalogue' };
    }

    this.tracks.push(track);
    return { added: true, track };
  }

  /**
   * Ingest a MusicBrainz recording cleanly with duplicate protection
   */
  public addMusicBrainzTrack(rec: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    releaseYear?: number;
    country?: string;
    disambiguation?: string;
  }): Track {
    const year = rec.releaseYear || 2020;
    const decade = `${Math.floor(year / 10) * 10}s`;

    const track: Track = {
      id: `trk_mb_${rec.id}`,
      provider: 'musicbrainz-open-metadata',
      providerTrackId: rec.id,
      title: rec.title,
      artist: rec.artist,
      album: rec.album || 'Single',
      language: 'English',
      genre: 'General',
      releaseYear: year,
      decade,
      country: rec.country || 'Global',
      playbackStatus: 'metadata_only',
      artworkGradient: 'from-slate-500 via-zinc-600 to-neutral-800',
      durationSeconds: 210,
      clipStartSeconds: 0,
      licenceReference: 'ODbL-MUSICBRAINZ',
      licenceType: 'Metadata Only (MusicBrainz ODbL)',
      attributionText: 'Metadata provided by MusicBrainz under Open Database License (ODbL). Audio recording not cleared for trivia playback.',
      availabilityStatus: 'available',
      regionRestrictions: [],
      aliases: [rec.title, `${rec.artist} ${rec.title}`]
    };

    const res = this.addTrack(track);
    return res.track;
  }

  public toggleTrackStatus(trackId: string, status: Track['availabilityStatus']): boolean {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) {
      track.availabilityStatus = status;
      return true;
    }
    return false;
  }
}

export const musicCatalogue = new MusicCatalogueService();
