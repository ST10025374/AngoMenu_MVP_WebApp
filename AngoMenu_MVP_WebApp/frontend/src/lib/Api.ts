import { getToken } from './auth';

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

type LoginResponse = {
    token: string;
};

export type Restaurant = {
    id: number;
    name: string;
    description?: string | null;
    location: string;
    phone: string;
    openingHour: string;
    closingHour: string;
    imageUrl?: string | null;
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
    status?: string;
};

export type MenuItem = {
    id: number;
    restaurantId: number;
    name: string;
    description?: string | null;
    price: number;
};

export type UserReservation = {
    id: number;
    restaurantId: number;
    restaurantName: string;
    date: string;
    time: string;
    numberOfPeople: number;
    status: string;
};

async function parseResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();

    let data: unknown = null;
    if (raw) {
        data = contentType.includes('application/json') ? JSON.parse(raw) : raw;
    }

    if (!res.ok) {
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

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    return parseResponse<LoginResponse>(res);
}

export async function register(payload: RegisterPayload): Promise<string> {
    const res = await fetch('/api/auth/register', {
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

    const res = await fetch(`/api/restaurants?${query.toString()}`, {
        method: 'GET',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<PagedResult<Restaurant>>(res);
}

export async function getRestaurantById(id: number): Promise<Restaurant> {
    const res = await fetch(`/api/restaurants/${id}`, {
        method: 'GET',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<Restaurant>(res);
}

export async function getMenuByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    const res = await fetch(`/api/menu/restaurant/${restaurantId}`, {
        method: 'GET',
    });

    return parseResponse<MenuItem[]>(res);
}

export async function createReservation(payload: {
    restaurantId: number;
    date: string;
    time: string;
    numberOfPeople: number;
}): Promise<string> {
    const res = await fetch('/api/reservations', {
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
    const res = await fetch("/api/reservations/my", {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<UserReservation[]>(res);
}

export async function cancelReservation(reservationId: number): Promise<string> {
    const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: "PUT",
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<string>(res);
}

export type AdminReservation = {
    id: number;
    userEmail: string;
    restaurant: string;
    date: string;
    time: string;
    numberOfPeople: number;
    status: string;
};

export async function getAllReservations(): Promise<AdminReservation[]> {
    const res = await fetch("/api/reservations", {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<AdminReservation[]>(res);
}

export async function updateReservationStatus(
    id: number,
    status: string
): Promise<string> {
    const res = await fetch(`/api/reservations/${id}/status?status=${status}`, {
        method: "PUT",
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<string>(res);
}

export async function deleteReservation(id: number): Promise<string> {
    const res = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<string>(res);
}

export type AdminRestaurant = {
    id: number;
    name: string;
    description?: string;
    location: string;
    phone: string;
    openingHour: string;
    closingHour: string;
};

export async function getAllRestaurantsAdmin(): Promise<AdminRestaurant[]> {
    const res = await fetch("/api/restaurants", {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<AdminRestaurant[]>(res);
}

export async function createRestaurant(payload: Omit<AdminRestaurant, "id">): Promise<string> {
    const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify(payload),
    });

    return parseResponse<string>(res);
}

export async function updateRestaurant(id: number, payload: Omit<AdminRestaurant, "id">): Promise<string> {
    const res = await fetch(`/api/restaurants/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify(payload),
    });

    return parseResponse<string>(res);
}

export async function deleteRestaurant(id: number): Promise<string> {
    const res = await fetch(`/api/restaurants/${id}`, {
        method: "DELETE",
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<string>(res);
}

export type AdminMenuItem = {
    id: number;
    restaurantId: number;
    name: string;
    description?: string;
    price: number;
};

export async function getMenuByRestaurantAdmin(restaurantId: number): Promise<AdminMenuItem[]> {
    const res = await fetch(`/api/menu/restaurant/${restaurantId}`, {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<AdminMenuItem[]>(res);
}

export async function createMenuItem(payload: Omit<AdminMenuItem, "id">): Promise<string> {
    const res = await fetch(`/api/menu`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify(payload),
    });

    return parseResponse<string>(res);
}

export async function updateMenuItem(id: number, payload: Omit<AdminMenuItem, "id">): Promise<string> {
    const res = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify(payload),
    });

    return parseResponse<string>(res);
}

export async function deleteMenuItem(id: number): Promise<string> {
    const res = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse<string>(res);
}