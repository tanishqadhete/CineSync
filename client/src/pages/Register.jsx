import { useState } from "react";
import { registerUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";

function Register() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const data = await registerUser(
                username,
                email,
                password
            );

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            navigate("/dashboard");

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="auth-container">

            <h1>CineSync</h1>

            <p className="subtitle">
                Create your account.
            </p>

            <div className="auth-card">

                <h2>Register</h2>

                <form onSubmit={handleRegister}>

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Register"
                        }
                    </button>

                </form>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                <p className="switch-text">
                    Already have an account?

                    <Link
                        to="/"
                        className="link-button"
                    >
                        Login
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default Register;