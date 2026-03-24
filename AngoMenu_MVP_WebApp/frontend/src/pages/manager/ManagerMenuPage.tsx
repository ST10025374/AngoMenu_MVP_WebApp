import { useEffect, useState } from "react";
import {
    createManagerMenuItem,
    deleteManagerMenuItem,
    getManagerMenu,
    updateManagerMenuItem,
    type MenuItem,
    type MenuItemUpsertPayload,
} from "../../lib/api";
import { formatKwanza } from "../../lib/currency";

const defaultForm: MenuItemUpsertPayload = {
    name: "",
    description: "",
    price: 0,
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
                <input className="input" type="number" min={0} placeholder="Preço" required value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))} />
                <input className="input md:col-span-2" placeholder="Descrição" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
                <button className="btn-primary md:col-span-2" disabled={saving}>{saving ? "A guardar..." : editingId ? "Editar Prato" : "Adicionar Prato"}</button>
            </form>

            {loading ? (
                <p className="text-sm text-slate-600">A carregar menu...</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-slate-600">Nenhum prato disponível.</p>
            ) : (
                <div className="app-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left">Prato</th>
                                <th className="p-3 text-left">Preço</th>
                                <th className="p-3 text-left">Descrição</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="p-3">{item.name}</td>
                                    <td className="p-3">{formatKwanza(item.price)}</td>
                                    <td className="p-3">{item.description}</td>
                                    <td className="space-x-3 p-3 text-right">
                                        <button type="button" className="text-brand-red hover:underline" onClick={() => { setEditingId(item.id); setForm({ name: item.name, price: item.price, description: item.description ?? "" }); }}>Editar</button>
                                        <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(item.id)}>Eliminar</button>
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