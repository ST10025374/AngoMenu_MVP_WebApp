import { useEffect, useState } from "react";
import {
    getAllRestaurantsAdmin,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    type AdminRestaurant
} from "../../lib/api";

import { isAdmin } from "../../lib/auth";



export default function AdminRestaurantsPage() {
    const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState<Omit<AdminRestaurant, "id">>({
        name: "",
        description: "",
        location: "",
        phone: "",
        openingHour: "08:00",
        closingHour: "22:00"
    });

    const [editingId, setEditingId] = useState<number | null>(null);

    if (!isAdmin()) {
        return <p>Unauthorized</p>;
    }

    async function load() {
        const data = await getAllRestaurantsAdmin();
        setRestaurants(data);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            if (editingId) {
                await updateRestaurant(editingId, form);
            } else {
                await createRestaurant(form);
            }

            setForm({
                name: "",
                description: "",
                location: "",
                phone: "",
                openingHour: "08:00",
                closingHour: "22:00"
            });

            setEditingId(null);
            load();
        } catch (err) {
            alert("Error saving restaurant");
        }
    }

    function handleEdit(r: AdminRestaurant) {
        setForm(r);
        setEditingId(r.id);
    }

    async function handleDelete(id: number) {
        if (!confirm("Delete this restaurant?")) return;

        await deleteRestaurant(id);
        load();
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">
                Admin - Restaurants
            </h1>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="app-card p-6 grid gap-4 md:grid-cols-2">
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="input" required />
                <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="input" required />
                <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="input" required />

                <input name="openingHour" type="time" value={form.openingHour} onChange={handleChange} className="input" required />
                <input name="closingHour" type="time" value={form.closingHour} onChange={handleChange} className="input" required />

                <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="input md:col-span-2" />

                <button className="btn-primary md:col-span-2">
                    {editingId ? "Update Restaurant" : "Create Restaurant"}
                </button>
            </form>

            {/* LIST */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="app-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Location</th>
                                <th className="p-3 text-left">Hours</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {restaurants.map(r => (
                                <tr key={r.id} className="border-t">
                                    <td className="p-3 font-semibold text-brand-dark">{r.name}</td>
                                    <td className="p-3">{r.location}</td>
                                    <td className="p-3">{r.openingHour} - {r.closingHour}</td>

                                    <td className="p-3 text-right space-x-3">
                                        <button
                                            onClick={() => handleEdit(r)}
                                            className="text-brand-red hover:underline"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(r.id)}
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
            )}
        </section>
    );
}