// ProfileLogo.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../stylesheets/profileLogo.css'; // Import the stylesheet for styling

const ProfileLogo = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false); // Added state to track authentication

  useEffect(() => {
    // Fetch user session status on component mount
    axios.get('http://localhost:8000/api/users/check-session', { withCredentials: true })
        .then(response => {
            console.log(response.data.user)
            setIsAuthenticated(response.data.isLoggedIn);
            console.log(response.data.isLoggedIn);
            // console.log(isAuthenticated);

        })
        .catch(error => console.error('Error checking user session:', error));
}, []);

  return (
    <div className="profile-logo">
      
      {isAuthenticated ? (
                    <button><Link to="/userprofile">
                    {/* Add your logo or profile image */}
                    <img src="../assets/ProfileLogo.jpg" alt="User Profile" />
                  </Link>
                  </button>
                ) : (
                    <button disabled >User Profile</button>
                )}
    </div>
  );
};

export default ProfileLogo;
