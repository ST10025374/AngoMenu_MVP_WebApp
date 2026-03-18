import { useEffect, useState } from "react";
import {
    getAllReservations,
    updateReservationStatus,
    deleteReservation,
    type AdminReservation,
    type ReservationStatus,
} from "../../lib/api";

import { isAdmin } from "../../lib/auth";

const statuses: ReservationStatus[] = ["Pending", "Confirmed", "Cancelled"];

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<AdminReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!isAdmin()) {
        return <p className="text-sm text-red-600">Unauthorized</p>;
    }

    async function load() {
        setLoading(true);
        setError("");

        try {
            const data = await getAllReservations();
            setReservations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load reservations");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleStatusChange(id: number, status: ReservationStatus) {
        setError("");
        setSuccess("");

        try {
            await updateReservationStatus(id, status);
            setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
            setSuccess(`Reservation #${id} updated to ${status}.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update status");
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Delete this reservation?")) return;

        setError("");
        setSuccess("");

        try {
            await deleteReservation(id);
            setReservations((prev) => prev.filter((item) => item.id !== id));
            setSuccess(`Reservation #${id} deleted.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete reservation");
        }
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">Manage Reservations</h1>

            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {loading && (
                <div className="app-card p-6">
                    <p className="text-sm text-slate-500">Loading reservations...</p>
                </div>
            )}

            {!loading && reservations.length === 0 && (
                <div className="app-card p-6 text-center">
                    <p className="text-sm text-slate-600">No reservations found.</p>
                </div>
            )}

            {!loading && reservations.length > 0 && (
                <div className="app-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left">User</th>
                                <th className="p-3 text-left">Restaurant</th>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Guests</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {reservations.map((reservation) => (
                                <tr key={reservation.id} className="border-t">
                                    <td className="p-3 font-semibold text-brand-dark">{reservation.userEmail}</td>
                                    <td className="p-3">{reservation.restaurant}</td>
                                    <td className="p-3">{reservation.date}</td>
                                    <td className="p-3">{reservation.numberOfPeople}</td>

                                    <td className="p-3">
                                        <select
                                            value={reservation.status}
                                            onChange={(event) =>
                                                handleStatusChange(reservation.id, event.target.value as ReservationStatus)
                                            }
                                            className="input"
                                        >
                                            {statuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="p-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(reservation.id)}
                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}