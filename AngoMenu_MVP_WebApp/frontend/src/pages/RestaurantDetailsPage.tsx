import { useEffect, useMemo, useRef, useState } from 'react';
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

type FullscreenImageModalProps = {
    imageUrl: string;
    altText: string;
    onClose: () => void;
};

function FullscreenImageModal({ imageUrl, altText, onClose }: FullscreenImageModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => setIsVisible(true));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        setIsZoomed(false);
    }, [imageUrl]);

    function handleImageDoubleClick() {
        setIsZoomed((current) => !current);
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px] transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Visualização ampliada da imagem"
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-800 shadow-lg transition hover:bg-white"
                aria-label="Fechar visualização da imagem"
            >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 5L15 15M15 5L5 15" />
                </svg>
            </button>

            <div
                className={`max-h-[90vh] w-full max-w-4xl transform transition duration-200 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                onClick={(event) => event.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt={altText}
                    onDoubleClick={handleImageDoubleClick}
                    className={`max-h-[90vh] w-full rounded-2xl object-contain shadow-2xl transition-transform duration-300 ${isZoomed ? 'scale-[1.85] cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                        }`}
                />
                <p className="mt-3 text-center text-xs text-slate-200">
                    Duplo clique na imagem para {isZoomed ? 'reduzir' : 'ampliar'}.
                </p>
            </div>
        </div>
    );
}

export default function RestaurantDetailsPage() {
    const { id } = useParams();
    const restaurantId = Number(id);

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedImageAlt, setSelectedImageAlt] = useState('Imagem do menu');
    const [activeCategory, setActiveCategory] = useState<string>('');
    const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

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

    useEffect(() => {
        if (groupedMenuItems.length === 0) {
            setActiveCategory('');
            return;
        }

        setActiveCategory((current) => {
            if (current && groupedMenuItems.some(([category]) => category === current)) {
                return current;
            }

            return groupedMenuItems[0][0];
        });
    }, [groupedMenuItems]);

    useEffect(() => {
        if (groupedMenuItems.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visibleEntries.length > 0) {
                    setActiveCategory(visibleEntries[0].target.id.replace('menu-category-', ''));
                }
            },
            {
                root: null,
                rootMargin: '-140px 0px -55% 0px',
                threshold: 0.1,
            }
        );

        for (const [category] of groupedMenuItems) {
            const section = categoryRefs.current[category];
            if (section) {
                observer.observe(section);
            }
        }

        return () => observer.disconnect();
    }, [groupedMenuItems]);

    function scrollToCategory(category: string) {
        const target = categoryRefs.current[category];
        if (!target) {
            return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        if (selectedImage) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [selectedImage]);

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
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedImage(getImageUrl(image.imageUrl));
                                        setSelectedImageAlt(`Imagem da galeria de ${restaurant.name}`);
                                    }}
                                    className="overflow-hidden rounded-lg border border-slate-200"
                                >
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
                            <nav className="sticky top-2 z-20 -mx-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                                <ul className="flex min-w-max items-center gap-2">
                                    {groupedMenuItems.map(([category, items]) => (
                                        <li key={`tab-${category}`}>
                                            <button
                                                type="button"
                                                onClick={() => scrollToCategory(category)}
                                                className={`rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${activeCategory === category
                                                        ? 'border-brand-dark bg-brand-dark text-white shadow-sm'
                                                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {getMenuCategoryLabel(category)} ({items.length})
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {groupedMenuItems.map(([category, items]) => (
                                <section
                                    key={category}
                                    id={`menu-category-${category}`}
                                    ref={(element) => {
                                        categoryRefs.current[category] = element;
                                    }}
                                    className="scroll-mt-28 space-y-4"
                                >
                                    <h3 className="border-b border-slate-200 pb-2 text-xl font-black text-brand-dark">
                                        {getMenuCategoryLabel(category)}
                                    </h3>
                                    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {items.map((item) => (
                                            <li key={item.id} className={`overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-lg ${item.isAvailable ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50/40"}`}>
                                                <div className="flex gap-4 p-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedImage(getImageUrl(item.imageUrl) ?? 'https://placehold.co/800x800?text=Menu');
                                                            setSelectedImageAlt(item.name);
                                                        }}
                                                        className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28"
                                                        aria-label={`Ampliar imagem de ${item.name}`}
                                                    >
                                                        <img
                                                            src={getImageUrl(item.imageUrl) ?? 'https://placehold.co/240x240?text=Menu'}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                                        />
                                                    </button>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <h4 className="text-base font-bold text-brand-dark">{item.name}</h4>
                                                            <span className="shrink-0 rounded-full bg-brand-red/10 px-3 py-1 text-sm font-semibold text-brand-red">
                                                                {formatKwanza(item.price)}
                                                            </span>
                                                        </div>
                                                        <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                                            {item.isAvailable ? "Disponível" : "Indisponível no momento"}
                                                        </p>
                                                        <p className="mt-2 text-sm text-slate-600">
                                                            {item.description ?? 'Item de menu criado pelo chef com ingredientes de qualidade.'}
                                                        </p>
                                                    </div>
                                                </div>                                  
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                        ))}
                       </div>
                )}
            </article>

            {selectedImage && (
                <FullscreenImageModal
                    imageUrl={selectedImage}
                    altText={selectedImageAlt}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </section>
    );
}