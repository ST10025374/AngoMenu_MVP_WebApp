import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function Home() {
    const token = localStorage.getItem("auth_token");

    return (
        <main style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
            <h1>AngoMenu Frontend</h1>
            <p>Status: {token ? "Logged in" : "Not logged in"}</p>
            {token && (
                <button
                    onClick={() => {
                        localStorage.removeItem("auth_token");
                        window.location.reload();
                    }}
                >
                    Logout
                </button>
            )}
        </main>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}