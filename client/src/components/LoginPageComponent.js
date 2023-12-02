import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPageComponent() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Replace with backend API endpoint for login
            await axios.post('http://localhost:8000/api/users/login', credentials, { withCredentials: true });
            alert('Login successful');
            navigate('/home'); // Redirect to home page on successful login
        } catch (error) {
            alert('Login failed: ' + error.response.data.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    name="username" 
                    value={credentials.username} 
                    onChange={handleChange} 
                    placeholder="Username" 
                    required
                />
                <input 
                    type="password" 
                    name="password" 
                    value={credentials.password} 
                    onChange={handleChange} 
                    placeholder="Password" 
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
