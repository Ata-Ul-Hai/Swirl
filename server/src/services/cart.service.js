import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";

// In-memory fallback
const memoryCarts = new Map();

export const getUserCart = async (userId) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
      });
    }
    return cart;
  }

  if (!memoryCarts.has(String(userId))) {
    memoryCarts.set(String(userId), {
      userId: String(userId),
      restaurantId: null,
      restaurantName: "",
      items: [],
    });
  }
  return memoryCarts.get(String(userId));
};

export const syncUserCart = async (
  userId,
  { restaurantId, restaurantName, restaurantLocation, items }
) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId });
    }

    // Cart clears on restaurant switch
    if (cart.restaurantId && restaurantId && cart.restaurantId !== restaurantId) {
      cart.items = [];
    }

    cart.restaurantId = restaurantId || null;
    cart.restaurantName = restaurantName || "";
    if (restaurantLocation) {
      cart.restaurantLocation = restaurantLocation;
    }

    cart.items = (items || []).map((it) => ({
      itemId: String(it.itemId || it.id || it.card?.info?.id),
      name: it.name || it.card?.info?.name,
      priceSnapshotted: Number(it.priceSnapshotted || it.price || (it.card?.info?.price || it.card?.info?.defaultPrice || 0) / 100),
      quantity: Math.max(1, Number(it.quantity || 1)),
      variant: it.variant || "Standard",
      imageUrl: it.imageUrl || (it.card?.info?.imageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${it.card.info.imageId}` : ""),
      isVeg: Boolean(it.isVeg !== undefined ? it.isVeg : it.card?.info?.isVeg),
      rawItem: it.rawItem || it,
    }));

    await cart.save();
    return cart;
  }

  // In-memory fallback
  let userCart = memoryCarts.get(String(userId)) || {
    userId: String(userId),
    restaurantId: null,
    restaurantName: "",
    items: [],
  };

  if (userCart.restaurantId && restaurantId && userCart.restaurantId !== restaurantId) {
    userCart.items = [];
  }

  userCart.restaurantId = restaurantId || null;
  userCart.restaurantName = restaurantName || "";
  userCart.restaurantLocation = restaurantLocation;
  userCart.items = (items || []).map((it) => ({
    itemId: String(it.itemId || it.id || it.card?.info?.id),
    name: it.name || it.card?.info?.name,
    priceSnapshotted: Number(it.priceSnapshotted || it.price || (it.card?.info?.price || it.card?.info?.defaultPrice || 0) / 100),
    quantity: Math.max(1, Number(it.quantity || 1)),
    variant: it.variant || "Standard",
    imageUrl: it.imageUrl || (it.card?.info?.imageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${it.card.info.imageId}` : ""),
    isVeg: Boolean(it.isVeg !== undefined ? it.isVeg : it.card?.info?.isVeg),
    rawItem: it.rawItem || it,
  }));

  memoryCarts.set(String(userId), userCart);
  return userCart;
};

export const clearUserCart = async (userId) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [], restaurantId: null, restaurantName: "" } },
      { upsert: true }
    );
    return true;
  }

  if (memoryCarts.has(String(userId))) {
    const c = memoryCarts.get(String(userId));
    c.items = [];
    c.restaurantId = null;
    c.restaurantName = "";
  }
  return true;
};
