import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getUserCart,
  syncUserCart,
  clearUserCart,
} from "../services/cart.service.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getUserCart(req.user.id);
  return res.status(200).json({
    success: true,
    data: cart,
  });
});

export const syncCart = asyncHandler(async (req, res) => {
  const { restaurantId, restaurantName, restaurantLocation, items } = req.body;
  const cart = await syncUserCart(req.user.id, {
    restaurantId,
    restaurantName,
    restaurantLocation,
    items,
  });
  return res.status(200).json({
    success: true,
    message: "Cart synced successfully",
    data: cart,
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  await clearUserCart(req.user.id);
  return res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
  });
});
