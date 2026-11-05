import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  const token = localStorage.getItem("accessToken");

  if (!socket && token) {
    const socketUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
