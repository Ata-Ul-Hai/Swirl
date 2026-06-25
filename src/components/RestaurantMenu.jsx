import useRestaurantMenu from "../utils/useRestaurantMenu"
import Shimmer from "./Shimmer"
import { useParams } from "react-router"
import { useState } from "react"
import RestaurantCategory from "./RestaurantCategory"

const RestaurantMenu = () => {
    const [showIndex, setShowIndex] = useState(null);

    const {resId} = useParams()
    // Used custom hook
    const menuArray = useRestaurantMenu(resId)
    // console.log(menuArray);
    
    if (menuArray === undefined || menuArray === '' || menuArray === null){
        return <div>
        <h1 className="flex justify-center">Menu</h1>
        <Shimmer/>
        </div>
    } else {
        const categories = menuArray.filter( (c) => c.card?.card?.['@type'] === 'type.googleapis.com/swiggy.presentation.food.v2.ItemCategory' );
        // console.log(categories);
        
        return(
            <div className="text-center p-2 m-2">
                {
                categories.map( (category, index) => (
                    <RestaurantCategory 
                        key={category?.card?.card.title} 
                        data={category?.card?.card} 
                        showItems={ showIndex===index? true: false }
                        setShowIndex = {() => setShowIndex(index)}
                        resetIndex = {() => setShowIndex(null)}
                    />
                ))}
                
            </div>
        )
    }
}

export default RestaurantMenu