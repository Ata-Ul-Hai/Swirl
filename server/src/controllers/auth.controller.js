import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signupUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  getUserProfile,
  addUserAddress,
} from "../services/auth.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, address } = req.body;

  const { user, accessToken, refreshToken } = await signupUser({
    name,
    email,
    password,
    address,
  });

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
    accessToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser({
    email,
    password,
  });

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user,
    accessToken,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  const { user, accessToken, refreshToken } = await refreshUserToken(
    incomingRefreshToken
  );

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  return res.status(200).json({
    success: true,
    accessToken,
    user,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    await logoutUser(userId);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);

  return res.status(200).json({
    success: true,
    user,
  });
});

export const addAddress = asyncHandler(async (req, res) => {
  const addresses = await addUserAddress(req.user.id, req.body);

  return res.status(200).json({
    success: true,
    message: "Address added successfully",
    addresses,
  });
});
