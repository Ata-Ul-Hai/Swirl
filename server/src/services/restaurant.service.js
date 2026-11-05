import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Restaurant } from "../models/restaurant.model.js";
import { Menu } from "../models/menu.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getCache, setCache } from "../utils/redis.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_DATA_PATH = path.resolve(__dirname, "../../data/restaurants.json");

/**
 * Load local seed data from restaurants.json as a fallback
 */
function loadSeedData() {
  if (!fs.existsSync(SEED_DATA_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(SEED_DATA_PATH, "utf8");
  return JSON.parse(raw);
}

/**
 * Retrieve paginated restaurants with search & rating filters
 */
export const findRestaurants = async ({ search, rating, page = 1, limit = 10 }) => {
  const cacheKey = `restaurants:list:${search || ""}:${rating || ""}:${page}:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    const mongoQuery = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      mongoQuery.$or = [{ name: regex }, { cuisines: regex }, { locality: regex }, { areaName: regex }];
    }

    if (rating !== undefined && rating !== null) {
      mongoQuery.rating = { $gte: Number(rating) };
    }

    const total = await Restaurant.countDocuments(mongoQuery);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const restaurants = await Restaurant.find(mongoQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedData = restaurants.map((r) => ({
      info: {
        id: String(r._id),
        name: r.name,
        cuisines: r.cuisines || [],
        rating: r.rating,
        avgRating: r.rating,
        avgRatingString: r.avgRatingString || String(r.rating || "N/A"),
        totalRatingsString: r.totalRatingsString || "",
        costForTwo: r.costForTwo || "",
        cloudinaryImageId: r.cloudinaryImageId || "",
        imageUrl: r.imageUrl || "",
        locality: r.locality || "",
        areaName: r.areaName || "",
        isOpen: r.isOpen ?? true,
        sla: r.sla || {},
      },
    }));

    const result = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      restaurants: formattedData,
    };
    await setCache(cacheKey, result, 600);
    return result;
  }

  // Fallback to local JSON seed data
  let allRestaurants = loadSeedData();

  // Apply search filter (name or cuisines)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    allRestaurants = allRestaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.cuisines && r.cuisines.some((c) => c.toLowerCase().includes(q))) ||
        (r.locality && r.locality.toLowerCase().includes(q)) ||
        (r.areaName && r.areaName.toLowerCase().includes(q))
    );
  }

  // Apply rating filter (>= rating)
  if (rating !== undefined && rating !== null) {
    const minRating = Number(rating);
    allRestaurants = allRestaurants.filter(
      (r) => (r.rating !== null && r.rating >= minRating) || parseFloat(r.avgRatingString || 0) >= minRating
    );
  }

  const total = allRestaurants.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;
  const paginated = allRestaurants.slice(skip, skip + limit);

  const formattedData = paginated.map((r) => ({
    info: {
      id: String(r.id),
      name: r.name,
      cuisines: r.cuisines || [],
      rating: r.rating,
      avgRating: r.rating,
      avgRatingString: r.avgRatingString || String(r.rating || "N/A"),
      totalRatingsString: r.totalRatingsString || "",
      costForTwo: r.costForTwo || "",
      cloudinaryImageId: r.cloudinaryImageId || "",
      imageUrl: r.imageUrl || "",
      locality: r.locality || "",
      areaName: r.areaName || "",
      isOpen: r.isOpen ?? true,
      sla: r.sla || {},
    },
  }));

  const result = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    restaurants: formattedData,
  };
  await setCache(cacheKey, result, 600);
  return result;
};

/**
 * Retrieve restaurant menu by restaurant ID
 */
export const findRestaurantMenu = async (restaurantId) => {
  const cacheKey = `restaurants:menu:${restaurantId}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    let restaurant = null;
    if (mongoose.Types.ObjectId.isValid(restaurantId)) {
      restaurant = await Restaurant.findById(restaurantId).lean();
    }
    if (!restaurant) {
      restaurant = await Restaurant.findOne({ swiggyId: restaurantId }).lean();
    }

    if (!restaurant) {
      throw new ApiError(404, `Restaurant with ID '${restaurantId}' not found`);
    }

    const menu = await Menu.findOne({ restaurant: restaurant._id }).lean();
    const categories = (menu?.categories || []).map((cat) => ({
      card: {
        card: {
          "@type": "type.googleapis.com/swiggy.presentation.food.v2.ItemCategory",
          title: cat.name,
          itemCards: (cat.items || []).map((item) => ({
            card: {
              info: {
                id: String(item._id || item.swiggyItemId || Math.random()),
                name: item.name,
                description: item.description,
                price: (item.price || 0) * 100,
                defaultPrice: (item.price || 0) * 100,
                isVeg: item.isVeg ? 1 : 0,
                imageId: item.imageId,
                imageUrl: item.imageUrl,
                inStock: item.inStock,
              },
            },
          })),
        },
      },
    }));

    const menuResult = {
      restaurantInfo: {
        id: String(restaurant._id),
        name: restaurant.name,
        cuisines: restaurant.cuisines || [],
        locality: restaurant.locality || "",
        areaName: restaurant.areaName || "",
        avgRatingString: restaurant.avgRatingString || String(restaurant.rating || "N/A"),
        costForTwo: restaurant.costForTwo || "",
        costForTwoMessage: restaurant.costForTwo || "",
        cloudinaryImageId: restaurant.cloudinaryImageId || "",
        imageUrl: restaurant.imageUrl || "",
      },
      categories,
    };
    await setCache(cacheKey, menuResult, 900);
    return menuResult;
  }

  // Fallback to local JSON seed data
  const seedList = loadSeedData();
  const restaurant = seedList.find((r) => String(r.id) === String(restaurantId)) || seedList[0];

  if (!restaurant) {
    throw new ApiError(404, `Restaurant with ID '${restaurantId}' not found`);
  }

  // Group menu items by category
  const categoriesMap = new Map();
  for (const item of restaurant.menuItems || []) {
    const catName = item.category || "Recommended";
    if (!categoriesMap.has(catName)) {
      categoriesMap.set(catName, []);
    }
    categoriesMap.get(catName).push({
      card: {
        info: {
          id: String(item.id),
          name: item.name,
          description: item.description || "",
          price: (item.price || 0) * 100,
          defaultPrice: (item.price || 0) * 100,
          isVeg: item.isVeg ? 1 : 0,
          imageId: item.imageId || "",
          imageUrl: item.imageUrl || "",
          inStock: item.inStock ?? true,
        },
      },
    });
  }

  const categories = Array.from(categoriesMap.entries()).map(([title, itemCards]) => ({
    card: {
      card: {
        "@type": "type.googleapis.com/swiggy.presentation.food.v2.ItemCategory",
        title,
        itemCards,
      },
    },
  }));

  const menuResult = {
    restaurantInfo: {
      id: String(restaurant.id),
      name: restaurant.name,
      cuisines: restaurant.cuisines || [],
      locality: restaurant.locality || "",
      areaName: restaurant.areaName || "",
      avgRatingString: restaurant.avgRatingString || String(restaurant.rating || "N/A"),
      costForTwo: restaurant.costForTwo || "",
      costForTwoMessage: restaurant.costForTwo || "",
      cloudinaryImageId: restaurant.cloudinaryImageId || "",
      imageUrl: restaurant.imageUrl || "",
    },
    categories,
  };
  await setCache(cacheKey, menuResult, 900);
  return menuResult;
};
