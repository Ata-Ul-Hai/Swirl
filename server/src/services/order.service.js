import mongoose from "mongoose";
import { Order, ORDER_STATUSES } from "../models/order.model.js";
import { clearUserCart } from "./cart.service.js";
import {
  calculateHaversineDistance,
  calculateDeliveryFee,
} from "../utils/haversine.js";
import { ApiError } from "../utils/ApiError.js";

// In-memory fallback
const memoryOrders = [];

/**
 * Recompute item total, delivery fee via Haversine distance, and taxes
 */
export const computeOrderQuote = ({
  restaurantLocation,
  addressLocation,
  items,
}) => {
  if (!items || items.length === 0) {
    throw new ApiError(400, "Cannot quote an empty order");
  }

  // Recompute item total using snapshotted prices
  let itemTotal = 0;
  const processedItems = items.map((it) => {
    const price = Number(it.priceSnapshotted || it.price || 0);
    const qty = Math.max(1, Number(it.quantity || 1));
    const subtotal = Math.round(price * qty * 100) / 100;
    itemTotal += subtotal;

    return {
      itemId: String(it.itemId || it.id),
      name: it.name,
      priceSnapshotted: price,
      quantity: qty,
      variant: it.variant || "Standard",
      subtotal,
    };
  });

  // Haversine distance between restaurant and user address
  const rCoords = restaurantLocation?.coordinates || [77.2900505, 28.5488579];
  const aCoords = addressLocation?.coordinates || [77.216721, 28.6448];
  const distanceKm = calculateHaversineDistance(rCoords, aCoords);

  // Delivery fee based on distance
  const deliveryFee = calculateDeliveryFee(distanceKm);

  // 5% GST taxes
  const taxes = Math.round(itemTotal * 0.05 * 100) / 100;

  // Grand Total
  const grandTotal = Math.round((itemTotal + deliveryFee + taxes) * 100) / 100;

  return {
    items: processedItems,
    distanceKm,
    itemTotal,
    deliveryFee,
    taxes,
    grandTotal,
  };
};

/**
 * Create a new order with frozen prices
 */
export const placeOrder = async (
  userId,
  { restaurant, items, deliveryAddress }
) => {
  if (!restaurant || !restaurant.id || !restaurant.name) {
    throw new ApiError(400, "Restaurant information is required");
  }
  if (!deliveryAddress || !deliveryAddress.city || !deliveryAddress.pincode) {
    throw new ApiError(400, "Complete delivery address is required");
  }

  const quote = computeOrderQuote({
    restaurantLocation: restaurant.location,
    addressLocation: deliveryAddress.location,
    items,
  });

  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    const order = await Order.create({
      userId,
      restaurant,
      items: quote.items,
      deliveryAddress,
      distanceKm: quote.distanceKm,
      itemTotal: quote.itemTotal,
      deliveryFee: quote.deliveryFee,
      taxes: quote.taxes,
      grandTotal: quote.grandTotal,
      status: "placed",
      statusHistory: [
        {
          status: "placed",
          timestamp: new Date(),
          note: "Order has been placed successfully",
        },
      ],
    });

    // Clear user cart on successful order creation
    await clearUserCart(userId);

    return order;
  }

  // In-memory fallback
  const order = {
    _id: "order_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    id: "order_" + Date.now(),
    userId: String(userId),
    restaurant,
    items: quote.items,
    deliveryAddress,
    distanceKm: quote.distanceKm,
    itemTotal: quote.itemTotal,
    deliveryFee: quote.deliveryFee,
    taxes: quote.taxes,
    grandTotal: quote.grandTotal,
    status: "placed",
    statusHistory: [
      {
        status: "placed",
        timestamp: new Date(),
        note: "Order has been placed successfully",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryOrders.unshift(order);
  await clearUserCart(userId);

  return order;
};

/**
 * Get all orders for a user
 */
export const getUserOrders = async (userId) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    return Order.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  return memoryOrders.filter((o) => String(o.userId) === String(userId));
};

/**
 * Get single order by ID
 */
export const getOrderById = async (orderId, userId) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    const order = await Order.findOne({ _id: orderId, userId }).lean();
    if (!order) throw new ApiError(404, "Order not found");
    return order;
  }

  const order = memoryOrders.find(
    (o) => (o._id === orderId || o.id === orderId) && String(o.userId) === String(userId)
  );
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

/**
 * Transition order status
 */
export const updateOrderStatus = async (orderId, newStatus, note = "") => {
  if (!ORDER_STATUSES.includes(newStatus)) {
    throw new ApiError(
      400,
      `Invalid status '${newStatus}'. Must be one of: ${ORDER_STATUSES.join(", ")}`
    );
  }

  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: note || `Status updated to ${newStatus}`,
    });

    await order.save();
    return order;
  }

  const order = memoryOrders.find((o) => o._id === orderId || o.id === orderId);
  if (!order) throw new ApiError(404, "Order not found");

  order.status = newStatus;
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Status updated to ${newStatus}`,
  });
  order.updatedAt = new Date();

  return order;
};
