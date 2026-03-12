import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { clearToken, getToken } from '../lib/auth';

type AppShellProps = {
    children: ReactNode;
};

const navItems = [
    { to: '/', label: 'Home' },
    { to: '/restaurants', label: 'Restaurants' },
];

export default function AppShell({ children }: AppShellProps) {
    const isLoggedIn = Boolean(getToken());

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
                <div className="container-shell flex flex-wrap items-center justify-between gap-4 py-4">
                    <Link to="/" className="group inline-flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-brand-dark text-center leading-10 shadow-soft">
                            <span className="text-base font-black tracking-tight text-brand-yellow">A</span>
                        </div>
                        <div>
                            <p className="text-lg font-black leading-none tracking-tight">
                                <span className="text-brand-red">Ango</span>
                                <span className="text-brand-dark">Menu</span>
                            </p>
                            <p className="text-xs text-slate-500">Reservation Platform</p>
                        </div>
                    </Link>

                    <nav className="flex flex-wrap items-center gap-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
                                        ? 'bg-brand-dark text-white'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}

                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" className="btn-secondary">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Register
                                </Link>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => {
                                    clearToken();
                                    window.location.assign('/login');
                                }}
                            >
                                Logout
                            </button>
                        )}
                    </nav>
                </div>
            </header>

            <main className="container-shell py-8 md:py-10">{children}</main>
        </div>
    );
}