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
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Broadcast a ticket update event to all connected clients
const broadcastUpdate = () => {
  io.emit("ticketUpdate");
};

// Setup multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Obtener Tickets
router.get("/", authMiddleware, getTickets);
//Descargar Tickets
router.get("/download/:id/:filename", authMiddleware, downloadFile);
//Asignar Tecnico
router.post("/assign", (req, res) => {
  authMiddleware;
  assignTechnician(req, res);
  broadcastUpdate();
});
//Cerrar Ticket
router.post("/close", (req, res) => {
  authMiddleware;
  closeTicket(req, res);
  broadcastUpdate();
});
//Obtener Tickets
router.post("/", upload.array("files"), (req, res) => {
  authMiddleware;
  createTicket(req, res);
  broadcastUpdate();
});

export default router;
