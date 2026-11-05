import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      trim: true,
      default: "",
    },
    locality: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate access token (short-lived, e.g., 15m)
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.JWT_ACCESS_SECRET || "swirl_access_secret_key_default",
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    }
  );
};

// Generate refresh token (long-lived, e.g., 7d)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_REFRESH_SECRET || "swirl_refresh_secret_key_default",
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

// Exclude sensitive fields from JSON serialization
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export const User = mongoose.model("User", userSchema);
export default User;
