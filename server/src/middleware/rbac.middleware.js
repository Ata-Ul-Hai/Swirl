import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to restrict access based on user role
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    // Admin has access to all routes
    if (req.user.role === "Admin") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied: required role ${allowedRoles.join(" or ")}`
        )
      );
    }

    next();
  };
};

/**
 * Ownership check middleware: ensures a RestaurantOwner only accesses their own restaurant
 * "Owner A can never fetch Owner B's orders"
 */
export const requireRestaurantOwnership = (paramName = "restaurantId") => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    // Admins have access across all restaurants
    if (req.user.role === "Admin") {
      return next();
    }

    if (req.user.role !== "RestaurantOwner") {
      return next(
        new ApiError(403, "Access denied: only restaurant owners can access this resource")
      );
    }

    const targetRestaurantId =
      req.params[paramName] || req.body[paramName] || req.query[paramName];

    if (!targetRestaurantId) {
      return next(new ApiError(400, "Restaurant identifier is missing"));
    }

    if (String(req.user.restaurantId) !== String(targetRestaurantId)) {
      return next(
        new ApiError(
          403,
          "Ownership check failed: you do not own or have permission for this restaurant"
        )
      );
    }

    next();
  };
};
