import { useEffect, useState } from "react";
import {
    createManagerMenuItem,
    deleteManagerMenuItem,
    getImageUrl,
    getManagerMenu,
    updateManagerMenuItem,
    type MenuItem,
    type MenuItemUpsertPayload,
} from "../../lib/api";
import { formatKwanza } from "../../lib/currency";
import { getMenuCategoryLabel, MENU_CATEGORIES } from "../../lib/menuCategories";

const defaultForm: MenuItemUpsertPayload = {
    name: "",
    description: "",
    price: 0,
    category: "Other",
    imageFile: null,
};

export default function ManagerMenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [form, setForm] = useState<MenuItemUpsertPayload>(defaultForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function load() {
        setLoading(true);
        setError("");
        try {
            const data = await getManagerMenu();
            setItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao carregar menu.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            if (editingId) {
                await updateManagerMenuItem(editingId, form);
                setSuccess("Prato atualizado com sucesso.");
            } else {
                await createManagerMenuItem(form);
                setSuccess("Prato adicionado com sucesso.");
            }

            setForm(defaultForm);
            setEditingId(null);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao guardar prato.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Eliminar este prato?")) return;

        try {
            await deleteManagerMenuItem(id);
            setSuccess("Prato eliminado com sucesso.");
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao eliminar prato.");
        }
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">Gerir Menu</h1>
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="app-card grid gap-4 p-6 md:grid-cols-2">
                <input className="input" placeholder="Nome do prato" required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
                <input className="input" type="number" min={0.01} step="0.01" placeholder="Preço" required value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))} />
                <select className="input" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as MenuItemUpsertPayload["category"] }))}>
                    {MENU_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{getMenuCategoryLabel(category)}</option>
                    ))}
                </select>
                <input className="input" type="file" accept="image/*" onChange={(event) => setForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] ?? null }))} />
                <input className="input md:col-span-2" placeholder="Descrição" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
                <button className="btn-primary md:col-span-2" disabled={saving}>{saving ? "A guardar..." : editingId ? "Editar Prato" : "Adicionar Prato"}</button>
            </form>

            {loading ? (
                <p className="text-sm text-slate-600">A carregar menu...</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-slate-600">Nenhum prato disponível.</p>
            ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="app-card flex flex-col gap-4 p-4 md:flex-row md:items-center">
                                    {getImageUrl(item.imageUrl) && <img src={getImageUrl(item.imageUrl) ?? ""} alt={item.name} className="h-20 w-full rounded-lg object-cover md:w-28" />}
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{getMenuCategoryLabel(item.category)}</p>
                                        <p className="font-semibold text-brand-dark">{item.name}</p>
                                        <p className="text-sm text-slate-600">{item.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4 md:flex-col md:items-end">
                                        <p className="font-semibold text-brand-red">{formatKwanza(item.price)}</p>
                                        <div className="space-x-3 text-sm">
                                            <button type="button" className="text-brand-red hover:underline" onClick={() => { setEditingId(item.id); setForm({ name: item.name, price: item.price, description: item.description ?? "", category: item.category, imageFile: null }); }}>Editar</button>
                                            <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(item.id)}>Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                </div>
            )}
        </section>
    );
}