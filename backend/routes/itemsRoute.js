import express from "express";
import { Item } from "../models/itemModel.js";

const router = express.Router();

// Route for saving a new item
router.post('/', async (request, response) => {
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
            dateAdded: request.body.dateAdded || Date.now(), // Use provided date or default to now
        };
        const item = await Item.create(newItem);
        return response.status(201).send(item);
    } catch (error) {
        console.error("Error creating item:", error); // Log the full error object
        return response.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

// Route for getting all items
router.get("/", async (request, response) => {
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

// Route to get one item
router.get("/:customId", async (request, response) => {
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

// Route to update an item
router.put("/:customId", async (request, response) => {
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
        const result = await Item.findOneAndUpdate({ customId }, request.body, { new: true });

        if (!result) {
            return response.status(404).json({ message: "Item not found" });
        }

        return response.status(200).send({ message: "Item updated successfully" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Route for deleting an item
router.delete("/:customId", async (request, response) => {
    try {
        const { customId } = request.params;
        const result = await Item.findOneAndDelete({ customId });
        if (!result) {
            return response.status(404).json({ message: "Item not found" });
        }
        return response.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;
