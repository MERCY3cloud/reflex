import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

function Login() {
const navigate = useNavigate();


const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

        try {
            const result = await login(username, password);

            const user = result?.user;

            if (user?.role === "RETAILER") {
                navigate("/dashboard");
            } else if (user?.role === "DISPATCHER") {
                navigate("/dispatcher/dashboard");
            } else if (user?.role === "RIDER") {
                navigate("/rider/dashboard");
            } else {
                navigate("/dashboard");
            }

    } catch (error) {
        console.error(error);

        setError("Invalid username or password.");
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
                                    Reflex
                                </h1>

                                <p className="text-muted">
                                    Delivery Management System
                                </p>
                            </div>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin}>

                                <div className="mb-3">
                                    <label
                                        htmlFor="username"
                                        className="form-label fw-semibold"
                                    >
                                        Username
                                    </label>

                                    <input
                                        id="username"
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(event) =>
                                            setUsername(event.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="password"
                                        className="form-label fw-semibold"
                                    >
                                        Password
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-dark btn-lg w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Signing in..."
                                        : "Sign In"}
                                    Sign In
                                </button>

                            </form>

                            <div className="text-center mt-4">
                                <span className="text-muted">
                                    Don't have an account?
                                </span>

                                <button
                                    type="button"
                                    className="btn btn-link text-decoration-none"
                                    onClick={() => navigate("/register")}
                                >
                                    Create an account
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

export default Login;
