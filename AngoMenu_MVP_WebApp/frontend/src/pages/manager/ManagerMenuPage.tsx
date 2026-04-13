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
    isAvailable: true,
    imageFile: null,
};

export default function ManagerMenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [form, setForm] = useState<MenuItemUpsertPayload>(defaultForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
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

    const isEditMode = editingId !== null;

    function switchToAddMode() {
        setEditingId(null);
        setEditingImageUrl(null);
        setForm(defaultForm);
    }

    function startEdit(item: MenuItem) {
        setEditingId(item.id);
        setEditingImageUrl(getImageUrl(item.imageUrl));
        setForm({
            name: item.name,
            price: item.price,
            description: item.description ?? "",
            category: item.category,
            isAvailable: item.isAvailable,
            imageFile: null,
            removeImage: false,
        });
    }

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

            switchToAddMode();
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
                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                    <p className={`text-sm font-semibold ${isEditMode ? "text-amber-700" : "text-emerald-700"}`}>
                        {isEditMode ? "Modo de ediÃ§Ã£o" : "Modo de adiÃ§Ã£o"}
                    </p>
                    <div className="flex gap-2">
                        {isEditMode && (
                            <>
                                <button type="button" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={switchToAddMode}>
                                    Cancelar
                                </button>
                                <button type="button" className="rounded-xl border border-brand-red px-4 py-2 text-sm font-semibold text-brand-red hover:bg-red-50" onClick={switchToAddMode}>
                                    Adicionar novo item
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <input className="input" placeholder="Nome do prato" required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
                <input className="input" type="number" min={0.01} step="0.01" placeholder="PreÃ§o" required value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))} />
                <select className="input" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as MenuItemUpsertPayload["category"] }))}>
                    {MENU_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{getMenuCategoryLabel(category)}</option>
                    ))}
                </select>
                <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] ?? null, removeImage: false }))}
                />
                <label className="md:col-span-2 inline-flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-semibold text-slate-700">Disponibilidade do prato</span>
                    <span className="inline-flex items-center gap-2">
                        <span className={`${form.isAvailable ? "text-emerald-700" : "text-amber-700"} font-semibold`}>
                            {form.isAvailable ? "DisponÃ­vel" : "IndisponÃ­vel no momento"}
                        </span>
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={form.isAvailable}
                            onChange={(event) => setForm((prev) => ({ ...prev, isAvailable: event.target.checked }))}
                        />
                    </span>
                </label>
                {isEditMode && editingImageUrl && (
                    <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Imagem atual</p>
                        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
                            <img src={editingImageUrl} alt="Imagem atual do prato" className="h-24 w-full rounded-lg object-cover md:w-40" />
                            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={Boolean(form.removeImage)}
                                    onChange={(event) => setForm((prev) => ({ ...prev, removeImage: event.target.checked }))}
                                />
                                Remover imagem atual
                            </label>
                        </div>
                    </div>
                )}
                <input className="input md:col-span-2" placeholder="DescriÃ§Ã£o" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
                <button className="btn-primary md:col-span-2" disabled={saving}>{saving ? "A guardar..." : isEditMode ? "Atualizar prato" : "Adicionar prato"}</button>
            </form>

            {loading ? (
                <p className="text-sm text-slate-600">A carregar menu...</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-slate-600">Nenhum prato disponÃ­vel.</p>
            ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="app-card flex flex-col gap-4 p-4 md:flex-row md:items-center">
                                    {getImageUrl(item.imageUrl) && <img src={getImageUrl(item.imageUrl) ?? ""} alt={item.name} className="h-20 w-full rounded-lg object-cover md:w-28" />}
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{getMenuCategoryLabel(item.category)}</p>
                                        <p className="font-semibold text-brand-dark">{item.name}</p>
                                        <p className="text-sm text-slate-600">{item.description}</p>
                                        <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${item.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                            {item.isAvailable ? "DisponÃ­vel" : "IndisponÃ­vel no momento"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 md:flex-col md:items-end">
                                        <p className="font-semibold text-brand-red">{formatKwanza(item.price)}</p>
                                        <div className="space-x-3 text-sm">
                                            <button type="button" className="text-brand-red hover:underline" onClick={() => startEdit(item)}>Editar</button>
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