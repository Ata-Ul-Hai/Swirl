// import './Card.css'
import { CDN_URL } from "../utils/constants";


function RestaurantCard({resData}){
return(
    <div className="res-card">
        <img className='res-logo' src={CDN_URL + resData.cloudinaryImageId} alt="product image" />
        <h3>{resData.name}</h3>
        <h4>{resData.cuisines}</h4>
        <h4>{resData.costForTwo}</h4>
        <h4>{resData.avgRatingString}</h4>
    </div>
)
    
}

export default RestaurantCard 