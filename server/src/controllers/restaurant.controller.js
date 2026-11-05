import { asyncHandler } from "../utils/asyncHandler.js";
import { findRestaurants, findRestaurantMenu } from "../services/restaurant.service.js";

export const getRestaurants = asyncHandler(async (req, res) => {
  const { search, rating, page, limit } = req.query;

  const result = await findRestaurants({
    search,
    rating,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });

  return res.status(200).json({
    success: true,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
    data: result.restaurants,
  });
});

export const getRestaurantMenu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menuData = await findRestaurantMenu(id);

  return res.status(200).json({
    success: true,
    data: menuData,
  });
});
