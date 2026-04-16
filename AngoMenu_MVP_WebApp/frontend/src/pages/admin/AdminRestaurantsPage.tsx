import { useEffect, useMemo, useState } from "react";
import {
    createRestaurant,
    deleteRestaurant,
    getAllRestaurantsAdmin,
    updateRestaurant,
    type AdminRestaurant,
    type RestaurantUpsertPayload,
} from "../../lib/api";

import { isAdmin } from "../../lib/auth";
import RestaurantForm, { type RestaurantFormValues } from "../../pages/admin/RestaurantForm";
import RestaurantModal from "../../pages/admin/RestaurantModal";
import RestaurantTable from "../../pages/admin/RestaurantTable";

const defaultRestaurantForm: RestaurantFormValues = {
    name: "",
    description: "",
    location: "",
    googleMapsUrl: "",
    city: "",
    province: "",
    municipality: "",
    neighborhood: "",
    streetName: "",
    phone: "",
    openingHour: "08:00",
    closingHour: "22:00",
    managerId: null,
    managerName: null,
    managerEmail: null,
    createManager: false,
    managerFirstName: "",
    managerLastName: "",
    managerAccountEmail: "",
    managerPassword: "",
    managerConfirmPassword: "",
};


export default function AdminRestaurantsPage() {
    const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState<AdminRestaurant | null>(null);
    const [formValues, setFormValues] = useState<RestaurantFormValues>(defaultRestaurantForm);

    const modalTitle = useMemo(
        () => (editingRestaurant ? "Editar Restaurante" : "Criar Restaurante"),
        [editingRestaurant],
    );

    if (!isAdmin()) {
        return <p className="text-sm text-red-600">Não autorizado</p>
    }

    async function loadRestaurants() {
        setLoading(true);
        setError("");

        try {
            const data = await getAllRestaurantsAdmin();
            setRestaurants(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao carregar restaurantes");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRestaurants();
    }, []);

    function openCreateModal() {
        setEditingRestaurant(null);
        setFormValues(defaultRestaurantForm);
        setSuccess("");
        setError("");
        setIsModalOpen(true);
    }

    function openEditModal(restaurant: AdminRestaurant) {
        setEditingRestaurant(restaurant);
        setFormValues({
            ...defaultRestaurantForm,
            name: restaurant.name,
            description: restaurant.description ?? "",
            location: restaurant.location,
            googleMapsUrl: restaurant.googleMapsUrl ?? "",
            city: restaurant.city,
            province: restaurant.province,
            municipality: restaurant.municipality,
            neighborhood: restaurant.neighborhood,
            streetName: restaurant.streetName,
            phone: restaurant.phone,
            openingHour: restaurant.openingHour,
            closingHour: restaurant.closingHour,
            managerId: restaurant.managerId ?? null,
            managerName: restaurant.managerName ?? null,
            managerEmail: restaurant.managerEmail ?? null,
        });
        setSuccess("");
        setError("");
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingRestaurant(null);
        setFormValues(defaultRestaurantForm);
    }

    function handleFieldChange(field: keyof RestaurantFormValues, value: string) {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    }

    function handleToggleManager(value: boolean) {
        setFormValues((prev) => ({
            ...prev,
            createManager: value,
            managerFirstName: value ? prev.managerFirstName : "",
            managerLastName: value ? prev.managerLastName : "",
            managerAccountEmail: value ? prev.managerAccountEmail : "",
            managerPassword: value ? prev.managerPassword : "",
            managerConfirmPassword: value ? prev.managerConfirmPassword : "",
        }));
    }

    function buildPayload(values: RestaurantFormValues): RestaurantUpsertPayload {
        const payload: RestaurantUpsertPayload = {
            name: values.name,
            description: values.description ?? "",
            location: values.location,
            googleMapsUrl: values.googleMapsUrl ?? "",
            city: values.city,
            province: values.province,
            municipality: values.municipality,
            neighborhood: values.neighborhood,
            streetName: values.streetName,
            phone: values.phone,
            openingHour: values.openingHour,
            closingHour: values.closingHour,
        };

        if (!editingRestaurant && values.createManager) {
            payload.manager = {
                firstName: values.managerFirstName,
                lastName: values.managerLastName,
                email: values.managerAccountEmail,
                password: values.managerPassword,
            };
        }

        return payload;
    }


    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!editingRestaurant && formValues.createManager && formValues.managerPassword !== formValues.managerConfirmPassword) {
            setError("A confirmação da palavra-passe do gestor não coincide.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload = buildPayload(formValues);

            if (editingRestaurant) {
                await updateRestaurant(editingRestaurant.id, payload);
                setSuccess("Restaurante atualizado com sucesso.");
            } else {
                await createRestaurant(payload);
                setSuccess("Restaurante criado com sucesso.");
            }

            closeModal();
            await loadRestaurants();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao guardar restaurante.");
        } finally {
            setSaving(false);
        }
    }
  
    async function handleDelete(restaurant: AdminRestaurant) {
        if (!confirm(`Eliminar restaurante \"${restaurant.name}\"?`)) {
            return;
        }

        setSuccess("");
        setError("");

        try {
            await deleteRestaurant(restaurant.id);
            setSuccess("Restaurante eliminado com sucesso.");
            await loadRestaurants();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao eliminar restaurante.");
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-black text-brand-dark">Gerir Restaurantes</h1>
                <button type="button" className="btn-primary" onClick={openCreateModal}>
                    Criar Restaurante
                </button>
            </div>
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

            {loading ? (
                <div className="app-card p-6">
                    <p className="text-sm text-slate-500">A carregar restaurantes...</p>
                </div>
            ) : restaurants.length === 0 ? (
                <div className="app-card p-6 text-center">
                        <p className="text-sm text-slate-600">Nenhum restaurante encontrado. Crie o primeiro.</p>
                </div>
            ) : (
                <RestaurantTable restaurants={restaurants} onEdit={openEditModal} onDelete={handleDelete} />
            )}

            <RestaurantModal title={modalTitle} isOpen={isModalOpen} onClose={closeModal}>
                <RestaurantForm
                    values={formValues}
                    loading={saving}
                    submitLabel={editingRestaurant ? "Atualizar Restaurante" : "Criar Restaurante"}
                    isEditMode={Boolean(editingRestaurant)}
                    onChange={handleFieldChange}
                    onToggleManager={handleToggleManager}
                    onSubmit={handleSubmit}
                    onCancel={closeModal}
                />
            </RestaurantModal>
        </section>
    );
}