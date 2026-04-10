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

import ManagerDashboardPage from './pages/manager/ManagerDashboardPage';
import ManagerRestaurantPage from './pages/manager/ManagerRestaurantPage';
import ManagerMenuPage from './pages/manager/ManagerMenuPage';
import ManagerReservationsPage from './pages/manager/ManagerReservationsPage';
import RestaurantImageManagementPage from './pages/RestaurantImageManagementPage';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import { getDefaultRouteForRole, getUserRole, isAuthenticated } from './lib/auth';

import HomePage from './pages/HomePage';

export default function App() {
    const role = getUserRole();
    const isLoggedIn = isAuthenticated();

    return (
        <BrowserRouter>
            <AppShell>
                <Routes>

                    {/* PUBLIC */}
                    <Route
                        path="/"
                        element={isLoggedIn ? <Navigate to={getDefaultRouteForRole(role)} replace /> : <HomePage />}
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* CLIENT */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<RoleRoute allowedRoles={['Client', 'User']} />}>
                            <Route path="/restaurants" element={<RestaurantsPage />} />
                            <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
                            <Route path="/restaurants/:id/reserve" element={<CreateReservationPage />} />
                            <Route path="/reservations/my" element={<MyReservationsPage />} />
                        </Route>
                    </Route>

                    {/* ADMIN */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<RoleRoute allowedRoles={['Admin']} />}>
                            <Route path="/admin" element={<AdminDashboardPage />} />
                            <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
                            <Route path="/admin/restaurants/:restaurantId/images" element={<RestaurantImageManagementPage />} />
                            <Route path="/admin/reservations" element={<AdminReservationsPage />} />
                            <Route path="/admin/menu" element={<AdminMenuPage />} />
                        </Route>
                    </Route>

                    <Route element={<ProtectedRoute />}>
                        <Route element={<RoleRoute allowedRoles={['Manager']} />}>
                            <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
                            <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
                            <Route path="/manager/restaurant" element={<ManagerRestaurantPage />} />
                            <Route path="/manager/restaurants/:restaurantId/images" element={<RestaurantImageManagementPage />} />
                            <Route path="/manager/menu" element={<ManagerMenuPage />} />
                            <Route path="/manager/reservations" element={<ManagerReservationsPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </AppShell>
        </BrowserRouter>
    );
}
