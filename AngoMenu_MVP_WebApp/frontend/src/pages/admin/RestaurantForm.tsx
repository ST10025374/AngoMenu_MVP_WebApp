import { getImageUrl, type AdminRestaurant } from "../../lib/api";

export type RestaurantFormValues = Omit<AdminRestaurant, "id"> & {
    image?: File | null;
};

export default function RestaurantForm({
    values,
    loading,
    submitLabel,
    isEditMode = false,
    onChange,
    onImageChange,
    onSubmit,
    onCancel,
}: {
    values: RestaurantFormValues;
    loading: boolean;
    submitLabel: string;
    isEditMode?: boolean;
    onChange: (field: keyof RestaurantFormValues, value: string) => void;
    onImageChange: (file: File | null) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    }) {
    const previewUrl = getImageUrl(values.imageUrl ?? null);

    return (
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
                <label className="label" htmlFor="restaurant-name">Nome</label>
                <input
                    id="restaurant-name"
                    className="input"
                    required
                    value={values.name}
                    onChange={(event) => onChange("name", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-location">Localização</label>
                <input
                    id="restaurant-location"
                    className="input"
                    required
                    value={values.location}
                    onChange={(event) => onChange("location", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-phone">Telefone</label>
                <input
                    id="restaurant-phone"
                    className="input"
                    required
                    value={values.phone}
                    onChange={(event) => onChange("phone", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-opening">Hora de abertura</label>
                <input
                    id="restaurant-opening"
                    type="time"
                    className="input"
                    required
                    value={values.openingHour}
                    onChange={(event) => onChange("openingHour", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-closing">Hora de fecho</label>
                <input
                    id="restaurant-closing"
                    type="time"
                    className="input"
                    required
                    value={values.closingHour}
                    onChange={(event) => onChange("closingHour", event.target.value)}
                />
            </div>

            <div className="md:col-span-2">
                <label className="label" htmlFor="restaurant-description">Descrição</label>
                <input
                    id="restaurant-description"
                    className="input"
                    value={values.description ?? ""}
                    onChange={(event) => onChange("description", event.target.value)}
                />
            </div>

            <div className="md:col-span-2">
                <label className="label" htmlFor="restaurant-image">Imagem do restaurante</label>
                <input
                    id="restaurant-image"
                    type="file"
                    accept="image/*"
                    className="input"
                    onChange={(event) => onImageChange(event.target.files?.[0] ?? null)}
                />
                {values.image && (
                    <p className="mt-2 text-xs text-slate-500">Imagem selecionada: {values.image.name}</p>
                )}
                {!isEditMode && previewUrl && (
                    <img src={previewUrl} alt="Pré-visualização do restaurante" className="mt-3 h-40 w-full rounded-xl object-cover" />
                )}
            </div>

            <div className="mt-2 flex flex-wrap justify-end gap-2 md:col-span-2">
                <button type="button" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600" onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "A guardar..." : submitLabel}
                </button>
            </div>
        </form>
    );
}