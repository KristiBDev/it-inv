import mongoose from "mongoose";

const itemSchema = mongoose.Schema(
    {
        customId: {
            type: String,
            unique: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        item_user: {
            type: String,
            default: '',
        },
        dateAdded: {
            type: Date,
            default: Date.now,
        },
        category: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['Available', 'In Use', 'Maintenance'],
        },
        department: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            default: '',
        },
        purchaseDate: {
            type: Date,
        },
        purchasePrice: {
            type: Number,
            min: 0,
        },
        manufacturer: {
            type: String,
            default: '',
        },
        model: {
            type: String,
            default: '',
        },
        serialNumber: {
            type: String,
            default: '',
        },
        // Removed notes field as it's being handled separately
        qrCode: {
            type: String, // Store QR code as base64 string
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to generate custom ID
itemSchema.pre("save", async function (next) {
    try {
        if (!this.customId) {
            // Generate a more sophisticated ID format
            const prefix = 'INV';
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            this.customId = `${prefix}-${timestamp}-${random}`;
        }
        next();
    } catch (error) {
        console.error("Error generating custom ID:", error);
        next(error);
    }
});

export const Item = mongoose.model("Item", itemSchema);
