import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

const EditItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
    axios
      .get(`${apiUrl}/items/${id}`)
      .then((response) => {
        setFormData({
          title: response.data.title,
          category: response.data.category,
          status: response.data.status,
          department: response.data.department,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      await axios.put(`${apiUrl}/items/${id}`, formData);
      setMessage('Item updated successfully!');
      toast.success('Item updated successfully!');
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else {
        console.error(error);
        setMessage('Failed to update item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-3xl my-4">Edit Item</h1>
      {loading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col border-2 border-yellow-400 rounded-xl w-fit p-4">
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-500">Name</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="border rounded p-2"
              required
            />
          </div>
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-500">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border rounded p-2"
              required
            >
              <option value="">Select Category</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Network">Network</option>
            </select>
          </div>
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-500">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border rounded p-2"
              required
            >
              <option value="">Select Status</option>
              <option value="In Use">In Use</option>
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-500">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="border rounded p-2"
              required
            >
              <option value="">Select Department</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="IT">IT</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Item'}
          </button>
          {message && <p className="mt-4 text-gray-700">{message}</p>}
        </form>
      )}
    </div>
  );
};

export default EditItem;