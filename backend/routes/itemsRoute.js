import express from "express";
import { Item } from "../models/itemModel.js";
import { apiLimiter, getLimiter } from "../rateLimiter.js";
import { createItemLog, updateItemLog, deleteItemLog } from "../utils/logUtils.js";
import { generateItemQRCode, generateItemQRCodeWithBaseUrl } from "../utils/qrCodeUtils.js";

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
        
        // Generate QR code after item is created and customId is assigned
        try {
            // Get the base URL from request or environment variable
            const protocol = request.headers['x-forwarded-proto'] || request.protocol;
            const host = request.get('host');
            const baseUrl = `${protocol}://${host}`;
            
            const qrCode = await generateItemQRCodeWithBaseUrl(item.customId, baseUrl);
            
            // Update the item with the QR code
            item.qrCode = qrCode;
            await item.save();
        } catch (qrError) {
            console.error("Error generating QR code:", qrError);
            // Continue even if QR code generation fails
        }
        
        // Create log for item creation
        await createItemLog(item, request.body.user || "DemoAdmin");
        
        return response.status(201).send(item);
    } catch (error) {
        console.error("Error creating item:", error);
        return response.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

// Add a new endpoint to get just the QR code for an item
router.get("/:customId/qrcode", getLimiter, async (request, response) => {
    try {
        const { customId } = request.params;
        const item = await Item.findOne({ customId });
        
        if (!item) {
            return response.status(404).json({ message: "Item not found" });
        }
        
        if (!item.qrCode) {
            // If QR code doesn't exist, generate it on-the-fly
            try {
                const protocol = request.headers['x-forwarded-proto'] || request.protocol;
                const host = request.get('host');
                const baseUrl = `${protocol}://${host}`;
                
                const qrCode = await generateItemQRCodeWithBaseUrl(item.customId, baseUrl);
                
                // Update the item with the QR code
                item.qrCode = qrCode;
                await item.save();
            } catch (qrError) {
                console.error("Error generating QR code:", qrError);
                return response.status(500).send({ message: "Failed to generate QR code" });
            }
        }
        
        return response.status(200).json({ qrCode: item.qrCode });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
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
