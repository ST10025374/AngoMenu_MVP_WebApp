import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl, getRestaurants, type PagedResult, type Restaurant } from '../lib/api';

export default function RestaurantsPage() {
    const [data, setData] = useState<PagedResult<Restaurant> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 9;

    async function loadRestaurants(targetPage = pageNumber) {
        setLoading(true);
        setError('');

        try {
            const result = await getRestaurants({
                pageNumber: targetPage,
                pageSize,
                search: search.trim() || undefined,
            });

            setData(result);
            setPageNumber(targetPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao carregar restaurantes');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadRestaurants(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totalPages = useMemo(() => {
        if (!data) return 1;
        return Math.max(1, Math.ceil(data.totalCount / data.pageSize));
    }, [data]);

    return (
        <section className="space-y-6">
            <div className="app-card p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-brand-dark sm:text-3xl">Encontre o seu próximo restaurante</h1>
                        <p className="mt-1 text-sm text-slate-600">Pesquise restaurantes por nome ou localização e abra os detalhes instantaneamente.</p>
                    </div>

                    <div className="flex w-full max-w-xl gap-2">
                        <input
                            className="input"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    void loadRestaurants(1);
                                }
                            }}
                            placeholder="Pesquisar por nome ou localização"
                            aria-label="Pesquisar restaurantes"
                        />
                        <button className="btn-primary shrink-0" onClick={() => void loadRestaurants(1)}>
                            Pesquisar
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="app-card p-6">
                    <p className="text-sm text-slate-500">A carregar restaurantes...</p>
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && data && data.items.length === 0 && (
                <div className="app-card p-8 text-center">
                    <h2 className="text-lg font-bold text-brand-dark">Nenhum restaurante encontrado</h2>
                    <p className="mt-2 text-sm text-slate-500">Experimente outro termo de pesquisa ou limpe o filtro.</p>
                </div>
            )}

            {!loading && !error && data && data.items.length > 0 && (
                <>
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {data.items.map((restaurant) => (
                            <li key={restaurant.id} className="app-card overflow-hidden p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                                {getImageUrl(restaurant.imageUrl) && (
                                    <img
                                        src={getImageUrl(restaurant.imageUrl) ?? ''}
                                        alt={restaurant.name}
                                        className="mb-4 h-40 w-full rounded-xl object-cover"
                                    />
                                )}

                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-brand-dark">{restaurant.name}</h2>
                                    <span className="rounded-full bg-brand-yellow/30 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                                        Aberto
                                    </span>
                                </div>

                                <p className="mt-2 min-h-12 text-sm text-slate-600">
                                    {restaurant.description ?? 'Uma experiência gastronómica selecionada com serviço de qualidade e comida deliciosa.'}
                                </p>

                                <div className="mt-4 space-y-1 text-sm text-slate-700">
                                    <p>
                                        <span className="font-semibold text-slate-900">Localização:</span> {restaurant.location}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-900">Telefone:</span> {restaurant.phone}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-900">Horário:</span> {restaurant.openingHour} - {restaurant.closingHour}
                                    </p>
                                </div>

                                <div className="mt-5">
                                    <Link className="btn-secondary w-full" to={`/restaurants/${restaurant.id}`}>
                                        Ver detalhes
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="app-card flex flex-wrap items-center justify-center gap-3 p-4 sm:justify-between">
                        <p className="text-sm font-medium text-slate-600">
                            A mostrar página <span className="font-bold text-brand-dark">{pageNumber}</span> de{' '}
                            <span className="font-bold text-brand-dark">{totalPages}</span>
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                className="btn-secondary"
                                disabled={pageNumber <= 1}
                                onClick={() => void loadRestaurants(pageNumber - 1)}
                            >
                                Anterior
                            </button>
                            <button
                                className="btn-secondary"
                                disabled={pageNumber >= totalPages}
                                onClick={() => void loadRestaurants(pageNumber + 1)}
                            >
                                Seguinte
                            </button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}