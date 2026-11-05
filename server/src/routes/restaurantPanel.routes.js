import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireRole,
  requireRestaurantOwnership,
} from "../middleware/rbac.middleware.js";
import {
  getLiveOrders,
  acceptOrder,
  rejectOrder,
  updatePrepTime,
  toggleItemAvailability,
} from "../controllers/restaurantPanel.controller.js";

const router = Router();

// Apply auth and ownership check middleware
router.use(requireAuth);
router.use(requireRole("RestaurantOwner", "Admin"));
router.use("/:restaurantId", requireRestaurantOwnership("restaurantId"));

// Routes for restaurant owners
router.get("/:restaurantId/orders", getLiveOrders);
router.patch("/:restaurantId/orders/:orderId/accept", acceptOrder);
router.patch("/:restaurantId/orders/:orderId/reject", rejectOrder);
router.patch("/:restaurantId/orders/:orderId/prep-time", updatePrepTime);
router.patch("/:restaurantId/menu/items/:itemId/toggle", toggleItemAvailability);

export default router;
