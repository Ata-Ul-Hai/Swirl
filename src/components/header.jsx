// import './header.css'
import { LOGO_URL } from '../utils/constants'
import { Link } from 'react-router'
function Header(props) {
    const {isOnline} = props
    return (
        <div className="flex justify-between bg-emerald-100 shadow-lg">
            
            
            <img className='w-30 p-2 rounded-full' src={LOGO_URL} alt="logo" />
            

            <div className="flex items-center">
                <ul className='flex p4 m4'>
                    <li className='px-4'>
                        {isOnline?'🟢':'❌'} Online
                    </li>

                    <li className='px-4'>
                        <Link to='/'>Home</Link>
                    </li>
                    
                    <li className='px-4'>
                        <Link to='/grocery'>Grocery</Link>
                    </li>

                    <li className='px-4'>
                        <Link to='/about'>About</Link>
                    </li>

                    <li className='px-4'>
                        <Link to='/contact'>Contact Us</Link>
                    </li>

                    <li className='px-4'>
                        <Link to='/cart'>Cart</Link>
                    </li>
                </ul>
            </div>

        </div>
    )
    
}

export default Header