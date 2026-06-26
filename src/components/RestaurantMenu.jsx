import useRestaurantMenu from "../utils/useRestaurantMenu"
import Shimmer from "./Shimmer"
import { useParams } from "react-router"
import { useState } from "react"
import RestaurantCategory from "./RestaurantCategory"
import { CDN_URL } from "../utils/constants"

const RestaurantMenu = () => {
    const [showIndex, setShowIndex] = useState(null);

    const {resId} = useParams()
    // Used custom hook
    const menuData = useRestaurantMenu(resId)

    if (!menuData) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <h1 className="flex justify-center text-xl font-bold text-gray-900 mb-4">Menu</h1>
                    <div className="animate-pulse bg-gray-200 rounded-2xl h-48 mb-8" />
                    <Shimmer />
                </div>
            </div>
        )
    }

    const { restaurantInfo, categories } = menuData
    const menuCategories = categories.filter(
        (c) => c.card?.card?.['@type'] === 'type.googleapis.com/swiggy.presentation.food.v2.ItemCategory'
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-6">
                {restaurantInfo && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                        <img
                            className="w-full h-48 sm:h-56 object-cover"
                            src={CDN_URL + restaurantInfo.cloudinaryImageId}
                            alt={restaurantInfo.name}
                        />
                        <div className="p-5">
                            <h1 className="text-2xl font-bold text-gray-900">{restaurantInfo.name}</h1>
                            <p className="text-sm text-gray-500 mt-1">{restaurantInfo.cuisines?.join(", ")}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {restaurantInfo.locality}, {restaurantInfo.areaName}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                                <span className="bg-green-600 text-white font-semibold px-2 py-1 rounded-md">
                                    ⭐ {restaurantInfo.avgRatingString}
                                </span>
                                <span className="text-gray-600">{restaurantInfo.totalRatingsString}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">{restaurantInfo.costForTwoMessage}</span>
                                {restaurantInfo.sla?.slaString && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-600">{restaurantInfo.sla.slaString}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <h2 className="text-xl font-bold text-gray-900 mb-4">Menu</h2>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {menuCategories.map((category, index) => (
                        <RestaurantCategory
                            key={category?.card?.card.title}
                            data={category?.card?.card}
                            showItems={showIndex === index}
                            setShowIndex={() => setShowIndex(index)}
                            resetIndex={() => setShowIndex(null)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default RestaurantMenu
