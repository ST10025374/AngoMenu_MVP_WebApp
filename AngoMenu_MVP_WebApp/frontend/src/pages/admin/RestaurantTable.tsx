import { getImageUrl, type AdminRestaurant } from "../../lib/api";

export default function RestaurantTable({
    restaurants,
    onEdit,
    onDelete,
}: {
    restaurants: AdminRestaurant[];
    onEdit: (restaurant: AdminRestaurant) => void;
    onDelete: (restaurant: AdminRestaurant) => void;
}) {
    return (
        <div className="app-card overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="p-3 text-left">Image</th>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Location</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {restaurants.map((restaurant) => (
                        <tr key={restaurant.id} className="border-t">
                            <td className="p-3">
                                {getImageUrl(restaurant.imageUrl) ? (
                                    <img
                                        src={getImageUrl(restaurant.imageUrl) ?? ''}
                                        alt={restaurant.name}
                                        className="h-12 w-20 rounded-md object-cover"
                                    />
                                ) : (
                                    <span className="text-xs text-slate-400">No image</span>
                                )}
                            </td>
                            <td className="p-3 font-semibold text-brand-dark">{restaurant.name}</td>
                            <td className="p-3 text-slate-700">{restaurant.location}</td>
                            <td className="p-3 text-right">
                                <div className="inline-flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(restaurant)}
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-brand-red hover:text-brand-red"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(restaurant)}
                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}