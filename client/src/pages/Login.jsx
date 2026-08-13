import { useState } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await loginUser(
                email,
                password
            );

            console.log("LOGIN DATA:", data);
            console.log("USER ROLE:", data.user?.role);

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            if (data.user.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app auth-page">

            <div className="auth-container">

                <div className="brand">

                    <div className="brand">
                        Cine<span>Sync</span>
                    </div>

                    <p className="tagline">
                        Watch together. Stay in sync.
                    </p>

                    <p className="description">
                        Create a room, invite your friends,
                        and enjoy your movie night together
                        in real time.
                    </p>

                </div>

                <div className="auth-card">

                    <h2>
                        Welcome back
                    </h2>

                    <form onSubmit={handleLogin}>

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                        <div className="password-wrapper">

    <input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={(e) =>
            setPassword(e.target.value)
        }
        required
    />

    <button
        type="button"
        className="password-toggle"
        onClick={() =>
            setShowPassword((prev) => !prev)
        }
        aria-label={
            showPassword
                ? "Hide password"
                : "Show password"
        }
    >
        {showPassword ? (
            <EyeOff size={18} />
        ) : (
            <Eye size={18} />
        )}
    </button>

</div>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Entering CineSync..."
                                : "Enter CineSync"
                            }
                        </button>

                    </form>

                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}

                    <p className="switch-text">

                        New to CineSync?

                        <Link
                            to="/register"
                            className="link-button"
                        >
                            Create an account
                        </Link>

                    </p>

                </div>

                <p className="auth-footer">
                    Your movie night, together.
                </p>

            </div>

        </div>
    );
}

export default Login;