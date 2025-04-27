import React, { useState } from 'react';
import axios from 'axios';
import { IoMdClose } from 'react-icons/io';
import { toast } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';

const DeleteItemModal = ({ isOpen, onClose, itemId, itemTitle, onDeleteSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const { isNightMode } = useTheme();

  if (!isOpen) return null;

  const handleDeleteItem = async () => {
    setDeleting(true);
    setMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      await axios.delete(`${apiUrl}/items/${itemId}`, {
        data: { user: "DemoAdmin" } // Send user in request body for DELETE
      });
      setMessage('Item deleted successfully!');
      toast.success('Item deleted successfully!');
      // Wait a moment before closing the modal and notifying parent
      setTimeout(() => {
        onClose();
        if (onDeleteSuccess) onDeleteSuccess();
      }, 1500);
    } catch (error) {
      if (error.response?.status === 429) {
        // Use the server's response message if available
        const errorMessage = error.response.data.message || "Item deletion limit reached. Please try again later.";
        toast.error(errorMessage);
        setMessage('Rate limit exceeded. Please try again later.');
      } else {
        console.error(error);
        setMessage('Failed to delete item. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  // Prevent click inside modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div 
        className={`relative rounded-xl shadow-2xl w-full max-w-md overflow-hidden ${isNightMode ? 'bg-gray-800' : 'bg-white'} app-modal`}
        onClick={handleModalClick}
      >
        {/* Modal header */}
        <div className={`sticky top-0 z-10 flex justify-between items-center p-4 border-b ${isNightMode ? 'border-gray-700' : 'border-gray-200'} ${isNightMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold text-red-500">Delete Item</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition"
            aria-label="Close"
          >
            <IoMdClose className="text-2xl" />
          </button>
        </div>

        {/* Modal content */}
        <div className={`p-6 ${isNightMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col">
            <p className="text-xl mb-2">Are you sure you want to delete this item?</p>
            <p className="font-bold mb-6">{itemTitle || 'Unknown Item'}</p>
            
            <div className="flex justify-between gap-4">
              <button
                onClick={onClose}
                className="app-btn app-btn-outline flex-1"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="app-btn bg-red-500 hover:bg-red-600 text-white flex-1"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
            
            {message && (
              <div className={`mt-4 p-3 rounded ${
                message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              } ${isNightMode ? 'bg-opacity-20 text-opacity-90' : ''}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteItemModal;