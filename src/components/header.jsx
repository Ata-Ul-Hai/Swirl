// import './header.css'
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
    // console.log(cartItems);

    
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
                        <Link to='/cart'>🛒({cartItems.length})</Link>
                    </li>

                    <li className='px-4'>
                        <button onClick={() => {
                            btnNameReact==='LogIn'
                                ? setBtnNameReact('LogOut')
                                : setBtnNameReact('LogIn')
                            }}
                        >
                            {btnNameReact}
                        </button>
                    </li>

                    <li className='px-4'>
                        {loggedInUser}
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Header