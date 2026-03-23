import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createReservation, getImageUrl, getRestaurantById, type Restaurant } from "../lib/api";

export default function CreateReservationPage() {
    const { id } = useParams();
    const restaurantId = Number(id);

    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [numberOfPeople, setNumberOfPeople] = useState(2);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadRestaurant() {
            if (!restaurantId || Number.isNaN(restaurantId)) {
                setError("Restaurante inválido.");
                return;
            }

            try {
                const data = await getRestaurantById(restaurantId);
                setRestaurant(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Falha ao carregar restaurante.");
            }
        }

        void loadRestaurant();
    }, [restaurantId]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!restaurantId || Number.isNaN(restaurantId)) {
            setError("Restaurante inválido.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const message = await createReservation({
                restaurantId,
                date,
                time,
                numberOfPeople,
            });

            setSuccess(message || "Reserva criada com sucesso.");

            setTimeout(() => {
                navigate("/reservations/my");
            }, 1200);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao criar reserva.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-6">
            <Link
                to={`/restaurants/${restaurantId}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:underline"
            >
                Voltar ao restaurant
            </Link>

            {restaurant && (
                <div className="app-card overflow-hidden p-0">
                    {getImageUrl(restaurant.imageUrl) && (
                        <img src={getImageUrl(restaurant.imageUrl) ?? ''} alt={restaurant.name} className="h-48 w-full object-cover" />
                    )}
                    <div className="p-6">
                        <h2 className="text-xl font-black text-brand-dark">{restaurant.name}</h2>
                        <p className="mt-1 text-sm text-slate-600">{restaurant.location}</p>
                    </div>
                </div>
            )}

            <div className="app-card p-6 md:p-8">
                <h1 className="text-2xl font-black text-brand-dark">
                    Reservar uma mesa
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Selecione a data, hora e número de pessoas pretendidos.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 grid gap-5 sm:grid-cols-2"
                >
                    <div>
                        <label className="label">Data</label>
                        <input
                            type="date"
                            className="input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Hora</label>
                        <input
                            type="time"
                            className="input"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="label">Número de pessoas</label>

                        <input
                            type="number"
                            min={1}
                            max={20}
                            className="input"
                            value={numberOfPeople}
                            onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                            required
                        />
                    </div>

                    {error && (
                        <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {success}
                        </div>
                    )}

                    <div className="sm:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? "A criar reserva..." : "Reservar mesa"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}