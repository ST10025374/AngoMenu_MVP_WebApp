import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserRole, logout, isAuthenticated, subscribeAuthChanges } from "../lib/auth";

function Dropdown({ title, items, onNavigate }: { title: string; items: { to: string; label: string }[]; onNavigate?: () => void }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onDocumentClick(event: MouseEvent) {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        function onEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", onDocumentClick);
        document.addEventListener("keydown", onEscape);

        return () => {
            document.removeEventListener("mousedown", onDocumentClick);
            document.removeEventListener("keydown", onEscape);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-red hover:text-brand-red"
                aria-expanded={open}
                aria-haspopup="menu"
            >
                {title}
                <span className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">▼</span>
            </button>

            {open && (
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <ul className="py-1 text-sm" role="menu">
                        {items.map((item) => (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className="block px-4 py-2 text-slate-700 transition hover:bg-slate-50 hover:text-brand-red"
                                    role="menuitem"
                                    onClick={() => {
                                        setOpen(false);
                                        onNavigate?.();
                                    }}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [, setAuthVersion] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        return subscribeAuthChanges(() => {
            setAuthVersion((value) => value + 1);
        });
    }, []);

    const isLoggedIn = isAuthenticated();
    const role = getUserRole();
    const isAdminUser = role === "Admin";
    const isManagerUser = role === "Manager";
    const isClientUser = role === "Client" || role === "User";

    function handleLogout() {
        logout();
        setMobileMenuOpen(false);
        navigate("/login");
    }

    function closeMobileMenu() {
        setMobileMenuOpen(false);
    }

    return (
        <div>
            <nav className="border-b bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-sm font-black uppercase tracking-wide text-brand-dark" onClick={closeMobileMenu}>
                            AngoMenu
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 md:hidden"
                        onClick={() => setMobileMenuOpen((value) => !value)}
                        aria-expanded={mobileMenuOpen}
                    >
                        Menu
                    </button>

                    <div className="hidden items-center gap-3 md:flex">
                        {isLoggedIn && (
                            <>
                                <Link to="/restaurants" className="text-sm font-semibold text-slate-700 transition hover:text-brand-red">
                                    Restaurantes
                                </Link>
                                {isClientUser && (
                                    <Link to="/reservations/my" className="text-sm font-semibold text-slate-700 transition hover:text-brand-red">
                                        As Minhas Reservas
                                    </Link>
                                )}
                            </>
                        )}

                        {isAdminUser && (
                            <Dropdown
                                title="Administrador"
                                items={[
                                    { to: "/admin", label: "Painel" },
                                    { to: "/admin/restaurants", label: "Gerir Restaurantes" },
                                    { to: "/admin/reservations", label: "Gerir Reservas" },
                                    { to: "/admin/menu", label: "Gerir Menu" },
                                ]}
                            />
                        )}

                        {isManagerUser && (
                            <Dropdown
                                title="Gestor"
                                items={[
                                    { to: "/manager", label: "Painel do Gestor" },
                                    { to: "/manager/restaurant", label: "Meu Restaurante" },
                                    { to: "/manager/menu", label: "Gerir Menu" },
                                    { to: "/manager/reservations", label: "Reservas" },
                                ]}
                            />
                        )}

                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" className="text-sm font-semibold text-slate-700 transition hover:text-brand-red">
                                    Entrar
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    Registar
                                </Link>
                            </>
                        ) : (
                            <button onClick={handleLogout} className="btn-primary text-sm">
                                Terminar sessão
                            </button>
                        )}
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="border-t border-slate-100 px-4 py-3 md:hidden">
                        <div className="flex flex-col gap-2">
                            {isLoggedIn && (
                                <>
                                    <Link to="/admin" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>Painel</Link>
                                    <Link to="/admin/restaurants" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>Gerir Restaurantes</Link>
                                    <Link to="/admin/reservations" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>Gerir Reservas</Link>
                                    <Link to="/admin/menu" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>Gerir Menu</Link>
                                </>
                            )}

                            {isManagerUser && (
                                <>
                                    <Link to="/manager" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>Painel do Gestor</Link>
                                    <Link to="/manager/restaurant" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>Meu Restaurante</Link>
                                    <Link to="/manager/menu" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>Gerir Menu</Link>
                                    <Link to="/manager/reservations" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>Reservas</Link>
                                </>
                            )}

                            {isAdminUser && (
                                <>
                                    <Link to="/admin" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>
                                        Painel
                                    </Link>
                                    <Link to="/admin/restaurants" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>
                                        Gerir Restaurantes
                                    </Link>
                                    <Link to="/admin/reservations" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>
                                        Gerir Reservas
                                    </Link>
                                    <Link to="/admin/menu" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>
                                        Gerir Menu
                                    </Link>
                                </>
                            )}

                            {!isLoggedIn ? (
                                <>
                                    <Link to="/login" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>
                                        Entrar
                                    </Link>
                                    <Link to="/register" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeMobileMenu}>
                                        Registar
                                    </Link>
                                </>
                            ) : (
                                <button onClick={handleLogout} className="btn-primary w-full text-sm">
                                        Terminar sessão
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <main className="p-4">{children}</main>
        </div>
    );
}
