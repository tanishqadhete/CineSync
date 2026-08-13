import { useState } from "react";
import { registerUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="app auth-page">

            <div className="auth-container">

                <div className="brand">

                    <div className="brand">
                        Cine<span>Sync</span>
                    </div>

                    <p className="tagline">
                        Your movie night starts here.
                    </p>

                    

                </div>

                <div className="auth-card">

                    <h2>
                        Create your account
                    </h2>

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
                                ? "Creating your account..."
                                : "Create Account"
                            }
                        </button>

                    </form>

                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}

                    <p className="switch-text">

                        Already part of CineSync?

                        <Link
                            to="/"
                            className="link-button"
                        >
                            Login
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

export default Register;
