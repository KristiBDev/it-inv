/*import mongoose from "mongoose";
import { Log } from "../models/logModel.js";
import { Note } from "../models/noteModel.js";

// Use the correct MongoDB connection string for your environment
const mongoURL= process.env.MONGO_URL; //hardcode if needed
const PORT = process.env.PORT || 5000;
// Function to delete all logs
async function deleteAllLogs() {
  try {
    const result = await Log.deleteMany({});
    console.log(`Deleted ${result.deletedCount} logs successfully`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error deleting logs:", error);
    throw error;
  }
}

// Function to delete all notes
async function deleteAllNotes() {
  try {
    const result = await Note.deleteMany({});
    console.log(`Deleted ${result.deletedCount} notes successfully`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error deleting notes:", error);
    throw error;
  }
}

// Connect to MongoDB and clean up
mongoose
  .connect(mongoURL)
  .then(async () => {
    console.log("Connected to MongoDB");
    console.log(`Server port configured as: ${PORT}`);
    
    console.log("Starting cleanup process...");
    
    try {
      // Delete logs
      const deletedLogs = await deleteAllLogs();
      
      // Delete notes
      const deletedNotes = await deleteAllNotes();
      
      console.log("Cleanup completed successfully");
      console.log(`Summary: Deleted ${deletedLogs} logs and ${deletedNotes} notes`);
    } catch (error) {
      console.error("Error during cleanup process:", error);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    }
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1);
  });
*/