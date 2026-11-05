import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getCart,
  syncCart,
  clearCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.put("/", syncCart);
router.delete("/", clearCart);

export default router;
