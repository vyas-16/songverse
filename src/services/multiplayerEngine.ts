import { MultiplayerRoom, MultiplayerPlayer, Track } from '../types';
import { musicCatalogue } from './musicCatalogue';

type RoomListener = (room: MultiplayerRoom) => void;

class MultiplayerEngineService {
  private activeRoom: MultiplayerRoom | null = null;
  private roomListeners: Set<RoomListener> = new Set();
  private botSimulationTimer: number | null = null;

  public subscribeRoom(listener: RoomListener): () => void {
    this.roomListeners.add(listener);
    if (this.activeRoom) {
      listener(this.activeRoom);
    }
    return () => this.roomListeners.delete(listener);
  }

  private notify() {
    if (this.activeRoom) {
      this.roomListeners.forEach(listener => listener({ ...this.activeRoom! }));
    }
  }

  public getActiveRoom(): MultiplayerRoom | null {
    return this.activeRoom ? { ...this.activeRoom } : null;
  }

  /**
   * Create a new room with a random 6-character room code
   */
  public createRoom(hostPlayerName: string, hostPlayerId: string): MultiplayerRoom {
    this.leaveRoom();

    const roomCode = 'SONG' + Math.floor(10 + Math.random() * 90);
    const availableTracks = musicCatalogue.getAvailableTracks();
    const shuffled = [...availableTracks].sort(() => 0.5 - Math.random());
    const trackIds = shuffled.slice(0, 3).map(t => t.id);

    const hostPlayer: MultiplayerPlayer = {
      id: hostPlayerId,
      displayName: hostPlayerName || 'HostPlayer',
      avatarSeed: 'host_avatar',
      isReady: true,
      isHost: true,
      score: 0,
      currentLevel: 1,
      hasGuessedThisRound: false
    };

    // Add 2 friendly simulated friends into the lobby
    const friend1: MultiplayerPlayer = {
      id: 'bot_maya',
      displayName: 'Maya_Vibes',
      avatarSeed: 'maya_avatar',
      isReady: true,
      isHost: false,
      score: 0,
      currentLevel: 1,
      hasGuessedThisRound: false
    };

    const friend2: MultiplayerPlayer = {
      id: 'bot_leo',
      displayName: 'LeoCoda',
      avatarSeed: 'leo_avatar',
      isReady: false,
      isHost: false,
      score: 0,
      currentLevel: 1,
      hasGuessedThisRound: false
    };

    this.activeRoom = {
      roomCode,
      hostId: hostPlayerId,
      status: 'lobby',
      trackIds,
      currentRoundIndex: 0,
      players: [hostPlayer, friend1, friend2],
      roundStartedAt: 0,
      createdAt: Date.now()
    };

    // Auto ready friend 2 after 1.5 seconds for realism
    setTimeout(() => {
      if (this.activeRoom && this.activeRoom.status === 'lobby') {
        const p = this.activeRoom.players.find(x => x.id === 'bot_leo');
        if (p) {
          p.isReady = true;
          this.notify();
        }
      }
    }, 1500);

    this.notify();
    return this.activeRoom;
  }

  /**
   * Join an existing room with code
   */
  public joinRoom(roomCode: string, playerName: string, playerId: string): MultiplayerRoom {
    const cleanCode = roomCode.trim().toUpperCase();

    if (this.activeRoom && this.activeRoom.roomCode === cleanCode) {
      // Already in room or room exists locally
      const existing = this.activeRoom.players.find(p => p.id === playerId);
      if (!existing) {
        this.activeRoom.players.push({
          id: playerId,
          displayName: playerName || 'Player',
          avatarSeed: 'player_' + playerId.slice(0, 4),
          isReady: false,
          isHost: false,
          score: 0,
          currentLevel: 1,
          hasGuessedThisRound: false
        });
      }
      this.notify();
      return this.activeRoom;
    }

    // Create room with this specific requested code
    const availableTracks = musicCatalogue.getAvailableTracks();
    const shuffled = [...availableTracks].sort(() => 0.5 - Math.random());
    const trackIds = shuffled.slice(0, 3).map(t => t.id);

    const player: MultiplayerPlayer = {
      id: playerId,
      displayName: playerName || 'GuestPlayer',
      avatarSeed: 'avatar_' + playerId.slice(0, 4),
      isReady: false,
      isHost: false,
      score: 0,
      currentLevel: 1,
      hasGuessedThisRound: false
    };

    const host: MultiplayerPlayer = {
      id: 'host_beatmaster',
      displayName: 'BeatMaster',
      avatarSeed: 'host_seed',
      isReady: true,
      isHost: true,
      score: 0,
      currentLevel: 1,
      hasGuessedThisRound: false
    };

    this.activeRoom = {
      roomCode: cleanCode,
      hostId: 'host_beatmaster',
      status: 'lobby',
      trackIds,
      currentRoundIndex: 0,
      players: [host, player],
      roundStartedAt: 0,
      createdAt: Date.now()
    };

    this.notify();
    return this.activeRoom;
  }

  public toggleReady(playerId: string): void {
    if (!this.activeRoom) return;
    const player = this.activeRoom.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = !player.isReady;
      this.notify();
    }
  }

  public startMatch(hostId: string): void {
    if (!this.activeRoom || this.activeRoom.hostId !== hostId) return;

    this.activeRoom.status = 'playing';
    this.activeRoom.roundStartedAt = Date.now();
    this.activeRoom.players.forEach(p => {
      p.currentLevel = 1;
      p.hasGuessedThisRound = false;
      p.lastGuessCorrect = undefined;
    });

    this.notify();
    this.startSimulatedOpponents();
  }

  public submitPlayerGuess(playerId: string, isCorrect: boolean, points: number): void {
    if (!this.activeRoom || this.activeRoom.status !== 'playing') return;

    const player = this.activeRoom.players.find(p => p.id === playerId);
    if (player) {
      player.hasGuessedThisRound = true;
      player.lastGuessCorrect = isCorrect;
      if (isCorrect) {
        player.score += points;
      }
      this.notify();
      this.checkRoundCompletion();
    }
  }

  private startSimulatedOpponents() {
    if (this.botSimulationTimer) {
      clearInterval(this.botSimulationTimer);
    }

    // Simulate bot answers with realistic timings
    const botIds = ['bot_maya', 'bot_leo', 'host_beatmaster'];
    this.botSimulationTimer = window.setInterval(() => {
      if (!this.activeRoom || this.activeRoom.status !== 'playing') return;

      const pendingBots = this.activeRoom.players.filter(p => botIds.includes(p.id) && !p.hasGuessedThisRound);
      if (pendingBots.length > 0) {
        // Pick one bot to submit
        const bot = pendingBots[Math.floor(Math.random() * pendingBots.length)];
        const isCorrect = Math.random() > 0.35;
        const awarded = isCorrect ? (bot.currentLevel === 1 ? 100 : bot.currentLevel === 2 ? 70 : 40) : 0;
        bot.hasGuessedThisRound = true;
        bot.lastGuessCorrect = isCorrect;
        bot.score += awarded;
        this.notify();
        this.checkRoundCompletion();
      }
    }, 2500);
  }

  private checkRoundCompletion() {
    if (!this.activeRoom) return;

    const allGuessed = this.activeRoom.players.every(p => p.hasGuessedThisRound);
    if (allGuessed) {
      if (this.botSimulationTimer) {
        clearInterval(this.botSimulationTimer);
        this.botSimulationTimer = null;
      }
      this.activeRoom.status = 'round-summary';
      this.notify();
    }
  }

  public nextRound(): void {
    if (!this.activeRoom) return;

    if (this.activeRoom.currentRoundIndex < this.activeRoom.trackIds.length - 1) {
      this.activeRoom.currentRoundIndex += 1;
      this.activeRoom.status = 'playing';
      this.activeRoom.roundStartedAt = Date.now();
      this.activeRoom.players.forEach(p => {
        p.currentLevel = 1;
        p.hasGuessedThisRound = false;
        p.lastGuessCorrect = undefined;
      });
      this.notify();
      this.startSimulatedOpponents();
    } else {
      this.activeRoom.status = 'finished';
      this.notify();
    }
  }

  public leaveRoom(): void {
    if (this.botSimulationTimer) {
      clearInterval(this.botSimulationTimer);
      this.botSimulationTimer = null;
    }
    this.activeRoom = null;
  }

  public getCurrentTrack(): Track | undefined {
    if (!this.activeRoom) return undefined;
    const trackId = this.activeRoom.trackIds[this.activeRoom.currentRoundIndex];
    return musicCatalogue.getTrackById(trackId);
  }
}

export const multiplayerEngine = new MultiplayerEngineService();
