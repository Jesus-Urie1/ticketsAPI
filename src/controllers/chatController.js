import fs from "fs/promises";
import path from "path";

export const getChatHistory = async (ticketId) => {
  const chatFilePath = path.join("public", "Tickets", ticketId, "chat.json");

  try {
    const data = await fs.readFile(chatFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log("No previous chat history found, creating a new file.");
    return [];
  }
};

const saveMessageToFile = async (ticketId, messageData) => {
  const chatFilePath = path.join("public", "Tickets", ticketId, "chat.json");

  // Read existing chat data if available
  let chatHistory = [];
  try {
    const data = await fs.readFile(chatFilePath, "utf-8");
    chatHistory = JSON.parse(data);
  } catch (error) {
    console.log("No previous chat history found, creating a new file.");
  }

  // Append the new message
  chatHistory.push(messageData);

  // Save the updated chat history to the file
  await fs.writeFile(
    chatFilePath,
    JSON.stringify(chatHistory, null, 2),
    "utf-8"
  );
};

export const handleChatMessages = (socket, io) => {
  socket.on("sendMessage", async (messageData) => {
    console.log("Received message from client:", messageData);
    // Guarda el mensaje en un archivo o base de datos
    await saveMessageToFile(messageData.ticketId, messageData);

    // Emitir el mensaje a todos los usuarios conectados, incluido el remitente
    io.emit("receiveMessage", messageData); // Esto envía el mensaje a todos

    // O bien, si solo quieres enviarlo a todos excepto al remitente:
    // socket.broadcast.emit("receiveMessage", messageData);
  });
};
