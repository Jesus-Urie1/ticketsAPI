import fs from "fs/promises";
import path from "path";
import { getChatHistory } from "./chatController.js";
import { io } from "../../server.js";

export const createTicket = async (req, res) => {
  try {
    // Extract the fields and files from the request
    const { solicitante, email, departamento, prioridad, tipo, descripcion } =
      req.body;
    const files = req.files; // This will contain the uploaded files

    // Generate a ticket folio based on current tickets and format #00000 starting with #00001
    const tickets = await fs.readdir("public/Tickets");
    let id = "";
    if (tickets.length > 0) {
      id = tickets.length + 1;
    } else {
      id = "#0001";
    }
    if (id !== "#0001") {
      if (id > 0 && id < 10) id = "#000" + id;
      else if (id > 9 && id < 100) id = "#00" + id;
      else if (id > 99 && id < 1000) id = "#0" + id;
      else if (id > 999 && id < 10000) id = "#" + id;
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
    io.emit("createTicket", ticketInfo);
    await fs.writeFile(infoPath, JSON.stringify(ticketInfo, null, 2), "utf-8");

    res.status(200).json({ message: "Ticket creado con éxito" });
  } catch (error) {
    console.error("Error al crear el ticket:", error);
    res.status(500).json({ message: "Error al crear el ticket" });
  }
};

//Obtener Tickets por Email de Usuario
export const getTicketsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
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
        const ticketData = JSON.parse(data);
        if (ticketData.email === email) {
          result.push(ticketData);
        }
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los tickets" });
  }
};

//Obtener Chat de Ticket
export const getChat = async (req, res) => {
  try {
    const { id } = req.params;
    const chatHistory = await getChatHistory(id);
    res.json(chatHistory);
  } catch (error) {
    console.error("Error al obtener el chat:", error);
    res.status(500).json({ message: "Error al obtener el chat" });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const { ticketId } = req.params;
    console.log("Uploading files for ticket:", ticketId);
    const files = req.files; // Acceder a múltiples archivos subidos

    // Verificar si hay archivos subidos
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No se subieron archivos" });
    }

    // Crear la carpeta del ticket si no existe
    const ticketDir = path.join("public", "Tickets", ticketId);
    await fs.mkdir(ticketDir, { recursive: true });

    let savedFiles = []; // Array para almacenar la información de los archivos subidos

    // Iterar sobre cada archivo subido
    for (const file of files) {
      const filePath = path.join(ticketDir, file.originalname);
      await fs.writeFile(filePath, file.buffer);

      const size = (file.size / 1024).toFixed(2) + " KB";

      // Agregar la información del archivo al array
      savedFiles.push({ fileName: file.originalname, size });
    }

    // Responder con los detalles de los archivos subidos
    res.status(200).json({ files: savedFiles });
  } catch (error) {
    console.error("Error al subir los archivos:", error);
    res.status(500).json({ message: "Error al subir los archivos" });
  }
};
