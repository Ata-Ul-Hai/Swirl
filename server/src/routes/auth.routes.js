import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  signup,
  login,
  refresh,
  logout,
  getMe,
  addAddress,
} from "../controllers/auth.controller.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["User", "RestaurantOwner", "Admin"]).optional(),
  restaurantId: z.string().optional(),
  address: z
    .object({
      street: z.string().trim().optional(),
      locality: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      pincode: z.string().trim().optional(),
      isDefault: z.boolean().optional(),
    })
    .optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const addressSchema = z.object({
  street: z.string().trim().optional(),
  locality: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  pincode: z.string().trim().min(1, "Pincode is required"),
  isDefault: z.boolean().optional(),
});

router.post("/signup", validateBody(signupSchema), signup);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.post("/address", requireAuth, validateBody(addressSchema), addAddress);

export default router;
