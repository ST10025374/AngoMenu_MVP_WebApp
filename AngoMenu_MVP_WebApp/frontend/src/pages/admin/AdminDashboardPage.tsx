import { useEffect, useMemo, useState } from 'react';
import {
    deleteReservationAdmin,
    deleteRestaurant,
    getAllReservationsAdmin,
    getRestaurants,
    updateReservationStatus,
    type AdminReservation,
    type ReservationStatus,
    type Restaurant,
} from '../lib/api';

export default function AdminDashboardPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [reservations, setReservations] = useState<AdminReservation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function loadData() {
        setLoading(true);
        setError('');

        try {
            const [restaurantsResponse, reservationsResponse] = await Promise.all([
                getRestaurants({ pageNumber: 1, pageSize: 50 }),
                getAllReservationsAdmin(),
            ]);

            setRestaurants(restaurantsResponse.items);
            setReservations(reservationsResponse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load admin data');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadData();
    }, []);

    async function onDeleteRestaurant(id: number) {
        setError('');
        setSuccess('');
        try {
            const message = await deleteRestaurant(id);
            setSuccess(message || 'Restaurant deleted.');
            setRestaurants((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete restaurant');
        }
    }

    async function onUpdateReservationStatus(id: number, status: ReservationStatus) {
        setError('');
        setSuccess('');
        try {
            const message = await updateReservationStatus(id, status);
            setSuccess(message || 'Reservation updated.');
            setReservations((prev) =>
                prev.map((reservation) =>
                    reservation.id === id ? { ...reservation, status } : reservation,
                ),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update reservation');
        }
    }

    async function onDeleteReservation(id: number) {
        setError('');
        setSuccess('');
        try {
            const message = await deleteReservationAdmin(id);
            setSuccess(message || 'Reservation deleted.');
            setReservations((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete reservation');
        }
    }

    const pendingCount = useMemo(
        () => reservations.filter((reservation) => reservation.status === 'Pending').length,
        [reservations],
    );

    return (
        <section className="space-y-6">
            <header className="app-card p-5 sm:p-6">
                <h1 className="text-2xl font-black text-brand-dark sm:text-3xl">Admin Control Center</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Manage restaurants and reservations from one place.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase text-slate-500">Restaurants</p>
                        <p className="text-lg font-bold text-brand-dark">{restaurants.length}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase text-slate-500">Reservations</p>
                        <p className="text-lg font-bold text-brand-dark">{reservations.length}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase text-slate-500">Pending</p>
                        <p className="text-lg font-bold text-brand-red">{pendingCount}</p>
                    </div>
                </div>
            </header>

            {loading && (
                <div className="app-card p-5">
                    <p className="text-sm text-slate-500">Loading admin data...</p>
                </div>
            )}

            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {success}
                </p>
            )}

            <div className="grid gap-6 xl:grid-cols-2">
                <article className="app-card p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-brand-dark">Restaurants</h2>
                    <p className="mt-1 text-sm text-slate-500">Admin delete actions are enabled.</p>

                    <ul className="mt-4 space-y-3">
                        {restaurants.map((restaurant) => (
                            <li
                                key={restaurant.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                            >
                                <div>
                                    <p className="font-semibold text-brand-dark">{restaurant.name}</p>
                                    <p className="text-sm text-slate-500">{restaurant.location}</p>
                                </div>
                                <button
                                    className="btn-secondary"
                                    onClick={() => void onDeleteRestaurant(restaurant.id)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </article>

                <article className="app-card p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-brand-dark">Reservations</h2>
                    <p className="mt-1 text-sm text-slate-500">Confirm, cancel, or remove reservations.</p>

                    <ul className="mt-4 space-y-3">
                        {reservations.map((reservation) => (
                            <li key={reservation.id} className="rounded-xl border border-slate-200 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-brand-dark">
                                            {reservation.restaurant} · {reservation.userEmail}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {reservation.date} at {reservation.time} · {reservation.numberOfPeople} people
                                        </p>
                                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Status: {reservation.status}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            className="btn-secondary"
                                            onClick={() => void onUpdateReservationStatus(reservation.id, 'Confirmed')}
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => void onUpdateReservationStatus(reservation.id, 'Cancelled')}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => void onDeleteReservation(reservation.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </article>
            </div>
        </section>
    );
}