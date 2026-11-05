import mongoose from "mongoose";

export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const orderItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    priceSnapshotted: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    variant: {
      type: String,
      default: "Standard",
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurant: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [77.2900505, 28.5488579] },
      },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val) => val.length > 0, "Order must contain at least one item"],
    },
    deliveryAddress: {
      street: { type: String, default: "" },
      locality: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      pincode: { type: String, required: true },
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [77.216721, 28.6448] },
      },
    },
    distanceKm: {
      type: Number,
      required: true,
    },
    itemTotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    taxes: {
      type: Number,
      required: true,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "placed",
      index: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: "placed", timestamp: new Date(), note: "Order placed successfully" }],
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
export default Order;
