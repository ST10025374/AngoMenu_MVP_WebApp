export type AppRole = "Admin" | "Client" | "Manager";

export type JwtPayload = {
    sub?: string;
    exp?: number;
    iat?: number;
    email?: string;
    role?: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
};

function base64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return atob(padded);
}

export function decodeJwt(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const json = base64UrlDecode(parts[1]);
        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
}

export function getUserRole(token: string | null): AppRole | null {
    if (!token) return null;
    const payload = decodeJwt(token);
    if (!payload) return null;

    const role =
        payload.role ??
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (role === "Admin" || role === "Client" || role === "Manager") return role;
    return null;
}

export function isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    const payload = decodeJwt(token);
    if (!payload?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
}