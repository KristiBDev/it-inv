import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AiOutlineEye, AiOutlineDownload, AiOutlineFolder } from 'react-icons/ai';
import { MdOutlineDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import ItemDetailsModal from './ItemDetailsModal';
import DeleteItemModal from './DeleteItemModal';

const ItemList = ({ refreshTrigger }) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  // New state for delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Function to open delete modal
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Function to close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Function to handle successful deletion
  const handleDeleteSuccess = () => {
    // Refresh the items list by triggering a re-render
    const apiUrl = import.meta.env.VITE_API_URL;
    axios
      .get(`${apiUrl}/items`)
      .then((response) => {
        setItems(response.data.data || []);
        setFilteredItems(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
      });
  };

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
  }, [refreshTrigger]);

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
    <div>
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
          >
            Add Item
          </Link>
        </div>
      </div>

      <div className="app-card">
        {loading ? (
          <div className="text-center p-6">Loading items...</div>
        ) : (
          <table className="app-table app-table-striped min-w-full divide-y">
            <thead>
              <tr>
                <th className="column-header p-4 text-left rounded-tl-lg">ID</th>
                <th className="column-header p-4 text-left">Name</th>
                <th className="column-header p-4 text-left hidden md:table-cell">Category</th>
                <th className="column-header p-4 text-left hidden md:table-cell">Status</th>
                <th className="column-header p-4 text-left hidden md:table-cell">Date Added</th>
                <th className="column-header p-4 text-left hidden md:table-cell">Department</th>
                <th className="column-header p-4 text-center actions-header rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-4">{item?.customId || 'N/A'}</td>
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
                        title="View Full Details"
                      >
                        <AiOutlineFolder size={18} />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="action-button action-button-delete"
                        title="Delete Item"
                      >
                        <MdOutlineDelete size={18} />
                      </button>
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
        )}
      </div>

      <ItemDetailsModal 
        isOpen={isModalOpen} 
        onClose={closeItemDetails} 
        itemId={selectedItemId}
      />

      {/* Add the DeleteItemModal */}
      {itemToDelete && (
        <DeleteItemModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          itemId={itemToDelete.customId}
          itemTitle={itemToDelete.title}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default ItemList;
