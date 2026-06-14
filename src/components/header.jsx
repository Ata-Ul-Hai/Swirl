// import './header.css'
import { LOGO_URL } from '../utils/constants'

function Header() {

    return (
        <div className="Header">
            
            
            <img className='Logo' src={LOGO_URL} alt="logo" />
            

            <div className="Nav">
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/menu">Menu</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </div>

        </div>
    )
    
}

export default Header