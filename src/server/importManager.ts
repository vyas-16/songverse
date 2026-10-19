import * as fs from 'fs';
import * as path from 'path';
import { catalogueStore, ServerTrack } from './catalogueStore';

export interface ImportTargetPreset {
  id: string;
  name: string;
  language: string;
  country: string;
  queries: string[];
}

export const IMPORT_PRESETS: ImportTargetPreset[] = [
  {
    id: 'global_hits_en',
    name: 'Global Chart Hits (English)',
    language: 'English',
    country: 'United States',
    queries: [
      'artist:"The Weeknd"',
      'artist:"Queen"',
      'artist:"Daft Punk"',
      'artist:"Billie Eilish"',
      'artist:"Adele"',
      'artist:"Coldplay"'
    ]
  },
  {
    id: 'indian_cinema_hindi',
    name: 'Bollywood & Indie (Hindi)',
    language: 'Hindi',
    country: 'India',
    queries: [
      'artist:"Arijit Singh"',
      'artist:"A. R. Rahman" AND tag:hindi',
      'artist:"Pritam"',
      'artist:"Shreya Ghoshal" AND tag:hindi'
    ]
  },
  {
    id: 'tollywood_telugu',
    name: 'Tollywood & Folk (Telugu)',
    language: 'Telugu',
    country: 'India',
    queries: [
      'artist:"Rahul Sipligunj"',
      'artist:"M. M. Keeravani"',
      'artist:"S. P. Balasubrahmanyam" AND tag:telugu',
      'artist:"Sid Sriram" AND tag:telugu'
    ]
  },
  {
    id: 'kollywood_tamil',
    name: 'Kollywood & Classical (Tamil)',
    language: 'Tamil',
    country: 'India',
    queries: [
      'artist:"Anirudh Ravichander"',
      'artist:"Ilaiyaraaja"',
      'artist:"Yuvan Shankar Raja"',
      'artist:"A. R. Rahman" AND tag:tamil'
    ]
  },
  {
    id: 'kpop_korean',
    name: 'K-Pop & Indie (Korean)',
    language: 'Korean',
    country: 'South Korea',
    queries: [
      'artist:"BTS"',
      'artist:"NewJeans"',
      'artist:"IU"',
      'artist:"PSY"'
    ]
  },
  {
    id: 'jpop_japanese',
    name: 'City Pop & J-Pop (Japanese)',
    language: 'Japanese',
    country: 'Japan',
    queries: [
      'artist:"Mariya Takeuchi"',
      'artist:"YOASOBI"',
      'artist:"Hikaru Utada"',
      'artist:"Tatsuro Yamashita"'
    ]
  },
  {
    id: 'latin_spanish',
    name: 'Latin & Flamenco (Spanish)',
    language: 'Spanish',
    country: 'Spain / Latin America',
    queries: [
      'artist:"Rosalía"',
      'artist:"Bad Bunny"',
      'artist:"Buena Vista Social Club"',
      'artist:"Luis Fonsi"'
    ]
  }
];

export interface ImportJobStatus {
  jobId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled' | 'error';
  presetId?: string;
  currentQuery: string;
  queryList: string[];
  queryIndex: number;
  offset: number;
  limitPerPage: number;
  totalFound: number;
  importedCount: number;
  updatedCount: number;
  duplicateCount: number;
  errorCount: number;
  logs: Array<{ timestamp: string; level: 'info' | 'warn' | 'error'; message: string }>;
  startedAt?: string;
  lastActivityAt?: string;
  completedAt?: string;
}

const CHECKPOINT_FILE = path.resolve(process.cwd(), 'data', 'import_checkpoint.json');

export class MusicBrainzImportManager {
  private status: ImportJobStatus;
  private isInterrupted = false;
  private readonly minIntervalMs = 1200; // Strict MusicBrainz 1 req/sec limit + safety buffer
  private lastRequestTime = 0;

  constructor() {
    this.status = this.loadCheckpoint() || {
      jobId: 'initial',
      status: 'idle',
      currentQuery: '',
      queryList: [],
      queryIndex: 0,
      offset: 0,
      limitPerPage: 10,
      totalFound: 0,
      importedCount: 0,
      updatedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      logs: []
    };
  }

  private loadCheckpoint(): ImportJobStatus | null {
    try {
      if (fs.existsSync(CHECKPOINT_FILE)) {
        const raw = fs.readFileSync(CHECKPOINT_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.status === 'running') {
          parsed.status = 'paused'; // Auto-pause interrupted tasks on boot
        }
        return parsed;
      }
    } catch (err) {
      console.error('[ImportManager] Failed to load checkpoint:', err);
    }
    return null;
  }

  private saveCheckpoint() {
    try {
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(this.status, null, 2), 'utf8');
    } catch (err) {
      console.error('[ImportManager] Failed to write checkpoint:', err);
    }
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    this.status.logs.push(entry);
    if (this.status.logs.length > 250) {
      this.status.logs.shift(); // Bound memory log window
    }
    this.status.lastActivityAt = entry.timestamp;
    console.log(`[ImportManager][${level.toUpperCase()}] ${message}`);
  }

  public getStatus(): ImportJobStatus {
    return { ...this.status };
  }

  public async startPresetImport(presetId: string, limitPerPage: number = 10): Promise<ImportJobStatus> {
    const preset = IMPORT_PRESETS.find(p => p.id === presetId);
    if (!preset) {
      throw new Error(`Import preset "${presetId}" not found.`);
    }

    if (this.status.status === 'running') {
      throw new Error('An import job is already running. Pause or cancel it before starting a new job.');
    }

    this.isInterrupted = false;
    this.status = {
      jobId: `job_${preset.id}_${Date.now()}`,
      status: 'running',
      presetId: preset.id,
      currentQuery: preset.queries[0],
      queryList: [...preset.queries],
      queryIndex: 0,
      offset: 0,
      limitPerPage,
      totalFound: 0,
      importedCount: 0,
      updatedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      logs: [],
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };

    this.log(`Started import job for preset "${preset.name}" (${preset.language}) with ${preset.queries.length} queries.`);
    this.saveCheckpoint();

    // Run in background asynchronously without blocking express response
    this.executeLoop(preset.language, preset.country);
    return this.getStatus();
  }

  public async startCustomQueryImport(query: string, language: string = 'English', country: string = 'Global', limitPerPage: number = 10): Promise<ImportJobStatus> {
    if (this.status.status === 'running') {
      throw new Error('An import job is already running.');
    }

    this.isInterrupted = false;
    this.status = {
      jobId: `job_custom_${Date.now()}`,
      status: 'running',
      currentQuery: query,
      queryList: [query],
      queryIndex: 0,
      offset: 0,
      limitPerPage,
      totalFound: 0,
      importedCount: 0,
      updatedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      logs: [],
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };

    this.log(`Started custom import job for query: "${query}" (Language: ${language})`);
    this.saveCheckpoint();

    this.executeLoop(language, country);
    return this.getStatus();
  }

  public pause(): ImportJobStatus {
    if (this.status.status === 'running') {
      this.isInterrupted = true;
      this.status.status = 'paused';
      this.log('Import job paused by administrator. Checkpoint saved for resumption.', 'warn');
      this.saveCheckpoint();
    }
    return this.getStatus();
  }

  public resume(): ImportJobStatus {
    if (this.status.status !== 'paused') {
      throw new Error(`Cannot resume job in "${this.status.status}" state.`);
    }

    this.isInterrupted = false;
    this.status.status = 'running';
    this.log(`Resuming import job from query ${this.status.queryIndex + 1}/${this.status.queryList.length} at offset ${this.status.offset}.`);
    this.saveCheckpoint();

    const preset = IMPORT_PRESETS.find(p => p.id === this.status.presetId);
    const lang = preset ? preset.language : 'English';
    const country = preset ? preset.country : 'Global';

    this.executeLoop(lang, country);
    return this.getStatus();
  }

  public cancel(): ImportJobStatus {
    this.isInterrupted = true;
    this.status.status = 'cancelled';
    this.log('Import job cancelled by administrator.', 'warn');
    this.saveCheckpoint();
    return this.getStatus();
  }

  private async executeLoop(language: string, country: string) {
    while (this.status.queryIndex < this.status.queryList.length && !this.isInterrupted) {
      const currentQuery = this.status.queryList[this.status.queryIndex];
      this.status.currentQuery = currentQuery;

      try {
        // Enforce rate limiter
        const now = Date.now();
        const timeSince = now - this.lastRequestTime;
        if (timeSince < this.minIntervalMs) {
          await new Promise(r => setTimeout(r, this.minIntervalMs - timeSince));
        }
        this.lastRequestTime = Date.now();

        this.log(`Fetching MusicBrainz page: query="${currentQuery}", offset=${this.status.offset}, limit=${this.status.limitPerPage}`);

        const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(currentQuery)}&fmt=json&limit=${this.status.limitPerPage}&offset=${this.status.offset}`;
        const resp = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SongVerse/1.0.0 ( contact@songverse.app )'
          }
        });

        if (resp.status === 503) {
          this.log('MusicBrainz 503 rate-limit backoff detected. Waiting 3 seconds before retry...', 'warn');
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }

        if (!resp.ok) {
          const errText = await resp.text().catch(() => '');
          this.log(`MusicBrainz API error HTTP ${resp.status}: ${errText.slice(0, 100)}`, 'error');
          this.status.errorCount++;
          // Move to next query if stuck
          this.status.queryIndex++;
          this.status.offset = 0;
          this.saveCheckpoint();
          continue;
        }

        const data: any = await resp.json();
        const total = data.count || 0;
        this.status.totalFound = total;
        const recordings = data.recordings || [];

        if (recordings.length === 0) {
          this.log(`No further recordings for query "${currentQuery}". Moving to next query.`);
          this.status.queryIndex++;
          this.status.offset = 0;
          this.saveCheckpoint();
          continue;
        }

        for (const rec of recordings) {
          const artistCredits = rec['artist-credit'] || [];
          const primaryArtist = artistCredits.map((a: any) => a.name || a.artist?.name || '').filter(Boolean).join(', ') || 'Unknown Artist';
          const primaryRelease = rec.releases?.[0];
          const releaseYearStr = rec['first-release-date'] || primaryRelease?.date || '';
          const releaseYear = releaseYearStr ? parseInt(releaseYearStr.substring(0, 4), 10) : undefined;
          const tags = (rec.tags || []).map((t: any) => t.name).filter(Boolean);

          const track: ServerTrack = {
            id: `trk_mb_${rec.id}`,
            providerTrackId: rec.id, // Legitimate MusicBrainz UUID
            title: rec.title,
            artist: primaryArtist,
            artistCredits: artistCredits.map((ac: any) => ({
              name: ac.name || ac.artist?.name || '',
              mbid: ac.artist?.id
            })),
            album: primaryRelease?.title || 'Single / Release',
            releaseDate: releaseYearStr || undefined,
            releaseYear: isNaN(releaseYear as number) ? undefined : releaseYear,
            durationMs: rec.length || 210000,
            source: 'musicbrainz-open-metadata',
            importDate: new Date().toISOString(),
            language,
            country: primaryRelease?.country || rec.country || country,
            genre: tags[0] || 'General',
            tags: tags.slice(0, 5),
            isrcs: rec.isrcs || [],
            // Rights Architecture: MusicBrainz is metadata-only, strictly protected
            hasAuthorizedAudio: false,
            isAuthorizedForGameplay: false,
            playbackStatus: 'metadata_only',
            audioAvailability: 'restricted',
            audioSourceType: 'none',
            licenceType: 'Metadata Only (MusicBrainz ODbL)',
            licenceReference: 'ODbL-1.0-MUSICBRAINZ',
            attributionText: `Metadata provided by MusicBrainz under Open Database License (ODbL). Audio recording copyright held by respective rights holders.`,
            artworkGradient: 'from-slate-600 via-zinc-700 to-neutral-900',
            clipStartSeconds: 0,
            aliases: [rec.title, `${primaryArtist} - ${rec.title}`]
          };

          const addRes = catalogueStore.addOrUpdateTrack(track);
          if (addRes.added) {
            this.status.importedCount++;
          } else if (addRes.updated) {
            this.status.updatedCount++;
          } else {
            this.status.duplicateCount++;
          }
        }

        // Persist catalogue after batch
        catalogueStore.saveCatalogue();

        this.status.offset += recordings.length;
        this.saveCheckpoint();

        // Advance to next query if we reached end or hit 20 results per target (to keep catalogue diverse)
        if (this.status.offset >= total || this.status.offset >= 20) {
          this.log(`Finished target "${currentQuery}" (${this.status.offset} recordings processed).`);
          this.status.queryIndex++;
          this.status.offset = 0;
          this.saveCheckpoint();
        }

      } catch (loopErr: any) {
        this.status.errorCount++;
        this.log(`Error during import loop: ${loopErr.message || loopErr}`, 'error');
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!this.isInterrupted && this.status.queryIndex >= this.status.queryList.length) {
      this.status.status = 'completed';
      this.status.completedAt = new Date().toISOString();
      this.log(`Import job completed successfully! Imported: ${this.status.importedCount}, Updated: ${this.status.updatedCount}, Duplicates: ${this.status.duplicateCount}`);
      this.saveCheckpoint();
    }
  }
}

export const importManager = new MusicBrainzImportManager();
