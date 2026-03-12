import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, clearToken } from '../lib/auth';
import { isTokenExpired } from '../lib/jwt';

export default function ProtectedRoute() {
    const location = useLocation();
    const token = getToken();

    if (!token || isTokenExpired(token)) {
        clearToken(); // optional but recommended
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}