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

      {/* Search bar on top */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="app-input w-full shadow-sm"
        />
      </div>
      
      {/* Controls on one line with 3-column layout */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        {/* Left: Download CSV */}
        <div className="w-full sm:w-auto mb-2 sm:mb-0">
          <button
            onClick={downloadCSV}
            className="app-btn app-btn-success flex items-center gap-2 shadow-md whitespace-nowrap w-full sm:w-auto"
          >
            <AiOutlineDownload className="text-xl" />
            <span>Download CSV</span>
          </button>
        </div>
        
        {/* Middle: Department Filter */}
        <div className="w-full sm:w-auto mb-2 sm:mb-0 text-center">
          <select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="app-select w-auto shadow-sm mx-auto"
          >
            <option>All Departments</option>
            <option>HR</option>
            <option>Finance</option>
            <option>IT</option>
            <option>Marketing</option>
            <option>Operations</option>
          </select>
        </div>
        
        {/* Right: Add Item */}
        <div className="w-full sm:w-auto text-right">
          <Link
            to="/items/create"
            className="app-btn app-btn-primary shadow-md w-full sm:w-auto"
            onClick={() => setRefresh(!refresh)}
          >
            Add Item
          </Link>
        </div>
      </div>

      <div className="app-card">
        <table className="app-table app-table-striped min-w-full divide-y">
          <thead>
            <tr>
              <th className="column-header p-4 text-left rounded-tl-lg">Name</th>
              <th className="column-header p-4 text-left hidden md:table-cell">Category</th>
              <th className="column-header p-4 text-left hidden md:table-cell">Status</th>
              <th className="column-header p-4 text-left hidden md:table-cell">Date Added</th>
              <th className="column-header p-4 text-left hidden md:table-cell">Department</th>
              <th className="column-header p-4 text-left hidden md:table-cell">ID</th>
              <th className="column-header p-4 text-center actions-header rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <tr key={index}>
                  <td className="p-4">{item?.title || 'N/A'}</td>
                  <td className="p-4 hidden md:table-cell">{item?.category || 'N/A'}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`status-badge ${
                        item?.status === 'In Use'
                          ? 'status-badge-in-use'
                          : item?.status === 'Available'
                          ? 'status-badge-available'
                          : 'status-badge-maintenance'
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
                  <td className="p-4 flex gap-2 justify-center actions-cell">
                    <button
                      onClick={() => openItemDetails(item?.customId)}
                      className="action-button action-button-view"
                      title="View Details"
                    >
                      <AiOutlineEye size={18} />
                    </button>
                    <Link
                      to={`/items/edit/${item?.customId}`}
                      className="action-button action-button-edit"
                      title="Edit Item"
                    >
                      <AiOutlineEdit size={18} />
                    </Link>
                    <Link
                      to={`/items/delete/${item?.customId}`}
                      className="action-button action-button-delete"
                      title="Delete Item"
                    >
                      <MdOutlineDelete size={18} />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
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

      <ItemDetailsModal 
        isOpen={isModalOpen} 
        onClose={closeItemDetails} 
        itemId={selectedItemId}
      />
    </div>
  );
};

export default Home;