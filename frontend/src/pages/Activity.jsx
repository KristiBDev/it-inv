import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { useTheme } from '../contexts/ThemeContext';
import BackButton from '../components/BackButton';

const Activity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isNightMode } = useTheme();
  
  useEffect(() => {
    fetchAllLogs();
  }, []);
  
  const fetchAllLogs = () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
    axios
      .get(`${apiUrl}/logs`)
      .then((response) => {
        setLogs(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching activity logs:", error);
        toast.error("Failed to load activity logs");
        setLoading(false);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <BackButton />
      </div>

      {loading ? (
        <div className="p-6 text-center">
          <Spinner />
        </div>
      ) : logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <div 
              key={log._id} 
              className={`p-3 rounded-lg ${
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
                <span className="font-bold">{log.user}</span> {log.action === 'create' ? 'created' : log.action === 'update' ? 'updated' : 'deleted'} 
                {log.itemName ? 
                  <span className="font-normal"> item <a href={`/items/details/${log.itemId}`} className="text-blue-600 hover:underline">{log.itemName}</a> {log.itemCode ? `(${log.itemCode})` : ''}</span> : 
                  ' an item'}
              </p>
              
              {log.changes && Object.keys(log.changes).length > 0 && (
                <div className="mt-2 pl-2 border-l-2 border-gray-300">
                  {Object.entries(log.changes).map(([field, change]) => (
                    <p key={field} className="text-sm text-secondary">
                      <span className="font-medium capitalize">{field}:</span> {change.from ? `${change.from} → ${change.to}` : (change.added ? `Added: "${change.added}"` : change.removed ? `Removed: "${change.removed}"` : '')}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-secondary">
          No activity logs available.
        </div>
      )}
    </div>
  );
};

export default Activity;
