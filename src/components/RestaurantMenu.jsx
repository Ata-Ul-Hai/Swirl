import useRestaurantMenu from "../utils/useRestaurantMenu"
import Shimmer from "./Shimmer"
import { useParams } from "react-router"

const RestaurantMenu = () => {

    const {resId} = useParams()
    // Used custom hook
    const menuArray = useRestaurantMenu(resId)

    if (menuArray === undefined || menuArray === '' || menuArray === null){
        return <>
        <h1 className="flex justify-center">Menu</h1>
        <Shimmer/>
        </>
    } else {
        const {name, costForTwoMessagde, cuisines, avgRating} = menuArray.cards[2].card.card.info
        const itemCards = menuArray.cards[4].groupedCard.cardGroupMap.REGULAR.cards[1].card.card.itemCards

        return(
            <div className="">
                <h1>{name}</h1>
                <h3>{cuisines.join(',')} : {costForTwoMessagde}</h3>
                <h3>Rating: {avgRating}</h3>

                {itemCards.map((item) => <ul>
                    <li key={item.card.info.id}>{item.card.info.name}</li>
                    <li key={item.card.info.id}>₹{(Number(item.card.info.defaultPrice)/100)}</li>
                    <li key={item.card.info.id}>{item.card.info.description}</li>
                    </ul>)}

            </div>
        )
    }
}

export default RestaurantMenu