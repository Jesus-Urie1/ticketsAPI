// src/routes/ticketRoutes.js
import express from "express";
import {
  assignTechnician,
  closeTicket,
  createTicket,
  getTickets,
  downloadFile,
} from "../controllers/ticketController.js";
import multer from "multer";
import { io } from "../../server.js";
// import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Broadcast a ticket update event to all connected clients
const broadcastUpdate = () => {
  io.emit("ticketUpdate");
};

// Setup multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", getTickets);
router.get("/download/:id/:filename", downloadFile);
router.post("/assign", (req, res) => {
  assignTechnician(req, res);
  broadcastUpdate();
});
router.post("/close", (req, res) => {
  closeTicket(req, res);
  broadcastUpdate();
});
router.post("/", upload.array("files"), (req, res) => {
  createTicket(req, res);
  broadcastUpdate();
});

export default router;
