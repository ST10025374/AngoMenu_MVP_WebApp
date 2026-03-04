import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../lib/auth";
import { getUserRole, type AppRole, isTokenExpired } from "../lib/jwt";

type RoleRouteProps = {
    allowed: AppRole[];
};

export default function RoleRoute({ allowed }: RoleRouteProps) {
    const token = getToken();

    if (!token || isTokenExpired(token)) {
        return <Navigate to="/login" replace />;
    }

    const role = getUserRole(token);
    if (!role || !allowed.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}