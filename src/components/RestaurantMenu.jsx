import { useState ,useEffect } from "react"
import axios from "axios"
import Shimmer from "./Shimmer"
import { useParams } from "react-router"

const RestaurantMenu = () => {

    const [menuArray, setMenuArray] = useState(null)
    const {resId} = useParams()

    useEffect(() => {
        async function fetchMenu(){
            try {
                const data = await axios.get(`https://corsproxy.io/?https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=27.8789386&lng=79.929197&restaurantId=${resId}`)

                // this will show only recommended menu, for other need to parse the json better!
                setMenuArray(data.data.data)
                // console.log(menuArray);
                
            } catch (error) {
                console.log(error);   
            }
        }
        fetchMenu()
        }, [resId])
    

    if (menuArray === undefined || menuArray === '' || menuArray === null){
        return <>
        <h1 style={{marginLeft:'45vw'}}>Menu</h1>
        <Shimmer/>
        </>
    } else {
        const {name, costForTwoMessagde, cuisines, avgRating} = menuArray.cards[2].card.card.info
        const itemCards = menuArray.cards[4].groupedCard.cardGroupMap.REGULAR.cards[1].card.card.itemCards

        return(
            <div className="menu">
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