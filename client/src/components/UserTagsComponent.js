import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserTagsComponent = () => {
    const [tags, setTags] = useState([]);
    const [editingTagId, setEditingTagId] = useState(null);
    const [newTagName, setNewTagName] = useState("");

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await axios.get('http://localhost:8000/users/tags', { withCredentials: true });
            setTags(response.data);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleEditTag = async (tagId) => {
        if (!newTagName.trim()) {
            alert('Tag name cannot be empty');
            return;
        }

        try {
            await axios.put(`http://localhost:8000/tags/${tagId}`, { newName: newTagName }, { withCredentials: true });
            alert('Tag updated successfully');
            setEditingTagId(null);
            fetchTags();
        } catch (error) {
            console.error('Error updating tag:', error);
            alert('Error updating tag');
        }
    };

    const handleDeleteTag = async (tagId) => {
        if (window.confirm('Are you sure you want to delete this tag?')) {
            try {
                await axios.delete(`http://localhost:8000/tags/${tagId}`, { withCredentials: true });
                alert('Tag deleted successfully');
                fetchTags();
            } catch (error) {
                console.error('Error deleting tag:', error);
                alert('Error deleting tag');
            }
        }
    };

    return (
        <div>
            <h2>Your Tags</h2>
            <ul>
                {tags.map(tag => (
                    <li key={tag._id}>
                        {editingTagId === tag._id ? (
                            <input 
                                type="text" 
                                value={newTagName} 
                                onChange={(e) => setNewTagName(e.target.value)}
                                onBlur={() => setEditingTagId(null)}
                            />
                        ) : (
                            <span>{tag.name}</span>
                        )}
                        <button onClick={() => setEditingTagId(tag._id)}>Edit</button>
                        <button onClick={() => handleDeleteTag(tag._id)}>Delete</button>
                        {editingTagId === tag._id && (
                            <button onClick={() => handleEditTag(tag._id)}>Save</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserTagsComponent;
