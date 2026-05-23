import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSupabase, loadConfig } from '../../config/supabaseClient';
import { clearAuthPreference, useAuth } from '../../context/AuthContext';

const isSessionLockError = (err: any) => {
  const message = String(err?.message || err || '').toLowerCase();
  return message.includes('lock:') || message.includes('another request stole it');
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasSession = Boolean(session);

  const passwordError = useMemo(() => {
    if (!password) return null;
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (confirmPassword && password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }, [password, confirmPassword]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    let passwordWasUpdated = false;

    const sendToLogin = () => {
      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1400);
    };

    try {
      await loadConfig();
      const client = getSupabase();
      const { error: updateError } = await client.auth.updateUser({ password });

      if (updateError) throw updateError;
      passwordWasUpdated = true;

      setMessage('Password updated successfully. Please sign in with your new password.');
      setPassword('');
      setConfirmPassword('');
      clearAuthPreference();
      client.auth.signOut().catch((signOutError) => {
        console.warn('Password reset sign-out cleanup failed:', signOutError);
      });
      sendToLogin();
    } catch (err: any) {
      if (passwordWasUpdated || isSessionLockError(err)) {
        setMessage('Password updated successfully. Please sign in with your new password.');
        setPassword('');
        setConfirmPassword('');
        clearAuthPreference();
        getSupabase().auth.signOut().catch((signOutError) => {
          console.warn('Password reset sign-out cleanup failed:', signOutError);
        });
        sendToLogin();
      } else {
        setError(err.message || 'Could not update password. Please request a new reset link.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-forest dark:text-white flex flex-col">
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="size-10 rounded-full overflow-hidden bg-forest">
            <img src="/logo.png" alt="Greenlife Solar" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-black tracking-tight">Greenlife Solar</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <section className="w-full max-w-[460px] rounded-2xl bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-white/10 shadow-xl p-6 sm:p-8">
          <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-6">
            <span className="material-symbols-outlined">password</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight mb-2">Create New Password</h1>
          <p className="text-sm text-forest/65 dark:text-white/65 mb-8">
            Choose a strong password for your Greenlife Solar account.
          </p>

          {!hasSession ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                This reset link is invalid or expired. Please request a new password reset email.
              </div>
              <Link to="/forgot-password" className="w-full bg-primary text-forest font-black h-14 rounded-xl flex items-center justify-center gap-2">
                Request New Link
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          ) : (
            <>
              {message && (
                <div className="mb-5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-forest dark:text-green-100">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="new-password" className="block mb-2 text-sm font-bold">New Password</label>
                  <div className="relative">
                    <input
                      id="new-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 pl-4 pr-12 placeholder:text-gray-400 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Enter new password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block mb-2 text-sm font-bold">Confirm Password</label>
                  <input
                    id="confirm-password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 placeholder:text-gray-400 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Confirm new password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                  />
                  {passwordError && <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-300">{passwordError}</p>}
                </div>

                <button
                  className="w-full bg-primary hover:bg-opacity-90 text-forest font-black h-14 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                  type="submit"
                  disabled={loading || Boolean(passwordError)}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <span className="material-symbols-outlined">check</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default ResetPassword;
