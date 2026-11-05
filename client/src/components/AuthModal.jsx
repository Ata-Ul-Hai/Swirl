import { useState, useContext } from "react";
import UserContext from "../utils/UserContext";

function AuthModal({ isOpen, onClose }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup } = useContext(UserContext);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        if (!name.trim()) throw new Error("Name is required");
        if (!email.trim()) throw new Error("Email is required");
        if (password.length < 6)
          throw new Error("Password must be at least 6 characters");

        const address =
          city.trim() && pincode.trim()
            ? { city: city.trim(), pincode: pincode.trim(), isDefault: true }
            : undefined;

        await signup(name, email, password, address);
      } else {
        if (!email.trim() || !password)
          throw new Error("Email and password are required");

        await login(email, password);
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        err.message ||
        "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignup ? "Create an Account" : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isSignup
              ? "Sign up to track orders and save favorite restaurants"
              : "Log in with your email and password"}
          </p>

          {/* Tab selector */}
          <div className="flex border-b border-gray-200 mt-4">
            <button
              type="button"
              className={`flex-1 py-2 text-center text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                !isSignup
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setIsSignup(false);
                setError("");
              }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-center text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                isSignup
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setIsSignup(true);
                setError("");
              }}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {isSignup && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                data-testid="auth-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              data-testid="auth-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              data-testid="auth-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              required
            />
          </div>

          {isSignup && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  City (Optional)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New Delhi"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Pincode (Optional)
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="110025"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
