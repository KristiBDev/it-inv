import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import itemsRoute from "./routes/itemsRoute.js";
import cors from "cors";
import path from "path";

const app = express();

// Middleware for parsing request body
app.use(express.json());

// Middleware for handling CORS policy
app.use(cors());

// Serve static files (e.g., favicon.ico)
app.use(express.static(path.join(__dirname, "public")));

// Use itemsRoute for all /items routes
app.use("/items", itemsRoute);

// Root route
app.get("/", (request, response) => {
    console.log(request);
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


