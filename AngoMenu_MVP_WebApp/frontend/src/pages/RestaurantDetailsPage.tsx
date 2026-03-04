import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    getMenuByRestaurant,
    getRestaurantById,
    type MenuItem,
    type Restaurant,
} from "../lib/api";

export default function RestaurantDetailsPage() {
    const { id } = useParams();
    const restaurantId = Number(id);

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            if (!restaurantId || Number.isNaN(restaurantId)) {
                setError("Invalid restaurant id.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const [restaurantData, menuData] = await Promise.all([
                    getRestaurantById(restaurantId),
                    getMenuByRestaurant(restaurantId),
                ]);

                setRestaurant(restaurantData);
                setMenu(menuData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load restaurant details");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [restaurantId]);

    if (loading) return <p style={{ textAlign: "center", marginTop: 40 }}>Loading details...</p>;
    if (error) return <p style={{ textAlign: "center", marginTop: 40, color: "crimson" }}>{error}</p>;
    if (!restaurant) return <p style={{ textAlign: "center", marginTop: 40 }}>Restaurant not found.</p>;

    return (
        <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
            <Link to="/restaurants">? Back to restaurants</Link>

            <h1 style={{ marginTop: 12 }}>{restaurant.name}</h1>
            {restaurant.description && <p>{restaurant.description}</p>}

            <p><strong>Location:</strong> {restaurant.location}</p>
            <p><strong>Phone:</strong> {restaurant.phone}</p>
            <p>
                <strong>Hours:</strong> {restaurant.openingHour} - {restaurant.closingHour}
            </p>

            {restaurant.imageUrl && (
                <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    style={{ width: "100%", maxWidth: 500, borderRadius: 8, margin: "8px 0 20px" }}
                />
            )}

            <h2>Menu</h2>
            {menu.length === 0 ? (
                <p>No menu items found.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
                    {menu.map((item) => (
                        <li key={item.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <strong>{item.name}</strong>
                                <strong>${item.price.toFixed(2)}</strong>
                            </div>
                            {item.description && <p style={{ marginTop: 6 }}>{item.description}</p>}
                        </li>
                    ))}
                </ul>
            )}

            <div style={{ marginTop: 20 }}>
                <Link to={`/reservations/new?restaurantId=${restaurant.id}`}>
                    <button>Reserve Now</button>
                </Link>
            </div>
        </main>
    );
}