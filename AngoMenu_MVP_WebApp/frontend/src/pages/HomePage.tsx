import { Link } from "react-router-dom";
import { getToken, getUserRole } from "../lib/auth";

export default function HomePage() {
    const isLoggedIn = Boolean(getToken());
    const role = getUserRole();

    const primaryAction = !isLoggedIn
        ? { label: "Começar a reservar", to: "/login" }
        : role === "Admin"
            ? { label: "Ir para o Painel de Administração", to: "/admin" }
            : { label: "Explorar Restaurantes", to: "/restaurants" };

    return (
        <section className="space-y-12">

            {/* HERO */}
            <div className="grid gap-10 lg:grid-cols-2 items-center">
                <div>
                    <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-red bg-red-50 rounded-full">
                        Plataforma Inteligente de Restaurantes
                    </span>

                    <h1 className="mt-4 text-4xl md:text-5xl font-black leading-tight text-brand-dark">
                        Reserve restaurantes
                        <span className="text-brand-red"> de forma mais inteligente</span>, mais rápido,
                        e com confiança.
                    </h1>

                    <p className="mt-4 text-slate-600 max-w-xl">
                        Descubra os melhores restaurantes, explore menus e reserve a sua mesa em segundos.
                        Feito para rapidez, simplicidade e uma experiência premium.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to={primaryAction.to} className="btn-primary">
                            {primaryAction.label}
                        </Link>

                        {!isLoggedIn && (
                            <Link to="/register" className="btn-secondary">
                                Criar conta
                            </Link>
                        )}
                    </div>
                </div>

                {/* RIGHT CARD */}
                <div className="app-card p-6">
                    <h2 className="text-lg font-bold text-brand-dark">
                        O que pode fazer
                    </h2>

                    <ul className="mt-4 space-y-3 text-sm text-slate-600">
                        <li className="flex gap-2">
                            <span className="w-2 h-2 mt-2 rounded-full bg-brand-red" />
                            Início de sessão seguro e gestão de conta
                        </li>

                        <li className="flex gap-2">
                            <span className="w-2 h-2 mt-2 rounded-full bg-brand-yellow" />
                            Pesquisar restaurantes com busca rápida
                        </li>

                        <li className="flex gap-2">
                            <span className="w-2 h-2 mt-2 rounded-full bg-brand-dark" />
                            Reservar mesas instantaneamente
                        </li>

                        {role === "Admin" && (
                            <li className="flex gap-2">
                                <span className="w-2 h-2 mt-2 rounded-full bg-brand-red" />
                                Gerir restaurantes, menus e reservas
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* FEATURES */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="app-card p-5">
                    <p className="text-xs uppercase text-slate-500 font-semibold">
                        Experiência
                    </p>
                    <h3 className="mt-1 font-bold text-brand-dark text-lg">
                        Reserva sem complicações
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Reserve uma mesa em segundos com um fluxo simples e intuitivo.
                    </p>
                </div>

                <div className="app-card p-5">
                    <p className="text-xs uppercase text-slate-500 font-semibold">
                        Rapidez
                    </p>
                    <h3 className="mt-1 font-bold text-brand-dark text-lg">
                        Rápido e responsivo
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Desenvolvido com React + Vite para navegação ultrarrápida.
                    </p>
                </div>

                <div className="app-card p-5">
                    <p className="text-xs uppercase text-slate-500 font-semibold">
                        Controlo
                    </p>
                    <h3 className="mt-1 font-bold text-brand-dark text-lg">
                        Gestão Administrativa
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Controlo total sobre restaurantes, menus e reservas.
                    </p>
                </div>
            </div>

            {/* CTA */}
            <div className="app-card p-8 text-center">
                <h2 className="text-2xl font-black text-brand-dark">
                    Pronto para começar?
                </h2>

                <p className="mt-2 text-slate-600">
                    Junte-se agora e comece a reservar a sua próxima experiência gastronómica.
                </p>

                <div className="mt-5 flex justify-center gap-3">
                    <Link to={primaryAction.to} className="btn-primary">
                        {primaryAction.label}
                    </Link>

                    {!isLoggedIn && (
                        <Link to="/register" className="btn-secondary">
                            Criar conta
                        </Link>
                    )}
                </div>
            </div>

        </section>
    );
}