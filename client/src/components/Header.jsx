import { useContext, useState, useEffect } from "react";
import { LOGO_URL } from "../utils/constants";
import { Link } from "react-router";
import UserContext from "../utils/UserContext";
import { useSelector } from "react-redux";
import AuthModal from "./AuthModal";

function Header(props) {
  const { isOnline } = props;
  const { loggedInUser, user, logout } = useContext(UserContext);
  const cartItems = useSelector((store) => store.cart.items);
  const [btnNameReact, setBtnNameReact] = useState("LogIn");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setBtnNameReact("LogOut");
    } else {
      setBtnNameReact("LogIn");
    }
  }, [user]);

  const toggleLogin = () => {
    if (btnNameReact === "LogOut") {
      logout();
      setBtnNameReact("LogIn");
    } else {
      setIsAuthModalOpen(true);
      setBtnNameReact("LogOut");
    }
  };

  const navLinks = (
    <>
      <li className="flex items-center gap-2 px-4 py-2 md:py-0">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-gray-600">
          {isOnline ? "Online" : "Offline"}
        </span>
      </li>

      <li className="px-4 py-2 md:py-0">
        <Link
          to="/"
          className="text-gray-700 hover:text-orange-500 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Home
        </Link>
      </li>

      <li className="px-4 py-2 md:py-0">
        <Link
          to="/restaurants"
          className="text-gray-700 hover:text-orange-500 transition-colors font-medium"
          onClick={() => setIsMenuOpen(false)}
        >
          Restaurants
        </Link>
      </li>

      <li className="px-4 py-2 md:py-0">
        <Link
          to="/grocery"
          className="text-gray-700 hover:text-orange-500 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Grocery
        </Link>
      </li>

      <li className="px-4 py-2 md:py-0">
        <Link
          to="/about"
          className="text-gray-700 hover:text-orange-500 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          About
        </Link>
      </li>

      <li className="px-4 py-2 md:py-0">
        <Link
          to="/contact"
          className="text-gray-700 hover:text-orange-500 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Contact Us
        </Link>
      </li>

      <li className="px-4 py-2 md:py-0">
        <Link
          to="/restaurant"
          className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Partner Panel
        </Link>
      </li>

      <li className="px-4 py-2 md:py-0">
        <Link
          to="/cart"
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-3 py-1.5 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          {cartItems.length} Cart
        </Link>
      </li>

      <li className="px-4 py-2 md:py-0">
        <button
          onClick={toggleLogin}
          className="border border-orange-500 text-orange-500 hover:bg-orange-50 rounded-lg px-4 py-1.5 transition-colors cursor-pointer"
        >
          {btnNameReact}
        </button>
      </li>

      <li className="px-4 py-2 md:py-0 text-sm text-gray-600 font-medium">
        {loggedInUser}
      </li>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
          <Link to="/">
            <img
              className="w-16 h-16 object-contain"
              src={LOGO_URL}
              alt="logo"
            />
          </Link>
          {/* Toggle Button for responsiveness */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-gray-700 transition-transform ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-gray-700 transition-opacity ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-gray-700 transition-transform ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center">
            <ul className="flex items-center list-none m-0 p-0">{navLinks}</ul>
          </nav>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 bg-white px-4 py-3">
            <ul className="flex flex-col gap-3 list-none m-0 p-0">
              {navLinks}
            </ul>
          </nav>
        )}
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

export default Header;
