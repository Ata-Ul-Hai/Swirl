import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    // GeoJSON coordinates are in [longitude, latitude] order
    coordinates: {
      type: [Number],
      required: true,
      default: [77.2900505, 28.5488579],
    },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      index: true,
    },
    swiggyId: {
      type: String,
      trim: true,
      index: true,
    },
    cuisines: {
      type: [String],
      default: [],
      index: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    avgRatingString: {
      type: String,
      default: "",
    },
    totalRatingsString: {
      type: String,
      default: "",
    },
    costForTwo: {
      type: String,
      default: "",
    },
    cloudinaryImageId: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    locality: {
      type: String,
      trim: true,
      default: "",
    },
    areaName: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: pointSchema,
      required: true,
      default: () => ({
        type: "Point",
        coordinates: [77.2900505, 28.5488579],
      }),
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    sla: {
      deliveryTime: { type: Number, default: null },
      slaString: { type: String, default: "" },
      lastMileTravelString: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial proximity queries
restaurantSchema.index({ location: "2dsphere" });

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
