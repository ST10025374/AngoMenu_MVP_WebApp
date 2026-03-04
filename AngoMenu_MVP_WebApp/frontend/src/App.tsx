import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import { clearToken, getToken } from "./lib/auth";
import { getUserRole } from "./lib/jwt";

function Home() {
    const token = getToken();
    const role = getUserRole(token);

    return (
        <main style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
            <h1>AngoMenu Frontend</h1>
            <p>Status: {token ? "Logged in" : "Not logged in"}</p>
            <p>Role: {role ?? "N/A"}</p>

            {token && (
                <button
                    onClick={() => {
                        clearToken();
                        window.location.reload();
                    }}
                >
                    Logout
                </button>
            )}
        </main>
    );
}

function ClientDashboard() {
    return <h2 style={{ textAlign: "center" }}>Client Area</h2>;
}

function AdminDashboard() {
    return <h2 style={{ textAlign: "center" }}>Admin Area</h2>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* authenticated */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                </Route>

                {/* client only */}
                <Route element={<RoleRoute allowed={["Client"]} />}>
                    <Route path="/client" element={<ClientDashboard />} />
                </Route>

                {/* admin only */}
                <Route element={<RoleRoute allowed={["Admin"]} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}