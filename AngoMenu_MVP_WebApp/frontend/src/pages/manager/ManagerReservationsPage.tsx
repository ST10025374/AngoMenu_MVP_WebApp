import { useEffect, useState } from "react";
import {
    getManagerReservations,
    updateManagerReservationStatus,
    type AdminReservation,
    type ReservationStatus,
} from "../../lib/api";
import { formatReservationTime24 } from "../../lib/time";

const statuses: ReservationStatus[] = ["Pending", "Confirmed", "Cancelled"];
const statusLabels: Record<ReservationStatus, string> = {
    Pending: "Pendente",
    Confirmed: "Confirmada",
    Cancelled: "Cancelada",
};

export default function ManagerReservationsPage() {
    const [reservations, setReservations] = useState<AdminReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function load() {
        setLoading(true);
        setError("");
        try {
            const data = await getManagerReservations();
            setReservations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao carregar reservas.");
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
            await updateManagerReservationStatus(id, status);
            setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
            setSuccess(`Reserva #${id} atualizada para ${statusLabels[status]}.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao atualizar estado da reserva.");
        }
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">Reservas</h1>
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {loading ? (
                <p className="text-sm text-slate-600">A carregar reservas...</p>
            ) : reservations.length === 0 ? (
                <p className="text-sm text-slate-600">Nenhuma reserva encontrada.</p>
            ) : (
                <div className="app-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left">Cliente</th>
                                <th className="p-3 text-left">Data</th>
                                <th className="p-3 text-left">Hora</th>
                                <th className="p-3 text-left">Pessoas</th>
                                <th className="p-3 text-left">Estado da Reserva</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((reservation) => (
                                <tr key={reservation.id} className="border-t">
                                    <td className="p-3">{reservation.userEmail}</td>
                                    <td className="p-3">{reservation.date}</td>
                                    <td className="p-3">{formatReservationTime24(reservation.time)}</td>
                                    <td className="p-3">{reservation.numberOfPeople}</td>
                                    <td className="p-3">
                                        <select
                                            className="input"
                                            value={reservation.status}
                                            onChange={(event) => handleStatusChange(reservation.id, event.target.value as ReservationStatus)}
                                        >
                                            {statuses.map((status) => (
                                                <option key={status} value={status}>{statusLabels[status]}</option>
                                            ))}
                                        </select>
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