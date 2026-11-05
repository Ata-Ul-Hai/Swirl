import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SWIGGY_RESTAURANTS_URL =
  "https://www.swiggy.com/dapi/restaurants/list/v5?lat=28.5488579&lng=77.2900505&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING";

const CDN_URL =
  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/";

const SWIGGY_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  Origin: "https://www.swiggy.com",
  Referer: "https://www.swiggy.com/",
};

/**
 * Extracts and normalizes menu items from the local mock menu dataset
 */
function extractMenuItems() {
  const menuFilePath = path.resolve(
    __dirname,
    "../../client/src/utils/mockJSONMenu.jsx"
  );
  if (!fs.existsSync(menuFilePath)) {
    console.warn("Mock menu file not found at:", menuFilePath);
    return [];
  }

  try {
    const content = fs.readFileSync(menuFilePath, "utf8");
    const jsonStr = content
      .substring(content.indexOf("=") + 1, content.lastIndexOf("export default"))
      .trim();
    const parsed = JSON.parse(jsonStr.replace(/;$/, ""));

    const regularCards =
      parsed?.data?.cards?.find((c) => c?.groupedCard)?.groupedCard
        ?.cardGroupMap?.["REGULAR"]?.cards || [];

    const itemCategories = regularCards.filter(
      (c) =>
        c.card?.card?.["@type"] ===
        "type.googleapis.com/swiggy.presentation.food.v2.ItemCategory"
    );

    const items = [];
    for (const cat of itemCategories) {
      const categoryTitle = cat.card?.card?.title || "General";
      const itemCards = cat.card?.card?.itemCards || [];

      for (const item of itemCards) {
        const info = item.card?.info;
        if (!info) continue;

        const rawPrice = info.price ?? info.defaultPrice ?? 0;
        items.push({
          id: String(info.id),
          name: info.name,
          category: categoryTitle,
          description: info.description || "",
          price: rawPrice / 100,
          isVeg: Boolean(info.isVeg),
          imageId: info.imageId || null,
          imageUrl: info.imageId ? `${CDN_URL}${info.imageId}` : null,
          inStock: info.inStock !== 0,
        });
      }
    }

    return items;
  } catch (err) {
    console.error("Error reading menu items:", err.message);
    return [];
  }
}

/**
 * Fetch restaurant list from Swiggy API, with fallback to local ResList.json
 */
async function fetchRestaurantsData() {
  console.log("Fetching restaurant data from Swiggy API...");
  try {
    const response = await fetch(SWIGGY_RESTAURANTS_URL, {
      headers: SWIGGY_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Swiggy API responded with status ${response.status}`);
    }

    const json = await response.json();
    console.log("Successfully fetched live data from Swiggy API.");
    return json;
  } catch (err) {
    console.warn(`Swiggy API fetch failed (${err.message}). Using local fallback mock data.`);
    const fallbackPath = path.resolve(
      __dirname,
      "../../client/src/components/Mock/ResList.json"
    );
    const raw = fs.readFileSync(fallbackPath, "utf8");
    return JSON.parse(raw);
  }
}

/**
 * Main seeding transformation script
 */
async function generateSeedData() {
  const rawData = await fetchRestaurantsData();
  const allMenuItems = extractMenuItems();

  const cards = rawData?.data?.cards || [];
  const rawRestaurants = [];

  // Extract restaurants from all grid cards
  for (const cardWrapper of cards) {
    const cardObj = cardWrapper?.card?.card;
    const restaurantsInCard =
      cardObj?.gridElements?.infoWithStyle?.restaurants;
    if (Array.isArray(restaurantsInCard)) {
      rawRestaurants.push(...restaurantsInCard);
    }
  }

  // Deduplicate restaurants by id
  const seenIds = new Set();
  const transformedRestaurants = [];

  for (const item of rawRestaurants) {
    const info = item?.info;
    if (!info || seenIds.has(info.id)) continue;
    seenIds.add(info.id);

    // Assign menu items tailored to the restaurant
    // If Pizza / Italian in cuisines, prioritize pizza/pasta items; otherwise distribute items
    let restaurantMenu = [];
    const isPizzaPlace = (info.cuisines || []).some((c) =>
      /pizza|italian|fast food|burger/i.test(c)
    );

    if (allMenuItems.length > 0) {
      if (isPizzaPlace) {
        restaurantMenu = allMenuItems.slice(0, 25);
      } else {
        // Diverse subset of menu items for other restaurants
        restaurantMenu = allMenuItems
          .filter((_, idx) => idx % 2 === 0)
          .slice(0, 18);
      }
    }

    const transformed = {
      id: String(info.id),
      name: info.name,
      cuisines: info.cuisines || [],
      rating: info.avgRating ?? (info.avgRatingString ? parseFloat(info.avgRatingString) : null),
      avgRatingString: info.avgRatingString || String(info.avgRating || "N/A"),
      totalRatingsString: info.totalRatingsString || "",
      costForTwo: info.costForTwo || "",
      locality: info.locality || "",
      areaName: info.areaName || "",
      cloudinaryImageId: info.cloudinaryImageId || "",
      imageUrl: info.cloudinaryImageId ? `${CDN_URL}${info.cloudinaryImageId}` : null,
      isOpen: info.isOpen ?? true,
      sla: {
        deliveryTime: info.sla?.deliveryTime ?? null,
        slaString: info.sla?.slaString ?? "",
        lastMileTravelString: info.sla?.lastMileTravelString ?? "",
      },
      menuItems: restaurantMenu,
    };

    transformedRestaurants.push(transformed);
  }

  const outputDir = path.resolve(__dirname, "../data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "restaurants.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(transformedRestaurants, null, 2),
    "utf8"
  );

  console.log(`\nSeed data successfully generated!`);
  console.log(`- Restaurants transformed: ${transformedRestaurants.length}`);
  console.log(`- Sample restaurant: "${transformedRestaurants[0]?.name}" with ${transformedRestaurants[0]?.menuItems?.length} menu items`);
  console.log(`- Output file: ${outputPath}`);
}

generateSeedData().catch((err) => {
  console.error("Fatal error generating seed data:", err);
  process.exit(1);
});
