import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
const navigate = useNavigate();


const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "RETAILER",
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

const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
        await api.post("/auth/register/", formData);

        setSuccess("Account created successfully. You can now log in.");

        setTimeout(() => {
            navigate("/login");
        }, 1500);

    } catch (error) {
        console.error(error);

        if (error.response?.data) {
            setError(
                error.response.data.error ||
                error.response.data.detail ||
                "Registration failed."
            );
        } else {
            setError("Unable to connect to the server.");
        }
    } finally {
        setLoading(false);
    }
};

return (
    <div className="login-page">
        <div className="container">
            <div className="row justify-content-center align-items-center min-vh-100">

                <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">

                    <div className="card border-0 shadow-lg login-card">

                        <div className="card-body p-4 p-md-5">

                            <div className="text-center mb-4">
                                <h1 className="fw-bold mb-2">
                                    Create Account
                                </h1>

                                <p className="text-muted mb-0">
                                    Join Reflex Delivery Management
                                </p>
                            </div>

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

                            <form onSubmit={handleRegister}>

                                <div className="mb-3">
                                    <label
                                        htmlFor="username"
                                        className="form-label fw-semibold"
                                    >
                                        Username
                                    </label>

                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="Choose a username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label
                                        htmlFor="password"
                                        className="form-label fw-semibold"
                                    >
                                        Password
                                    </label>

                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        className="form-control form-control-lg"
                                        placeholder="Choose a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="role"
                                        className="form-label fw-semibold"
                                    >
                                        Account Type
                                    </label>

                                    <select
                                        id="role"
                                        name="role"
                                        className="form-select form-select-lg"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="RETAILER">
                                            Retailer
                                        </option>

                                        <option value="DISPATCHER">
                                            Dispatcher
                                        </option>

                                        <option value="RIDER">
                                            Rider
                                        </option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-dark btn-lg w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Creating Account..."
                                        : "Create Account"}
                                </button>

                            </form>

                            <div className="text-center mt-4">
                                <span className="text-muted">
                                    Already have an account?
                                </span>

                                <button
                                    type="button"
                                    className="btn btn-link text-decoration-none"
                                    onClick={() => navigate("/login")}
                                >
                                    Sign in
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
);


}

export default Register;
