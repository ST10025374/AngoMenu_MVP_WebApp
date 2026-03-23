import { getImageUrl, type AdminRestaurant } from "../../lib/api";

export type RestaurantFormValues = Omit<AdminRestaurant, "id"> & {
    image?: File | null;
    createManager: boolean;
    managerFirstName: string;
    managerLastName: string;
    managerAccountEmail: string;
    managerPassword: string;
    managerConfirmPassword: string;
};

export default function RestaurantForm({
    values,
    loading,
    submitLabel,
    isEditMode = false,
    onChange,
    onToggleManager,
    onImageChange,
    onSubmit,
    onCancel,
}: {
    values: RestaurantFormValues;
    loading: boolean;
    submitLabel: string;
    isEditMode?: boolean;
    onChange: (field: keyof RestaurantFormValues, value: string) => void;
    onToggleManager: (value: boolean) => void;
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
                <label className="label" htmlFor="restaurant-city">Cidade</label>
                <input
                    id="restaurant-city"
                    className="input"
                    required
                    value={values.city}
                    onChange={(event) => onChange("city", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-province">Província</label>
                <input
                    id="restaurant-province"
                    className="input"
                    required
                    value={values.province}
                    onChange={(event) => onChange("province", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-municipality">Município</label>
                <input
                    id="restaurant-municipality"
                    className="input"
                    required
                    value={values.municipality}
                    onChange={(event) => onChange("municipality", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-neighborhood">Bairro</label>
                <input
                    id="restaurant-neighborhood"
                    className="input"
                    required
                    value={values.neighborhood}
                    onChange={(event) => onChange("neighborhood", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-street">Rua</label>
                <input
                    id="restaurant-street"
                    className="input"
                    required
                    value={values.streetName}
                    onChange={(event) => onChange("streetName", event.target.value)}
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

            {!isEditMode && (
                <div className="md:col-span-2 rounded-xl border border-slate-200 p-4">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                            type="checkbox"
                            checked={values.createManager}
                            onChange={(event) => onToggleManager(event.target.checked)}
                        />
                        Criar conta de gestor para este restaurante
                    </label>

                    {values.createManager && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="label">Nome</label>
                                <input className="input" value={values.managerFirstName} onChange={(event) => onChange("managerFirstName", event.target.value)} required />
                            </div>
                            <div>
                                <label className="label">Sobrenome</label>
                                <input className="input" value={values.managerLastName} onChange={(event) => onChange("managerLastName", event.target.value)} required />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input className="input" type="email" value={values.managerAccountEmail} onChange={(event) => onChange("managerAccountEmail", event.target.value)} required />
                            </div>
                            <div>
                                <label className="label">Palavra-passe</label>
                                <input className="input" type="password" value={values.managerPassword} onChange={(event) => onChange("managerPassword", event.target.value)} required />
                            </div>
                            <div>
                                <label className="label">Confirmar palavra-passe</label>
                                <input className="input" type="password" value={values.managerConfirmPassword} onChange={(event) => onChange("managerConfirmPassword", event.target.value)} required />
                            </div>
                        </div>
                    )}
                </div>
            )}

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