// src/controllers/ticketController.js
import fs from "fs/promises";
import path from "path";
import { io } from "../../server.js";

export const getTickets = async (req, res) => {
  try {
    const baseDir = "public/Tickets";
    const result = [];
    const folders = await fs.readdir(baseDir);

    for (const folder of folders) {
      const filePath = path.join(baseDir, folder, "info.json");
      if (
        await fs
          .stat(filePath)
          .then((stat) => stat.isFile())
          .catch(() => false)
      ) {
        const data = await fs.readFile(filePath, "utf-8");
        result.push(JSON.parse(data));
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los tickets" });
  }
};

export const assignTechnician = async (req, res) => {
  try {
    const { id, tecnico } = req.body;

    const ticketDir = path.join("public", "Tickets", id);
    const infoPath = path.join(ticketDir, "info.json");

    if (
      !(await fs
        .stat(infoPath)
        .then((stat) => stat.isFile())
        .catch(() => false))
    ) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    const ticketData = JSON.parse(await fs.readFile(infoPath, "utf-8"));
    ticketData.tecnico = tecnico;
    ticketData.estado = "En Progreso";
    ticketData.fechaAsignacion = new Date().toISOString();

    await fs.writeFile(infoPath, JSON.stringify(ticketData, null, 2), "utf-8");
    io.emit("updateTicket", ticketData);
    return res.status(200).json({ message: "Técnico asignado con éxito" });
  } catch (error) {
    console.error("Error al asignar técnico:", error);
    return res.status(500).json({ message: "Error al asignar técnico" });
  }
};

export const closeTicket = async (req, res) => {
  try {
    const { id, comentarios } = req.body;

    const ticketDir = path.join("public", "Tickets", id);
    const infoPath = path.join(ticketDir, "info.json");

    if (
      !(await fs
        .stat(infoPath)
        .then((stat) => stat.isFile())
        .catch(() => false))
    ) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    const ticketData = JSON.parse(await fs.readFile(infoPath, "utf-8"));
    ticketData.comentarios = comentarios;
    ticketData.estado = "Cerrado";
    ticketData.fechaCerrado = new Date().toISOString();

    await fs.writeFile(infoPath, JSON.stringify(ticketData, null, 2), "utf-8");
    io.emit("updateTicket", ticketData);
    return res.status(200).json({ message: "Ticket cerrado con éxito" });
  } catch (error) {
    console.error("Error al cerrar el ticket:", error);
    return res.status(500).json({ message: "Error al cerrar el ticket" });
  }
};

export const downloadFile = (req, res) => {
  const { id, filename } = req.params;
  const filePath = path.join("public", "Tickets", id, filename);

  res.download(filePath);
};
