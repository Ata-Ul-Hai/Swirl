import { useState, useEffect } from "react";
import axios from "axios";
import mockMenuData from "./mockJSONMenu";

const useRestaurantMenu = (resId) => {
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadMock = () => {
      try {
        const json = mockMenuData;
        const restaurantCard = json?.data?.cards?.find(
          (card) =>
            card?.card?.card?.["@type"] ===
            "type.googleapis.com/swiggy.presentation.food.v2.Restaurant"
        );
        const regularCardsContainer = json?.data?.cards?.find(
          (card) => card?.groupedCard
        );
        const regularCards =
          regularCardsContainer?.groupedCard?.cardGroupMap?.["REGULAR"]?.cards;

        if (regularCards && isMounted) {
          setMenuData({
            restaurantInfo: restaurantCard?.card?.card?.info,
            categories: regularCards,
          });
        }
      } catch (err) {
        console.error("Failed to load fallback menu:", err);
      }
    };

    const fetchMenu = async () => {
      if (!resId) {
        loadMock();
        return;
      }

      try {
        const response = await axios.get(`/api/restaurants/${resId}/menu`);
        if (
          isMounted &&
          response?.data?.data?.restaurantInfo &&
          response?.data?.data?.categories
        ) {
          setMenuData(response.data.data);
          return;
        }
        loadMock();
      } catch (error) {
        loadMock();
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, [resId]);

  return menuData;
};

export default useRestaurantMenu;
