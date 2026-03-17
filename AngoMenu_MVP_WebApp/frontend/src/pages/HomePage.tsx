import { Link } from "react-router-dom";
import { getToken, getUserRole } from "../lib/auth";

export default function HomePage() {
    const isLoggedIn = Boolean(getToken());
    const role = getUserRole();

    const primaryAction = !isLoggedIn
        ? { label: "Start Booking", to: "/login" }
        : role === "Admin"
            ? { label: "Go to Admin Dashboard", to: "/admin" }
            : { label: "Explore Restaurants", to: "/restaurants" };

    return (
        <section className="space-y-12">

            {/* HERO */}
            <div className="grid gap-10 lg:grid-cols-2 items-center">
                <div>
                    <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-red bg-red-50 rounded-full">
                        Smart Dining Platform
                    </span>

                    <h1 className="mt-4 text-4xl md:text-5xl font-black leading-tight text-brand-dark">
                        Book restaurants
                        <span className="text-brand-red"> smarter</span>, faster,
                        and with confidence.
                    </h1>

                    <p className="mt-4 text-slate-600 max-w-xl">
                        Discover top restaurants, explore menus, and reserve your table in seconds.
                        Built for speed, simplicity, and a premium experience.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to={primaryAction.to} className="btn-primary">
                            {primaryAction.label}
                        </Link>

                        {!isLoggedIn && (
                            <Link to="/register" className="btn-secondary">
                                Create Account
                            </Link>
                        )}
                    </div>
                </div>

                {/* RIGHT CARD */}
                <div className="app-card p-6">
                    <h2 className="text-lg font-bold text-brand-dark">
                        What you can do
                    </h2>

                    <ul className="mt-4 space-y-3 text-sm text-slate-600">
                        <li className="flex gap-2">
                            <span className="w-2 h-2 mt-2 rounded-full bg-brand-red" />
                            Secure login & account management
                        </li>

                        <li className="flex gap-2">
                            <span className="w-2 h-2 mt-2 rounded-full bg-brand-yellow" />
                            Browse restaurants with fast search
                        </li>

                        <li className="flex gap-2">
                            <span className="w-2 h-2 mt-2 rounded-full bg-brand-dark" />
                            Reserve tables instantly
                        </li>

                        {role === "Admin" && (
                            <li className="flex gap-2">
                                <span className="w-2 h-2 mt-2 rounded-full bg-brand-red" />
                                Manage restaurants, menus & reservations
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* FEATURES */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="app-card p-5">
                    <p className="text-xs uppercase text-slate-500 font-semibold">
                        Experience
                    </p>
                    <h3 className="mt-1 font-bold text-brand-dark text-lg">
                        Seamless Booking
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Book a table in seconds with a smooth and intuitive flow.
                    </p>
                </div>

                <div className="app-card p-5">
                    <p className="text-xs uppercase text-slate-500 font-semibold">
                        Speed
                    </p>
                    <h3 className="mt-1 font-bold text-brand-dark text-lg">
                        Fast & Responsive
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Powered by React + Vite for lightning-fast navigation.
                    </p>
                </div>

                <div className="app-card p-5">
                    <p className="text-xs uppercase text-slate-500 font-semibold">
                        Control
                    </p>
                    <h3 className="mt-1 font-bold text-brand-dark text-lg">
                        Admin Management
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Full control over restaurants, menus, and reservations.
                    </p>
                </div>
            </div>

            {/* CTA */}
            <div className="app-card p-8 text-center">
                <h2 className="text-2xl font-black text-brand-dark">
                    Ready to get started?
                </h2>

                <p className="mt-2 text-slate-600">
                    Join now and start booking your next dining experience.
                </p>

                <div className="mt-5 flex justify-center gap-3">
                    <Link to={primaryAction.to} className="btn-primary">
                        {primaryAction.label}
                    </Link>

                    {!isLoggedIn && (
                        <Link to="/register" className="btn-secondary">
                            Create Account
                        </Link>
                    )}
                </div>
            </div>

        </section>
    );
}