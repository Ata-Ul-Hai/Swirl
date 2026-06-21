// import './Card.css'
import { CDN_URL } from "../utils/constants";


function RestaurantCard({resData}){
return(
    <div className="m-4 p-4 w-62.5 rounded-lg bg-gray-100 hover:bg-gray-300 ">
        <img className='rounded-lg' src={CDN_URL + resData.cloudinaryImageId} alt="product image" />
        <h3 className="font-bold py-4 text-lg">{resData.name}</h3>
        <h4>{resData.cuisines.join(', ')}</h4>
        <h4>{resData.costForTwo}</h4>
        <h4>{resData.avgRatingString}</h4>
        <h4>{resData.locality}, {resData.areaName}</h4>
    </div>
)
    
}

export default RestaurantCard 