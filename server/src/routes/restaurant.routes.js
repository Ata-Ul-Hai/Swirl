import { Router } from "express";
import { z } from "zod";
import { validateQuery, validateParams } from "../middleware/validate.js";
import {
  getRestaurants,
  getRestaurantMenu,
} from "../controllers/restaurant.controller.js";

const router = Router();

// Zod schema for GET /api/restaurants?search=&rating=&page=&limit=
const restaurantQuerySchema = z.object({
  search: z.string().trim().optional(),
  rating: z
    .preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().min(0).max(5).optional()),
  page: z
    .preprocess((val) => (val === "" || val === undefined ? 1 : Number(val)), z.number().int().positive().default(1)),
  limit: z
    .preprocess((val) => (val === "" || val === undefined ? 20 : Number(val)), z.number().int().positive().max(100).default(20)),
});

// Zod schema for /api/restaurants/:id
const restaurantParamsSchema = z.object({
  id: z.string().trim().min(1, "Restaurant ID cannot be empty"),
});

// Routes
router.get("/", validateQuery(restaurantQuerySchema), getRestaurants);
router.get("/:id/menu", validateParams(restaurantParamsSchema), getRestaurantMenu);
router.get("/:id", validateParams(restaurantParamsSchema), getRestaurantMenu);

export default router;
