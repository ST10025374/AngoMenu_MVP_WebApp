import { useEffect, useMemo, useState } from "react";
import {
    createRestaurant,
    deleteRestaurant,
    getAllRestaurantsAdmin,
    updateRestaurant,
    type AdminRestaurant,
} from "../../lib/api";

import { isAdmin } from "../../lib/auth";
import RestaurantForm, { type RestaurantFormValues } from "../../pages/admin/RestaurantForm";
import RestaurantModal from "../../pages/admin/RestaurantModal";
import RestaurantTable from "../../pages/admin/RestaurantTable";

const defaultRestaurantForm: RestaurantFormValues = {
    name: "",
    description: "",
    location: "",
    phone: "",
    openingHour: "08:00",
    closingHour: "22:00",
    imageUrl: "",
    image: null,
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
        () => (editingRestaurant ? "Edit Restaurant" : "Create Restaurant"),
        [editingRestaurant],
    );

    if (!isAdmin()) {
        return <p className="text-sm text-red-600">Unauthorized</p>;
    }

    async function loadRestaurants() {
        setLoading(true);
        setError("");

        try {
            const data = await getAllRestaurantsAdmin();
            setRestaurants(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load restaurants");
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
            name: restaurant.name,
            description: restaurant.description ?? "",
            location: restaurant.location,
            phone: restaurant.phone,
            openingHour: restaurant.openingHour,
            closingHour: restaurant.closingHour,
            imageUrl: restaurant.imageUrl ?? "",
            image: null,
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

    function handleImageChange(file: File | null) {
        setFormValues((prev) => ({ ...prev, image: file }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            if (editingRestaurant) {
                await updateRestaurant(editingRestaurant.id, formValues);
                setSuccess("Restaurant updated successfully.");
            } else {
                await createRestaurant(formValues);
                setSuccess("Restaurant created successfully.");
            }

            closeModal();
            await loadRestaurants();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save restaurant.");
        } finally {
            setSaving(false);
        }
    }
  
    async function handleDelete(restaurant: AdminRestaurant) {
        if (!confirm(`Delete restaurant \"${restaurant.name}\"?`)) {
            return;
        }

        setSuccess("");
        setError("");

        try {
            await deleteRestaurant(restaurant.id);
            setSuccess("Restaurant deleted successfully.");
            await loadRestaurants();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete restaurant.");
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-black text-brand-dark">Manage Restaurants</h1>
                <button type="button" className="btn-primary" onClick={openCreateModal}>
                    Create Restaurant
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
                    <p className="text-sm text-slate-500">Loading restaurants...</p>
                </div>
            ) : restaurants.length === 0 ? (
                <div className="app-card p-6 text-center">
                    <p className="text-sm text-slate-600">No restaurants found. Create your first one.</p>
                </div>
            ) : (
                <RestaurantTable restaurants={restaurants} onEdit={openEditModal} onDelete={handleDelete} />
            )}

            <RestaurantModal title={modalTitle} isOpen={isModalOpen} onClose={closeModal}>
                <RestaurantForm
                    values={formValues}
                    loading={saving}
                    submitLabel={editingRestaurant ? "Update Restaurant" : "Create Restaurant"}
                    isEditMode={Boolean(editingRestaurant)}
                    onChange={handleFieldChange}
                    onImageChange={handleImageChange}
                    onSubmit={handleSubmit}
                    onCancel={closeModal}
                />
            </RestaurantModal>
        </section>
    );
}