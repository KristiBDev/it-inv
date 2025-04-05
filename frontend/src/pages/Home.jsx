import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDownload } from 'react-icons/ai';
import { MdOutlineDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import ItemDetailsModal from '../components/ItemDetailsModal';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [refresh, setRefresh] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const { isNightMode } = useTheme();

  const openItemDetails = (itemId) => {
    setSelectedItemId(itemId);
    setIsModalOpen(true);
  };

  const closeItemDetails = () => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  };

  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    axios
      .get(`${apiUrl}/items`)
      .then((response) => {
        setItems(response.data.data || []);
        setFilteredItems(response.data.data || []);
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

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterItems(term, selectedDepartment);
  };

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setSelectedDepartment(department);
    filterItems(searchTerm, department);
  };

  const filterItems = (term, department) => {
    const filtered = items.filter(
      (item) =>
        (item?.title?.toLowerCase().includes(term) ||
          item?.customId?.toLowerCase().includes(term)) &&
        (department === "All Departments" || item?.department === department)
    );
    setFilteredItems(filtered);
  };

  const sortItems = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedItems = [...filteredItems].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredItems(sortedItems);
  };

  const downloadCSV = () => {
    if (filteredItems.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Name", "Category", "Status", "Date Added", "Department", "ID"];
    const rows = filteredItems.map(item => [
      item.title,
      item.category,
      item.status,
      item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : "N/A",
      item.department,
      item.customId,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-6 min-h-screen`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold tracking-wide">IT Inventory Dashboard</h1>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">Total Items</h2>
          <p className="text-4xl font-bold mt-2">{items?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">In Use</h2>
          <p className="text-4xl font-bold mt-2">{items?.filter((item) => item.status === 'In Use').length || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">Maintenance</h2>
          <p className="text-4xl font-bold mt-2">{items?.filter((item) => item.status === 'Maintenance').length || 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg p-3 w-full onethird shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={downloadCSV}
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-green-600 transition"
        >
          <AiOutlineDownload className="text-xl" />
          <span className="hidden md:inline">Download CSV</span>
        </button>
        <select
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          className="border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>All Departments</option>
          <option>HR</option>
          <option>Finance</option>
          <option>IT</option>
          <option>Marketing</option>
          <option>Operations</option>
        </select>
        <Link
          to="/items/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
          onClick={() => setRefresh(!refresh)}
        >
          Add Item
        </Link>
      </div>

      <div className={`rounded-lg shadow overflow-hidden ${isNightMode ? 'bg-gray-800' : 'bg-white'}`}>
        <table className={`min-w-full divide-y ${isNightMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={`${isNightMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left hidden md:table-cell">Category</th>
              <th className="p-4 text-left hidden md:table-cell">Status</th>
              <th className="p-4 text-left hidden md:table-cell">Date Added</th>
              <th className="p-4 text-left hidden md:table-cell">Department</th>
              <th className="p-4 text-left hidden md:table-cell">ID</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className={`${isNightMode ? 'bg-gray-800 text-gray-300' : 'bg-white'} divide-y ${isNightMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <tr
                  key={index}
                  className={`transition ${
                    isNightMode 
                      ? (index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750') 
                      : (index % 2 === 0 ? 'bg-gray-50' : 'bg-white')
                  } ${isNightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <td className="p-4">{item?.title || 'N/A'}</td>
                  <td className="p-4 hidden md:table-cell">{item?.category || 'N/A'}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item?.status === 'In Use'
                          ? 'bg-green-200 text-green-800'
                          : item?.status === 'Available'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}
                    >
                      {item?.status || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {item?.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 hidden md:table-cell">{item?.department || 'N/A'}</td>
                  <td className="p-4 hidden md:table-cell">{item?.customId || 'N/A'}</td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => openItemDetails(item?.customId)}
                      className="text-blue-500 hover:text-blue-700 transition"
                    >
                      <AiOutlineEye />
                    </button>
                    <Link
                      to={`/items/edit/${item?.customId}`}
                      className="text-green-500 hover:text-green-700 transition"
                    >
                      <AiOutlineEdit />
                    </Link>
                    <Link
                      to={`/items/delete/${item?.customId}`}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <MdOutlineDelete />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr className={isNightMode ? 'bg-gray-800 text-gray-300' : ''}>
                <td colSpan="7" className="text-center p-4">
                  No items available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className={`rounded-lg overflow-hidden ${isNightMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-2`}>
          {logsLoading ? (
            <div className="p-4 text-center">Loading activity logs...</div>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log) => (
                <div 
                  key={log._id} 
                  className={`p-3 rounded-lg border-l-4 ${
                    log.action === 'create'
                      ? 'border-l-emerald-500'
                      : log.action === 'update'
                      ? 'border-l-blue-500'
                      : 'border-l-purple-500'
                  } ${isNightMode 
                      ? (log.action === 'create'
                          ? 'bg-emerald-900 bg-opacity-15'
                          : log.action === 'update'
                          ? 'bg-blue-900 bg-opacity-15'
                          : 'bg-purple-900 bg-opacity-15') 
                      : (log.action === 'create'
                          ? 'bg-emerald-50'
                          : log.action === 'update'
                          ? 'bg-blue-50'
                          : 'bg-purple-50')
                  } ${isNightMode ? 'text-gray-200' : ''}`}
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <span className={`text-sm ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.action === 'create'
                          ? isNightMode ? 'bg-emerald-800 bg-opacity-50 text-emerald-200' : 'bg-emerald-200 text-emerald-800'
                          : log.action === 'update'
                          ? isNightMode ? 'bg-blue-800 bg-opacity-50 text-blue-200' : 'bg-blue-200 text-blue-800'
                          : isNightMode ? 'bg-purple-800 bg-opacity-50 text-purple-200' : 'bg-purple-200 text-purple-800'
                      }`}
                    >
                      {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                    </span>
                  </div>
                  
                  <p className={`font-medium mt-1 ${isNightMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <span className="font-bold">{log.user}</span> {log.action === 'create' ? 'created' : log.action === 'update' ? 'updated' : 'deleted'} item{' '}
                    <Link 
                      to={`/items/edit/${log.itemId}`}
                      className="text-blue-500 hover:underline font-bold"
                    >
                      {log.itemName}
                    </Link> ({log.itemId})
                  </p>
                  
                  <p className={`mt-1 ${isNightMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
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

      <ItemDetailsModal 
        isOpen={isModalOpen} 
        onClose={closeItemDetails} 
        itemId={selectedItemId}
        isNightMode={isNightMode}
      />
    </div>
  );
};

export default Home;