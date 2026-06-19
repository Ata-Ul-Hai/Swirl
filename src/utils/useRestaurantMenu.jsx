import { useState, useEffect } from "react";

const useRestaurantMenu = (resId) => {
    const [menu, setMenu] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const data = await fetch(`https://corsproxy.io/?https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=27.8789386&lng=79.929197&restaurantId=${resId}`);
                
                // 2. Check if the fetch was actually successful
                if (!data.ok) {
                    throw new Error(`HTTP error! status: ${data.status}`);
                }

                const json = await data.json();
                setMenu(json.data);
                
            } catch (error) {
                console.error("Failed to fetch menu:", error);
            }
        };

        if (resId) {
            fetchMenu();
        }

    }, [resId]);

    return menu;
};

export default useRestaurantMenu;