import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getRestaurantLiveOrders,
  acceptRestaurantOrder,
  rejectRestaurantOrder,
  setOrderPrepTime,
  toggleMenuItemStock,
} from "../services/restaurantPanel.service.js";

export const getLiveOrders = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const orders = await getRestaurantLiveOrders(restaurantId);

  return res.status(200).json({
    success: true,
    data: orders,
  });
});

export const acceptOrder = asyncHandler(async (req, res) => {
  const { restaurantId, orderId } = req.params;
  const { prepTimeMinutes } = req.body;

  const order = await acceptRestaurantOrder(
    orderId,
    restaurantId,
    prepTimeMinutes || 25
  );

  return res.status(200).json({
    success: true,
    message: "Order accepted successfully",
    data: order,
  });
});

export const rejectOrder = asyncHandler(async (req, res) => {
  const { restaurantId, orderId } = req.params;
  const { reason } = req.body;

  const order = await rejectRestaurantOrder(orderId, restaurantId, reason);

  return res.status(200).json({
    success: true,
    message: "Order rejected",
    data: order,
  });
});

export const updatePrepTime = asyncHandler(async (req, res) => {
  const { restaurantId, orderId } = req.params;
  const { prepTimeMinutes } = req.body;

  const order = await setOrderPrepTime(
    orderId,
    restaurantId,
    prepTimeMinutes || 30
  );

  return res.status(200).json({
    success: true,
    message: `Prep time updated to ${prepTimeMinutes} mins`,
    data: order,
  });
});

export const toggleItemAvailability = asyncHandler(async (req, res) => {
  const { restaurantId, itemId } = req.params;
  const { inStock } = req.body;

  const result = await toggleMenuItemStock(
    restaurantId,
    itemId,
    Boolean(inStock)
  );

  return res.status(200).json({
    success: true,
    message: `Item availability updated to ${inStock ? "in-stock" : "out-of-stock"}`,
    data: result,
  });
});
