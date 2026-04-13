import { useEffect, useState } from "react";
import {
    getMenuByRestaurantAdmin,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getAllRestaurantsAdmin,
    getImageUrl,
    type AdminMenuItem,
    type AdminRestaurant,
    type MenuItemUpsertPayload,
} from "../../lib/api";
import { isAdmin } from "../../lib/auth";
import { formatKwanza } from "../../lib/currency";
import { getMenuCategoryLabel, MENU_CATEGORIES } from "../../lib/menuCategories";

const defaultForm: MenuItemUpsertPayload = {
    name: "",
    description: "",
    price: 0,
    category: "Other",
    imageFile: null,
};

export default function AdminMenuPage() {
    const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

    const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState<MenuItemUpsertPayload>(defaultForm);
    const [editingId, setEditingId] = useState<number | null>(null);

    if (!isAdmin()) {
        return <p className="text-sm text-red-600">Não autorizado</p>;
    }

    useEffect(() => {
        async function loadRestaurants() {
            try {
                const data = await getAllRestaurantsAdmin();
                setRestaurants(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Falha ao carregar restaurantes");
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
            setError(err instanceof Error ? err.message : "Falha ao carregar menu");
        } finally {
            setLoading(false);
        }
    }

    function handleSelectRestaurant(id: number) {
        setSelectedRestaurant(id);
        setSuccess("");
        setError("");
        setForm(defaultForm);
        setEditingId(null);
        void loadMenu(id);
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
                setSuccess("Item do menu atualizado com sucesso.");
            } else {
                await createMenuItem({ ...form, restaurantId: selectedRestaurant });
                setSuccess("Item do menu criado com sucesso.");
            }

            setForm(defaultForm);

            setEditingId(null);
            await loadMenu(selectedRestaurant);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao guardar item do menu");
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(item: AdminMenuItem) {
        setForm({
            name: item.name,
            price: item.price,
            description: item.description ?? "",
            category: item.category,
            imageFile: null,
        });

        setEditingId(item.id);
    }

    async function handleDelete(id: number) {
        if (!selectedRestaurant) return;
        if (!confirm("Eliminar este item?")) return;

        setError("");
        setSuccess("");

        try {
            await deleteMenuItem(id);
            loadMenu(selectedRestaurant);
        } catch {
            alert("Erro ao eliminar item");
        }
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">Gerir Menu</h1>

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
                <label className="label">Selecionar Restaurante</label>
                <select
                    className="input"
                    value={selectedRestaurant ?? ""}
                    onChange={(e) => handleSelectRestaurant(Number(e.target.value))}
                >
                    <option value="">Selecionar...</option>
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
                        placeholder="Nome"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="input"
                        required
                    />

                    <input
                        name="price"
                        type="number"
                        min={0.01}
                        step="0.01"
                        placeholder="Preço (AOA)"
                        value={form.price}
                        onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                        className="input"
                        required
                    />

                    <select
                        className="input"
                        value={form.category}
                        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as MenuItemUpsertPayload["category"] }))}
                        required
                    >
                        {MENU_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {getMenuCategoryLabel(category)}
                            </option>
                        ))}
                    </select>

                    <input
                        type="file"
                        accept="image/*"
                        className="input"
                        onChange={(e) => setForm((prev) => ({ ...prev, imageFile: e.target.files?.[0] ?? null }))}
                    />

                    <input
                        name="description"
                        placeholder="Descrição"
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="input md:col-span-2"
                    />

                    <button className="btn-primary md:col-span-2" disabled={saving}>
                        {saving ? "A guardar..." : editingId ? "Atualizar Item" : "Adicionar Item"}
                    </button>
                </form>
            )}

            {selectedRestaurant && (
                loading ? (
                    <div className="app-card p-6">
                        <p className="text-sm text-slate-500">A carregar itens do menu...</p>
                    </div>
                ) : menuItems.length === 0 ? (
                        <div className="app-card p-6 text-center text-sm text-slate-600">Nenhum item de menu encontrado para este restaurante.</div>
                ) : (
                            <div className="space-y-3">
                                {menuItems.map((item) => (
                                    <div key={item.id} className="app-card flex flex-col gap-4 p-4 md:flex-row md:items-center">
                                        {getImageUrl(item.imageUrl) && (
                                            <img src={getImageUrl(item.imageUrl) ?? ""} alt={item.name} className="h-20 w-full rounded-lg object-cover md:w-28" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{getMenuCategoryLabel(item.category)}</p>
                                            <p className="font-semibold text-brand-dark">{item.name}</p>
                                            <p className="text-sm text-slate-600">{item.description}</p>
                                        </div>
                                        <div className="flex items-center gap-4 md:flex-col md:items-end">
                                            <p className="font-semibold text-brand-red">{formatKwanza(item.price)}</p>
                                            <div className="space-x-3 text-sm">
                                                <button type="button" onClick={() => handleEdit(item)} className="text-brand-red hover:underline">Editar</button>
                                                <button type="button" onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Eliminar</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                    </div>
                )
            )}
        </section>
    );
}