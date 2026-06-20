// import './header.css'
import { LOGO_URL } from '../utils/constants'
import { Link } from 'react-router'
function Header(props) {
    const {isOnline} = props
    return (
        <div className="Header">
            
            
            <img className='Logo' src={LOGO_URL} alt="logo" />
            

            <div className="Nav">
                <ul>
                    <li>{isOnline?'🟢':'❌'} Online</li>
                    <li><Link to='/'>Home</Link></li>
                    <li><Link to='/grocery'>Grocery</Link></li>
                    <li><Link to='/about'>About</Link></li>
                    <li><Link to='/contact'>Contact Us</Link></li>
                    <li><Link to='/cart'>Cart</Link></li>
                </ul>
            </div>

        </div>
    )
    
}

export default Header