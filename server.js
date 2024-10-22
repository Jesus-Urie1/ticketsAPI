import https from "https";
import fs from "fs";
import app from "./src/app.js";
import { setupWebSocketServer } from "./src/websockets/websocketServer.js";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Ruta a los certificados SSL
const sslOptions = {
  key: fs.readFileSync("./certificados/localhost-key.pem"),
  cert: fs.readFileSync("./certificados/localhost.pem"),
};

// Crea el servidor HTTPS
const server = https.createServer(sslOptions, app);

// Setup WebSocket server
export const io = setupWebSocketServer(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running securely on https://localhost:${PORT}`);
});
