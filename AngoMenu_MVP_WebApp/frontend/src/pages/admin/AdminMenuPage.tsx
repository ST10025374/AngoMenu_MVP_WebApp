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

export default function AdminMenuPage() {
    const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

    const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<Omit<AdminMenuItem, "id">>({
        restaurantId: 0,
        name: "",
        description: "",
        price: 0
    });

    const [editingId, setEditingId] = useState<number | null>(null);

    // Load restaurants
    useEffect(() => {
        async function loadRestaurants() {
            const data = await getAllRestaurantsAdmin();
            setRestaurants(data);
        }
        loadRestaurants();
    }, []);

    // Load menu items
    async function loadMenu(restaurantId: number) {
        setLoading(true);
        const data = await getMenuByRestaurantAdmin(restaurantId);
        setMenuItems(data);
        setLoading(false);
    }

    function handleSelectRestaurant(id: number) {
        setSelectedRestaurant(id);
        setForm({ ...form, restaurantId: id });
        loadMenu(id);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            if (editingId) {
                await updateMenuItem(editingId, form);
            } else {
                await createMenuItem(form);
            }

            setForm({
                restaurantId: selectedRestaurant!,
                name: "",
                description: "",
                price: 0
            });

            setEditingId(null);
            loadMenu(selectedRestaurant!);
        } catch {
            alert("Error saving menu item");
        }
    }

    function handleEdit(item: AdminMenuItem) {
        setForm(item);
        setEditingId(item.id);
    }

    async function handleDelete(id: number) {
        if (!confirm("Delete this item?")) return;

        await deleteMenuItem(id);
        loadMenu(selectedRestaurant!);
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">
                Admin - Menu Management
            </h1>

            {/* Restaurant Selector */}
            <div className="app-card p-4">
                <label className="label">Select Restaurant</label>
                <select
                    className="input"
                    onChange={(e) => handleSelectRestaurant(Number(e.target.value))}
                >
                    <option value="">Select...</option>
                    {restaurants.map(r => (
                        <option key={r.id} value={r.id}>
                            {r.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Form */}
            {selectedRestaurant && (
                <form onSubmit={handleSubmit} className="app-card p-6 grid gap-4 md:grid-cols-2">
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="input" required />
                    <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} className="input" required />

                    <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="input md:col-span-2" />

                    <button className="btn-primary md:col-span-2">
                        {editingId ? "Update Item" : "Add Item"}
                    </button>
                </form>
            )}

            {/* List */}
            {selectedRestaurant && (
                loading ? (
                    <p>Loading...</p>
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
                                {menuItems.map(item => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-3 font-semibold text-brand-dark">{item.name}</td>
                                        <td className="p-3">${item.price}</td>
                                        <td className="p-3">{item.description}</td>

                                        <td className="p-3 text-right space-x-3">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-brand-red hover:underline"
                                            >
                                                Edit
                                            </button>

                                            <button
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