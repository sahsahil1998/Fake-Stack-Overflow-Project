// Importing React and necessary hooks
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importing stylesheet for the header component
import '../stylesheets/header.css';

const HeaderComponent = () => {
    // Hook to enable programmatic navigation
    const navigate = useNavigate();

    // Handler for search functionality
    const handleSearch = (e) => {
        // Triggering search on 'Enter' key press
        if (e.key === 'Enter') {
            // Logging the search term for debugging
            console.log('Search:', e.target.value);
            // Navigating to the search results page with the search query
            navigate(`/search?query=${e.target.value}`);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:8000/api/users/logout', { withCredentials: true });
            navigate('/'); // Redirect to the welcome page after logout
        } catch (error) {
            console.error('Logout failed:', error);
            // Optionally, show an error message to the user
        }
    };

    // Render function for the header component
    return (
        <div className="header">
            {/* Application title */}
            <h1 id="titleApplication">Fake Stack Overflow</h1>
            
            {/* Search bar input field */}
            <input 
                className="searchBar"
                type="text" 
                id="searchBar" 
                placeholder="Search..." 
                onKeyDown={handleSearch}
                style={{ marginLeft: '250px', width: '230px', lineHeight: '1px', height: '25px' }}
            />
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default HeaderComponent;
