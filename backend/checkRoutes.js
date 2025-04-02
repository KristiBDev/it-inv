import express from "express";
import itemsRoute from "./routes/itemsRoute.js";
import logsRoute from "./routes/logsRoute.js";
import notesRoute from "./routes/notesRoute.js";

const app = express();

// Register routes
app.use("/items", itemsRoute);
app.use("/logs", logsRoute);
app.use("/notes", notesRoute);

// Get all registered routes
console.log("Checking routes...");

// Print out routes from each router
const printRoutes = (router, prefix) => {
  router.stack.forEach(layer => {
    if (layer.route) {
      const path = prefix + layer.route.path;
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${path}`);
    }
  });
};

console.log("\nITEMS ROUTES:");
printRoutes(itemsRoute, "/items");

console.log("\nLOGS ROUTES:");
printRoutes(logsRoute, "/logs");

console.log("\nNOTES ROUTES:");
printRoutes(notesRoute, "/notes");

console.log("\nRoute check complete");
