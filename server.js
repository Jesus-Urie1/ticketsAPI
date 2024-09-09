// server.js
import http from "http";
import app from "./src/app.js";
import { setupWebSocketServer } from "./src/websockets/websocketServer.js";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const server = http.createServer(app);

// Setup WebSocket server
export const io = setupWebSocketServer(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
