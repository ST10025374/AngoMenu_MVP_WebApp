import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getMyReservations,
    cancelReservation,
    type UserReservation
} from "../lib/api";

export default function MyReservationsPage() {
    const [reservations, setReservations] = useState<UserReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadReservations() {
        setLoading(true);
        setError("");

        try {
            const data = await getMyReservations();
            setReservations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load reservations");
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(reservationId: number) {
        if (!confirm("Cancel this reservation?")) return;

        try {
            await cancelReservation(reservationId);

            setReservations((prev) =>
                prev.map((r) =>
                    r.id === reservationId ? { ...r, status: "Cancelled" } : r
                )
            );
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to cancel reservation");
        }
    }

    useEffect(() => {
        loadReservations();
    }, []);

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-brand-dark">
                    My Reservations
                </h1>

                <Link to="/restaurants" className="btn-secondary">
                    Browse Restaurants
                </Link>
            </div>

            {loading && (
                <div className="app-card p-6">
                    <p className="text-sm text-slate-500">
                        Loading reservations...
                    </p>
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && reservations.length === 0 && (
                <div className="app-card p-8 text-center">
                    <h2 className="text-lg font-bold text-brand-dark">
                        No reservations yet
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Start exploring restaurants and reserve your table.
                    </p>

                    <Link to="/restaurants" className="btn-primary mt-4">
                        Find Restaurants
                    </Link>
                </div>
            )}

            {!loading && reservations.length > 0 && (
                <ul className="grid gap-5">
                    {reservations.map((r) => (
                        <li
                            key={r.id}
                            className="app-card p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                        >
                            <div>
                                <h2 className="text-lg font-bold text-brand-dark">
                                    {r.restaurantName}
                                </h2>

                                <p className="text-sm text-slate-600">
                                    {r.date} at {r.time}
                                </p>

                                <p className="text-sm text-slate-600">
                                    Guests: {r.numberOfPeople}
                                </p>

                                <p className="mt-1 text-sm font-semibold">
                                    Status:{" "}
                                    <span
                                        className={
                                            r.status === "Cancelled"
                                                ? "text-red-600"
                                                : "text-emerald-600"
                                        }
                                    >
                                        {r.status}
                                    </span>
                                </p>
                            </div>

                            {r.status !== "Cancelled" && (
                                <button
                                    onClick={() => handleCancel(r.id)}
                                    className="btn-secondary"
                                >
                                    Cancel Reservation
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}