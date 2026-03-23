const TOKEN_KEY = 'auth_token';
const AUTH_CHANGED_EVENT = 'auth:changed';

export type UserRole = 'Admin' | 'Client' | 'Manager' | 'User' | null;

type JwtPayload = {
    role?: string;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
    exp?: number;
};

// TOKEN HANDLING
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

// JWT DECODE
function decodeToken(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

        return JSON.parse(atob(padded)) as JwtPayload;
    } catch {
        return null;
    }
}

// ROLE
export function getUserRole(): UserRole {
    const token = getToken();
    if (!token) return null;

    const payload = decodeToken(token);
    if (!payload) return null;

    // ?? Handle ALL possible formats
    const role =
        payload.role ??
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        (payload as any).Role ??
        (payload as any).roles?.[0] ??
        (payload as any)['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];

    return role === 'Admin' || role === 'Client' || role === 'Manager' || role === 'User' ? role : null;
}

// EXPIRATION
export function isTokenExpired(): boolean {
    const token = getToken();
    if (!token) return true;

    const payload = decodeToken(token);
    if (!payload?.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
}

// AUTH CHECK
export function isAuthenticated(): boolean {
    const token = getToken();
    return Boolean(token) && !isTokenExpired();
}

// ADMIN CHECK
export function isAdmin(): boolean {
    return getUserRole() === 'Admin';
}

// LOGOUT
export function logout() {
    clearToken();
}

export function subscribeAuthChanges(handler: () => void): () => void {
    window.addEventListener(AUTH_CHANGED_EVENT, handler);
    window.addEventListener('storage', handler);

    return () => {
        window.removeEventListener(AUTH_CHANGED_EVENT, handler);
        window.removeEventListener('storage', handler);
    };
}