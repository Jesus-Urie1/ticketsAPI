// src/routes/ticketRoutes.js
import express from "express";
import {
  assignTechnician,
  closeTicket,
  getTickets,
  downloadFile,
} from "../controllers/ticketAdminController.js";
import {
  createTicket,
  getTicketsByEmail,
  getChat,
  uploadFile,
} from "../controllers/ticketUserController.js";
import multer from "multer";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Setup multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Obtener Tickets
router.get("/", authMiddleware, getTickets);
//Obtener Tickets por Email de Usuario
router.get("/:email", getTicketsByEmail);
//Obtener Chat de Ticket
router.get("/chat/:id", getChat);
//Descargar Files de Tickets
router.get("/download/:id/:filename", authMiddleware, downloadFile);
//Asignar Tecnico
router.post("/assign", (req, res) => {
  authMiddleware;
  assignTechnician(req, res);
});
//Cerrar Ticket
router.post("/close", (req, res) => {
  authMiddleware;
  closeTicket(req, res);
});
//Crear Ticket
router.post("/", upload.array("files"), (req, res) => {
  authMiddleware;
  createTicket(req, res);
});

// Upload file middleware
router.post("/upload/:ticketId", upload.array("files"), uploadFile);

export default router;
