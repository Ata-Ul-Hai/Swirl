import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "swirl_access_secret_key_default";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "swirl_refresh_secret_key_default";
const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

// In-memory fallback storage when MongoDB is not connected
const memoryUsers = new Map();

function generateTokens(payload) {
  const accessToken = jwt.sign(
    { id: String(payload.id), email: payload.email, name: payload.name },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { id: String(payload.id) },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );

  return { accessToken, refreshToken };
}

/**
 * Register a new user
 */
export const signupUser = async ({ name, email, password, address }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ApiError(409, "User with this email already exists");
    }

    const addresses = address ? [address] : [];
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      addresses,
    });

    const tokens = generateTokens({ id: user._id, email: user.email, name: user.name });
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        addresses: user.addresses,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // In-memory fallback
  if (memoryUsers.has(normalizedEmail)) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const addresses = address ? [{ ...address, _id: "addr_" + Date.now() }] : [];

  const userObj = {
    id,
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    addresses,
    refreshToken: null,
  };

  const tokens = generateTokens({ id, email: normalizedEmail, name: userObj.name });
  userObj.refreshToken = tokens.refreshToken;
  memoryUsers.set(normalizedEmail, userObj);

  return {
    user: {
      id,
      name: userObj.name,
      email: userObj.email,
      addresses: userObj.addresses,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

/**
 * Authenticate existing user
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const tokens = generateTokens({ id: user._id, email: user.email, name: user.name });
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        addresses: user.addresses,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // In-memory fallback
  const user = memoryUsers.get(normalizedEmail);
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = generateTokens({ id: user.id, email: user.email, name: user.name });
  user.refreshToken = tokens.refreshToken;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      addresses: user.addresses,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

/**
 * Refresh access token using valid refresh token
 */
export const refreshUserToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token required");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired or revoked");
    }

    const tokens = generateTokens({ id: user._id, email: user.email, name: user.name });
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        addresses: user.addresses,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // In-memory fallback
  let foundUser = null;
  for (const u of memoryUsers.values()) {
    if (u.id === decoded.id) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser || foundUser.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token expired or revoked");
  }

  const tokens = generateTokens({
    id: foundUser.id,
    email: foundUser.email,
    name: foundUser.name,
  });
  foundUser.refreshToken = tokens.refreshToken;

  return {
    user: {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      addresses: foundUser.addresses,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

/**
 * Log out user and revoke refresh token
 */
export const logoutUser = async (userId) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, { $set: { refreshToken: null } });
    }
    return true;
  }

  for (const u of memoryUsers.values()) {
    if (u.id === userId) {
      u.refreshToken = null;
      break;
    }
  }
  return true;
};

/**
 * Retrieve user profile
 */
export const getUserProfile = async (userId) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      addresses: user.addresses,
    };
  }

  for (const u of memoryUsers.values()) {
    if (u.id === userId) {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        addresses: u.addresses,
      };
    }
  }
  throw new ApiError(404, "User not found");
};

/**
 * Add address to user
 */
export const addUserAddress = async (userId, addressData) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  if (isMongoConnected) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    user.addresses.push(addressData);
    await user.save();
    return user.addresses;
  }

  for (const u of memoryUsers.values()) {
    if (u.id === userId) {
      const newAddr = { ...addressData, _id: "addr_" + Date.now() };
      u.addresses.push(newAddr);
      return u.addresses;
    }
  }
  throw new ApiError(404, "User not found");
};
