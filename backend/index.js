import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import itemsRoute from "./routes/itemsRoute.js";
import cors from "cors";

const app = express();

// Middleware for parsing request body
app.use(express.json());

// Middleware for handling CORS policy
app.use(cors());

// Use itemsRoute for all /items routes
app.use("/items", itemsRoute);

app.get("/", (request, response) => {
    console.log(request);
    return response.status(234).send("Hello, World!");
});

app.get('/api/resource', (req, res) => {
    res.send('Resource data');
});

mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(5555, () => {
            console.log(`Server is running on port: 5555`);
        });
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB", error);
    });


