import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../lib/api';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const message = await register({ firstName, lastName, email, phoneNumber, password });
            setSuccess(message || 'Registo efetuado com sucesso. A redirecionar...');
            setTimeout(() => navigate('/login'), 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha no registo');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-stretch">
            <section className="app-card hidden p-8 lg:block">
                <span className="inline-flex rounded-full bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-red">
                    Junte-se ao AngoMenu
                </span>
                <h1 className="mt-4 text-3xl font-black text-brand-dark">Crie a sua conta em minutos.</h1>
                <p className="mt-3 text-slate-600">
                    Tenha uma experiÃªncia de reserva mais fluida com descoberta personalizada de restaurantes e reservas mais rÃ¡pidas.
                </p>

                <div className="mt-8 space-y-4 text-sm text-slate-700">
                    <p className="rounded-xl border border-slate-200 bg-white p-4">? Descubra restaurantes por localizaÃ§Ã£o e disponibilidade</p>
                    <p className="rounded-xl border border-slate-200 bg-white p-4">? Veja os menus antes de reservar</p>
                    <p className="rounded-xl border border-slate-200 bg-white p-4">? Gira os seus planos gastronÃ³micos com confianÃ§a</p>
                </div>
            </section>

            <section className="app-card p-6 sm:p-8">
                <h2 className="text-2xl font-black text-brand-dark">Registar</h2>
                <p className="mt-1 text-sm text-slate-500">Configure a sua conta e comece a reservar.</p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="firstName" className="label">
                                Primeiro nome
                            </label>
                            <input
                                id="firstName"
                                className="input"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                autoComplete="given-name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName" className="label">
                                Ãšltimo nome
                            </label>
                            <input
                                id="lastName"
                                className="input"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                autoComplete="family-name"
                                required
                            />
                        </div>
                    </div>

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
                        <label htmlFor="phoneNumber" className="label">
                            NÃºmero de telefone
                        </label>
                        <input
                            id="phoneNumber"
                            className="input"
                            type="tel"
                            value={phoneNumber}
                            onChange={(event) => setPhoneNumber(event.target.value)}
                            autoComplete="tel"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="label">
                            Palavra-passe
                        </label>
                        <input
                            id="password"
                            className="input"
                            type="password"
                            minLength={6}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                    {success && (
                        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
                    )}

                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? 'A criar conta...' : 'Criar conta'}
                    </button>
                </form>

                <p className="mt-5 text-sm text-slate-600">
                    JÃ¡ tem conta?{' '}
                    <Link to="/login" className="font-semibold text-brand-red hover:underline">
                        Entrar
                    </Link>
                </p>
            </section>
        </div>
    );
}