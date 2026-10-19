import { CookiePreferences } from '../types';

const STORAGE_KEY_COOKIES = 'songverse_cookie_consent_v1';

class PrivacyConsentService {
  private preferences: CookiePreferences;
  private listeners: Set<(prefs: CookiePreferences) => void> = new Set();

  constructor() {
    this.preferences = this.loadPreferences();
  }

  private loadPreferences(): CookiePreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COOKIES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Default fallback
    }

    return {
      strictlyNecessary: true,
      functional: false,
      analytics: false,
      hasChosen: false,
      updatedAt: 0
    };
  }

  public getPreferences(): CookiePreferences {
    return { ...this.preferences };
  }

  public subscribe(listener: (prefs: CookiePreferences) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l({ ...this.preferences }));
  }

  public acceptAll(): void {
    this.preferences = {
      strictlyNecessary: true,
      functional: true,
      analytics: true,
      hasChosen: true,
      updatedAt: Date.now()
    };
    this.save();
  }

  public rejectOptional(): void {
    this.preferences = {
      strictlyNecessary: true,
      functional: false,
      analytics: false,
      hasChosen: true,
      updatedAt: Date.now()
    };
    this.save();
  }

  public saveCustom(functional: boolean, analytics: boolean): void {
    this.preferences = {
      strictlyNecessary: true,
      functional,
      analytics,
      hasChosen: true,
      updatedAt: Date.now()
    };
    this.save();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY_COOKIES, JSON.stringify(this.preferences));
    } catch {
      // storage error
    }
    this.notify();
  }

  public resetConsent(): void {
    this.preferences = {
      strictlyNecessary: true,
      functional: false,
      analytics: false,
      hasChosen: false,
      updatedAt: 0
    };
    localStorage.removeItem(STORAGE_KEY_COOKIES);
    this.notify();
  }
}

export const privacyConsent = new PrivacyConsentService();
