import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ email, password });
      localStorage.setItem("auth_token", result.token);
      navigate("/"); // later you can redirect by role
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading} type="submit">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </main>
  );
}