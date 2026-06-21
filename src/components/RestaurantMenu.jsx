import useRestaurantMenu from "../utils/useRestaurantMenu"
import Shimmer from "./Shimmer"
import { useParams } from "react-router"

const RestaurantMenu = () => {

    const {resId} = useParams()
    // Used custom hook
    const menuArray = useRestaurantMenu(resId)

    if (menuArray === undefined || menuArray === '' || menuArray === null){
        return <div>
        <h1 className="flex justify-center">Menu</h1>
        <Shimmer/>
        </div>
    } else {
        const menu = menuArray.filter( (c) => c.card?.card?.['@type'] === 'type.googleapis.com/swiggy.presentation.food.v2.ItemCategory' );
        console.log(menu);
        
        return(
            <div className="">
                Items
            </div>
        )
    }
}

export default RestaurantMenu