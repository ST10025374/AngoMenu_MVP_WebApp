import { useEffect, useState } from "react";
import {
    getMenuByRestaurantAdmin,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getAllRestaurantsAdmin,
    type AdminMenuItem,
    type AdminRestaurant
} from "../../lib/api";
import { isAdmin } from "../../lib/auth";
import { formatKwanza } from "../../lib/currency";

const defaultForm: Omit<AdminMenuItem, "id"> = {
    restaurantId: 0,
    name: "",
    description: "",
    price: 0,
};

export default function AdminMenuPage() {
    const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

    const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState<Omit<AdminMenuItem, "id">>(defaultForm);
    const [editingId, setEditingId] = useState<number | null>(null);

    if (!isAdmin()) {
        return < p className = "text-sm text-red-600" > Unauthorized</p >;
    }

    useEffect(() => {
        async function loadRestaurants() {
            try {
                const data = await getAllRestaurantsAdmin();
                setRestaurants(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load restaurants");
            }
        }

        void loadRestaurants();
    }, []);

    async function loadMenu(restaurantId: number) {
        try {
            setLoading(true);
            setError("");

            const data = await getMenuByRestaurantAdmin(restaurantId);
            setMenuItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load menu");
        } finally {
            setLoading(false);
        }
    }

    function handleSelectRestaurant(id: number) {
        setSelectedRestaurant(id);
        setSuccess("");
        setError("");

        setForm({
            ...defaultForm,
            restaurantId: id,
        });

        setEditingId(null);
        void loadMenu(id);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;

        if (name === "price") {
            const digitsOnly = value.replace(/\D/g, "");

            setForm((prev) => ({
                ...prev,
                price: digitsOnly === "" ? 0 : parseInt(digitsOnly, 10),
            }));

            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handlePriceKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        const allowedKeys = new Set([
            "Backspace",
            "Delete",
            "Tab",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
        ]);

        if (allowedKeys.has(e.key) || (e.ctrlKey || e.metaKey)) return;

        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedRestaurant) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            if (editingId) {
                await updateMenuItem(editingId, form);
                setSuccess("Menu item updated successfully.");
            } else {
                await createMenuItem(form);
                setSuccess("Menu item created successfully.");
            }

            setForm({
                ...defaultForm,
                restaurantId: selectedRestaurant,
            });

            setEditingId(null);
            await loadMenu(selectedRestaurant);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error saving menu item");
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(item: AdminMenuItem) {
        setForm({
            restaurantId: item.restaurantId,
            name: item.name,
            description: item.description,
            price: item.price,
        });

        setEditingId(item.id);
    }

    async function handleDelete(id: number) {
        if (!selectedRestaurant) return;
        if (!confirm("Delete this item?")) return;

        setError("");
        setSuccess("");

        try {
            await deleteMenuItem(id);
            loadMenu(selectedRestaurant);
        } catch {
            alert("Error deleting item");
        }
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">
                Manage Menu
            </h1>

            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="app-card p-4">
                <label className="label">Select Restaurant</label>
                <select
                    className="input"
                    value={selectedRestaurant ?? ""}
                    onChange={(e) => handleSelectRestaurant(Number(e.target.value))}
                >
                    <option value="">Select...</option>
                    {restaurants.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>
                            {restaurant.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedRestaurant && (
                <form onSubmit={handleSubmit} className="app-card grid gap-4 p-6 md:grid-cols-2">
                    <input
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        className="input"
                        required
                    />

                    <input
                        name="price"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Price (AOA)"
                        value={form.price}
                        onChange={handleChange}
                        onKeyDown={handlePriceKeyDown}
                        className="input"
                        required
                    />

                    <input
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                        className="input md:col-span-2"
                    />

                    <button className="btn-primary md:col-span-2" disabled={saving}>
                        {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
                    </button>
                </form>
            )}

            {selectedRestaurant && (
                loading ? (
                    <div className="app-card p-6">
                        <p className="text-sm text-slate-500">Loading menu items...</p>
                    </div>
                ) : menuItems.length === 0 ? (
                    <div className="app-card p-6 text-center text-sm text-slate-600">No menu items found for this restaurant.</div>
                ) : (
                    <div className="app-card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Price</th>
                                    <th className="p-3 text-left">Description</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {menuItems.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-3 font-semibold text-brand-dark">{item.name}</td>
                                        <td className="p-3">{formatKwanza(item.price)}</td>
                                        <td className="p-3">{item.description}</td>

                                        <td className="space-x-3 p-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(item)}
                                                className="text-brand-red hover:underline"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
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
                )
            )}
        </section>
    );
}