import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase, loadConfig } from '../../config/supabaseClient';

const PRODUCTION_ORIGIN = 'https://www.greenlifesolarsolution.com';

const getResetRedirectUrl = () => {
  if (typeof window === 'undefined') return '/reset-password';

  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const origin = isLocalHost ? PRODUCTION_ORIGIN : window.location.origin;

  return `${origin}/reset-password`;
};

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError('Please enter your account email address.');
        return;
      }

      await loadConfig();

      const { error: resetError } = await getSupabase().auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: getResetRedirectUrl(),
      });

      if (resetError) throw resetError;

      setMessage('If this email is registered, a secure reset link has been sent.');
    } catch (err: any) {
      setError(err.message || 'Could not send reset link. Please try again.');
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
            <span className="material-symbols-outlined">lock_reset</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight mb-2">Reset Password</h1>
          <p className="text-sm text-forest/65 dark:text-white/65 mb-8">
            Enter your account email and we will send a secure password reset link.
          </p>

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
              <label htmlFor="reset-email" className="block mb-2 text-sm font-bold">Email Address</label>
              <input
                id="reset-email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 placeholder:text-gray-400 focus:ring-primary focus:border-primary transition-all"
                placeholder="name@company.com"
                type="email"
                autoComplete="email"
              />
            </div>

            <button
              className="w-full bg-primary hover:bg-opacity-90 text-forest font-black h-14 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              type="submit"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <span className="material-symbols-outlined">mail</span>
                </>
              )}
            </button>
          </form>

          <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to sign in
          </Link>
        </section>
      </main>
    </div>
  );
};

export default ForgotPassword;
