import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { logout } from "../services/auth";

function Dashboard() {
const navigate = useNavigate();


const [deliveries, setDeliveries] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
    fetchDeliveries();
}, []);

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

const totalDeliveries = deliveries.length;

const createdDeliveries = deliveries.filter(
    (delivery) => delivery.status === "CREATED"
).length;

const inTransitDeliveries = deliveries.filter(
    (delivery) => delivery.status === "IN_TRANSIT"
).length;

const deliveredDeliveries = deliveries.filter(
    (delivery) => delivery.status === "DELIVERED"
).length;

const getStatusBadge = (status) => {
    switch (status) {
        case "CREATED":
            return "badge text-bg-secondary";

        case "LOCATION_VERIFIED":
            return "badge text-bg-info";

        case "ASSIGNED":
            return "badge text-bg-primary";

        case "PICKED_UP":
            return "badge text-bg-warning";

        case "IN_TRANSIT":
            return "badge text-bg-dark";

        case "DELIVERED":
            return "badge text-bg-success";

        default:
            return "badge text-bg-secondary";
    }
};

const formatStatus = (status) => {
    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h1 className="fw-bold mb-1">
                        Retailer Dashboard
                    </h1>

                    <p className="text-muted mb-0">
                        Manage and track your deliveries.
                    </p>
                </div>

                <button
                    className="btn btn-dark"
                    onClick={() => navigate("/deliveries/create")}
                >
                    + New Delivery
                </button>

            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="row g-4 mb-5">

                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-2">
                                Total Deliveries
                            </p>

                            <h2 className="fw-bold mb-0">
                                {totalDeliveries}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-2">
                                Created
                            </p>

                            <h2 className="fw-bold mb-0">
                                {createdDeliveries}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-2">
                                In Transit
                            </p>

                            <h2 className="fw-bold mb-0">
                                {inTransitDeliveries}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-2">
                                Delivered
                            </p>

                            <h2 className="fw-bold mb-0">
                                {deliveredDeliveries}
                            </h2>
                        </div>
                    </div>
                </div>

            </div>

            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    <div className="p-4 border-bottom">
                        <h4 className="fw-bold mb-1">
                            My Deliveries
                        </h4>

                        <p className="text-muted mb-0">
                            Recent delivery requests
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
                                No deliveries yet
                            </h5>

                            <p className="text-muted">
                                Create your first delivery request.
                            </p>

                            <button
                                className="btn btn-dark"
                                onClick={() =>
                                    navigate("/deliveries/create")
                                }
                            >
                                Create Delivery
                            </button>

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
                                            Address
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Date
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
                                                {delivery.address}
                                            </td>

                                            <td>
                                                KSh{" "}
                                                {Number(
                                                    delivery.total_amount
                                                ).toLocaleString()}
                                            </td>

                                            <td>
                                                <span
                                                    className={getStatusBadge(
                                                        delivery.status
                                                    )}
                                                >
                                                    {formatStatus(
                                                        delivery.status
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                {new Date(
                                                    delivery.created_at
                                                ).toLocaleDateString()}
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

export default Dashboard;
