import { useEffect, useState } from "react";
import {
    getAllReservations,
    updateReservationStatus,
    deleteReservation,
    type AdminReservation
} from "../../lib/api";

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<AdminReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    async function handleStatusChange(id: number, status: string) {
        try {
            await updateReservationStatus(id, status);

            setReservations(prev =>
                prev.map(r => (r.id === id ? { ...r, status } : r))
            );
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update status");
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Delete this reservation?")) return;

        try {
            await deleteReservation(id);
            setReservations(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete reservation");
        }
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">
                Admin - Reservations
            </h1>

            {loading && (
                <div className="app-card p-6">
                    <p className="text-sm text-slate-500">Loading reservations...</p>
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
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
                                <th className="p-3 text-left">Time</th>
                                <th className="p-3 text-left">Guests</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {reservations.map(r => (
                                <tr key={r.id} className="border-t">
                                    <td className="p-3 font-semibold text-brand-dark">
                                        {r.userEmail}
                                    </td>

                                    <td className="p-3">{r.restaurant}</td>
                                    <td className="p-3">{r.date}</td>
                                    <td className="p-3">{r.time}</td>
                                    <td className="p-3">{r.numberOfPeople}</td>

                                    <td className="p-3">
                                        <select
                                            value={r.status}
                                            onChange={(e) =>
                                                handleStatusChange(r.id, e.target.value)
                                            }
                                            className="input"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>

                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            className="text-red-600 hover:underline"
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