import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRestaurants, type PagedResult, type Restaurant } from "../lib/api";

export default function RestaurantsPage() {
    const [data, setData] = useState<PagedResult<Restaurant> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10;

    async function loadRestaurants() {
        setLoading(true);
        setError("");
        try {
            const result = await getRestaurants({
                pageNumber,
                pageSize,
                search: search.trim() || undefined,
            });
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load restaurants");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRestaurants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNumber]);

    const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / data.pageSize)) : 1;

    return (
        <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
            <h1>Restaurants</h1>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or location"
                    style={{ flex: 1 }}
                />
                <button
                    onClick={() => {
                        setPageNumber(1);
                        loadRestaurants();
                    }}
                >
                    Search
                </button>
            </div>

            {loading && <p>Loading restaurants...</p>}
            {error && <p style={{ color: "crimson" }}>{error}</p>}

            {!loading && !error && data && data.items.length === 0 && <p>No restaurants found.</p>}

            {!loading && !error && data && data.items.length > 0 && (
                <>
                    <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
                        {data.items.map((r) => (
                            <li key={r.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                                <h3 style={{ margin: "0 0 8px" }}>{r.name}</h3>
                                <p style={{ margin: "4px 0" }}><strong>Location:</strong> {r.location}</p>
                                <p style={{ margin: "4px 0" }}><strong>Phone:</strong> {r.phone}</p>
                                {r.description && <p style={{ margin: "4px 0" }}>{r.description}</p>}

                                {/* Added navigation button */}
                                <div style={{ marginTop: 10 }}>
                                    <Link to={`/restaurants/${r.id}`}>
                                        <button>View Details</button>
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
                        <button disabled={pageNumber <= 1} onClick={() => setPageNumber((p) => p - 1)}>
                            Prev
                        </button>
                        <span>
                            Page {pageNumber} / {totalPages}
                        </span>
                        <button
                            disabled={pageNumber >= totalPages}
                            onClick={() => setPageNumber((p) => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}