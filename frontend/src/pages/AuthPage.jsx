import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const MODES = { LOGIN: 'login', SIGNUP: 'signup' };

export default function AuthPage() {
  const [mode, setMode] = useState(MODES.LOGIN);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, signup, user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && user) navigate('/chat', { replace: true });
  }, [ready, user, navigate]);

  const isLogin = mode === MODES.LOGIN;

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await signup({ username: form.username, email: form.email, password: form.password });
      }
      navigate('/chat');
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.error;
      setError(message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <section className="auth__brand">
        <div className="auth__brand-top">
          <Logo size="lg" />
        </div>

        <div className="auth__brand-copy">
          <h1>
            A quieter place to talk<br />with people you know.
          </h1>
          <p>No public feed, no follower counts — just conversations between you and your friends.</p>
        </div>

        <svg
          className="auth__motif"
          viewBox="0 0 260 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="10" y="70" width="150" height="90" rx="20" fill="var(--color-accent)" opacity="0.9" />
          <rect x="95" y="20" width="150" height="90" rx="20" fill="var(--color-highlight)" opacity="0.85" />
        </svg>
      </section>

      <section className="auth__panel">
        <div className="auth__panel-top">
          <ThemeSwitcher align="right" />
        </div>

        <div className="auth__form-wrap">
          <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>

          <form className="auth__form" onSubmit={handleSubmit}>
            {!isLogin && (
              <label className="field">
                <span>Username</span>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                  value={form.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  placeholder="e.g. ahsan"
                  autoComplete="username"
                />
              </label>
            )}

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </label>

            {error && <p className="auth__error">{error}</p>}

            <button type="submit" className="auth__submit" disabled={submitting}>
              {submitting ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <button
            type="button"
            className="auth__switch"
            onClick={() => {
              setError('');
              setMode(isLogin ? MODES.SIGNUP : MODES.LOGIN);
            }}
          >
            {isLogin ? "New here? Create an account" : 'Already have an account? Log in'}
          </button>
        </div>
      </section>
    </div>
  );
}
