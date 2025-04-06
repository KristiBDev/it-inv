import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ItemList from '../components/ItemList';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const { isNightMode } = useTheme();

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
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg rounded-lg p-6 transform transition-transform hover:scale-[1.02]">
          <h2 className="text-xl font-semibold">Total Items</h2>
          <p className="text-4xl font-bold mt-2">{items?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg rounded-lg p-6 transform transition-transform hover:scale-[1.02]">
          <h2 className="text-xl font-semibold">In Use</h2>
          <p className="text-4xl font-bold mt-2">{items?.filter((item) => item.status === 'In Use').length || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white shadow-lg rounded-lg p-6 transform transition-transform hover:scale-[1.02]">
          <h2 className="text-xl font-semibold">Maintenance</h2>
          <p className="text-4xl font-bold mt-2">{items?.filter((item) => item.status === 'Maintenance').length || 0}</p>
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
                <div 
                  key={log._id} 
                  className={`log-entry ${
                    log.action === 'create'
                      ? 'log-entry-create'
                      : log.action === 'update'
                      ? 'log-entry-update'
                      : 'log-entry-delete'
                  }`}
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <span className="text-sm text-secondary">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`log-badge ${
                      log.action === 'create'
                        ? 'log-badge-create'
                        : log.action === 'update'
                        ? 'log-badge-update'
                        : 'log-badge-delete'
                      }`}
                    >
                      {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                    </span>
                  </div>
                  
                  <p className="font-medium mt-1">
                    <span className="font-bold">{log.user}</span> {log.action === 'create' ? 'created' : log.action === 'update' ? 'updated' : 'deleted'} item{' '}
                    <Link 
                      to={`/items/edit/${log.itemId}`}
                      className="text-blue-500 hover:underline font-bold"
                    >
                      {log.itemName}
                    </Link> ({log.itemId})
                  </p>
                  
                  <p className="mt-1 text-secondary text-sm">
                    {log.details && typeof log.details === 'string' 
                      ? log.details.replace(`User ${log.user} ${log.action}d item ${log.itemName} (${log.itemId})`, '').trim() || 'No additional details'
                      : 'No details available'}
                  </p>
                </div>
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