import { Navigate, Outlet } from 'react-router-dom';
import { getUserRole, isAuthenticated, type UserRole } from '../lib/auth';

type RoleRouteProps = {
    allowedRoles: Exclude<UserRole, null>[];
};

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const role = getUserRole();
    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}