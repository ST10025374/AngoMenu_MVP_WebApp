import { Navigate, Outlet } from "react-router-dom";
import { getDefaultRouteForRole, getUserRole } from "../lib/auth";

export default function RoleRoute({
    allowedRoles,
}: {
    allowedRoles: string[];
}) {
    const role = getUserRole();

    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to={getDefaultRouteForRole(role)} replace />;
    }
    
    return <Outlet />;
}

