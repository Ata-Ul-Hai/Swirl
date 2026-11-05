import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Item price is required"],
      min: 0,
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    imageId: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    swiggyItemId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const menuCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    items: {
      type: [menuItemSchema],
      default: [],
    },
  },
  { _id: true }
);

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant reference is required"],
      unique: true,
      index: true,
    },
    categories: {
      type: [menuCategorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
