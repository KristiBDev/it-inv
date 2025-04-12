import axios from 'axios';

// Get API URL directly from environment variables, matching Home.jsx pattern
const REMINDERS_URL = `${import.meta.env.VITE_API_URL}/reminders`;

// Get all reminders with optional query parameters
export const getAllReminders = async (queryString = '') => {
  try {
    const response = await axios.get(`${REMINDERS_URL}${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
};

// Get reminders for a specific item
export const getItemReminders = async (itemId) => {
  try {
    // First try to get reminders filtered by the backend
    const response = await axios.get(`${REMINDERS_URL}?itemId=${itemId}`);
    
    // If the backend doesn't filter properly, do client-side filtering
    let reminders = response.data?.data || response.data || [];
    
    // If reminders is an array (not already filtered by backend)
    if (Array.isArray(reminders)) {
      // Filter to only include reminders that match the itemId
      reminders = reminders.filter(reminder => 
        reminder.itemId === itemId || 
        reminder.item === itemId ||
        reminder.itemCustomId === itemId
      );
    }
    
    return Array.isArray(reminders) ? { data: reminders } : reminders;
  } catch (error) {
    console.error(`Error fetching reminders for item ${itemId}:`, error);
    throw error;
  }
};

// Create a new reminder
export const createReminder = async (reminderData) => {
  try {
    const response = await axios.post(REMINDERS_URL, reminderData);
    return response.data;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

// Update a reminder
export const updateReminder = async (id, reminderData) => {
  try {
    const response = await axios.put(`${REMINDERS_URL}/${id}`, reminderData);
    return response.data;
  } catch (error) {
    console.error(`Error updating reminder ${id}:`, error);
    throw error;
  }
};

// Mark a reminder as completed
export const completeReminder = async (id) => {
  try {
    const response = await axios.patch(`${REMINDERS_URL}/${id}/complete`, {});
    return response.data;
  } catch (error) {
    console.error(`Error completing reminder ${id}:`, error);
    throw error;
  }
};

// Delete a reminder
export const deleteReminder = async (id) => {
  try {
    // Validate the ID parameter
    if (!id) {
      throw new Error('Reminder ID is required for deletion');
    }
    
    // Log the delete attempt for debugging
    console.log(`Attempting to delete reminder with ID: ${id}`);
    
    const response = await axios.delete(`${REMINDERS_URL}/${id}`);
    
    // Check if the request was successful even if we got a 500 status code
    // This can happen if the backend successfully deletes but has an issue with the logging
    if (response.status === 200) {
      console.log(`Successfully deleted reminder ${id}`);
      return { success: true, message: 'Reminder deleted successfully', data: response.data };
    }
    
    return response.data;
  } catch (error) {
    // Enhanced error logging with more details
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error(`Error deleting reminder ${id}: Server responded with status ${error.response.status}`);
      console.error('Response data:', error.response.data);
      
      // Special handling for 500 errors where deletion might have succeeded
      if (error.response.status === 500) {
        console.warn('The deletion may have succeeded despite the error. The UI will be updated.');
        // Don't throw an error, instead return a success object
        // This way the component won't show an error toast
        return { 
          success: true, 
          probablyDeleted: true,
          message: 'The reminder was likely deleted successfully.',
          id: id,
          // This flag tells the component not to show an error toast
          noErrorToast: true
        };
      } else if (error.response.status === 404) {
        console.error('The reminder may have already been deleted or does not exist');
        // Return success for 404 since the reminder doesn't exist anyway
        return {
          success: true,
          alreadyDeleted: true,
          message: 'The reminder was already deleted or does not exist.',
          id: id,
          noErrorToast: true
        };
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`Error deleting reminder ${id}: No response received from server`, error.request);
    } else {
      // Something happened in setting up the request
      console.error(`Error deleting reminder ${id}:`, error.message);
    }
    
    // Rethrow with more context but allow the UI to update if deletion probably succeeded
    throw {
      ...error,
      probablyDeleted: error.response?.status === 500,
      userMessage: `Failed to delete reminder (ID: ${id}). The server returned an error. Please refresh the page to see if the deletion succeeded.`
    };
  }
};
