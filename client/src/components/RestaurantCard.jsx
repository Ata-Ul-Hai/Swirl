import { CDN_URL } from "../utils/constants";

function RestaurantCard({resData}){
    return(
        <div data-testid="resCard" className="w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="relative">
                <img
                    className="aspect-4/3 w-full object-cover"
                    src={CDN_URL + resData.cloudinaryImageId}
                    alt={resData.name}
                />
                <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-md">
                    ⭐ {resData.avgRatingString}
                </span>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 truncate">{resData.name}</h3>
                <p className="text-sm text-gray-500 mt-1 truncate">{resData.cuisines.join(', ')}</p>
                <p className="text-sm text-gray-600 mt-2">{resData.costForTwo}</p>
                <p className="text-xs text-gray-400 mt-2 truncate">{resData.locality}, {resData.areaName}</p>
            </div>
        </div>
    )
}

// Higher Order Component

// input - RestaurantCard =>> RestaurantCardPromoted but this will give isOpen becuase promoted no more available
export const withPromotedLabel = (RestaurantCard) => {
    return (props) => {
        return (
            <div className="relative">
                <span className="absolute top-2 left-2 z-10 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-md">
                    Open
                </span>
                <RestaurantCard {...props}/>
            </div>
        )
    }
}

export default RestaurantCard
