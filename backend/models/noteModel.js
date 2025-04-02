import mongoose from "mongoose";

const noteSchema = mongoose.Schema(
    {
        itemId: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 100,
        },
        user: {
            type: String,
            default: 'DemoAdmin',
        },
    },
    {
        timestamps: true,
    }
);

export const Note = mongoose.model("Note", noteSchema);
