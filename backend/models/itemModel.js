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
        dateAdded: {
            type: Date,
            default: Date.now,
        },
        category: {
            type: String,
            required: true,
            enum: ['Hardware', 'Software', 'Network'],
        },
        status: {
            type: String,
            required: true,
            enum: ['In Use', 'Available', 'Maintenance'],
        },
        department: {
            type: String,
            required: true,
            enum: ['HR', 'Finance', 'IT', 'Marketing', 'Operations'],
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
            const lastItem = await mongoose
                .model("Item")
                .findOne()
                .sort({ customId: -1 });

            // Handle the case where no items exist in the database
            const lastCustomId = lastItem && lastItem.customId
                ? parseInt(lastItem.customId.replace("ORG", ""))
                : 999;

            this.customId = `ORG${lastCustomId + 1}`;
        }
        next();
    } catch (error) {
        console.error("Error generating custom ID:", error); // Log any errors in the custom ID generation
        next(error);
    }
});

export const Item = mongoose.model("Item", itemSchema);
