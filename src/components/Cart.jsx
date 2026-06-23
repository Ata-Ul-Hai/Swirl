import { useSelector } from "react-redux"
import ItemList from "./itemList"
import { useDispatch } from "react-redux"
import { clearCart } from "../utils/cartSlice"

const Cart = () => {
    const dispatch = useDispatch()

    const handleClearBtn = () => {
        dispatch(clearCart())
    }
    const cartItems = useSelector((store) => store.cart.items)

    return(
        <div className="text-center m-4 p-4" >
            <h1 className="font-bold text-2xl">Cart</h1>
            <button 
            className="border border-solid border-black rounded-xl px-2 m-2 hover:cursor-pointer bg-red-400 "
            onClick={handleClearBtn}
            >Clear Cart</button>
            <div className="w-6/12 m-auto">
                <ItemList data={cartItems} />
                {cartItems.length === 0 && (
                    <><h1>Cart is empty</h1>
                    <h1>Add Items to the cart!</h1></>)
                }
            </div>
        </div>
    )
}

export default Cart