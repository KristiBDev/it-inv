import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';

const DeleteItem = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { id } = useParams();

  const handleDelete = async () => {
    setLoading(true);
    setMessage('');
    try {
      await axios.delete(`http://104.248.166.172:5555/items/${id}`);
      setMessage('Item deleted successfully!');
    } catch (error) {
      setMessage('Failed to delete item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-3xl my-4">Delete Item</h1>
      <div className="flex flex-col border-2 border-red-400 rounded-xl w-fit p-4">
        <p className="text-xl text-gray-500 mb-4">Are you sure you want to delete this item?</p>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Confirm'}
        </button>
        {message && <p className="mt-4 text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default DeleteItem;