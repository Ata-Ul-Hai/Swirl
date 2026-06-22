import { useContext } from "react";
import { CDN_URL } from "../utils/constants";
import UserContext from "../utils/UserContext";

function RestaurantCard({resData}){
    const user = useContext(UserContext)

    return(
        <div className="m-4 p-4 w-62.5 rounded-lg bg-gray-100 hover:bg-gray-300 cursor-pointer ">
            <img className='rounded-lg' src={CDN_URL + resData.cloudinaryImageId} alt="product image" />
            <h3 className="font-bold py-4 text-lg">{resData.name}</h3>
            <h4>{resData.cuisines.join(', ')}</h4>
            <h4>{resData.costForTwo}</h4>
            <h4>⭐️{resData.avgRatingString}</h4>
            <h4>{resData.locality}, {resData.areaName}</h4>
            <h4>Current User: {user.loggedInUser} </h4>
        </div>
    )
}

// Higher Order Component

// input - RestaurantCard =>> RestaurantCardPromoted but this will give isOpen becuase promoted no more available
export const withPromotedLabel = (RestaurantCard) =>{
    return (props) => {
        return <div>
            <label className="absolute bg-red-900 text-white m-2 p-2 rounded-lg">Open</label>
            <RestaurantCard {...props}/>
        </div>
    }
}

export default RestaurantCard 