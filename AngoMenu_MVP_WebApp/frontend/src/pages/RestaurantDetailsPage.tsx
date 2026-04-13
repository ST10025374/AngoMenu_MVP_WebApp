import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    getImageUrl,
    getMenuByRestaurant,
    getRestaurantById,
    type MenuItem,
    type Restaurant,
} from '../lib/api';
import { formatKwanza } from '../lib/currency';
import { getMenuCategoryLabel, MENU_CATEGORIES } from '../lib/menuCategories';

export default function RestaurantDetailsPage() {
    const { id } = useParams();
    const restaurantId = Number(id);

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (!restaurantId || Number.isNaN(restaurantId)) {
                setError('ID de restaurante inválido.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const [restaurantData, menuData] = await Promise.all([
                    getRestaurantById(restaurantId),
                    getMenuByRestaurant(restaurantId),
                ]);

                setRestaurant(restaurantData);
                setMenuItems(menuData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Falha ao carregar os detalhes do restaurante');
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, [restaurantId]);

    const heroImage = useMemo(
        () => getImageUrl(restaurant?.mainImageUrl) ?? 'https://placehold.co/1200x600?text=Sem+Imagem',
        [restaurant?.mainImageUrl]
    );

    const groupedMenuItems = useMemo(() => {
        const groups = new Map<string, MenuItem[]>();

        for (const category of MENU_CATEGORIES) {
            groups.set(category, []);
        }

        for (const item of menuItems) {
            const key = item.category && groups.has(item.category) ? item.category : 'Other';
            groups.get(key)?.push(item);
        }

        return Array.from(groups.entries()).filter(([, items]) => items.length > 0);
    }, [menuItems]);

    const galleryImages = useMemo(
        () =>
            (restaurant?.images ?? []).filter((image) => {
                const currentUrl = getImageUrl(image.imageUrl);
                return Boolean(currentUrl) && currentUrl !== heroImage;
            }),
        [restaurant?.images, heroImage]
    );

    if (loading) {
        return (
            <div className="app-card p-6">
                <p className="text-sm text-slate-500">A carregar detalhes do restaurante...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="app-card p-6">
                <p className="text-sm text-slate-600">Restaurante não encontrado.</p>
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red transition hover:text-red-700 hover:underline"
            >
                Voltar aos restaurantes
            </Link>

            <article className="app-card overflow-hidden">
                <img src={heroImage} alt={restaurant.name} className="h-64 w-full object-cover" />

                <div className="border-b border-slate-200 bg-gradient-to-r from-brand-dark to-slate-900 p-6 text-white">
                    <h1 className="text-3xl font-black">{restaurant.name}</h1>
                    <p className="mt-2 max-w-3xl text-sm text-slate-200">
                        {restaurant.description ?? 'Um destino premium para refeições memoráveis e serviço de qualidade.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                            to={`/restaurants/${restaurant.id}/reserve`}
                            className="btn-primary"
                        >
                            Reserva Mesa
                        </Link>
                    </div>
                </div>

                {galleryImages.length > 0 && (
                    <div className="border-b border-slate-100 p-6">
                        <h2 className="text-base font-bold text-brand-dark">Mais imagens</h2>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {galleryImages.map((image) => (
                                <button key={image.id} type="button" onClick={() => setSelectedImage(getImageUrl(image.imageUrl))} className="overflow-hidden rounded-lg border border-slate-200">
                                    <img src={getImageUrl(image.imageUrl) ?? ''} alt="Galeria do restaurante" className="h-24 w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Localização</p>
                        <p className="mt-1 text-sm font-semibold text-brand-dark">{restaurant.location}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Telefone</p>
                        <p className="mt-1 text-sm font-semibold text-brand-dark">{restaurant.phone}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hora de abertura</p>
                        <p className="mt-1 text-sm font-semibold text-brand-dark">{restaurant.openingHour}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hora de fecho</p>
                        <p className="mt-1 text-sm font-semibold text-brand-dark">{restaurant.closingHour}</p>
                    </div>
                </div>
            </article>

            <article className="app-card p-6">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-black text-brand-dark">Menu</h2>
                    <span className="rounded-full bg-brand-yellow/30 px-3 py-1 text-xs font-semibold text-brand-dark">
                        {menuItems.length} itens
                    </span>
                </div>

                {menuItems.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                        Ainda não existem itens de menu disponíveis.
                    </div>
                ) : (
                        <div className="mt-5 space-y-8">
                            {groupedMenuItems.map(([category, items]) => (
                                <section key={category} className="space-y-3">
                                    <h3 className="border-b border-slate-200 pb-2 text-lg font-bold text-brand-dark">
                                        {getMenuCategoryLabel(category)}
                                    </h3>
                                    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {items.map((item) => (
                                            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md">
                                                {getImageUrl(item.imageUrl) && (
                                                    <img src={getImageUrl(item.imageUrl) ?? ''} alt={item.name} className="mb-3 h-40 w-full rounded-lg object-cover" />
                                                )}
                                                <div className="flex items-start justify-between gap-3">
                                                    <h4 className="text-base font-bold text-brand-dark">{item.name}</h4>
                                                    <span className="rounded-full bg-brand-red/10 px-3 py-1 text-sm font-semibold text-brand-red">
                                                        {formatKwanza(item.price)}
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-sm text-slate-600">
                                                    {item.description ?? 'Item de menu criado pelo chef com ingredientes de qualidade.'}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                        ))}
                       </div>
                )}
            </article>

            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Visualização da imagem" className="max-h-[90vh] max-w-[90vw] rounded-xl" />
                </div>
            )}
        </section>
    );
}