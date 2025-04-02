import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import itemsRoute from "./routes/itemsRoute.js";
import logsRoute from "./routes/logsRoute.js";
import notesRoute from "./routes/notesRoute.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware for parsing request body
app.use(express.json());

// Middleware for handling CORS policy
app.use(cors());

// Serve static files (e.g., favicon.ico)
app.use(express.static(path.join(__dirname, "public")));

// Debug which routes are being registered
console.log("Routes being registered:");
console.log(" - /items");
console.log(" - /logs"); 
console.log(" - /notes");

// Use routes
app.use("/items", itemsRoute);
app.use("/logs", logsRoute);
app.use("/notes", notesRoute);

// Root route
app.get("/", (request, response) => {
    console.log("Root route accessed");
    return response.status(200).send("Hello, World!");
});

// Handle favicon requests
app.get("/favicon.ico", (req, res) => {
    res.status(204).end(); // No Content
});

// Example API route
app.get('/api/resource', (req, res) => {
    res.send('Resource data');
});

// Add a route handler to catch all API routes that don't exist
app.use('/api/*', (req, res) => {
  console.log(`Route not found: ${req.originalUrl}`);
  res.status(404).json({ message: `API endpoint not found: ${req.originalUrl}` });
});

// Connect to MongoDB and start the server
mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT || 5555, () => {
            console.log(`Server is running on port: ${PORT || 5555}`);
        });
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB", error);
    });


