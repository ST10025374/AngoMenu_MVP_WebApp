import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import { getToken, getUserRole } from './lib/auth';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import RestaurantsPage from './pages/RestaurantsPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

function HomePage() {
    const isLoggedIn = Boolean(getToken());
    const role = getUserRole();

    return (
        <section className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                    <span className="inline-flex rounded-full border border-brand-red/20 bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-red">
                        Premium reservation experience
                    </span>

                    <h1 className="mt-4 text-4xl font-black leading-tight text-brand-dark md:text-5xl">
                        Modern dining starts with a
                        <span className="text-brand-red"> better booking flow.</span>
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                        Discover top restaurants, review curated menus, and reserve your table with a polished,
                        fast, and reliable experience.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            to={!isLoggedIn ? '/login' : role === 'Admin' ? '/admin' : '/restaurants'}
                            className="btn-primary"
                        >
                            {!isLoggedIn ? 'Start booking' : role === 'Admin' ? 'Open admin center' : 'Explore restaurants'}
                        </Link>
                        {!isLoggedIn && (
                            <Link to="/register" className="btn-secondary">
                                Create account
                            </Link>
                        )}
                    </div>
                </div>

                <div className="app-card p-6">
                    <h2 className="text-lg font-bold text-brand-dark">What you can do now</h2>
                    <ul className="mt-4 space-y-3 text-sm text-slate-600">
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-brand-red" />
                            Create an account and authenticate securely.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-brand-yellow" />
                            Browse restaurants with search and pagination.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-brand-dark" />
                            Admins can manage reservations and restaurants.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <article className="app-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Design</p>
                    <h3 className="mt-1 text-lg font-bold text-brand-dark">Brand-Driven UI</h3>
                    <p className="mt-2 text-sm text-slate-600">Consistent use of red, yellow and dark tones with clear hierarchy.</p>
                </article>

                <article className="app-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Performance</p>
                    <h3 className="mt-1 text-lg font-bold text-brand-dark">Fast Navigation</h3>
                    <p className="mt-2 text-sm text-slate-600">Vite-powered frontend with lightweight route-level structure.</p>
                </article>

                <article className="app-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Scalability</p>
                    <h3 className="mt-1 text-lg font-bold text-brand-dark">Clean Foundation</h3>
                    <p className="mt-2 text-sm text-slate-600">Reusable components and straightforward API layer for new modules.</p>
                </article>
            </div>
        </section>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppShell>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/restaurants" element={<RestaurantsPage />} />
                        <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
                    </Route>

                    <Route element={<RoleRoute allowedRoles={['Admin']} />}>
                        <Route path="/admin" element={<AdminDashboardPage />} />
                    </Route>

                    <Route path="*" element={<Navigate replace to="/" />} />
                </Routes>
            </AppShell>
        </BrowserRouter>
    );
}