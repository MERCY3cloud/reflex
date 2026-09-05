import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { logout } from "../services/auth";

function RiderDashboard() {
    const navigate = useNavigate();

    const [deliveries, setDeliveries] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMeAndDeliveries();

        // periodic refresh so newly assigned deliveries appear without re-login
        const intervalId = setInterval(() => {
            fetchDeliveries();
        }, 10000);

        // refresh when tab becomes visible again or window gains focus
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') fetchDeliveries();
        };
        const handleFocus = () => fetchDeliveries();

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const fetchMeAndDeliveries = async () => {
        try {
            const res = await api.get('/auth/me/');
            setUser(res.data);
        } catch (err) {
            console.error('Failed to fetch current user', err);
        }
        await fetchDeliveries();
    };

    const fetchDeliveries = async () => {
        try {
            const response = await api.get("/deliveries/my/");

            setDeliveries(response.data.deliveries || response.data);
        } catch (error) {
            console.error(error);

            if (error.response?.status === 401) {
                logout();
                navigate("/login");
                return;
            }

            setError("Unable to load your deliveries.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const nextStatusFor = (status) => {
        switch (status) {
            case "ASSIGNED":
                return "PICKED_UP";
            case "PICKED_UP":
                return "IN_TRANSIT";
            case "IN_TRANSIT":
                return "DELIVERED";
            default:
                return null;
        }
    };

    const handleAdvanceStatus = async (delivery) => {
        const next = nextStatusFor(delivery.status);
        if (!next) return;

        try {
            await api.post(`/deliveries/${delivery.id}/status/`, { status: next });
            fetchDeliveries();
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        }
    };

    const formatStatus = (status) => status.replaceAll("_", " ");

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-dark bg-dark shadow-sm">
                <div className="container-fluid px-4">
                    <span className="navbar-brand fw-bold fs-4">Rider Dashboard</span>
                    <button className="btn btn-outline-light" onClick={handleLogout}>Sign Out</button>
                </div>
            </nav>

            <main className="container py-4">
                <div className="mb-4">
                    <h1 className="fw-bold mb-1">Assigned Deliveries</h1>
                    <p className="text-muted mb-0">Manage your assigned deliveries.</p>
                    {user && (
                        <p className="text-muted small mb-0">Logged in as {user.username} ({user.role})</p>
                    )}
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : deliveries.length === 0 ? (
                    <div className="text-center py-5">
                        <h5>No assigned deliveries</h5>
                        <p className="text-muted">You will see deliveries once a dispatcher assigns them to you.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Address</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {deliveries.map((d) => (
                                    <tr key={d.id}>
                                        <td>#{d.id}</td>
                                        <td>{d.customer_name}</td>
                                        <td>{d.address}</td>
                                        <td>{d.item_description}</td>
                                        <td>KSh {Number(d.total_amount).toLocaleString()}</td>
                                        <td>{formatStatus(d.status)}</td>
                                        <td>
                                            {nextStatusFor(d.status) ? (
                                                <button className="btn btn-sm btn-primary" onClick={() => handleAdvanceStatus(d)}>
                                                    Mark {nextStatusFor(d.status).replaceAll("_", " ")}
                                                </button>
                                            ) : (
                                                <span className="text-muted">No action</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

export default RiderDashboard;
