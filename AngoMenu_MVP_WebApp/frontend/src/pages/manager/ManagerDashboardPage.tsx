import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getImageUrl, getManagerRestaurant, type Restaurant } from "../../lib/api";


export default function ManagerDashboardPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadManagerRestaurant() {
            setLoading(true);
            setError("");

            try {
                const data = await getManagerRestaurant();
                setRestaurant(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Falha ao carregar o restaurante do gestor.");
            } finally {
                setLoading(false);
            }
        }

        void loadManagerRestaurant();
    }, []);

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">Painel de Gestor</h1>
            <p className="text-sm text-slate-600">Gerir apenas o restaurante associado à sua conta.</p>

            <div className="grid gap-4 md:grid-cols-2">
                <Link to="/manager/menu" className="app-card block p-5 hover:border-brand-red">
                    <h2 className="text-lg font-bold text-brand-dark">Gerir Menu</h2>
                    <p className="mt-2 text-sm text-slate-600">Adicionar, editar e remover pratos.</p>
                </Link>
                <Link to="/manager/reservations" className="app-card block p-5 hover:border-brand-red">
                    <h2 className="text-lg font-bold text-brand-dark">Ver Reservas</h2>
                    <p className="mt-2 text-sm text-slate-600">Consultar e atualizar o estado das reservas.</p>
                </Link>
            </div>
            <section className="app-card space-y-4 p-6">
                <h2 className="text-xl font-black text-brand-dark">Restaurante do Gestor</h2>

                {loading && <p className="text-sm text-slate-600">A carregar restaurante...</p>}
                {!loading && error && <p className="text-sm text-red-600">{error}</p>}

                {!loading && !error && restaurant && (
                    <div className="space-y-4">
                        {getImageUrl(restaurant.imageUrl) && (
                            <img
                                src={getImageUrl(restaurant.imageUrl) ?? ""}
                                alt={restaurant.name}
                                className="h-52 w-full rounded-xl object-cover"
                            />
                        )}

                        <div>
                            <h3 className="text-lg font-bold text-brand-dark">{restaurant.name}</h3>
                            {restaurant.description && (
                                <p className="mt-2 text-sm text-slate-700">{restaurant.description}</p>
                            )}
                            <p className="mt-2 text-sm text-slate-600">Localização: {restaurant.location}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link to="/manager/restaurant" className="btn-secondary">
                                Editar Restaurante
                            </Link>
                            <Link to={`/restaurants/${restaurant.id}/reserve`} className="btn-primary">
                                Fazer Reserva
                            </Link>
                        </div>
                    </div>
                )}
            </section>
        </section>
    );
}