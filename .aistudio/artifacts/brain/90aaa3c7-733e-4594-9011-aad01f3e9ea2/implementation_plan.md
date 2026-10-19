# SongVerse Global Music Catalogue & Licensing Architecture

Comprehensive architecture audit and implementation blueprint for preparing SongVerse to support a legitimate, globally compliant music catalogue for all players—without requiring users to hold Spotify or Apple Music subscriptions.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Key Architectural & Licensing Decision Gates Requiring User Alignment:**
>
> 1. **Commercial B2B Provider Selection for Mainstream Hit Recordings**:
>    Consumer streaming APIs (Spotify Web API, Apple MusicKit) strictly prohibit interactive game mechanics, blind audio guessing, and non-subscriber streaming. To allow any visitor (including guests and free accounts) to play with mainstream commercial tracks, SongVerse must use a B2B pre-cleared music licensing API.
>    - **Recommended Path**: **Feed.fm (Feed Clips API)** or **Songtradr / 7digital B2B API**. Both provide legally pre-cleared 5s–30s excerpts of commercial master recordings with label and publishing royalties (ASCAP, BMI, SESAC, SoundExchange) settled at the B2B API tier.
> 2. **Multi-Tier Hybrid Catalogue Model (Recommended)**:
>    - **Tier 1 (Core Gameplay - Real-Time Synthesized & Creative Commons)**: 100% free, zero external subscription needed, available immediately for guests and daily challenges using verified public domain, CC-BY, and Jamendo tracks.
>    - **Tier 2 (Open Metadata Catalogue - MusicBrainz)**: Rich search and discovery of over 40M recordings (title, artist, album, ISRC, release year, genre tags) operating metadata-only without infringing master audio rights.
>    - **Tier 3 (Licensed Commercial Audio Pipeline)**: Modular B2B adapter (Feed.fm / 7digital) activated via server-side credentials when commercial licensing agreements are established, requiring zero client-side subscriber login.
> 3. **Strict Separation of Concerns in Schema**:
>    Segregate song metadata (`TrackMetadata`), playable audio stream sources (`AudioStreamSource`), and legal licensing compliance records (`LicensingRecord`) into distinct entities to prevent licensing ambiguity and vendor lock-in.

---

### 1. Overview & Core Concept

- **What It Does**: Upgrades SongVerse from a localized demo into an enterprise-ready, legally audited music guessing platform. Players can search and explore an expansive global catalogue (English, Hindi, Telugu, Tamil, Korean, Japanese, Spanish, and more) while the 4-level guessing game (1s, 3s, 5s, 10s audio excerpts with point deductions on skip) plays strictly verified, rights-cleared audio clips.
- **Target Audience / Persona**: Music trivia enthusiasts, casual mobile/desktop gamers, language and global music explorers, and community competitors who want instant access without linking paid Spotify or Apple Music accounts.
- **Key Value**: Delivers zero-barrier, friction-free browser gameplay with full international copyright compliance, transparent rights attribution, and a modular architecture ready for commercial B2B licensing without rebuilding existing game mechanics.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Game Flow (Preserved & Enhanced)**:
     - User selects mode (Classic, Daily, Category, Practice) or Language filter.
     - System loads a verified playable track (`playbackStatus: 'verified_audio'`).
     - Level 1 (1s excerpt) plays with synchronized waveform animation.
     - User guesses via predictive search or clicks **Skip** (-30 pts penalty, unlocks Level 2 at 3s).
     - Success triggers celebratory chime and reveals full metadata, artist credit, and licensing badge; skipping through Level 4 yields 0 points and marks round completed.
  2. **Global Catalogue Discovery**:
     - Live search powered by the server-side MusicBrainz proxy (`/api/musicbrainz/search`) with 1-req/sec queue management.
     - Visual differentiation: "Verified Playable" badges (emerald accent) vs. "Metadata Only / Rights Pending" (amber badge with transparent explanation modal).
     - Filter by Language (Hindi, Telugu, Tamil, Korean, Japanese, Spanish, English), Genre, and Decade.
  3. **Licensing & Rights Transparency Sheet**:
     - Accessible from any track card or footer. Displays exact rights holder, master license status, performance rights organizations (PRO), and usage terms.

- **Visual Identity & Theme**:
  - *Color Palette*: Deep studio black (`#0a0b10`), charcoal card containers (`#131622`), electric cyan accents (`#00f2fe`), vibrant indigo highlights (`#4facfe`), and emerald status accents (`#10b981`).
  - *Anti-Slop Discipline*: Zero floating pills or generic purple-blur soup. Clean typographic separators (`·`, `/`), crisp borders (`border-white/10`), tabular data alignment, and WCAG AA contrast.
  - *Typography*: High-contrast sans headings (`Inter` / `Plus Jakarta Sans`) with monospaced numerical readouts for timers, points, and ISRCs.

---

### 3. Current Audio Architecture Audit & Provider Investigation

#### A. Current Audio Architecture Audit

| Subsystem | Current State | Architectural Gap | Required Evolution |
| :--- | :--- | :--- | :--- |
| **Audio Generation** | `AudioEngineService` in `src/services/audioEngine.ts` uses Web Audio API oscillators, biquad filters, and ADSR gain envelopes to synthesize polyphonic chord presets (`synthpop`, `city-pop`, `latin-guitar`, etc.). | Does not stream real recorded commercial audio; relies on procedural synth simulations. | Introduce an `AudioStreamProvider` interface supporting HTML5 audio streaming, signed CDN URLs, and Web Audio fallback. |
| **Duration Enforcement** | Hardcoded timer (`setTimeout`) in `audioEngine.ts` stopping at exact millisecond marks: L1=1.0s, L2=3.0s, L3=5.0s, L4=10.0s. | Strict enforcement works well, but lacks buffer pre-loading and cryptographic seek protection. | Retain strict duration clamps; add audio chunk buffering and server-side signed excerpt tokens. |
| **Catalogue Coupling** | `Track` model in `src/types/index.ts` conflates metadata, audio URL, and license strings in a single flat object. | Difficult to manage different licensing jurisdictions, rate-limited CDNs, and multiple bitrates. | Refactor into 3 decoupled entities: `TrackMetadata`, `PlayableAudioManifest`, and `LicensingComplianceRecord`. |
| **Third-Party APIs** | Consumer streaming APIs (Spotify / Apple Music) were strictly excluded from gameplay. | Good! Complies with Spotify Developer Policy Rule 1.4 & 2.1. | Maintain ban on unauthorized consumer streaming; prepare B2B integration hooks. |

#### B. Commercial Music Providers & Licensing Investigation

Why Consumer Streaming APIs (Spotify / Apple Music) Are Ineligible for Guessing Games:
1. **Spotify Developer Terms Section IV**: Prohibits building games, trivia, or quizzes where audio playback is tied to game mechanics without direct, bespoke commercial agreements.
2. **Subscription Barrier**: Spotify Web Playback SDK requires each active player to hold an authenticated Spotify Premium account. Guests and free users are completely blocked.
3. **DRM & Fair Use**: Streaming timed clips without authorization is not covered by "Fair Use" in commercial or interactive gaming apps; it requires master recording (labels) and mechanical/sync/public performance (publishers/PROs) clearance.

Evaluation of Legitimate B2B Providers:

| Provider | Permitted Excerpts | Territorial Clearance | Audience Requirements | Commercial Licensing Model | Suitability for SongVerse |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Feed.fm (Feed Clips API)** | **Pre-cleared 5s to 30s clips** specifically designed for music trivia, games, and quizzes. | Global or US/EU/UK territory sets with automated geo-fencing. | **Zero user subscription required**. All players (guests & registered) can hear clips. | B2B monthly platform fee + micro-royalty per stream. All label/publisher/PRO royalties handled by Feed.fm. | **Highest Recommendation** for commercial pop/global hit trivia. Built specifically for this use case. |
| **Songtradr / 7digital B2B API** | 30s preview clips and full track delivery for enterprise applications. | Worldwide, multi-territory rights clearance across major & indie catalogues. | B2B application license; end users do not need individual subscriptions. | B2B Enterprise contract + usage reporting via ISRC/ISWC. | **Excellent Recommendation** for broad global repertoire (40M+ tracks across diverse languages). |
| **Jamendo Licensing (Developer API)** | Full tracks and 30s previews of 650,000+ indie and world music tracks. | 150+ countries worldwide. | Completely open to all players; no subscriptions or accounts required. | Free developer tier with CC-BY licensing; commercial sync license available per track or catalog. | **Best Immediate Zero-Cost Solution** for verified indie/world catalogue expansion. |
| **Audius API** | Full streaming access via decentralized audio node network. | Global access. | Free, open API; no end-user subscription or credit card needed. | Open distribution license granted by uploading artists; community-governed. | **High Viability** for supplementary indie, electronic, and global tracks without payment. |
| **MusicBrainz + Cover Art Archive** | Open metadata only (recordings, artists, releases, tags, genres, ISRCs). | Global public domain / ODbL. | Completely open and free. | Open Data Commons (ODbL). **Metadata only—no audio**. | **Current Foundation**: Retain as core metadata search and deduplication backbone. |

---

### 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             SONGVERSE APPLICATION                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                              PRESENTATION                                │   │
│   │                                                                          │   │
│   │  [GameView] ─── (4 Levels: 1s, 3s, 5s, 10s) ─── [Skip Button (-pts)]     │   │
│   │       │                                                                  │   │
│   │  [CatalogueView] ─── [Search/Filter] ─── [Language & Decade Tabs]        │   │
│   │       │                                                                  │   │
│   │  [RightsBadge] ─── [Transparency Modal] ─── [Profile/Achievements]       │   │
│   └────────────────────────────────────┬─────────────────────────────────────┘   │
│                                        │                                         │
│   ┌────────────────────────────────────▼─────────────────────────────────────┐   │
│   │                             DOMAIN SERVICES                              │   │
│   │                                                                          │   │
│   │  ┌───────────────────────┐  ┌───────────────────────┐  ┌──────────────┐  │   │
│   │  │   GameEngineService   │  │ MusicCatalogueService │  │  Auth/Guest  │  │   │
│   │  │  (Scoring, Levels,    │  │ (Search, Deduplicate, │  │   Manager    │  │   │
│   │  │   Skip Deduction)     │  │  Multi-Language)      │  │              │  │   │
│   │  └───────────┬───────────┘  └───────────┬───────────┘  └──────┬───────┘  │   │
│   │              │                          │                     │          │   │
│   │  ┌───────────▼──────────────────────────▼─────────────────────▼───────┐  │   │
│   │  │                     Audio Pipeline Router                          │  │   │
│   │  │   - Checks playbackStatus: verified_audio vs metadata_only         │  │   │
│   │  │   - Resolves authorized playback provider adapter                  │  │   │
│   │  └──────────────────────────────────────┬─────────────────────────────┘  │   │
│   └─────────────────────────────────────────┼────────────────────────────────┘   │
│                                             │                                    │
│   ┌─────────────────────────────────────────▼────────────────────────────────┐   │
│   │                        AUDIO PROVIDER ADAPTERS                           │   │
│   │                                                                          │   │
│   │  ┌──────────────────────┐  ┌───────────────────────┐  ┌───────────────┐  │   │
│   │  │  B2B Licensed Stream │  │  Open Commons Stream  │  │   Procedural  │  │   │
│   │  │  (Feed.fm / 7digital)│  │   (Jamendo / Audius)  │  │   Synthesizer │  │   │
│   │  │  [Pre-cleared Clips] │  │   [Direct Authorized] │  │ (Zero-network)│  │   │
│   │  └──────────┬───────────┘  └───────────┬───────────┘  └───────┬───────┘  │   │
│   └─────────────┼──────────────────────────┼──────────────────────┼──────────┘   │
│                 │                          │                      │              │
│   ┌─────────────▼──────────────────────────▼──────────────────────▼──────────┐   │
│   │                              BACKEND PROXY                               │   │
│   │  Express Server (`server.ts`)                                            │   │
│   │  - `/api/musicbrainz/search` (Rate-limited 1 req/sec + Cache)            │   │
│   │  - `/api/audio/stream-token` (Signed URL generator for legal clips)      │   │
│   │  - `/api/licensing/report` (Audit trail for PROs & rights verification)  │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### A. Decoupled Data Models (`src/types/index.ts`)

```typescript
// 1. Core Song Metadata (Searchable, filterable, provider-neutral)
export interface TrackMetadata {
  id: string; // Internal unique identifier
  musicBrainzId?: string; // MBID for deduplication
  isrc?: string; // International Standard Recording Code
  title: string;
  artist: string;
  album: string;
  language: 'English' | 'Hindi' | 'Telugu' | 'Tamil' | 'Korean' | 'Japanese' | 'Spanish' | 'Global';
  genre: string;
  releaseYear: number;
  decade: string;
  country?: string;
  artworkGradient: string;
}

// 2. Playable Audio Stream Source (Strictly separated from metadata)
export interface AudioStreamSource {
  trackId: string;
  playbackStatus: 'verified_audio' | 'metadata_only';
  provider: 'feedfm_clips' | 'seven_digital' | 'jamendo_authorized' | 'audius_stream' | 'procedural_synth';
  streamUrl?: string; // Signed or pre-cleared CDN URL (null for metadata-only)
  clipDurationSeconds: number; // Max length available (e.g. 10.0s, 30.0s)
  clipStartOffsetSeconds: number; // Best hook offset in seconds
  synthesizerPreset?: string; // Fallback procedural preset
}

// 3. Licensing Compliance Record (Legal verification & audit trail)
export interface LicensingRecord {
  trackId: string;
  rightsTier: 'b2b_cleared' | 'creative_commons' | 'public_domain' | 'metadata_only';
  licensorName: string; // e.g. "Feed.fm / Universal Music Group", "Jamendo Licensing"
  proAffiliation?: 'ASCAP' | 'BMI' | 'SESAC' | 'PRS' | 'GEMA' | 'None';
  masterRightsOwner?: string;
  publishingRightsOwner?: string;
  territorialScope: 'Worldwide' | 'US_Only' | 'Restricted';
  commercialUsePermitted: boolean;
  requiresUserSubscription: false; // ENFORCED: Must be false for all SongVerse gameplay
  attributionText: string;
  verifiedAt: number; // Unix timestamp
}
```

#### B. Game Engine & Skip Mechanism Integration

1. **Scoring Preservation**:
   - Level 1: 100 points
   - Level 2: 70 points
   - Level 3: 40 points
   - Level 4: 20 points
2. **Skip Button Deduction Policy**:
   - When a player encounters a level they cannot guess, clicking **Skip** deducts the point potential for that level (e.g., skipping Level 1 forfeits 30 pts, advancing directly to Level 2 with 70 pts max).
   - Skipping on Level 4 awards 0 points and transitions the round status to `'lost'`.
   - The user interface provides a dedicated, accessible "Skip Clip (-pts)" button alongside "Submit Guess".

---

### 5. Step-by-Step Implementation Roadmap (Post-Approval)

- [ ] **Phase 1: Domain Type System Decoupling**
  - Update `src/types/index.ts` to cleanly separate `TrackMetadata`, `AudioStreamSource`, and `LicensingRecord`.
  - Maintain backwards-compatibility alias for `Track = TrackMetadata & AudioStreamSource & LicensingRecord`.
- [ ] **Phase 2: Audio Stream Provider Architecture**
  - Extend `audioEngine.ts` with a modular `AudioStreamAdapter` interface.
  - Implement `Html5AudioAdapter` with exact duration clamping (1s, 3s, 5s, 10s) and clean stop handlers.
  - Retain `ProceduralSynthAdapter` as an offline, zero-network fallback.
- [ ] **Phase 3: Music Provider Connector Stub & Rights Verification Engine**
  - Create `src/services/providers/jamendoProvider.ts` for immediate zero-cost legal indie/world tracks.
  - Create `src/services/providers/b2bLicensingStub.ts` defining Feed.fm and 7digital integration interfaces.
  - Add `/api/licensing/audit` endpoint in `server.ts` to provide real-time compliance reporting.
- [ ] **Phase 4: UI & Catalogue Integration**
  - Verify Skip button state and point deduction indicators in `GameView.tsx`.
  - Add interactive "Licensing & Rights" transparency drawer in `DiscoveryView.tsx`.
  - Ensure guest play and local profile progression remain intact.
- [ ] **Phase 5: Automated Test Suite & Gameplay Verification**
  - Add test scenarios in `tests/verify-gameplay.ts` verifying skip point deductions, audio clamp timers, and duplicate prevention.
  - Compile applet with `npm run build` and run `npm test`.
