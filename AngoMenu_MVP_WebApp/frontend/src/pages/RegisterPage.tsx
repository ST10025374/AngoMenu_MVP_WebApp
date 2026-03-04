import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../lib/Api";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const message = await register({ firstName, lastName, email, password });
            setSuccess(message || "Registered successfully");
            setTimeout(() => navigate("/login"), 900);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Register failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ maxWidth: 420, margin: "40px auto", fontFamily: "sans-serif" }}>
            <h1>Register</h1>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
                <input
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
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
                    minLength={6}
                />

                <button disabled={loading} type="submit">
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>

            {error && <p style={{ color: "crimson" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <p>
                Already registered? <Link to="/login">Login</Link>
            </p>
        </main>
    );
}