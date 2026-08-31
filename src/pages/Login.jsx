import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import "../styles/auth.css";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.login({ emailOrUsername, password });
      login(token, user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel-brand">
        <div className="auth-brand-top">
          <Logo size="md" inverted />
        </div>
        <div className="auth-brand-mark">
          <h1>Still up? Your people are too.</h1>
          <p>A quiet corner for the group chats that actually matter to you.</p>
        </div>
        <div className="auth-brand-foot">Built by Ahsan.Dev</div>
      </div>

      <div className="auth-panel-form">
        <div className="auth-form-wrap">
          <div className="logo-mobile">
            <Logo size="md" />
          </div>
          <h2>Welcome back</h2>
          <p className="auth-form-sub">Log in to pick up where you left off.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="emailOrUsername">Email or username</label>
              <input
                id="emailOrUsername"
                type="text"
                autoComplete="username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
