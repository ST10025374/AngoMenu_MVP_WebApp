import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type LoginResponse = { token: string }

type ApiErrorPayload = {
    message?: string
    error?: string
    title?: string
    detail?: string
}

type Restaurant = {
    id: number
    name: string
    description: string
    location: string
    phone: string
    openingHour: string
    closingHour: string
    imageUrl: string
}

type PagedResult<T> = {
    items: T[]
    totalCount: number
    pageNumber: number
    pageSize: number
}

type MenuItem = {
    id: number
    restaurantId: number
    name: string
    price: number
    description: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7210'

function App() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [token, setToken] = useState('')
    const [authMessage, setAuthMessage] = useState('Not signed in yet.')
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [dataMessage, setDataMessage] = useState('')

    const authHeaders = useMemo(() => {
        const headers: Record<string, string> = {}

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        return headers
    }, [token])

    async function readResponseBody(response: Response) {
        const contentType = response.headers.get('content-type') ?? ''

        try {
            if (contentType.includes('application/json')) {
                return await response.json()
            }

            return await response.text()
        } catch {
            return ''
        }
    }

    function getErrorMessage(payload: unknown, fallback: string) {
        if (typeof payload === 'string' && payload.trim().length > 0) {
            return payload
        }

        if (payload && typeof payload === 'object') {
            const apiError = payload as ApiErrorPayload
            const firstMessage =
                apiError.message ?? apiError.error ?? apiError.title ?? apiError.detail

            if (typeof firstMessage === 'string' && firstMessage.trim().length > 0) {
                return firstMessage
            }
        }

        return fallback
    }

    async function login(event: FormEvent) {
        event.preventDefault()
        setIsLoggingIn(true)
        setAuthMessage('Signing in...')

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const payload = await readResponseBody(response)

            if (!response.ok) {
                setToken('')
                setRestaurants([])
                setMenuItems([])
                setSelectedRestaurantId(null)
                setAuthMessage(getErrorMessage(payload, 'Login failed.'))
                return
            }

            const loginData = payload as LoginResponse

            if (!loginData?.token) {
                setToken('')
                setAuthMessage('Login failed: token was not returned by API.')
                return
            }

            setToken(loginData.token)
            setAuthMessage('Login successful.')
            setDataMessage('')
        } catch {
            setToken('')
            setAuthMessage('Could not connect to API. Check backend URL and CORS.')
        } finally {
            setIsLoggingIn(false)
        }
    }

    async function loadRestaurants() {
        setDataMessage('Loading restaurants...')

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/restaurants?pageNumber=1&pageSize=10`,
                {
                    headers: {
                        ...authHeaders,
                    },
                },
            )

            const payload = await readResponseBody(response)

            if (!response.ok) {
                setDataMessage(getErrorMessage(payload, 'Could not load restaurants.'))
                return
            }

            const data = payload as PagedResult<Restaurant>
            setRestaurants(data.items)
            setDataMessage(`Loaded ${data.items.length} restaurants.`)
        } catch {
            setDataMessage('Could not connect to API. Check backend URL and CORS.')
        }
    }

    async function loadMenu(restaurantId: number) {
        setSelectedRestaurantId(restaurantId)
        setDataMessage('Loading menu...')

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/menu/restaurant/${restaurantId}`,
            )

            const payload = await readResponseBody(response)

            if (!response.ok) {
                setDataMessage(getErrorMessage(payload, 'Could not load menu.'))
                return
            }

            setMenuItems(payload as MenuItem[])
            setDataMessage('Menu loaded.')
        } catch {
            setDataMessage('Could not connect to API. Check backend URL and CORS.')
        }
    }

    return (
        <main className="layout">
            <section className="panel">
                <h1>AngoMenu Frontend Starter</h1>
                <p>
                    Use this page to test login, list restaurants, and load menu items from
                    your backend API.
                </p>
            </section>

            <section className="panel">
                <h2>1) Login</h2>
                <form onSubmit={login} className="formGrid">
                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </label>

                    <button type="submit" disabled={isLoggingIn}>
                        {isLoggingIn ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="message">{authMessage}</p>
                {token && <code className="token">Token captured in memory.</code>}
            </section>

            <section className="panel">
                <h2>2) Restaurants</h2>
                <button onClick={loadRestaurants} disabled={!token}>
                    Load restaurants (requires JWT)
                </button>

                <ul>
                    {restaurants.map((restaurant) => (
                        <li key={restaurant.id}>
                            <strong>{restaurant.name}</strong> — {restaurant.location}
                            <button onClick={() => loadMenu(restaurant.id)}>Load Menu</button>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="panel">
                <h2>3) Menu {selectedRestaurantId && `(Restaurant ${selectedRestaurantId})`}</h2>
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            {item.name} - {item.price.toFixed(2)} AOA
                        </li>
                    ))}
                </ul>
            </section>

            <p className="message">{dataMessage}</p>
        </main>
    )
}

export default App