import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import { useTheme } from '../contexts/ThemeContext';
import LogEntry from './LogEntry';

const ItemHistory = ({ itemId }) => {
  const [itemLogs, setItemLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const { isNightMode } = useTheme();
  
  useEffect(() => {
    if (itemId) {
      fetchItemLogs(itemId);
    }
  }, [itemId]);
  
  const fetchItemLogs = (itemId) => {
    setLogsLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
    axios
      .get(`${apiUrl}/logs/item/${itemId}`)
      .then((response) => {
        setItemLogs(response.data.data || []);
        setLogsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching item logs:", error);
        toast.error("Failed to load item history");
        setLogsLoading(false);
      });
  };

  return (
    <div className="p-6">
      {logsLoading ? (
        <div className="p-6 text-center">
          <Spinner />
        </div>
      ) : itemLogs.length > 0 ? (
        <div className="space-y-3">
          {itemLogs.map((log) => (
            <LogEntry key={log._id} log={log} />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-secondary">
          No history available for this item.
        </div>
      )}
    </div>
  );
};

export default ItemHistory;
