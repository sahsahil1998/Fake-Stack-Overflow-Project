import React, { useState } from 'react';
import axios from 'axios';

export default function RegistrationFormComponent() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Replace with your backend API endpoint
            await axios.post('http://localhost:8000/api/users/register', formData);
            alert('User registered successfully');
            // Redirect user or clear form
        } catch (error) {
            alert('Registration failed: ' + error.response.data);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    name="username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    placeholder="Username" 
                    required
                />
                <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="Email" 
                    required
                />
                <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Password" 
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
