import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../lib/api';
import { setToken } from '../lib/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login({ email, password });
            setToken(result.token);
            navigate('/restaurants');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-stretch">
            <section className="app-card hidden p-8 lg:block">
                <span className="inline-flex rounded-full bg-brand-yellow/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
                    Secure Access
                </span>
                <h1 className="mt-4 text-3xl font-black text-brand-dark">Welcome back to AngoMenu.</h1>
                <p className="mt-3 text-slate-600">
                    Access your personalized reservations dashboard and continue discovering the best places to dine.
                </p>

                <div className="mt-8 space-y-4 text-sm text-slate-700">
                    <p className="rounded-xl border border-slate-200 bg-white p-4">? Fast and secure authentication</p>
                    <p className="rounded-xl border border-slate-200 bg-white p-4">? Real-time restaurant browsing experience</p>
                    <p className="rounded-xl border border-slate-200 bg-white p-4">? Clean interface with responsive layouts</p>
                </div>
            </section>

            <section className="app-card p-6 sm:p-8">
                <h2 className="text-2xl font-black text-brand-dark">Login</h2>
                <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue.</p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="email" className="label">
                            Email
                        </label>
                        <input
                            id="email"
                            className="input"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="label">
                            Password
                        </label>
                        <input
                            id="password"
                            className="input"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-5 text-sm text-slate-600">
                    No account yet?{' '}
                    <Link to="/register" className="font-semibold text-brand-red hover:underline">
                        Create one
                    </Link>
                </p>
            </section>
        </div>
    );
}