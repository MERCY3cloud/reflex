import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateDelivery() {
const navigate = useNavigate();


const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    address: "",
    item_description: "",
    total_amount: "",
    deposit_paid: "",
    quantity: 1,
});

const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (event) => {
    setFormData({
        ...formData,
        [event.target.name]: event.target.value,
    });
};

const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
        const payload = {
            ...formData,
            total_amount: Number(formData.total_amount || 0),
            deposit_paid: Number(formData.deposit_paid || 0),
            quantity: Number(formData.quantity || 1),
        };

        const response = await api.post(
            "/deliveries/create/",
            payload
        );

        console.log("Delivery created:", response.data);

        setSuccess("Delivery created successfully.");

        setFormData({
            customer_name: "",
            customer_phone: "",
            address: "",
            item_description: "",
            total_amount: "",
        });

    } catch (error) {
        console.error("Delivery error:", error);

        setError(
            error.response?.data?.error ||
            error.response?.data?.detail ||
            "Unable to create delivery."
        );
    } finally {
        setLoading(false);
    }
};

return (
    <div className="bg-light min-vh-100">

        <nav className="navbar navbar-dark bg-dark shadow-sm">
            <div className="container">

                <span className="navbar-brand fw-bold">
                    Reflex
                </span>

                <button
                    className="btn btn-outline-light"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>

            </div>
        </nav>

        <main className="container py-5">

            <div className="row justify-content-center">

                <div className="col-lg-8">

                    <div className="mb-4">
                        <h1 className="fw-bold">
                            Create Delivery
                        </h1>

                        <p className="text-muted">
                            Enter the customer's delivery information below.
                        </p>
                    </div>

                    <div className="card border-0 shadow-sm">

                        <div className="card-body p-4 p-md-5">

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <div className="row">

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">
                                            Customer Name
                                        </label>

                                        <input
                                            type="text"
                                            name="customer_name"
                                            className="form-control"
                                            placeholder="Enter customer name"
                                            value={formData.customer_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">
                                            Customer Phone
                                        </label>

                                        <input
                                            type="text"
                                            name="customer_phone"
                                            className="form-control"
                                            placeholder="Enter phone number"
                                            value={formData.customer_phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-semibold">
                                            Delivery Address
                                        </label>

                                        <textarea
                                            name="address"
                                            className="form-control"
                                            rows="3"
                                            placeholder="Enter delivery address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-semibold">
                                            Item Description
                                        </label>

                                        <textarea
                                            name="item_description"
                                            className="form-control"
                                            rows="2"
                                            placeholder="Describe the item being delivered"
                                            value={formData.item_description}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-4">
                                        <label className="form-label fw-semibold">
                                            Total Amount (KSh)
                                        </label>

                                        <input
                                            type="number"
                                            name="total_amount"
                                            className="form-control"
                                            placeholder="5000"
                                            min="0"
                                            step="0.01"
                                            value={formData.total_amount}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-4">
                                        <label className="form-label fw-semibold">Deposit Paid (KSh)</label>

                                        <input
                                            type="number"
                                            name="deposit_paid"
                                            className="form-control"
                                            placeholder="1000"
                                            min="0"
                                            step="0.01"
                                            value={formData.deposit_paid}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-4 mb-4">
                                        <label className="form-label fw-semibold">Quantity</label>

                                        <input
                                            type="number"
                                            name="quantity"
                                            className="form-control"
                                            min="1"
                                            step="1"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-8 mb-4">
                                        <label className="form-label fw-semibold">Balance (KSh)</label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            readOnly
                                            value={(() => {
                                                const total = parseFloat(formData.total_amount || 0);
                                                const deposit = parseFloat(formData.deposit_paid || 0);
                                                return (total - deposit).toFixed(2);
                                            })()}
                                        />
                                    </div>

                                </div>

                                <div className="d-flex gap-2">

                                    <button
                                        type="submit"
                                        className="btn btn-dark px-4"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Creating..."
                                            : "Create Delivery"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() =>
                                            navigate("/dashboard")
                                        }
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </main>

    </div>
);


}

export default CreateDelivery;
