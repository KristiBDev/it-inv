import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { toast } from 'react-toastify';

const DeleteItem = () => {
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDeleteItem = async () => {
    setDeleting(true);
    setMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      await axios.delete(`${apiUrl}/items/${id}`, {
        data: { user: "DemoAdmin" } // Send user in request body for DELETE
      });
      setMessage('Item deleted successfully!');
      toast.success('Item deleted successfully!');
      // Wait a moment before navigating back
      setTimeout(() => navigate('/'), 1500);
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

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-3xl my-4">Delete Item</h1>
      <div className="flex flex-col border-2 border-red-400 rounded-xl w-fit p-4">
        <p className="text-xl text-gray-500 mb-4">Are you sure you want to delete this item?</p>
        <button
          onClick={handleDeleteItem}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Confirm'}
        </button>
        {message && <p className="mt-4 text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default DeleteItem;