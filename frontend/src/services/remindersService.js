import axios from 'axios';
import { API_URL } from '../config';

const REMINDERS_URL = `${API_URL}/reminders`;

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
    const response = await axios.get(`${REMINDERS_URL}/item/${itemId}`);
    return response.data;
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
    const response = await axios.delete(`${REMINDERS_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting reminder ${id}:`, error);
    throw error;
  }
};
