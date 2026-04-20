import type { MenuCategory } from './menuCategories';
import { clearToken, getToken } from './auth';

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
};

type LoginResponse = {
    token: string;
};

export type ReservationStatus = 'Pending' | 'Confirmed' | 'Cancelled';

const reservationStatusToApiValue: Record<ReservationStatus, number> = {
    Pending: 1,
    Confirmed: 2,
    Cancelled: 3,
};

export type RestaurantImage = {
    id: number;
    restaurantId: number;
    imageUrl: string;
    publicId?: string | null;
    isMain: boolean;
    displayOrder: number;
    createdAt: string;
};

export type Restaurant = {
    id: number;
    name: string;
    description?: string | null;
    location: string;
    googleMapsUrl?: string | null;
    city: string;
    province: string;
    municipality: string;
    neighborhood: string;
    streetName: string;
    phone: string;
    openingHour: string;
    closingHour: string;
    mainImageUrl?: string | null;
    images?: RestaurantImage[];
    managerId?: number | null;
    managerName?: string | null;
    managerEmail?: string | null;
};

export type PagedResult<T> = {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
};

export type Reservation = {
    id?: number;
    restaurantId: number;
    date: string;
    time: string;
    numberOfPeople: number;
    status?: ReservationStatus;
};

export type MenuItem = {
    id: number;
    restaurantId: number;
    name: string;
    description?: string | null;
    price: number;
    category: MenuCategory;
    imageUrl?: string | null;
    isAvailable: boolean;
};

export type UserReservation = {
    id: number;
    restaurantId: number;
    restaurantName: string;
    date: string;
    time: string;
    numberOfPeople: number;
    status: ReservationStatus;
};

export type ManagerCreatePayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export type RestaurantUpsertPayload = {
    name: string;
    description?: string;
    location: string;
    googleMapsUrl?: string;
    city: string;
    province: string;
    municipality: string;
    neighborhood: string;
    streetName: string;
    phone: string;
    openingHour: string;
    closingHour: string;
    manager?: ManagerCreatePayload | null;
};

export type AdminRestaurant = Restaurant;

export type MenuItemUpsertPayload = {
    name: string;
    description?: string;
    price: number;
    category: MenuCategory;
    isAvailable: boolean;
    imageFile?: File | null;
    removeImage?: boolean;
};

export type AdminMenuItem = MenuItem;

export type AdminReservation = {
    id: number;
    userEmail: string;
    restaurant: string;
    date: string;
    time: string;
    numberOfPeople: number;
    status: ReservationStatus;
};

async function parseResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();

    let data: unknown = null;
    if (raw) {
        data = contentType.includes('application/json') ? JSON.parse(raw) : raw;
    }

    if (!res.ok) {
        if (res.status === 401) {
            clearToken();
        }

        const message =
            typeof data === 'string'
                ? data
                : (data as { message?: string } | null)?.message ?? `Request failed (${res.status})`;
        throw new Error(message);
    }

    return data as T;
}

function authHeaders(): HeadersInit {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildRestaurantFormData(payload: RestaurantUpsertPayload): FormData {
    const formData = new FormData();

    formData.append('name', payload.name);
    formData.append('description', payload.description ?? '');
    formData.append('location', payload.location);
    formData.append('googleMapsUrl', payload.googleMapsUrl ?? '');
    formData.append('city', payload.city);
    formData.append('province', payload.province);
    formData.append('municipality', payload.municipality);
    formData.append('neighborhood', payload.neighborhood);
    formData.append('streetName', payload.streetName);
    formData.append('phone', payload.phone);
    formData.append('openingHour', payload.openingHour);
    formData.append('closingHour', payload.closingHour);

    if (payload.manager) {
        formData.append('manager.firstName', payload.manager.firstName);
        formData.append('manager.lastName', payload.manager.lastName);
        formData.append('manager.email', payload.manager.email);
        formData.append('manager.password', payload.manager.password);
    }

    return formData;
}

function buildMenuItemFormData(payload: MenuItemUpsertPayload & { restaurantId?: number }): FormData {
    const formData = new FormData();

    if (typeof payload.restaurantId === 'number') {
        formData.append('restaurantId', String(payload.restaurantId));
    }

    formData.append('name', payload.name);
    formData.append('description', payload.description ?? '');
    formData.append('price', String(payload.price));
    formData.append('category', payload.category);
    formData.append('isAvailable', String(payload.isAvailable));

    if (payload.imageFile) {
        formData.append('image', payload.imageFile);
    }

    if (payload.removeImage) {
        formData.append('removeImage', 'true');
    }

    return formData;
}

const API_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL as string | undefined) ?? '')
    .trim()
    .replace(/\/+$/, '');

function apiUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

export function getImageUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    return path.startsWith('/') ? path : `/${path}`;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    /*const res = await fetch('/api/auth/login', {*/
    const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    return parseResponse<LoginResponse>(res);
}

export async function register(payload: RegisterPayload): Promise<string> {
    /*const res = await fetch('/api/auth/register', {*/
    const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    return parseResponse<string>(res);
}

export async function getRestaurants(params: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
}): Promise<PagedResult<Restaurant>> {
    const query = new URLSearchParams();
    if (params.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.search) query.set('search', params.search);

    /*const res = await fetch(`/api/restaurants?${query.toString()}`, {*/
    const res = await fetch(apiUrl(`/api/restaurants?${query.toString()}`), {
        method: 'GET',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<PagedResult<Restaurant>>(res);
}

export async function getRestaurantById(id: number): Promise<Restaurant> {
    /*const res = await fetch(`/api/restaurants/${id}`, {*/
    const res = await fetch(apiUrl(`/api/restaurants/${id}`), {
        method: 'GET',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<Restaurant>(res);
}

export async function getManagerRestaurant(): Promise<Restaurant> {
    /*const res = await fetch('/api/restaurants/manager/my-restaurant', {*/
    const res = await fetch(apiUrl('/api/restaurants/manager/my-restaurant'), {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<Restaurant>(res);
}

export async function updateManagerRestaurant(payload: RestaurantUpsertPayload): Promise<string> {
    /*const res = await fetch('/api/restaurants/manager/my-restaurant', {*/
    const res = await fetch(apiUrl('/api/restaurants/manager/my-restaurant'), {
        method: 'PUT',
        headers: {
            ...authHeaders(),
        },
        body: buildRestaurantFormData(payload),
    });

    return parseResponse<string>(res);
}

export async function getMenuByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    /*const res = await fetch(`/api/menu/restaurant/${restaurantId}`, {*/
    const res = await fetch(apiUrl(`/api/menu/restaurant/${restaurantId}`), {
        method: 'GET',
    });

    return parseResponse<MenuItem[]>(res);
}

export async function getManagerMenu(): Promise<MenuItem[]> {
    /*const res = await fetch('/api/menu/manager', {*/
    const res = await fetch(apiUrl('/api/menu/manager'), {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<MenuItem[]>(res);
}

export async function createReservation(payload: {
    restaurantId: number;
    date: string;
    time: string;
    numberOfPeople: number;
}): Promise<string> {
    /*const res = await fetch('/api/reservations', {*/
    const res = await fetch(apiUrl('/api/reservations'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(payload),
    });

    return parseResponse<string>(res);
}

export async function getMyReservations(): Promise<UserReservation[]> {
    /*const res = await fetch('/api/reservations/my', {*/
    const res = await fetch(apiUrl('/api/reservations/my'), {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<UserReservation[]>(res);
}

export async function cancelReservation(reservationId: number): Promise<string> {
    /*const res = await fetch(`/api/reservations/${reservationId}/cancel`, {*/
    const res = await fetch(apiUrl(`/api/reservations/${reservationId}/cancel`), {
        method: 'PUT',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<string>(res);
}

export async function getAllReservations(): Promise<AdminReservation[]> {
    /*const res = await fetch('/api/reservations', {*/
    const res = await fetch(apiUrl('/api/reservations'), {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<AdminReservation[]>(res);
}

export async function getManagerReservations(): Promise<AdminReservation[]> {
    /*const res = await fetch('/api/reservations/manager', {*/
    const res = await fetch(apiUrl('/api/reservations/manager'), {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<AdminReservation[]>(res);
}

export async function updateReservationStatus(
    id: number,
    status: ReservationStatus
): Promise<string> {
    /*const res = await fetch(`/api/reservations/${id}/status`, {*/
    const res = await fetch(apiUrl(`/api/reservations/${id}/status`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ status: reservationStatusToApiValue[status] }),
    });

    return parseResponse<string>(res);
}

export async function updateManagerReservationStatus(
    id: number,
    status: ReservationStatus
): Promise<string> {
    /*const res = await fetch(`/api/reservations/manager/${id}/status`, {*/
    const res = await fetch(apiUrl(`/api/reservations/manager/${id}/status`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ status: reservationStatusToApiValue[status] }),
    });

    return parseResponse<string>(res);
}

export async function deleteReservation(id: number): Promise<string> {
    /*const res = await fetch(`/api/reservations/${id}`, {*/
    const res = await fetch(apiUrl(`/api/reservations/${id}`), {
        method: 'DELETE',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<string>(res);
}

export async function getAllRestaurantsAdmin(): Promise<AdminRestaurant[]> {
    /*const res = await fetch('/api/restaurants', {*/
    const res = await fetch(apiUrl('/api/restaurants'), {
        headers: {
            ...authHeaders(),
        },
    });

    const paged = await parseResponse<PagedResult<AdminRestaurant>>(res);
    return paged.items;
}

export async function createRestaurant(payload: RestaurantUpsertPayload): Promise<string> {
    /*const res = await fetch('/api/restaurants', {*/
    const res = await fetch(apiUrl('/api/restaurants'), {
        method: 'POST',
        headers: {
            ...authHeaders(),
        },
        body: buildRestaurantFormData(payload),
    });

    return parseResponse<string>(res);
}

export async function updateRestaurant(id: number, payload: RestaurantUpsertPayload): Promise<string> {
    /*const res = await fetch(`/api/restaurants/${id}`, {*/
    const res = await fetch(apiUrl(`/api/restaurants/${id}`), {
        method: 'PUT',
        headers: {
            ...authHeaders(),
        },
        body: buildRestaurantFormData(payload),
    });

    return parseResponse<string>(res);
}

export async function deleteRestaurant(id: number): Promise<string> {
    /*const res = await fetch(`/api/restaurants/${id}`, {*/
    const res = await fetch(apiUrl(`/api/restaurants/${id}`), {
        method: 'DELETE',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<string>(res);
}

export async function getMenuByRestaurantAdmin(restaurantId: number): Promise<AdminMenuItem[]> {
    /*const res = await fetch(`/api/menu/restaurant/${restaurantId}`, {*/
    const res = await fetch(apiUrl(`/api/menu/restaurant/${restaurantId}`), {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<AdminMenuItem[]>(res);
}

export async function createMenuItem(payload: { restaurantId: number } & MenuItemUpsertPayload): Promise<string> {
    /*const res = await fetch('/api/menu', {*/
    const res = await fetch(apiUrl('/api/menu'), {
        method: 'POST',
        headers: {
            ...authHeaders(),
        },
        body: buildMenuItemFormData(payload),
    });

    return parseResponse<string>(res);
}

export async function createManagerMenuItem(payload: MenuItemUpsertPayload): Promise<string> {
    /*const res = await fetch('/api/menu/manager', {*/
    const res = await fetch(apiUrl('/api/menu/manager'), {
        method: 'POST',
        headers: {
            ...authHeaders(),
        },
        body: buildMenuItemFormData(payload),
    });

    return parseResponse<string>(res);
}

export async function updateMenuItem(id: number, payload: MenuItemUpsertPayload): Promise<string> {
    /*const res = await fetch(`/api/menu/${id}`, {*/
    const res = await fetch(apiUrl(`/api/menu/${id}`), {
        method: 'PUT',
        headers: {
            ...authHeaders(),
        },
        body: buildMenuItemFormData(payload),
    });

    return parseResponse<string>(res);
}

export async function updateManagerMenuItem(id: number, payload: MenuItemUpsertPayload): Promise<string> {
    /*const res = await fetch(`/api/menu/manager/${id}`, {*/
    const res = await fetch(apiUrl(`/api/menu/manager/${id}`), {
        method: 'PUT',
        headers: {
            ...authHeaders(),
        },
        body: buildMenuItemFormData(payload),
    });

    return parseResponse<string>(res);
}

export async function deleteMenuItem(id: number): Promise<string> {
    /*const res = await fetch(`/api/menu/${id}`, {*/
    const res = await fetch(apiUrl(`/api/menu/${id}`), {
        method: 'DELETE',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<string>(res);
}

export async function deleteManagerMenuItem(id: number): Promise<string> {
    /*const res = await fetch(`/api/menu/manager/${id}`, {*/
    const res = await fetch(apiUrl(`/api/menu/manager/${id}`), {
        method: 'DELETE',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<string>(res);
}

export async function getRestaurantImages(restaurantId: number): Promise<RestaurantImage[]> {
    /*const res = await fetch(`/api/restaurants/${restaurantId}/images`, {*/
    const res = await fetch(apiUrl(`/api/restaurants/${restaurantId}/images`), {
        method: 'GET',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<RestaurantImage[]>(res);
}

export async function uploadRestaurantImage(
    restaurantId: number,
    payload: { image: File; isMain?: boolean }
): Promise<RestaurantImage[]> {
    const formData = new FormData();
    formData.append('image', payload.image);
    if (payload.isMain) {
        formData.append('isMain', 'true');
    }

    /*const res = await fetch(`/api/restaurants/${restaurantId}/images`, {*/
    const res = await fetch(apiUrl(`/api/restaurants/${restaurantId}/images`), {
        method: 'POST',
        headers: {
            ...authHeaders(),
        },
        body: formData,
    });

    return parseResponse<RestaurantImage[]>(res);
}

export async function deleteRestaurantImage(restaurantId: number, imageId: number): Promise<RestaurantImage[]> {
    /*const res = await fetch(`/api/restaurants/${restaurantId}/images/${imageId}`, {*/
    const res = await fetch(apiUrl(`/api/restaurants/${restaurantId}/images/${imageId}`), {
        method: 'DELETE',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<RestaurantImage[]>(res);
}

export async function setMainRestaurantImage(restaurantId: number, imageId: number): Promise<RestaurantImage[]> {
    /*const res = await fetch(`/api/restaurants/${restaurantId}/images/${imageId}/set-main`, {*/
    const res = await fetch(apiUrl(`/api/restaurants/${restaurantId}/images/${imageId}/set-main`), {
        method: 'PUT',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<RestaurantImage[]>(res);
}

export async function reorderRestaurantImages(restaurantId: number, orderedImageIds: number[]): Promise<RestaurantImage[]> {
    /*const res = await fetch(`/api/restaurants/${restaurantId}/images/reorder`, {*/
    const res = await fetch(apiUrl(`/api/restaurants/${restaurantId}/images/reorder`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ orderedImageIds }),
    });

    return parseResponse<RestaurantImage[]>(res);
}
