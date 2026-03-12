import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createReservation } from "../lib/api";

export default function CreateReservationPage() {
    const { id } = useParams();
    const restaurantId = Number(id);

    const navigate = useNavigate();

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [numberOfPeople, setNumberOfPeople] = useState(2);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!restaurantId || Number.isNaN(restaurantId)) {
            setError("Invalid restaurant.");
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

            setSuccess(message || "Reservation created successfully.");

            setTimeout(() => {
                navigate("/reservations/my");
            }, 1200);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create reservation.");
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
                ? Back to restaurant
            </Link>

            <div className="app-card p-6 md:p-8">
                <h1 className="text-2xl font-black text-brand-dark">
                    Reserve a Table
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Select your preferred date, time, and number of guests.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 grid gap-5 sm:grid-cols-2"
                >
                    {/* Date */}
                    <div>
                        <label className="label">Date</label>
                        <input
                            type="date"
                            className="input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="label">Time</label>
                        <input
                            type="time"
                            className="input"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </div>

                    {/* Number of people */}
                    <div className="sm:col-span-2">
                        <label className="label">Number of Guests</label>

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

                    {/* Messages */}
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

                    {/* Submit */}
                    <div className="sm:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Creating reservation..." : "Reserve Table"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}