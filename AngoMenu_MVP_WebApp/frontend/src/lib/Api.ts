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

async function parseResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get("content-type") ?? "";
    const raw = await res.text();

    let data: unknown = null;

    if (raw) {
        if (contentType.includes("application/json")) {
            data = JSON.parse(raw);
        } else {
            data = raw; // plain text response
        }
    }

    if (!res.ok) {
        const message =
            typeof data === "string"
                ? data
                : (data as { message?: string } | null)?.message ?? `Request failed (${res.status})`;
        throw new Error(message);
    }

    return data as T;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return parseResponse<LoginResponse>(res);
}

export async function register(payload: RegisterPayload): Promise<string> {
    const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    // backend returns Ok(result.Message) -> plain string
    return parseResponse<string>(res);
}