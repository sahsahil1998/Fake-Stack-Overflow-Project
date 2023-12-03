// ProfileLogo.js

import React from 'react';
import { Link } from 'react-router-dom';
import '../stylesheets/profileLogo.css'; // Import the stylesheet for styling

const ProfileLogo = () => {
  return (
    <div className="profile-logo">
      <Link to="/userprofile">
        {/* Add your logo or profile image */}
        <img src="../assets/ProfileLogo.jpg" alt="User Profile" />
      </Link>
    </div>
  );
};

export default ProfileLogo;
