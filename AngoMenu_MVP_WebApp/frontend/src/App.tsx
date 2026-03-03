import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type LoginResponse = { token: string }

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
    const [count, setCount] = useState(0)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [token, setToken] = useState('')
    const [authMessage, setAuthMessage] = useState('')

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

    async function login(event: FormEvent) {
        event.preventDefault()
        setAuthMessage('Signing in...')

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        const payload = await response.json()

        if (!response.ok) {
            setAuthMessage(payload ?? 'Login failed.')
            return
        }

        const loginData = payload as LoginResponse
        setToken(loginData.token)
        setAuthMessage('Login successful.')
    }

    async function loadRestaurants() {
        setDataMessage('Loading restaurants...')

        const response = await fetch(
            `${API_BASE_URL}/api/restaurants?pageNumber=1&pageSize=10`,
            {
                headers: {
                    ...authHeaders,
                },
            },
        )

        const payload = await response.json()

        if (!response.ok) {
            setDataMessage(
                typeof payload === 'string' ? payload : 'Could not load restaurants.',
            )
            return
        }

        const data = payload as PagedResult<Restaurant>
        setRestaurants(data.items)
        setDataMessage(`Loaded ${data.items.length} restaurants.`)
    }

    async function loadMenu(restaurantId: number) {
        setSelectedRestaurantId(restaurantId)
        setDataMessage('Loading menu...')

        const response = await fetch(
            `${API_BASE_URL}/api/menu/restaurant/${restaurantId}`,
        )

        const payload = await response.json()

        if (!response.ok) {
            setDataMessage(
                typeof payload === 'string' ? payload : 'Could not load menu.',
            )
            return
        }

        setMenuItems(payload as MenuItem[])
        setDataMessage('Menu loaded.')
    }

    return (
        <main className="layout">
            <section className="panel">
                <h1>AngoMenu Frontend Starter</h1>
                <p>
                    This first UI lets you test login, list restaurants, and read menu items
                    from your API.
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

                    <button type="submit">Sign in</button>
                </form>

                <p className="message">{authMessage || 'Not signed in yet.'}</p>
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
