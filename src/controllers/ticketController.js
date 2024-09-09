// src/controllers/ticketController.js
import fs from "fs/promises";
import path from "path";

export const createTicket = async (req, res) => {
  try {
    // Extract the fields and files from the request
    const {
      id,
      solicitante,
      email,
      departamento,
      prioridad,
      tipo,
      descripcion,
    } = req.body;
    const files = req.files; // This will contain the uploaded files

    if (!id) {
      throw new Error("ID is required");
    }

    // Create the ticket directory
    const ticketDir = path.join("public", "Tickets", id);
    await fs.mkdir(ticketDir, { recursive: true });

    // Save attached files
    let savedFiles = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const filePath = path.join(ticketDir, file.originalname);
        await fs.writeFile(filePath, file.buffer);

        const size = (file.size / 1024).toFixed(2) + " KB";
        savedFiles.push({ fileName: file.originalname, size });
      }
    }

    // Save ticket information in a JSON file
    const ticketInfo = {
      id,
      solicitante,
      email,
      departamento,
      prioridad,
      estado: "Abierto",
      tipo,
      descripcion,
      fechaAbierto: new Date().toISOString(),
      files: savedFiles,
    };

    const infoPath = path.join(ticketDir, "info.json");
    await fs.writeFile(infoPath, JSON.stringify(ticketInfo, null, 2), "utf-8");

    res.status(200).json({ message: "Ticket creado con éxito" });
  } catch (error) {
    console.error("Error al crear el ticket:", error);
    res.status(500).json({ message: "Error al crear el ticket" });
  }
};

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

    return res.status(200).json({ message: "Ticket cerrado con éxito" });
  } catch (error) {
    console.error("Error al cerrar el ticket:", error);
    return res.status(500).json({ message: "Error al cerrar el ticket" });
  }
};

export const downloadFile = async (req, res) => {
  const { id, filename } = req.params;
  const filePath = path.join("public", "Tickets", id, filename);

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file");
    }
  });
};
