import express from "express";
import { Log } from "../models/logModel.js";
import { getLimiter } from "../rateLimiter.js";

const router = express.Router();

// Get all logs with pagination
router.get("/", getLimiter, async (request, response) => {
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

// Get logs for a specific item
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

// Get log by ID
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

export default router;
