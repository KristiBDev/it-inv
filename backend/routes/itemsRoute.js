import express from "express";
import { Item } from "../models/itemModel.js";
import { apiLimiter, getLimiter } from "../rateLimiter.js";
import { createItemLog, updateItemLog, deleteItemLog } from "../utils/logUtils.js";

const router = express.Router();

// Apply rate limiting for GET requests
router.get("/", getLimiter, async (request, response) => {
    try {
        const items = await Item.find();
        return response.status(200).json({
            count: items.length,
            data: items,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Apply rate limiting for POST requests
router.post("/", apiLimiter, async (request, response) => {
    try {
        if (
            !request.body.title ||
            !request.body.category ||
            !request.body.status ||
            !request.body.department
        ) {
            return response.status(400).send({ message: "All fields are required" });
        }
        const newItem = {
            title: request.body.title,
            category: request.body.category,
            status: request.body.status,
            department: request.body.department,
            dateAdded: request.body.dateAdded || Date.now(),
        };
        const item = await Item.create(newItem);
        
        // Create log for item creation
        await createItemLog(item, request.body.user || "DemoAdmin");
        
        return response.status(201).send(item);
    } catch (error) {
        console.error("Error creating item:", error);
        return response.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

// Apply rate limiting for GET requests to a single item
router.get("/:customId", getLimiter, async (request, response) => {
    try {
        const { customId } = request.params;
        const item = await Item.findOne({ customId });
        if (!item) {
            return response.status(404).json({ message: "Item not found" });
        }
        return response.status(200).json(item);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Apply rate limiting for PUT requests
router.put("/:customId", apiLimiter, async (request, response) => {
    try {
        if (
            !request.body.title ||
            !request.body.category ||
            !request.body.status ||
            !request.body.department
        ) {
            return response.status(400).send({ message: "All fields are required" });
        }
        const { customId } = request.params;
        
        // Get the item before update for logging changes
        const oldItem = await Item.findOne({ customId });
        if (!oldItem) {
            return response.status(404).json({ message: "Item not found" });
        }
        
        const result = await Item.findOneAndUpdate({ customId }, request.body, { new: true });

        // Create log for item update
        await updateItemLog(result, oldItem, request.body.user || "DemoAdmin");

        return response.status(200).send({ message: "Item updated successfully" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Apply rate limiting for DELETE requests
router.delete("/:customId", apiLimiter, async (request, response) => {
    try {
        const { customId } = request.params;
        const item = await Item.findOne({ customId });
        
        if (!item) {
            return response.status(404).json({ message: "Item not found" });
        }
        
        await Item.findOneAndDelete({ customId });
        
        // Create log for item deletion
        await deleteItemLog(item, request.body.user || "DemoAdmin");
        
        return response.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;
