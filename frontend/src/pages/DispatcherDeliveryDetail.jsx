import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { logout } from "../services/auth";

function DispatcherDeliveryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRider, setSelectedRider] = useState("");
    const [riders, setRiders] = useState([]);
    const [ridersLoading, setRidersLoading] = useState(true);
    const [ridersError, setRidersError] = useState("");

    useEffect(() => {
        fetchDetail();
        fetchRiders();
    }, [id]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/deliveries/${id}/`);
            setDelivery(res.data.delivery);
            // ensure controlled select value
            setSelectedRider(res.data.delivery.rider_id || "");
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                logout();
                navigate("/login");
                return;
            }
            setError("Failed to load delivery details.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRiders = async () => {
        setRidersLoading(true);
        setRidersError("");
        try {
            const res = await api.get(`/deliveries/riders/`);
            setRiders(res.data.riders || []);
        } catch (err) {
            console.error("Failed to load riders:", err);
            setRidersError("Unable to load riders.");
        } finally {
            setRidersLoading(false);
        }
    };

    const handleVerify = async () => {
        try {
            await api.post(`/deliveries/${id}/verify-location/`);
            fetchDetail();
        } catch (err) {
            console.error(err);
            alert("Failed to verify location.");
        }
    };

    const handleAssign = async () => {
        if (!selectedRider) {
            alert("Please select a rider.");
            return;
        }
        try {
            await api.post(`/deliveries/${id}/assign-rider/`, { rider_id: selectedRider });
            fetchDetail();
        } catch (err) {
            console.error(err);
            alert("Failed to assign rider.");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">{error}</div>
        );
    }

    if (!delivery) {
        return null;
    }

    return (
        <div className="container py-5">
            <div className="mb-3">
                <button className="btn btn-link" onClick={() => navigate('/dispatcher/dashboard')}>← Back</button>
            </div>

            <h2>Delivery #{delivery.id}</h2>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">{delivery.customer_name} — KSh {Number(delivery.total_amount).toLocaleString()}</h5>
                    <p className="card-text">{delivery.item_description}</p>
                    <p className="mb-1"><strong>Phone:</strong> {delivery.customer_phone}</p>
                    <p className="mb-1"><strong>Address:</strong> {delivery.address}</p>
                    <p className="mb-1"><strong>Quantity:</strong> {delivery.quantity}</p>
                    <p className="mb-1"><strong>Deposit:</strong> KSh {Number(delivery.deposit_paid).toLocaleString()}</p>
                    <p className="mb-1"><strong>Balance:</strong> KSh {Number(delivery.balance).toLocaleString()}</p>
                    <p className="mb-1"><strong>Status:</strong> {delivery.status}</p>
                    <p className="mb-1"><strong>Assigned Rider:</strong> {delivery.rider || '—'}</p>
                </div>
            </div>

            <div className="mb-4">
                <h5>Actions</h5>

                {delivery.status === "CREATED" && (
                    <button className="btn btn-primary me-2" onClick={handleVerify}>Verify Location</button>
                )}

                {delivery.status === "LOCATION_VERIFIED" && (
                    <>
                        {ridersLoading ? (
                            <span className="me-2">Loading riders...</span>
                        ) : ridersError ? (
                            <span className="text-danger me-2">{ridersError}</span>
                        ) : (
                            <select className="form-select d-inline-block w-auto me-2" value={selectedRider} onChange={(e) => setSelectedRider(e.target.value)}>
                                <option value="">Select rider</option>
                                {riders.length > 0 ? (
                                    riders.map((r) => (
                                        <option key={r.id} value={r.id}>{(r.first_name || r.last_name) ? `${r.first_name} ${r.last_name}`.trim() : r.username}</option>
                                    ))
                                ) : (
                                    // fall back to delivery.available_riders if present
                                    delivery.available_riders?.map((r) => (
                                        <option key={r.id} value={r.id}>{r.username}</option>
                                    ))
                                )}
                            </select>
                        )}

                        <button className="btn btn-success" onClick={handleAssign}>Assign Rider</button>
                    </>
                )}
            </div>

            <div>
                <h5>Status History</h5>
                <ul className="list-group">
                    {delivery.history.map((h, idx) => (
                        <li key={idx} className="list-group-item">
                            {h.changed_at} — {h.old_status || 'INIT'} → {h.new_status} — {h.changed_by}
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
}

export default DispatcherDeliveryDetail;
