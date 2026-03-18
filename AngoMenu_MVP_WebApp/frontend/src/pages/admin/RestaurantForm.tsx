import type { AdminRestaurant } from "../../lib/api";

export type RestaurantFormValues = Omit<AdminRestaurant, "id">;

export default function RestaurantForm({
    values,
    loading,
    submitLabel,
    onChange,
    onSubmit,
    onCancel,
}: {
    values: RestaurantFormValues;
    loading: boolean;
    submitLabel: string;
    onChange: (field: keyof RestaurantFormValues, value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}) {
    return (
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
                <label className="label" htmlFor="restaurant-name">Name</label>
                <input
                    id="restaurant-name"
                    className="input"
                    required
                    value={values.name}
                    onChange={(event) => onChange("name", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-location">Location</label>
                <input
                    id="restaurant-location"
                    className="input"
                    required
                    value={values.location}
                    onChange={(event) => onChange("location", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-phone">Phone</label>
                <input
                    id="restaurant-phone"
                    className="input"
                    required
                    value={values.phone}
                    onChange={(event) => onChange("phone", event.target.value)}
                />
            </div>

            <div>
                <label className="label" htmlFor="restaurant-opening">Opening Hour</label>
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
                <label className="label" htmlFor="restaurant-closing">Closing Hour</label>
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
                <label className="label" htmlFor="restaurant-description">Description</label>
                <input
                    id="restaurant-description"
                    className="input"
                    value={values.description ?? ""}
                    onChange={(event) => onChange("description", event.target.value)}
                />
            </div>

            <div className="mt-2 flex flex-wrap justify-end gap-2 md:col-span-2">
                <button type="button" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );
}