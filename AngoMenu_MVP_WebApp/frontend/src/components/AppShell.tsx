import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserRole, logout, isAuthenticated, subscribeAuthChanges } from "../lib/auth";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [, setAuthVersion] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        return subscribeAuthChanges(() => {
            setAuthVersion((value) => value + 1);
        });
    }, []);

    const isLoggedIn = isAuthenticated();
    const role = getUserRole();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <div>
            <nav className="flex gap-3 p-4 border-b">

                <Link to="/">Home</Link>

                {isLoggedIn && (
                    <Link to="/restaurants">Restaurants</Link>
                )}

                {role === 'Admin' && (
                    <>
                        <Link to="/admin">Dashboard</Link>
                        <Link to="/admin/restaurants">Restaurants</Link>
                        <Link to="/admin/reservations">Reservations</Link>
                        <Link to="/admin/menu">Menu</Link>
                    </>
                )}

                {!isLoggedIn ? (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                ) : (
                    <button onClick={handleLogout} className="btn-primary">
                        Logout
                    </button>
                )}

            </nav>

            <main className="p-4">{children}</main>
        </div>
    );
}
