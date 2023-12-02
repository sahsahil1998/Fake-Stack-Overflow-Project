// UserProfile.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const [memberDays, setMemberDays] = useState(0);
  const [reputationPoints, setReputationPoints] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Make an API call to get user profile data
        const userProfileData = await fetch('/api/user/profile'); // Update the API endpoint
        const userProfile = await userProfileData.json();

        // Update state with user profile information
        setMemberDays(userProfile.memberDays);
        setReputationPoints(userProfile.reputationPoints);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div>
      <h2>User Profile</h2>

      <div>
        <p>Member for {memberDays} days</p>
        <p>Reputation Points: {reputationPoints}</p>
      </div>

      <div>
        <h3>Menu</h3>
        <ul>
          <li><Link to="/user/questions">View All Questions</Link></li>
          <li><Link to="/user/tags">View All Tags</Link></li>
          <li><Link to="/user/answers">View All Answers</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfile;
