import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import CreateReservationPage from './pages/CreateReservationPage';
import MyReservationsPage from './pages/MyReservationsPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';
import AdminMenuPage from './pages/admin/AdminMenuPage';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

import HomePage from './pages/HomePage';

export default function App() {
    return (
        <BrowserRouter>
            <AppShell>
                <Routes>

                    {/* PUBLIC */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* USER */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/restaurants" element={<RestaurantsPage />} />
                        <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
                        <Route path="/restaurants/:id/reserve" element={<CreateReservationPage />} />
                        <Route path="/reservations/my" element={<MyReservationsPage />} />
                    </Route>

                    {/* ADMIN */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<RoleRoute allowedRoles={['Admin']} />}>
                            <Route path="/admin" element={<AdminDashboardPage />} />
                            <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
                            <Route path="/admin/reservations" element={<AdminReservationsPage />} />
                            <Route path="/admin/menu" element={<AdminMenuPage />} />
                        </Route>
                    </Route>

                    {/* FALLBACK */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </AppShell>
        </BrowserRouter>
    );
}