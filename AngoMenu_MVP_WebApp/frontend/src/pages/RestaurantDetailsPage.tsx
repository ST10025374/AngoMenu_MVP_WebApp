import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    getImageUrl,
    getMenuByRestaurant,
    getRestaurantById,
    type MenuItem,
    type Restaurant,
} from '../lib/api';

export default function RestaurantDetailsPage() {
    const { id } = useParams();
    const restaurantId = Number(id);

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            if (!restaurantId || Number.isNaN(restaurantId)) {
                setError('Invalid restaurant id.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const [restaurantData, menuData] = await Promise.all([
                    getRestaurantById(restaurantId),
                    getMenuByRestaurant(restaurantId),
                ]);

                setRestaurant(restaurantData);
                setMenuItems(menuData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load restaurant details');
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, [restaurantId]);

    if (loading) {
        return (
            <div className="app-card p-6">
                <p className="text-sm text-slate-500">Loading restaurant details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="app-card p-6">
                <p className="text-sm text-slate-600">Restaurant not found.</p>
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red transition hover:text-red-700 hover:underline"
            >
                ? Back to restaurants
            </Link>

            <article className="app-card overflow-hidden">
                {getImageUrl(restaurant.imageUrl) && (
                    <img src={getImageUrl(restaurant.imageUrl) ?? ''} alt={restaurant.name} className="h-64 w-full object-cover" />
                )}

                <div className="border-b border-slate-200 bg-gradient-to-r from-brand-dark to-slate-900 p-6 text-white">
                    <h1 className="text-3xl font-black">{restaurant.name}</h1>
                    <p className="mt-2 max-w-3xl text-sm text-slate-200">
                        {restaurant.description ?? 'A premium destination for memorable meals and quality service.'}
                    </p>
                    <div className="mt-4">
                        <Link
                            to={`/restaurants/${restaurant.id}/reserve`}
                            className="btn-primary"
                        >
                            Reserve Table
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
                        <p className="mt-1 text-sm font-semibold text-brand-dark">{restaurant.location}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                        <p className="mt-1 text-sm font-semibold text-brand-dark">{restaurant.phone}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opening hour</p>
                        <p className="mt-1 text-sm font-semibold text-brand-dark">{restaurant.openingHour}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Closing hour</p>
                        <p className="mt-1 text-sm font-semibold text-brand-dark">{restaurant.closingHour}</p>
                    </div>
                </div>
            </article>

            <article className="app-card p-6">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-black text-brand-dark">Menu</h2>
                    <span className="rounded-full bg-brand-yellow/30 px-3 py-1 text-xs font-semibold text-brand-dark">
                        {menuItems.length} items
                    </span>
                </div>

                {menuItems.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                        No menu items available yet.
                    </div>
                ) : (
                    <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {menuItems.map((item) => (
                            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-base font-bold text-brand-dark">{item.name}</h3>
                                    <span className="rounded-full bg-brand-red/10 px-3 py-1 text-sm font-semibold text-brand-red">
                                        ${item.price.toFixed(2)}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-slate-600">
                                    {item.description ?? 'Chef-crafted menu item made with quality ingredients.'}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </article>
        </section>
    );
}