import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePageComponent = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Welcome to Fake Stack Overflow</h1>
            <button onClick={() => navigate('/register')}>Register as New User</button>
            <button onClick={() => navigate('/login')}>Login as Existing User</button>
            <button onClick={() => navigate('/home')}>Continue as Guest</button>
        </div>
    );
};

export default WelcomePageComponent;
