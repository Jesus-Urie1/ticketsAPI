// src/app.js
import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import ticketRoutes from "./routes/ticketRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import path from "path";

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to serve static files
app.use("/public", express.static(path.join("public")));

// Routes
app.use("/api", authRoutes);
app.use("/api/tickets", ticketRoutes);

export default app;
