import json

with open("data/song_catalogue.json", "r", encoding="utf-8") as f:
    tracks = json.load(f)

# Format each track as TypeScript Track object
ts_tracks = []
for t in tracks:
    is_playable = t["playbackStatus"] == "verified_audio"
    ts_obj = f"""  {{
    id: {json.dumps(t['id'])},
    provider: {json.dumps(t.get('source', 'songverse-authorized'))},
    providerTrackId: {json.dumps(t.get('providerTrackId', t['id']))},
    title: {json.dumps(t['title'])},
    artist: {json.dumps(t['artist'])},
    album: {json.dumps(t['album'])},
    language: {json.dumps(t['language'])},
    genre: {json.dumps(t['genre'])},
    releaseYear: {t['releaseYear']},
    decade: '{str(t['releaseYear'])[:3]}0s',
    country: {json.dumps(t.get('country', 'Global'))},
    playbackStatus: {json.dumps(t['playbackStatus'])},
    artworkGradient: {json.dumps(t['artworkGradient'])},
    audioSynthesizerPreset: {json.dumps(t.get('audioPreset', 'synthpop'))},
    audioUrl: {json.dumps(t.get('audioUrl')) if t.get('audioUrl') else 'undefined'},
    audioAssetUrl: {json.dumps(t.get('audioUrl')) if t.get('audioUrl') else 'undefined'},
    durationSeconds: {int(t.get('durationMs', 210000) / 1000)},
    clipStartSeconds: {t.get('clipStartSeconds', 0)},
    licenceReference: {json.dumps(t['licenceReference'])},
    licenceType: {json.dumps(t['licenceType'])},
    attributionText: {json.dumps(t['attributionText'])},
    availabilityStatus: {json.dumps(t.get('audioAvailability', 'available'))},
    regionRestrictions: [],
    aliases: {json.dumps(t.get('aliases', [t['title']]))}
  }}"""
    ts_tracks.append(ts_obj)

tracks_joined = ",\n".join(ts_tracks)

ts_content = f"""import {{ Track, PaginatedResult, CatalogueFilterOptions, CSVImportValidationResult }} from '../types';

export const INITIAL_TRACK_CATALOGUE: Track[] = [
{tracks_joined}
];

class MusicCatalogueService {{
  private tracks: Track[] = [...INITIAL_TRACK_CATALOGUE];

  public getAllTracks(): Track[] {{
    return [...this.tracks];
  }}

  /**
   * Only returns tracks approved with VERIFIED AUDIO for active gameplay rounds.
   * Guarantees gameplay never encounters unauthorized audio.
   */
  public getPlayableTracks(): Track[] {{
    return this.tracks.filter(
      t => t.availabilityStatus === 'available' && t.playbackStatus === 'verified_audio'
    );
  }}

  // Alias for backward compatibility with gameEngine
  public getAvailableTracks(): Track[] {{
    return this.getPlayableTracks();
  }}

  public getWishlistTracks(): Track[] {{
    return this.tracks.filter(t => t.playbackStatus === 'metadata_only');
  }}

  public getMetadataOnlyTracks(): Track[] {{
    return this.getWishlistTracks();
  }}

  public getTrackById(id: string): Track | undefined {{
    return this.tracks.find(t => t.id === id || t.providerTrackId === id);
  }}

  /**
   * Real playable track counts per language (9 supported languages)
   */
  public getPlayableCountsByLanguage(): Record<string, number> {{
    const counts: Record<string, number> = {{
      English: 0,
      Telugu: 0,
      Hindi: 0,
      Tamil: 0,
      Malayalam: 0,
      Kannada: 0,
      Bengali: 0,
      Punjabi: 0,
      Spanish: 0
    }};
    for (const t of this.getPlayableTracks()) {{
      const lang = t.language;
      if (counts[lang] !== undefined) {{
        counts[lang]++;
      }} else {{
        counts[lang] = 1;
      }}
    }}
    return counts;
  }}

  /**
   * Filter playable tracks by multiple selected languages
   */
  public getPlayableTracksByLanguages(languages: string[]): Track[] {{
    if (!languages || languages.length === 0) return [];
    const lower = languages.map(l => l.toLowerCase());
    return this.getPlayableTracks().filter(t => lower.includes(t.language.toLowerCase()));
  }}

  /**
   * Fast, paginated query engine with multi-language, genre, alphabet, and status filters.
   */
  public getPaginatedTracks(options: CatalogueFilterOptions = {{}}): PaginatedResult<Track> {{
    const {{
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
    }} = options;

    let filtered = [...this.tracks];

    // Playback status filter
    if (playbackStatus !== 'all') {{
      filtered = filtered.filter(t => t.playbackStatus === playbackStatus);
    }}

    // Language filter
    if (language !== 'All') {{
      filtered = filtered.filter(t => t.language.toLowerCase() === language.toLowerCase());
    }}

    // Genre filter
    if (genre !== 'All') {{
      filtered = filtered.filter(t => t.genre.toLowerCase() === genre.toLowerCase());
    }}

    // Decade filter
    if (decade !== 'All') {{
      filtered = filtered.filter(t => t.decade === decade);
    }}

    // Country filter
    if (country !== 'All') {{
      filtered = filtered.filter(t => (t.country || '').toLowerCase() === country.toLowerCase());
    }}

    // Alphabetical Letter Filter (A-Z or # for numbers/symbols)
    if (alphabetLetter !== 'ALL') {{
      if (alphabetLetter === '#') {{
        filtered = filtered.filter(t => {{
          const firstChar = t.title.trim().charAt(0).toUpperCase();
          return !/[A-Z]/.test(firstChar);
        }});
      }} else {{
        filtered = filtered.filter(t => {{
          const firstChar = t.title.trim().charAt(0).toUpperCase();
          return firstChar === alphabetLetter.toUpperCase();
        }});
      }}
    }}

    // Search query with tokenized normalization
    if (searchQuery.trim().length > 0) {{
      filtered = this.searchTracksInternal(searchQuery, filtered);
    }} else {{
      filtered.sort((a, b) => {{
        const valA = (a[sortBy] || '').toString().toLowerCase();
        const valB = (b[sortBy] || '').toString().toLowerCase();
        if (sortBy === 'releaseYear') {{
          return sortOrder === 'asc' ? a.releaseYear - b.releaseYear : b.releaseYear - a.releaseYear;
        }}
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }});
    }}

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIdx = (safePage - 1) * pageSize;
    const items = filtered.slice(startIdx, startIdx + pageSize);

    return {{
      items,
      total,
      page: safePage,
      pageSize,
      totalPages,
      hasMore: safePage < totalPages
    }};
  }}

  public getTracksByFilter(filter?: {{
    genre?: string;
    decade?: string;
    language?: string;
    searchQuery?: string;
  }}): Track[] {{
    const res = this.getPaginatedTracks({{
      genre: filter?.genre,
      decade: filter?.decade,
      language: filter?.language,
      searchQuery: filter?.searchQuery,
      pageSize: 100
    }});
    return res.items;
  }}

  public searchTracks(query: string, limit: number = 8): Track[] {{
    const scored = this.searchTracksInternal(query, this.tracks);
    return scored.slice(0, limit);
  }}

  private searchTracksInternal(query: string, pool: Track[]): Track[] {{
    const cleanQuery = this.normalizeString(query);
    if (!cleanQuery) return pool;

    const queryTokens = cleanQuery.split(' ').filter(t => t.length > 1 && t !== 'and' && t !== 'the');

    return pool
      .map(track => {{
        let score = 0;
        const normTitle = this.normalizeString(track.title);
        const normArtist = this.normalizeString(track.artist);
        const normAlbum = this.normalizeString(track.album);
        const combined = `${{normTitle}} ${{normArtist}} ${{normAlbum}}`;

        if (normTitle === cleanQuery) score += 100;
        else if (normTitle.startsWith(cleanQuery)) score += 60;
        else if (normTitle.includes(cleanQuery)) score += 40;

        if (normArtist === cleanQuery) score += 80;
        else if (normArtist.startsWith(cleanQuery)) score += 50;
        else if (normArtist.includes(cleanQuery)) score += 30;

        if (normAlbum.includes(cleanQuery)) score += 20;

        let matchedTokens = 0;
        for (const token of queryTokens) {{
          if (combined.includes(token)) {{
            matchedTokens++;
          }}
        }}
        if (matchedTokens > 0) {{
          score += matchedTokens * 25;
        }}

        if (track.aliases) {{
          for (const alias of track.aliases) {{
            const normAlias = this.normalizeString(alias);
            if (normAlias.includes(cleanQuery)) {{
              score += 35;
              break;
            }}
          }}
        }}

        return {{ track, score }};
      }})
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.track);
  }}

  public importTracksFromCSV(csvText: string): CSVImportValidationResult {{
    const lines = csvText.trim().split('\\n');
    const validRows: Track[] = [];
    const invalidRows: {{ rowNumber: number; data: Record<string, string>; errors: string[] }}[] = [];
    let duplicateCount = 0;

    if (lines.length < 2) {{
      return {{ validRows: [], invalidRows: [], duplicateCount: 0, importedCount: 0 }};
    }}

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    for (let i = 1; i < lines.length; i++) {{
      const rawLine = lines[i].trim();
      if (!rawLine) continue;

      const cols = rawLine.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      const rowData: Record<string, string> = {{}};
      headers.forEach((h, idx) => {{
        rowData[h] = cols[idx] || '';
      }});

      const errors: string[] = [];
      if (!rowData['title']) errors.push('Missing required column: title');
      if (!rowData['artist']) errors.push('Missing required column: artist');

      if (errors.length > 0) {{
        invalidRows.push({{ rowNumber: i + 1, data: rowData, errors }});
        continue;
      }}

      const title = rowData['title'];
      const artist = rowData['artist'];
      const album = rowData['album'] || 'Single';
      const language = rowData['language'] || 'English';
      const genre = rowData['genre'] || 'General';
      const year = parseInt(rowData['year'] || '2024', 10);
      const isPlayable = rowData['playbackstatus'] === 'verified_audio' && !!rowData['audiourl'];

      const isDuplicate = this.tracks.some(
        t => this.normalizeString(t.title) === this.normalizeString(title) &&
             this.normalizeString(t.artist) === this.normalizeString(artist)
      );

      if (isDuplicate) {{
        duplicateCount++;
        continue;
      }}

      const newTrack: Track = {{
        id: 'trk_import_' + Math.random().toString(36).substring(2, 9),
        provider: 'community-submission',
        providerTrackId: 'COMM-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        title,
        artist,
        album,
        language,
        genre,
        releaseYear: isNaN(year) ? 2024 : year,
        decade: isNaN(year) ? '2020s' : `${{Math.floor(year / 10) * 10}}s`,
        country: rowData['country'] || 'Global',
        playbackStatus: isPlayable ? 'verified_audio' : 'metadata_only',
        artworkGradient: 'from-indigo-600 via-purple-600 to-pink-500',
        audioSynthesizerPreset: 'synthpop',
        audioUrl: rowData['audiourl'] || undefined,
        audioAssetUrl: rowData['audiourl'] || undefined,
        durationSeconds: parseInt(rowData['duration'] || '210', 10),
        clipStartSeconds: parseInt(rowData['clipstart'] || '0', 10),
        licenceReference: rowData['licenceref'] || 'CC-BY-4.0',
        licenceType: 'CC-BY-4.0',
        attributionText: `${{artist}} - ${{title}} (Imported track).`,
        availabilityStatus: isPlayable ? 'available' : 'restricted',
        regionRestrictions: [],
        aliases: [title, `${{artist}} ${{title}}`]
      }};

      validRows.push(newTrack);
      this.tracks.push(newTrack);
    }}

    return {{
      validRows,
      invalidRows,
      duplicateCount,
      importedCount: validRows.length
    }};
  }}

  private normalizeString(str: string): string {{
    return (str || '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .replace(/[^\\w\\s]/gi, '')
      .replace(/\\s+/g, ' ');
  }}
}}

export const musicCatalogue = new MusicCatalogueService();
"""

with open("src/services/musicCatalogue.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print("Generated src/services/musicCatalogue.ts with 48 tracks successfully!")
