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
const statusLabels: Record<ReservationStatus, string> = {
    Pending: "Pendente",
    Confirmed: "Confirmada",
    Cancelled: "Cancelada",
};

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<AdminReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!isAdmin()) {
        return <p className="text-sm text-red-600">Não autorizado</p>
    }

    async function load() {
        setLoading(true);
        setError("");

        try {
            const data = await getAllReservations();
            setReservations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao carregar reservas");
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
            setSuccess(`Reserva #${id} atualizada para ${statusLabels[status]}.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao atualizar estado");
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Eliminar esta reserva?")) return;

        setError("");
        setSuccess("");

        try {
            await deleteReservation(id);
            setReservations((prev) => prev.filter((item) => item.id !== id));
            setSuccess(`Reserva #${id} eliminada.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao eliminar reserva");
        }
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">Gerir Reservas</h1>

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
                    <p className="text-sm text-slate-500">A carregar reservas...</p>
                </div>
            )}

            {!loading && reservations.length === 0 && (
                <div className="app-card p-6 text-center">
                    <p className="text-sm text-slate-600">Nenhuma reserva encontrada.</p>
                </div>
            )}

            {!loading && reservations.length > 0 && (
                <div className="app-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left">Utilizador</th>
                                <th className="p-3 text-left">Restaurante</th>
                                <th className="p-3 text-left">Data</th>
                                <th className="p-3 text-left">Pessoas</th>
                                <th className="p-3 text-left">Estado</th>
                                <th className="p-3 text-right">Ações</th>
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
                                                    {statusLabels[status]}
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
                                            Eliminar
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