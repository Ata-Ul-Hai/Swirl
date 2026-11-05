import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, "Authentication token required");
    }

    const secret =
      process.env.JWT_ACCESS_SECRET || "swirl_access_secret_key_default";

    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError(401, "Access token expired", [
          { code: "TOKEN_EXPIRED", message: "Token has expired" },
        ]);
      }
      throw new ApiError(401, "Invalid access token");
    }
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
