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

export const handleChatMessages = (socket) => {
  socket.on("joinRoom", (ticketId) => {
    socket.join(ticketId);
    console.log(`User joined room for ticket ${ticketId}`);
  });

  socket.on("sendMessage", async (messageData) => {
    // Save the message to a JSON file
    await saveMessageToFile(messageData.ticketId, messageData);

    // Broadcast the message to other users in the room
    socket.to(messageData.ticketId).emit("receiveMessage", messageData);
  });

  socket.on("leaveRoom", (ticketId) => {
    socket.leave(ticketId);
    console.log(`User left room for ticket ${ticketId}`);
  });
};
