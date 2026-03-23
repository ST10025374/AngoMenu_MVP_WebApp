import { useEffect, useState } from 'react';
import { getAllReservations, getAllRestaurantsAdmin } from '../../lib/api';
import { isAdmin } from '../../lib/auth';

export default function AdminDashboardPage() {
    const [restaurants, setRestaurants] = useState(0);
    const [reservations, setReservations] = useState(0);
    const [pending, setPending] = useState(0);
    const [error, setError] = useState("");

    // ?? EXTRA SAFETY (frontend)
    if (!isAdmin()) {
        return <p>Não autorizado</p>;
    }

    useEffect(() => {
        async function load() {
            try {
                // ? USE ADMIN ENDPOINT
                const r = await getAllRestaurantsAdmin();
                const res = await getAllReservations();

                setRestaurants(r.length);
                setReservations(res.length);
                setPending(res.filter(x => x.status === 'Pending').length);
            } catch (err) {
                console.error(err);
                setError("Falha ao carregar painel");
            }
        }

        load();
    }, []);

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">
                Painel de Administração
            </h1>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
                <div className="app-card p-5">
                    <p>Restaurantes</p>
                    <h2 className="text-xl font-bold">{restaurants}</h2>
                </div>

                <div className="app-card p-5">
                    <p>Reservas</p>
                    <h2 className="text-xl font-bold">{reservations}</h2>
                </div>

                <div className="app-card p-5">
                    <p>Pendentes</p>
                    <h2 className="text-xl font-bold text-brand-red">{pending}</h2>
                </div>
            </div>
        </section>
    );
}