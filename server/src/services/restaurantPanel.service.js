import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Menu } from "../models/menu.model.js";
import { updateOrderStatus, getMemoryOrders } from "./order.service.js";
import { emitItemAvailability } from "../socket.js";
import { ApiError } from "../utils/ApiError.js";
import { delCache } from "../utils/redis.js";

// In-memory fallback tracking for item availability
const itemStockOverrides = new Map();

/**
 * Fetch live orders for a specific restaurant
 * Guaranteed: Owner of restaurant A only gets restaurant A's orders
 */
export const getRestaurantLiveOrders = async (restaurantId) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    return Order.find({ "restaurant.id": String(restaurantId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  // From in-memory orders
  const allOrders = getMemoryOrders();
  return allOrders.filter(
    (o) => String(o.restaurant?.id) === String(restaurantId)
  );
};

/**
 * Accept an incoming order
 */
export const acceptRestaurantOrder = async (orderId, restaurantId, prepTimeMinutes = 25) => {
  const order = await getOrderWithOwnership(orderId, restaurantId);
  return updateOrderStatus(
    orderId,
    "confirmed",
    `Order accepted. Estimated prep time: ${prepTimeMinutes} mins`,
    prepTimeMinutes
  );
};

/**
 * Reject an incoming order
 */
export const rejectRestaurantOrder = async (orderId, restaurantId, reason = "Rejected by restaurant") => {
  const order = await getOrderWithOwnership(orderId, restaurantId);
  return updateOrderStatus(orderId, "cancelled", `Order rejected: ${reason}`);
};

/**
 * Update order prep time
 */
export const setOrderPrepTime = async (orderId, restaurantId, prepTimeMinutes) => {
  const order = await getOrderWithOwnership(orderId, restaurantId);
  return updateOrderStatus(
    orderId,
    "preparing",
    `Food is being prepared. Prep time: ${prepTimeMinutes} mins`,
    prepTimeMinutes
  );
};

/**
 * Helper to ensure order belongs to this restaurant
 */
async function getOrderWithOwnership(orderId, restaurantId) {
  const isMongoConnected = mongoose.connection.readyState === 1;

  let order = null;
  if (isMongoConnected) {
    order = await Order.findById(orderId);
  } else {
    const all = getMemoryOrders();
    order = all.find((o) => String(o.id || o._id) === String(orderId));
  }

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (String(order.restaurant?.id) !== String(restaurantId)) {
    throw new ApiError(
      403,
      "Access denied: This order does not belong to your restaurant"
    );
  }

  return order;
}

/**
 * Toggle menu item availability (inStock: true/false)
 */
export const toggleMenuItemStock = async (restaurantId, itemId, inStock) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    // Update MenuItem subdocument in Menu
    await Menu.updateOne(
      { "categories.items.swiggyItemId": itemId },
      { $set: { "categories.$[].items.$[item].inStock": inStock } },
      { arrayFilters: [{ "item.swiggyItemId": itemId }] }
    );
  }

  // Update memory/cache
  itemStockOverrides.set(`${restaurantId}_${itemId}`, inStock);
  await delCache(`restaurants:menu:${restaurantId}`);

  // Broadcast via Socket.io
  emitItemAvailability(restaurantId, itemId, inStock);

  return {
    restaurantId,
    itemId,
    inStock,
  };
};

/**
 * Get item stock status
 */
export const getItemStock = (restaurantId, itemId, defaultStock = true) => {
  const key = `${restaurantId}_${itemId}`;
  if (itemStockOverrides.has(key)) {
    return itemStockOverrides.get(key);
  }
  return defaultStock;
};
