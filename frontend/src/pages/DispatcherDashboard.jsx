import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { logout } from "../services/auth";

function DispatcherDashboard() {
const navigate = useNavigate();


const [deliveries, setDeliveries] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
    fetchPendingDeliveries();
}, []);

const fetchPendingDeliveries = async () => {
    try {
        const response = await api.get("/deliveries/pending/");

        setDeliveries(response.data.deliveries || []);

    } catch (error) {
        console.error("Failed to load deliveries:", error);

        if (error.response?.status === 401) {
            logout();
            navigate("/login");
            return;
        }

        setError(
            error.response?.data?.error ||
            "Unable to load pending deliveries."
        );

    } finally {
        setLoading(false);
    }
};

const handleLogout = () => {
    logout();
    navigate("/login");
};

return (
    <div className="bg-light min-vh-100">

        <nav className="navbar navbar-dark bg-dark shadow-sm">
            <div className="container-fluid px-4">

                <span className="navbar-brand fw-bold fs-4">
                    Reflex
                </span>

                <button
                    className="btn btn-outline-light"
                    onClick={handleLogout}
                >
                    Sign Out
                </button>

            </div>
        </nav>

        <main className="container py-5">

            <div className="mb-4">
                <h1 className="fw-bold">
                    Dispatcher Dashboard
                </h1>

                <p className="text-muted">
                    Manage pending delivery requests.
                </p>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    <div className="p-4 border-bottom">
                        <h4 className="fw-bold mb-1">
                            Pending Deliveries
                        </h4>

                        <p className="text-muted mb-0">
                            Deliveries waiting for location verification
                            and rider assignment.
                        </p>
                    </div>

                    {loading ? (

                        <div className="text-center py-5">

                            <div
                                className="spinner-border"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>

                            <p className="text-muted mt-3 mb-0">
                                Loading deliveries...
                            </p>

                        </div>

                    ) : deliveries.length === 0 ? (

                        <div className="text-center py-5">

                            <h5>
                                No pending deliveries
                            </h5>

                            <p className="text-muted mb-0">
                                New delivery requests will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>

                                        <th className="px-4">
                                            ID
                                        </th>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Address
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {deliveries.map((delivery) => (

                                        <tr key={delivery.id}>

                                            <td className="px-4 fw-semibold">
                                                #{delivery.id}
                                            </td>

                                            <td>
                                                {delivery.customer_name}
                                            </td>

                                            <td>
                                                {delivery.customer_phone}
                                            </td>

                                            <td>
                                                {delivery.address}
                                            </td>

                                            <td>
                                                KSh{" "}
                                                {Number(
                                                    delivery.total_amount
                                                ).toLocaleString()}
                                            </td>

                                            <td>

                                                <span className="badge text-bg-secondary">
                                                    {delivery.status}
                                                </span>

                                            </td>

                                            <td>

                                                <button
                                                    className="btn btn-sm btn-dark"
                                                    onClick={() =>
                                                        navigate(
                                                            `/dispatcher/deliveries/${delivery.id}`
                                                        )
                                                    }
                                                >
                                                    Manage
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </main>

    </div>
);


}

export default DispatcherDashboard;
