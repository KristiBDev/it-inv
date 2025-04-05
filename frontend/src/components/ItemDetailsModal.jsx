import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoMdClose } from 'react-icons/io';
import Spinner from './Spinner';
import ItemTag from './ItemTag';
import { toast } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';

const ItemDetailsModal = ({ isOpen, onClose, itemId }) => {
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const { isNightMode } = useTheme();

  useEffect(() => {
    if (isOpen && itemId) {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      axios
        .get(`${apiUrl}/items/${itemId}`)
        .then((response) => {
          setItem(response.data);
          
          // Get the QR code
          if (response.data.qrCode) {
            setQrCode(response.data.qrCode);
          } else {
            // If QR code doesn't exist in the item data, fetch it separately
            axios.get(`${apiUrl}/items/${itemId}/qrcode`)
              .then(qrResponse => {
                setQrCode(qrResponse.data.qrCode);
              })
              .catch(error => {
                console.error("Error fetching QR code:", error);
              });
          }
          
          setLoading(false);
        })
        .catch((error) => {
          if (error.response?.status === 429) {
            toast.error('Too many requests. Please try again later.');
          } else {
            console.error(error);
          }
          setLoading(false);
          onClose();
        });
    }
  }, [isOpen, itemId, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] bg-transparent z-50 flex justify-center items-center p-4">
      <div className="relative rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto card">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Item Details</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition`}
            aria-label="Close"
          >
            <IoMdClose className="text-2xl" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-lg font-medium text-gray-500">Name</span>
                    <p className="text-xl">{item.title}</p>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-500">Category</span>
                    <p className="text-xl">{item.category}</p>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-500">Status</span>
                    <p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === 'In Use'
                            ? 'bg-green-200 text-green-800'
                            : item.status === 'Available'
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-lg font-medium text-gray-500">Department</span>
                    <p className="text-xl">{item.department}</p>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-500">Item ID</span>
                    <p className="text-xl">{item.customId}</p>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-500">Date Added</span>
                    <p className="text-xl">
                      {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-lg font-medium text-gray-500">Last Updated</span>
                <p className="text-xl">
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              
              {/* Asset Label Section - updated title */}
              {qrCode && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="text-lg font-medium text-gray-500 mb-2 block">Asset Label</span>
                  <ItemTag item={item} qrCode={qrCode} compact={false} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;
