import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "swirl_access_secret_key_default";

/**
 * Initialize Socket.io on the HTTP server with JWT Handshake Authentication
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "*",
      credentials: true,
    },
  });

  // Socket Handshake Authentication with JWT
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization &&
        socket.handshake.headers.authorization.split(" ")[1]);

    if (!token) {
      return next(new Error("Socket authentication error: Token is required"));
    }

    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Socket authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // 1. One room per order for live order tracking
    socket.on("join_order", (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    // 2. Room per restaurant for restaurant owners
    socket.on("join_restaurant", (restaurantId) => {
      if (restaurantId) {
        // Verify owner role or permission
        if (
          socket.user.role === "Admin" ||
          (socket.user.role === "RestaurantOwner" &&
            String(socket.user.restaurantId) === String(restaurantId))
        ) {
          socket.join(`restaurant:${restaurantId}`);
        }
      }
    });

    socket.on("disconnect", () => {
      // Clean up
    });
  });

  return io;
}

/**
 * Get Socket.io server instance
 */
export function getIO() {
  return io;
}

/**
 * Emit "new order" event to the restaurant's room for popup notification
 */
export function emitNewOrder(order) {
  if (!io) return;
  const restaurantId = order.restaurant?.id;
  if (restaurantId) {
    io.to(`restaurant:${restaurantId}`).emit("new_order", {
      orderId: order.id || order._id,
      restaurantId,
      customerName: order.userId?.name || "Customer",
      items: order.items,
      grandTotal: order.grandTotal,
      createdAt: order.createdAt,
    });
  }
}

/**
 * Push updated order status to the customer page (one room per order)
 */
export function emitOrderStatus(order) {
  if (!io) return;
  const orderId = String(order.id || order._id);
  const restaurantId = String(order.restaurant?.id);

  const payload = {
    orderId,
    status: order.status,
    prepTimeMinutes: order.prepTimeMinutes,
    statusHistory: order.statusHistory,
    updatedAt: new Date(),
  };

  // Push to order room (customer)
  io.to(`order:${orderId}`).emit("order_status_updated", payload);
  // Also push to restaurant panel room
  if (restaurantId) {
    io.to(`restaurant:${restaurantId}`).emit("order_status_updated", payload);
  }
}

/**
 * Emit menu item availability toggle
 */
export function emitItemAvailability(restaurantId, itemId, inStock) {
  if (!io) return;
  io.emit("item_availability_updated", {
    restaurantId,
    itemId,
    inStock,
  });
}
