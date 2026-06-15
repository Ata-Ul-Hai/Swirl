// import './header.css'
import { LOGO_URL } from '../utils/constants'
import { Link } from 'react-router'
function Header() {

    return (
        <div className="Header">
            
            
            <img className='Logo' src={LOGO_URL} alt="logo" />
            

            <div className="Nav">
                <ul>
                    <li><Link to='/'>Home</Link></li>
                    <li><Link to='/about'>About</Link></li>
                    <li><Link to='/contact'>Contact Us</Link></li>
                    <li><Link to='/cart'>Cart</Link></li>
                </ul>
            </div>

        </div>
    )
    
}

export default Header