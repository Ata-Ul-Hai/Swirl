import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getQuote,
  createOrder,
  getOrders,
  getOrder,
  updateStatus,
} from "../controllers/order.controller.js";

const router = Router();

const orderCreateSchema = z.object({
  restaurant: z.object({
    id: z.string().min(1, "Restaurant id is required"),
    name: z.string().min(1, "Restaurant name is required"),
    location: z
      .object({
        type: z.literal("Point").optional(),
        coordinates: z.array(z.number()).length(2).optional(),
      })
      .optional(),
  }),
  items: z
    .array(
      z.object({
        itemId: z.string().optional(),
        id: z.string().optional(),
        name: z.string(),
        priceSnapshotted: z.number().optional(),
        price: z.number().optional(),
        quantity: z.number().min(1).default(1),
        variant: z.string().optional(),
      })
    )
    .min(1, "At least one item is required in the order"),
  deliveryAddress: z.object({
    street: z.string().optional(),
    locality: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    pincode: z.string().min(1, "Pincode is required"),
    location: z
      .object({
        type: z.literal("Point").optional(),
        coordinates: z.array(z.number()).length(2).optional(),
      })
      .optional(),
  }),
});

router.use(requireAuth);

router.post("/quote", getQuote);
router.post("/", validateBody(orderCreateSchema), createOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", updateStatus);

export default router;
