import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import background from "../assets/background.png";
import { UserDataContext } from "../context/UserContext";
import axios from "axios";

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { serverUrl, setUserData } = useContext(UserDataContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { name, email, password } = formData;

            const result = await axios.post(
                `${serverUrl}/api/auth/signup`,
                { name, email, password },
                { withCredentials: true }
            );

            console.log("Signup success:", result.data);
            if (setUserData) {
                setUserData(result.data);
            }
            navigate("/");
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.response?.data?.message || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="w-full min-h-screen min-h-dvh bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 sm:p-6 md:p-8"
            style={{ backgroundImage: `url(${background})` }}>
            <form
                onSubmit={handleSignUp}
                className="
                    w-full
                    max-w-[440px]
                    p-6 sm:p-8
                    bg-[#17111F]/70
                    backdrop-blur-xl
                    rounded-2xl
                    border border-[#D4AF72]/30
                    shadow-[0_8px_40px_rgba(0,0,0,0.45)]
                    transition-all
                "
            >
                <h1 className="text-2xl sm:text-3xl text-center text-[#E8C98A] font-semibold tracking-widest mb-1.5">
                    ASTRA
                </h1>

                <p className="text-center text-gray-300 text-xs sm:text-sm mb-6 sm:mb-8">
                    Create your account
                </p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs sm:text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Name */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-[#E8C98A] text-xs sm:text-sm mb-1.5 font-medium">
                        Full Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="w-full px-3.5 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm sm:text-base outline-none focus:border-[#D4AF72] focus:ring-1 focus:ring-[#D4AF72] transition-colors"
                    />
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-[#E8C98A] text-xs sm:text-sm mb-1.5 font-medium">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        spellCheck="false"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full px-3.5 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm sm:text-base outline-none focus:border-[#D4AF72] focus:ring-1 focus:ring-[#D4AF72] transition-colors"
                    />
                </div>

                {/* Password */}
                <div className="mb-6">
                    <label htmlFor="password" className="block text-[#E8C98A] text-xs sm:text-sm mb-1.5 font-medium">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className="w-full pl-3.5 pr-11 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm sm:text-base outline-none focus:border-[#D4AF72] focus:ring-1 focus:ring-[#D4AF72] transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E8C98A] focus:outline-none transition-colors"
                        >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF72] to-[#E8C98A] text-black font-semibold text-sm sm:text-base tracking-wide hover:opacity-95 active:scale-[0.99] transition-all shadow-md shadow-[#D4AF72]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>

                {/* Switch to Sign In */}
                <p className="text-center text-gray-400 text-xs sm:text-sm mt-5">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-[#E8C98A] font-medium hover:underline hover:text-[#F3DBA7] transition-colors">
                        Sign In
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default SignUp;
