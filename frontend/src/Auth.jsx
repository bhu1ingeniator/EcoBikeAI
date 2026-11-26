import { useState } from "react";
import { API, setToken } from "./api";
import { BikeIcon } from "./Landing";

export default function Auth({ mode, onSwitch, onAuthed, onBack }) {
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
      setToken(data.token);
      onAuthed({ name: data.name, email: data.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="link" onClick={onBack}>← Back</button>
        <div className="auth-brand"><BikeIcon size={28} /> EcoBike<span>AI</span></div>
        <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
        <p className="muted">
          {isRegister ? "Save bikes and get AI suggestions." : "Sign in to continue."}
        </p>

        <form onSubmit={submit}>
          {isRegister && (
            <>
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </>
          )}
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isRegister ? 8 : undefined}
          />
          {error && <div className="auth-error">{error}</div>}
          <button className="cta lg auth-submit" disabled={busy}>
            {busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account? " : "New here? "}
          <button className="link" onClick={() => onSwitch(isRegister ? "login" : "register")}>
            {isRegister ? "Sign in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}