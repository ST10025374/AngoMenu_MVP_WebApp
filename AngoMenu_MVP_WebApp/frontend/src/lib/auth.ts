const TOKEN_KEY = 'auth_token';

export type UserRole = 'Admin' | 'Client' | null;

type JwtPayload = {
    role?: string;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
    exp?: number;
};

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

function decodeToken(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const payload = JSON.parse(atob(padded)) as JwtPayload;

        return payload;
    } catch {
        return null;
    }
}

export function getUserRole(): UserRole {
    const token = getToken();
    if (!token) return null;

    const payload = decodeToken(token);
    if (!payload) return null;

    const rawRole = payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (rawRole === 'Admin' || rawRole === 'Client') {
        return rawRole;
    }

    return null;
}

export function isTokenExpired(): boolean {
    const token = getToken();
    if (!token) return true;

    const payload = decodeToken(token);
    if (!payload?.exp) return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds;
}

export function isAuthenticated(): boolean {
    const token = getToken();
    return Boolean(token) && !isTokenExpired();
}

export function isAdmin(): boolean {
    return getUserRole() === 'Admin';
}