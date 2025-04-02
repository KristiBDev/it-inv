import express from "express";
import { Log } from "../models/logModel.js";
import { apiLimiter, getLimiter, highTrafficLimiter } from "../rateLimiter.js";

const router = express.Router();

// Get all logs with pagination - Apply high traffic rate limiting
router.get("/", highTrafficLimiter, async (request, response) => {
    try {
        const page = parseInt(request.query.page) || 1;
        const limit = parseInt(request.query.limit) || 50;
        const skip = (page - 1) * limit;
        
        const logs = await Log.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await Log.countDocuments();
        
        return response.status(200).json({
            count: logs.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            data: logs,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Get logs for a specific item - Apply standard read rate limiting
router.get("/item/:itemId", getLimiter, async (request, response) => {
    try {
        const { itemId } = request.params;
        const logs = await Log.find({ itemId }).sort({ timestamp: -1 });
        
        return response.status(200).json({
            count: logs.length,
            data: logs,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Get log by ID - Apply standard read rate limiting
router.get("/:id", getLimiter, async (request, response) => {
    try {
        const { id } = request.params;
        const log = await Log.findById(id);
        
        if (!log) {
            return response.status(404).json({ message: "Log not found" });
        }
        
        return response.status(200).json(log);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Utility route to delete all logs without environment checks
router.delete("/util/deleteAll", async (request, response) => {
    try {
        const result = await Log.deleteMany({});
        
        return response.status(200).json({
            message: "All logs deleted successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error deleting logs:", error.message);
        return response.status(500).send({ message: error.message });
    }
});

export default router;
