import { Server } from "socket.io";
import { handleChatMessages } from "../controllers/chatController.js";

export const setupWebSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // You can replace '*' with your frontend domain for security
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New WebSocket connection established");

    // Handle chat messages
    handleChatMessages(socket, io);

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};
