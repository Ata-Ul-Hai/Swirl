import { useState, useEffect } from "react";
import mockMenuData from "./mockJSONMenu";

const useRestaurantMenu = (resId) => {
    const [menu, setMenu] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const json = mockMenuData; 
                
                // Dynamically find the REGULAR menu container
                const regularCardsContainer = json?.data?.cards?.find(
                    (card) => card?.groupedCard
                );

                const regularCards = regularCardsContainer?.groupedCard?.cardGroupMap?.["REGULAR"]?.cards;
                
                if (regularCards) {
                    setMenu(regularCards);
                } else {
                    console.error("Menu structure not found.");
                } 
            } catch (error) {
                console.error("Failed to load menu:", error);
            }
        };


            fetchMenu();

    }, [resId]);

    return menu;
};

export default useRestaurantMenu;