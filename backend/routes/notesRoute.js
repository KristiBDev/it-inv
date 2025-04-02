import express from "express";
import { Note } from "../models/noteModel.js";
import { Item } from "../models/itemModel.js";
import { apiLimiter, getLimiter, noteCreationLimiter, noteDeletionLimiter } from "../rateLimiter.js";
import { createNoteLog, deleteNoteLog } from "../utils/logUtils.js";

const router = express.Router();

// Get notes for a specific item - Apply standard read rate limiting
router.get("/item/:itemId", getLimiter, async (request, response) => {
    try {
        const { itemId } = request.params;
        const notes = await Note.find({ itemId }).sort({ createdAt: -1 });
        
        return response.status(200).json({
            count: notes.length,
            data: notes,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Create a new note - Apply stricter note creation rate limiting
router.post("/", noteCreationLimiter, async (request, response) => {
    try {
        const { itemId, content, user = "DemoAdmin" } = request.body;
        
        if (!itemId || !content) {
            return response.status(400).send({ message: "Item ID and content are required" });
        }
        
        if (content.length > 100) {
            return response.status(400).send({ message: "Note content cannot exceed 100 characters" });
        }
        
        // Validate that the item exists
        const item = await Item.findOne({ customId: itemId });
        if (!item) {
            return response.status(404).send({ message: "Item not found" });
        }
        
        // Create the note
        const note = await Note.create({
            itemId,
            content,
            user,
        });
        
        // Create a log entry for this note
        await createNoteLog(item, note, user);
        
        return response.status(201).json(note);
    } catch (error) {
        console.error("Error creating note:", error);
        return response.status(500).send({ message: error.message });
    }
});

// Delete a note - Apply note deletion rate limiting
router.delete("/:id", noteDeletionLimiter, async (request, response) => {
    try {
        const { id } = request.params;
        const { user = "DemoAdmin" } = request.body;
        
        const note = await Note.findById(id);
        if (!note) {
            return response.status(404).send({ message: "Note not found" });
        }
        
        // Find the associated item for logging
        const item = await Item.findOne({ customId: note.itemId });
        
        // Delete the note
        await Note.findByIdAndDelete(id);
        
        // Create a log entry for the note deletion
        if (item) {
            await deleteNoteLog(item, note, user);
        }
        
        return response.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error deleting note:", error);
        return response.status(500).send({ message: error.message });
    }
});

// Utility route to delete all notes without environment checks
router.delete("/util/deleteAll", async (request, response) => {
    try {
        const result = await Note.deleteMany({});
        
        return response.status(200).json({
            message: "All notes deleted successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error deleting notes:", error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Make sure this is correctly exporting the router
export default router;
