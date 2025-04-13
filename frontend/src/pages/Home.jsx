import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ItemList from '../components/ItemList';
import LogEntry from '../components/LogEntry';
import { homePageStats } from '../components/ReminderList';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    axios
      .get(`${apiUrl}/items`)
      .then((response) => {
        setItems(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response?.status === 429) {
          toast.error('Too many requests. Please try again later.');
        } else {
          console.error("Error fetching items:", error);
        }
        setLoading(false);
      });
  }, [refresh]);

  useEffect(() => {
    setLogsLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    axios
      .get(`${apiUrl}/logs?limit=10&page=1`)
      .then((response) => {
        setLogs(response.data.data || []);
        setLogsLoading(false);
      })
      .catch((error) => {
        if (error.response?.status === 429) {
          toast.error('Too many requests. Please try again later.');
        } else {
          console.error("Error fetching logs:", error);
        } 
        setLogsLoading(false);
      });
  }, [refresh]);

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold tracking-wide">IT Inventory Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg rounded-lg p-6 transform transition-transform hover:scale-[1.02] cursor-pointer"
          onClick={() => navigate('/inventory')}
        >
          <h2 className="text-xl font-semibold">Total Items</h2>
          <p className="text-4xl font-bold mt-2">{items?.length || 0}</p>
        </div>
        <div 
          className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white shadow-lg rounded-lg p-6 transform transition-transform hover:scale-[1.02] cursor-pointer"
          onClick={() => navigate('/inventory')}
        >
          <h2 className="text-xl font-semibold">Maintenance</h2>
          <p className="text-4xl font-bold mt-2">{items?.filter((item) => item.status === 'Maintenance').length || 0}</p>
        </div>
        <div 
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg rounded-lg p-6 transform transition-transform hover:scale-[1.02] cursor-pointer"
          onClick={() => navigate('/reminders')}
        >
          <h2 className="text-xl font-semibold">Reminders</h2>
          <div className="mt-2">
            <p className="text-lg">
              <span className="font-bold text-red-300">{homePageStats.overdue}</span> Overdue
            </p>
            <p className="text-lg">
              <span className="font-bold text-yellow-300">{homePageStats.thisMonth}</span> Due this month
            </p>
          </div>
        </div>
      </div>

      <ItemList refreshTrigger={refresh} />

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="app-card p-2">
          {logsLoading ? (
            <div className="p-4 text-center">Loading activity logs...</div>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log) => (
                <LogEntry key={log._id} log={log} />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">No activity logs available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;