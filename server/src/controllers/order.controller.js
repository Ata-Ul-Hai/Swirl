import { asyncHandler } from "../utils/asyncHandler.js";
import {
  computeOrderQuote,
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from "../services/order.service.js";

export const getQuote = asyncHandler(async (req, res) => {
  const { restaurantLocation, addressLocation, items } = req.body;
  const quote = computeOrderQuote({
    restaurantLocation,
    addressLocation,
    items,
  });

  return res.status(200).json({
    success: true,
    data: quote,
  });
});

export const createOrder = asyncHandler(async (req, res) => {
  const { restaurant, items, deliveryAddress } = req.body;
  const order = await placeOrder(req.user.id, {
    restaurant,
    items,
    deliveryAddress,
  });

  return res.status(201).json({
    success: true,
    message: "Order placed successfully with frozen prices",
    data: order,
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await getUserOrders(req.user.id);

  return res.status(200).json({
    success: true,
    data: orders,
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await getOrderById(req.params.id, req.user.id);

  return res.status(200).json({
    success: true,
    data: order,
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await updateOrderStatus(req.params.id, status, note);

  return res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order,
  });
});
