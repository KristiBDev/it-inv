import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import itemRoutes from "./routes/itemsRoute.js";
import logsRoute from "./routes/logsRoute.js";
import notesRoute from "./routes/notesRoute.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import statsRoute from "./routes/statsRoute.js";
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
console.log(" - /reminders");
console.log(" - /stats");

// Use routes
app.use("/items", itemRoutes);
app.use("/logs", logsRoute);
app.use("/notes", notesRoute);
app.use("/reminders", reminderRoutes);
app.use("/stats", statsRoute);

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

// Log all registered routes for debugging
app.get('/routes', (req, res) => {
  const routes = [];
  
  // Get all registered routes
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes registered directly
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods).join(', ')
      });
    } else if (middleware.name === 'router') {
      // Routes added via router
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = handler.route.path;
          const baseRoute = middleware.regexp.toString()
            .replace('\\^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/');
          
          const fullPath = baseRoute.replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, '') + path;
          routes.push({
            path: fullPath,
            methods: Object.keys(handler.route.methods).join(', ')
          });
        }
      });
    }
  });
  
  res.json(routes);
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


