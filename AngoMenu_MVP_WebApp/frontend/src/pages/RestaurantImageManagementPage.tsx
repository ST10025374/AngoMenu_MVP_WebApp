import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
    deleteRestaurantImage,
    getImageUrl,
    getRestaurantById,
    getRestaurantImages,
    reorderRestaurantImages,
    setMainRestaurantImage,
    uploadRestaurantImage,
    type Restaurant,
    type RestaurantImage,
} from '../lib/api';

const MAX_IMAGES = 5;

export default function RestaurantImageManagementPage() {
    const { id, restaurantId: restaurantIdParam } = useParams();
    const restaurantId = Number(restaurantIdParam ?? id);

    const location = useLocation();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [images, setImages] = useState<RestaurantImage[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function loadData() {
        if (!restaurantId || Number.isNaN(restaurantId)) {
            setError('Restaurante inválido.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const [restaurantData, imagesData] = await Promise.all([
                getRestaurantById(restaurantId),
                getRestaurantImages(restaurantId),
            ]);

            setRestaurant(restaurantData);
            setImages(imagesData.sort((a, b) => a.displayOrder - b.displayOrder));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao carregar imagens do restaurante.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadData();
    }, [restaurantId]);

    const canUpload = useMemo(() => images.length < MAX_IMAGES, [images.length]);

    async function handleUpload(event: React.FormEvent) {
        event.preventDefault();

        if (!selectedFile) {
            setError('Selecione uma imagem antes de enviar.');
            return;
        }

        if (!canUpload) {
            setError('O restaurante já possui 5 imagens.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const updated = await uploadRestaurantImage(restaurantId, { image: selectedFile });
            setImages(updated);
            setSelectedFile(null);
            setSuccess('Imagem adicionada com sucesso.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao adicionar imagem.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(imageId: number) {
        if (!confirm('Tem certeza que deseja eliminar esta imagem?')) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            const updated = await deleteRestaurantImage(restaurantId, imageId);
            setImages(updated);
            setSuccess('Imagem eliminada com sucesso.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao eliminar imagem.');
        } finally {
            setSaving(false);
        }
    }

    async function handleSetMain(imageId: number) {
        setSaving(true);
        setError('');

        try {
            const updated = await setMainRestaurantImage(restaurantId, imageId);
            setImages(updated);
            setSuccess('Imagem principal atualizada.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao definir imagem principal.');
        } finally {
            setSaving(false);
        }
    }

    async function moveImage(index: number, direction: -1 | 1) {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= images.length) {
            return;
        }

        const next = [...images];
        const [removed] = next.splice(index, 1);
        next.splice(nextIndex, 0, removed);

        const orderedIds = next.map((image) => image.id);

        setSaving(true);
        setError('');
        try {
            const updated = await reorderRestaurantImages(restaurantId, orderedIds);
            setImages(updated);
            setSuccess('Ordem das imagens atualizada.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao reordenar imagens.');
        } finally {
            setSaving(false);
        }
    }

    const backRoute = location.pathname.startsWith('/manager') ? '/manager/restaurant' : '/admin/restaurants';

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-3xl font-black text-brand-dark">Gerir Imagens do Restaurante</h1>
                <Link to={backRoute} className="btn-secondary">Voltar</Link>
            </div>

            {restaurant && <p className="text-sm text-slate-600">Restaurante: <strong>{restaurant.name}</strong></p>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <form onSubmit={handleUpload} className="app-card p-5 space-y-3">
                <h2 className="text-lg font-bold text-brand-dark">Adicionar imagem ({images.length}/{MAX_IMAGES})</h2>
                <input type="file" accept="image/*" className="input" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} disabled={!canUpload || saving} />
                <button type="submit" className="btn-primary" disabled={!canUpload || saving || !selectedFile}>
                    {saving ? 'A processar...' : canUpload ? 'Adicionar imagem' : 'Limite atingido'}
                </button>
            </form>

            {loading ? (
                <div className="app-card p-4 text-sm text-slate-500">A carregar imagens...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {images.map((image, index) => (
                        <article key={image.id} className="app-card p-4">
                            <img src={getImageUrl(image.imageUrl) ?? ''} alt={`Imagem ${index + 1}`} className="h-44 w-full rounded-lg object-cover" />
                            <div className="mt-3 flex flex-wrap gap-2">
                                {image.isMain ? (
                                    <span className="rounded-full bg-brand-yellow/40 px-3 py-1 text-xs font-semibold text-brand-dark">Imagem principal</span>
                                ) : (
                                    <button type="button" className="btn-secondary" onClick={() => void handleSetMain(image.id)} disabled={saving}>Definir principal</button>
                                )}
                                <button type="button" className="btn-secondary" disabled={index === 0 || saving} onClick={() => void moveImage(index, -1)}>Mover acima</button>
                                <button type="button" className="btn-secondary" disabled={index === images.length - 1 || saving} onClick={() => void moveImage(index, 1)}>Mover abaixo</button>
                                <button type="button" className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600" onClick={() => void handleDelete(image.id)} disabled={saving}>Eliminar</button>
                            </div>
                        </article>
                    ))}
                        {images.length === 0 && (
                            <div className="app-card p-4 text-sm text-slate-500">
                                Este restaurante ainda não possui imagens.
                            </div>
                        )}
                </div>
            )}
        </section>
    );
}