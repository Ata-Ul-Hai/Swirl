import { useContext, useState } from 'react'
import { LOGO_URL } from '../utils/constants'
import { Link } from 'react-router'
import UserContext from '../utils/UserContext'
import { useSelector } from 'react-redux'

function Header(props) {
    const {isOnline} = props
    const {loggedInUser} = useContext(UserContext)
    const cartItems = useSelector((store) => store.cart.items)
    const [btnNameReact, setBtnNameReact] = useState("LogIn");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleLogin = () => {
        setBtnNameReact(btnNameReact === 'LogIn' ? 'LogOut' : 'LogIn')
    }

    const navLinks = (
        <>
            <li className="flex items-center gap-2 px-4 py-2 md:py-0">
                <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>
            </li>

            <li className="px-4 py-2 md:py-0">
                <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
            </li>

            <li className="px-4 py-2 md:py-0">
                <Link to="/grocery" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Grocery</Link>
            </li>

            <li className="px-4 py-2 md:py-0">
                <Link to="/about" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>About</Link>
            </li>

            <li className="px-4 py-2 md:py-0">
                <Link to="/contact" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
            </li>

            <li className="px-4 py-2 md:py-0">
                <Link to="/cart" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-3 py-1.5 transition-colors" onClick={() => setIsMenuOpen(false)}>
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

            <li className="px-4 py-2 md:py-0 text-sm text-gray-600">
                {loggedInUser}
            </li>
        </>
    );

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
                <Link to="/">
                    <img className="w-16 h-16 object-contain" src={LOGO_URL} alt="logo" />
                </Link>
                {/* Toggle Button for responsiveness */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
                    aria-label="Toggle menu"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-gray-700 transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>

                <nav className="hidden md:flex items-center">
                    <ul className="flex items-center list-none m-0 p-0">
                        {navLinks}
                    </ul>
                </nav>
            </div>

            {isMenuOpen && (
                <nav className="md:hidden border-t border-gray-200 bg-white">
                    <ul className="flex flex-col list-none m-0 p-2">
                        {navLinks}
                    </ul>
                </nav>
            )}
        </header>
    )
}

export default Header
