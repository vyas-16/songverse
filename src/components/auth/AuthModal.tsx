import React, { useState } from 'react';
import {
  X,
  Shield,
  UserCheck,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { authService, AuthState } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());
  const [showSetupDetails, setShowSetupDetails] = useState<string | null>(null);

  React.useEffect(() => {
    return authService.subscribe((state) => {
      setAuthState(state);
    });
  }, []);

  if (!isOpen) return null;

  const handlePlayAsGuest = () => {
    authService.playAsGuest();
    onSuccess();
    onClose();
  };

  const toggleSetup = (providerId: string) => {
    setShowSetupDetails(prev => prev === providerId ? null : providerId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-900"
        role="dialog"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to SongVerse
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose how you would like to play. You can start instantly as a guest or link an account later.
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-3.5 mb-6">
          
          {/* Option 1: Play as Guest (Instant & Default — Zero Configuration Required) */}
          <div className="border-2 border-indigo-500/70 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 rounded-2xl p-4.5 shadow-sm transition-all">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  🎮
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Play as Guest
                    </h3>
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/90 border border-indigo-200 px-2 py-0.5 rounded-full">
                      Recommended · Instant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Zero setup or environment variables required
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlayAsGuest}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                Start Playing
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Play immediately across all 40 verified tracks, 9 languages, and 4-level trivia rounds without signing in or configuring OAuth credentials.
            </p>

            {/* Guest Mode Storage Notice */}
            <div className="mt-3 bg-white/90 border border-indigo-100/90 rounded-xl p-3 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Guest Storage Notice:</span>
              </div>
              <p>
                Guest progress, streaks, and scores are stored locally in your browser. You can link your progress to a registered Google or Apple account later if you choose to configure OAuth.
              </p>
            </div>
          </div>

          {/* Option 2: Continue with Google (Optional OAuth) */}
          <div className="border border-slate-200 rounded-2xl p-4 transition-all hover:border-slate-300 bg-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Continue with Google</span>
                    {!authState.providers.google.configured ? (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        Optional · Not Configured
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Sign in with your Google Account for cross-device sync
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!authState.providers.google.configured ? (
                  <>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title="Google OAuth credentials are not configured on this server. Use Guest Mode to play immediately."
                      className="px-3.5 py-2 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed flex items-center gap-1.5 opacity-70"
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Disabled</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSetup('google')}
                      className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="View setup instructions to configure later"
                    >
                      <span>Setup Guide</span>
                      {showSetupDetails === 'google' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Google Setup Checklist Drawer */}
            {showSetupDetails === 'google' && (
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-2.5 bg-slate-50 p-3.5 rounded-xl">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Google Sign-In Configuration (Optional):</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  SongVerse runs completely in <strong>Guest Mode</strong> without OAuth. If you want to enable Google Sign-In later for cloud sync:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-600">
                  <li>Open <strong>Google Cloud Console</strong> &gt; APIs &amp; Services &gt; Credentials.</li>
                  <li>Create an <strong>OAuth 2.0 Web Client ID</strong>.</li>
                  <li>Add your application URL under <em>Authorized JavaScript origins</em> and <em>Authorized redirect URIs</em>.</li>
                  <li>Set <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">GOOGLE_CLIENT_ID</code> in server environment variables.</li>
                </ol>
                <div className="text-[10px] text-slate-500 font-mono mt-1 pt-1.5 border-t border-slate-200">
                  Status: No OAuth variables set. Guest Mode is active and unrestricted.
                </div>
              </div>
            )}
          </div>

          {/* Option 3: Continue with Apple (Optional OAuth) */}
          <div className="border border-slate-200 rounded-2xl p-4 transition-all hover:border-slate-300 bg-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.42-6-9.21-10.88-20.08-14.62-32.61-3.74-12.53-5.61-24.16-5.61-34.89 0-14.81 3.8-27.12 11.41-36.93 7.6-9.81 17.06-14.86 28.38-15.15 4.35 0 9.17 1.13 14.46 3.4 5.29 2.27 8.94 3.45 10.95 3.55 1.57 0 5.42-1.28 11.56-3.83 6.13-2.55 11.4-3.68 15.79-3.4 11.75.53 21.17 4.7 28.27 12.52-10.22 6.19-15.22 14.86-15.01 26.02.21 8.7 3.58 15.98 10.11 21.84 6.53 5.86 14.15 9.11 22.86 9.76-2.02 6.09-4.54 12.44-7.57 19.06zM119.22 31.84c0-7.39 2.65-14.44 7.95-21.14 5.3-6.7 11.83-10.7 19.59-12 1.06 7.61-1.38 14.73-7.32 21.36-5.94 6.63-12.68 10.56-20.22 11.78z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Continue with Apple</span>
                    {!authState.providers.apple.configured ? (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        Optional · Not Configured
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Use your Apple ID for verified cross-device play
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!authState.providers.apple.configured ? (
                  <>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title="Apple Developer credentials are not configured on this server. Use Guest Mode to play immediately."
                      className="px-3.5 py-2 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed flex items-center gap-1.5 opacity-70"
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Disabled</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSetup('apple')}
                      className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="View setup instructions to configure later"
                    >
                      <span>Setup Guide</span>
                      {showSetupDetails === 'apple' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Apple Setup Checklist Drawer */}
            {showSetupDetails === 'apple' && (
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-2.5 bg-slate-50 p-3.5 rounded-xl">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Sign In with Apple Configuration (Optional):</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Sign In with Apple is completely optional. To configure Apple Developer credentials in the future:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-600">
                  <li>Open <strong>Apple Developer Portal</strong> &gt; Certificates, Identifiers &amp; Profiles.</li>
                  <li>Create a <strong>Services ID</strong> with &quot;Sign In with Apple&quot; enabled.</li>
                  <li>Configure your domain and Return URLs.</li>
                  <li>Generate a private key (<code className="font-mono text-[10px]">.p8</code> file).</li>
                  <li>Set <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">APPLE_CLIENT_ID</code>, <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">APPLE_TEAM_ID</code>, and <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">APPLE_KEY_ID</code> in server environment variables.</li>
                </ol>
                <div className="text-[10px] text-slate-500 font-mono mt-1 pt-1.5 border-t border-slate-200">
                  Status: No Apple credentials set. Guest Mode is active and unrestricted.
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Minimal Identity Privacy Guarantee */}
        <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-400">
          <Lock className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
          <span>
            SongVerse only requests basic profile information (name and email) required for trivia scores and leaderboards. We never collect contacts, calendars, or private files.
          </span>
        </div>

      </div>
    </div>
  );
};
