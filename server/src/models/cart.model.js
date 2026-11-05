import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    priceSnapshotted: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    variant: {
      type: String,
      default: "Standard",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    rawItem: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    restaurantId: {
      type: String,
      default: null,
    },
    restaurantName: {
      type: String,
      default: "",
    },
    restaurantLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [77.2900505, 28.5488579],
      },
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
