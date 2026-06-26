import { useState, useEffect } from "react";
import mockMenuData from "./mockJSONMenu";

const useRestaurantMenu = (resId) => {
    const [menuData, setMenuData] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const json = mockMenuData;

                const restaurantCard = json?.data?.cards?.find(
                    (card) =>
                        card?.card?.card?.["@type"] ===
                        "type.googleapis.com/swiggy.presentation.food.v2.Restaurant"
                );

                // Dynamically find the REGULAR menu container
                const regularCardsContainer = json?.data?.cards?.find(
                    (card) => card?.groupedCard
                );

                const regularCards =
                    regularCardsContainer?.groupedCard?.cardGroupMap?.["REGULAR"]?.cards;

                if (regularCards) {
                    setMenuData({
                        restaurantInfo: restaurantCard?.card?.card?.info,
                        categories: regularCards,
                    });
                } else {
                    console.error("Menu structure not found.");
                }
            } catch (error) {
                console.error("Failed to load menu:", error);
            }
        };

        fetchMenu();

    }, [resId]);

    return menuData;
};

export default useRestaurantMenu;
