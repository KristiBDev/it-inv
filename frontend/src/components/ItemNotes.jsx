import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const ItemNotes = ({ itemId, onNotesChange }) => {
  const [itemNotes, setItemNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  
  useEffect(() => {
    if (itemId) {
      fetchItemNotes(itemId);
    }
  }, [itemId]);
  
  const fetchItemNotes = (itemId) => {
    setNotesLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
    
    axios
      .get(`${apiUrl}/notes/item/${itemId}`)
      .then((response) => {
        setItemNotes(response.data.data || []);
        setNotesLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching item notes:", error);
        setItemNotes([]);
        setNotesLoading(false);
        
        // Show toast only if it's not a 404 (which may happen if notes feature is new)
        if (error.response?.status !== 404) {
          toast.error('Failed to load notes');
        }
      });
  };
  
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    
    if (!noteContent.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }
    
    if (noteContent.length > 100) {
      toast.error("Note content cannot exceed 100 characters");
      return;
    }
    
    setAddingNote(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      
      await axios.post(`${apiUrl}/notes`, {
        itemId: itemId,
        content: noteContent,
        user: "DemoAdmin"
      });
      
      toast.success("Note added successfully");
      setNoteContent('');
      
      // Refresh notes and notify parent about changes
      fetchItemNotes(itemId);
      if (onNotesChange) onNotesChange();
    } catch (error) {
      console.error("Error adding note:", error);
      
      if (error.response?.status === 429) {
        const errorMessage = error.response.data.message || "Note creation limit reached. Please try again later.";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to add note. Please check if the notes API is available.");
      }
    } finally {
      setAddingNote(false);
    }
  };
  
  const handleDeleteNote = async (noteId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
      await axios.delete(`${apiUrl}/notes/${noteId}`, {
        data: { user: "DemoAdmin" }
      });
      
      toast.success("Note deleted successfully");
      
      // Refresh notes and notify parent about changes
      fetchItemNotes(itemId);
      if (onNotesChange) onNotesChange();
    } catch (error) {
      console.error("Error deleting note:", error);
      
      if (error.response?.status === 429) {
        const errorMessage = error.response.data.message || "Note deletion limit reached. Please try again later.";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to delete note");
      }
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Item Notes</h2>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleNoteSubmit} className="mb-6">
            <div className="flex flex-col space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Add a note (max 100 characters):
              </label>
              <div className="flex items-start">
                <input
                  type="text"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  maxLength={100}
                  className="flex-1 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="Enter a note..."
                />
                <button
                  type="submit"
                  disabled={addingNote || !noteContent.trim()}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                >
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {noteContent.length}/100 characters
              </div>
            </div>
          </form>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Existing Notes</h3>
            
            {notesLoading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : itemNotes.length > 0 ? (
              <ul className="space-y-3">
                {itemNotes.map(note => (
                  <li key={note._id} className="flex items-start justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="text-gray-800">{note.content}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>By {note.user}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-500 hover:text-red-700 transition p-1"
                      title="Delete note"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">No notes for this item yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemNotes;
