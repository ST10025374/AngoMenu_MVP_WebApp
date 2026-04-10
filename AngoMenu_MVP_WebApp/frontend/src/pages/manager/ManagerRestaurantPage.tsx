import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getManagerRestaurant, updateManagerRestaurant, type Restaurant, type RestaurantUpsertPayload } from "../../lib/api";

type FormState = RestaurantUpsertPayload;

function mapRestaurantToForm(restaurant: Restaurant): FormState {
    return {
        name: restaurant.name,
        description: restaurant.description ?? "",
        location: restaurant.location,
        city: restaurant.city,
        province: restaurant.province,
        municipality: restaurant.municipality,
        neighborhood: restaurant.neighborhood,
        streetName: restaurant.streetName,
        phone: restaurant.phone,
        openingHour: restaurant.openingHour,
        closingHour: restaurant.closingHour,
    };
}

export default function ManagerRestaurantPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [form, setForm] = useState<FormState | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function load() {
        setLoading(true);
        setError("");

        try {
            const data = await getManagerRestaurant();
            setRestaurant(data);
            setForm(mapRestaurantToForm(data));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao carregar restaurante.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const pageTitle = useMemo(() => restaurant?.name ?? "Meu Restaurante", [restaurant]);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!form) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await updateManagerRestaurant(form);
            setSuccess("Restaurante atualizado com sucesso.");
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao atualizar restaurante.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p className="text-sm text-slate-600">A carregar restaurante...</p>;
    }

    if (!form) {
        return <p className="text-sm text-red-600">Não foi possível carregar os dados do restaurante.</p>;
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-black text-brand-dark">{pageTitle}</h1>
                {restaurant && (
                    <Link to={`/manager/restaurants/${restaurant.id}/images`} className="btn-secondary">Gerir Imagens</Link>
                )}
            </div>

            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="app-card grid gap-4 p-6 md:grid-cols-2">
                <div><label className="label">Nome</label><input className="input" required value={form.name} onChange={(event) => setForm((prev) => prev ? { ...prev, name: event.target.value } : prev)} /></div>
                <div><label className="label">Localização</label><input className="input" required value={form.location} onChange={(event) => setForm((prev) => prev ? { ...prev, location: event.target.value } : prev)} /></div>
                <div><label className="label">Cidade</label><input className="input" required value={form.city} onChange={(event) => setForm((prev) => prev ? { ...prev, city: event.target.value } : prev)} /></div>
                <div><label className="label">Província</label><input className="input" required value={form.province} onChange={(event) => setForm((prev) => prev ? { ...prev, province: event.target.value } : prev)} /></div>
                <div><label className="label">Município</label><input className="input" required value={form.municipality} onChange={(event) => setForm((prev) => prev ? { ...prev, municipality: event.target.value } : prev)} /></div>
                <div><label className="label">Bairro</label><input className="input" required value={form.neighborhood} onChange={(event) => setForm((prev) => prev ? { ...prev, neighborhood: event.target.value } : prev)} /></div>
                <div><label className="label">Rua</label><input className="input" required value={form.streetName} onChange={(event) => setForm((prev) => prev ? { ...prev, streetName: event.target.value } : prev)} /></div>
                <div><label className="label">Telefone</label><input className="input" required value={form.phone} onChange={(event) => setForm((prev) => prev ? { ...prev, phone: event.target.value } : prev)} /></div>

                <div>
                    <label className="label">Hora de abertura</label>
                    <input className="input" type="time" value={form.openingHour} onChange={(event) => setForm((prev) => prev ? { ...prev, openingHour: event.target.value } : prev)} />
                </div>
                <div>
                    <label className="label">Hora de fecho</label>
                    <input className="input" type="time" value={form.closingHour} onChange={(event) => setForm((prev) => prev ? { ...prev, closingHour: event.target.value } : prev)} />
                </div>

                <div className="md:col-span-2">
                    <label className="label">Descrição</label>
                    <input className="input" value={form.description ?? ""} onChange={(event) => setForm((prev) => prev ? { ...prev, description: event.target.value } : prev)} />
                </div>

                <button className="btn-primary md:col-span-2" disabled={saving}>{saving ? "A guardar..." : "Atualizar Restaurante"}</button>
            </form>
        </section>
    );
}