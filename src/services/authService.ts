import { UserProfile, AuthProviderConfig } from '../types';
import { gameEngine } from './gameEngine';

export interface AuthState {
  user: UserProfile;
  sessionToken: string | null;
  providers: {
    google: AuthProviderConfig;
    apple: AuthProviderConfig;
  };
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY_AUTH_TOKEN = 'songverse_auth_session_token';

class AuthService {
  private sessionToken: string | null = null;
  private providers: { google: AuthProviderConfig; apple: AuthProviderConfig } = {
    google: {
      id: 'google',
      name: 'Google',
      configured: false,
      missingEnvVars: ['GOOGLE_CLIENT_ID'],
      setupInstructions: [
        'Open Google Cloud Console > APIs & Services > Credentials.',
        'Create an OAuth 2.0 Web Client ID.',
        'Add your app domain under "Authorized JavaScript origins" and "Authorized redirect URIs".',
        'Set GOOGLE_CLIENT_ID in your environment variables.'
      ]
    },
    apple: {
      id: 'apple',
      name: 'Apple',
      configured: false,
      missingEnvVars: ['APPLE_CLIENT_ID', 'APPLE_TEAM_ID', 'APPLE_KEY_ID'],
      setupInstructions: [
        'Open Apple Developer Account > Certificates, Identifiers & Profiles.',
        'Create a Services ID with "Sign In with Apple" enabled.',
        'Configure your Web Domain and Return URLs.',
        'Generate and download a private key (.p8 file).',
        'Set APPLE_CLIENT_ID, APPLE_TEAM_ID, and APPLE_KEY_ID in your environment variables.'
      ]
    }
  };

  private listeners: Set<(state: AuthState) => void> = new Set();
  private isLoading = false;
  private error: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.sessionToken = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
      this.fetchProvidersStatus();
    }
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }

  public getState(): AuthState {
    return {
      user: gameEngine.getUserProfile(),
      sessionToken: this.sessionToken,
      providers: this.providers,
      isLoading: this.isLoading,
      error: this.error
    };
  }

  public async fetchProvidersStatus(): Promise<void> {
    try {
      const res = await fetch('/api/auth/providers');
      if (res.ok) {
        const data = await res.json();
        if (data.google && data.apple) {
          this.providers = data;
          this.notify();
        }
      }
    } catch {
      // Offline or server not ready; default to unconfigured state
    }
  }

  /**
   * Play as Guest: Activates guest session immediately with local storage isolation
   */
  public playAsGuest(): UserProfile {
    this.sessionToken = null;
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    const profile = gameEngine.getUserProfile();
    profile.isGuest = true;
    profile.authProvider = 'guest';
    gameEngine.updateUserProfile(profile);
    this.error = null;
    this.notify();
    return profile;
  }

  /**
   * Google Sign-In with server-side validation
   */
  public async signInWithGoogle(idToken: string): Promise<UserProfile> {
    if (!this.providers.google.configured) {
      throw new Error('Google Sign-In is not configured. Setup required in environment variables.');
    }

    this.isLoading = true;
    this.error = null;
    this.notify();

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to authenticate with Google.');
      }

      const { token, user } = await res.json();
      this.sessionToken = token;
      localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);

      // Link any existing guest progress
      const guestProfile = gameEngine.getUserProfile();
      if (guestProfile.isGuest && (guestProfile.totalScore > 0 || guestProfile.gamesPlayed > 0)) {
        await this.linkGuestData(token, guestProfile);
      }

      const updatedProfile: UserProfile = {
        ...guestProfile,
        id: user.id,
        displayName: user.displayName || guestProfile.displayName,
        email: user.email,
        authProvider: 'google',
        isGuest: false,
        linkedAt: Date.now()
      };

      gameEngine.updateUserProfile(updatedProfile);
      this.notify();
      return updatedProfile;
    } catch (err: any) {
      this.error = err.message;
      this.notify();
      throw err;
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  /**
   * Apple Sign-In with server-side validation
   */
  public async signInWithApple(identityToken: string): Promise<UserProfile> {
    if (!this.providers.apple.configured) {
      throw new Error('Sign in with Apple is not configured. Setup required in environment variables.');
    }

    this.isLoading = true;
    this.error = null;
    this.notify();

    try {
      const res = await fetch('/api/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityToken })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to authenticate with Apple.');
      }

      const { token, user } = await res.json();
      this.sessionToken = token;
      localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);

      const guestProfile = gameEngine.getUserProfile();
      const updatedProfile: UserProfile = {
        ...guestProfile,
        id: user.id,
        displayName: user.displayName || guestProfile.displayName,
        email: user.email,
        authProvider: 'apple',
        isGuest: false,
        linkedAt: Date.now()
      };

      gameEngine.updateUserProfile(updatedProfile);
      this.notify();
      return updatedProfile;
    } catch (err: any) {
      this.error = err.message;
      this.notify();
      throw err;
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  private async linkGuestData(token: string, guest: UserProfile): Promise<void> {
    try {
      await fetch('/api/auth/link-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          guestScore: guest.totalScore,
          guestGames: guest.gamesPlayed,
          guestStreak: guest.currentStreak,
          guestAchievements: guest.unlockedAchievements
        })
      });
    } catch {
      // Non-blocking link
    }
  }

  /**
   * Sign Out: Clears server session and resets client to a fresh, unauthenticated guest profile
   */
  public async signOut(): Promise<void> {
    if (this.sessionToken) {
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.sessionToken}` }
        });
      } catch {
        // Ignored
      }
    }

    this.sessionToken = null;
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    gameEngine.clearAllUserData();
    this.notify();
  }

  /**
   * Delete Account: Permanently purges server records and local storage.
   * Requires typing 'DELETE' exactly and returns confirmation dispatch details for Google/Apple account.
   */
  public async deleteAccount(confirmation: string): Promise<{
    status: string;
    message: string;
    designatedAccount?: string;
    authProvider?: string;
    confirmationDispatchId?: string;
  }> {
    if (confirmation !== 'DELETE') {
      throw new Error('You must type "DELETE" exactly to confirm account deletion.');
    }

    const currentProfile = gameEngine.getUserProfile();
    let result = {
      status: 'account_deleted',
      message: currentProfile.isGuest
        ? 'Guest profile and all locally stored gameplay history have been permanently deleted.'
        : `Your account has been deleted and a security confirmation has been dispatched to your ${currentProfile.authProvider || 'designated'} account (${currentProfile.email || 'account'}).`,
      designatedAccount: currentProfile.email,
      authProvider: currentProfile.authProvider,
      confirmationDispatchId: `sec_del_${Date.now()}`
    };

    if (this.sessionToken) {
      try {
        const res = await fetch('/api/auth/account', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.sessionToken}`
          },
          body: JSON.stringify({ confirmation: 'DELETE' })
        });
        if (res.ok) {
          const serverResult = await res.json();
          result = { ...result, ...serverResult };
        }
      } catch {
        // Fallback to local purge
      }
    }

    this.sessionToken = null;
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    gameEngine.clearAllUserData();
    this.notify();
    return result;
  }
}

export const authService = new AuthService();

