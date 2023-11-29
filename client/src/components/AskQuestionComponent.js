// Importing React hooks and additional libraries
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importing stylesheet specific to this component
import '../stylesheets/askQuestion.css';

const AskQuestionComponent = () => {
    // State hooks for managing form inputs and errors
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [tags, setTags] = useState("");
    const [username, setUsername] = useState("");
    const [errors, setErrors] = useState({});

    // Hook for programmatically navigating between routes
    const navigate = useNavigate();

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateInputs(title, text, tags, username);

        // Checking for validation errors before making the API call
        if (Object.keys(validationErrors).length === 0) {
            try {
                const tagArray = tags.split(/\s+/).filter(tag => tag.trim() !== "");
                const postData = { title, text, tags: tagArray, askedBy: username };

                // Making a POST request to the server
                await axios.post('http://localhost:8000/questions', postData);
                navigate('/'); // Redirecting to the homepage on successful post
            } catch (error) {
                console.error('Error posting question:', error);
                // Optionally handle the error by updating the state
            }
        } else {
            setErrors(validationErrors);
        }
    };

    // Function to validate form inputs
    const validateInputs = (title, text, tags, username) => {
        let errors = {};

        // Validation for each input field
        if (!title.trim()) errors.title = "Title cannot be empty";
        else if (title.length > 100) errors.title = "Title cannot be more than 100 characters";

        // Validation for text including hyperlink format check
        if (!text.trim()) errors.text = "Question text cannot be empty";
        else {
            const potentialHyperlinkRegex = /\[([^\]]*)]\(([^)]*)\)/g;
            let match;
            while ((match = potentialHyperlinkRegex.exec(text)) !== null) {
                if (match[1] === '' || match[2] === '' || !match[2].startsWith('https://')) {
                    errors.text = "Invalid hyperlink";
                    break;
                }
            }
        }

        // Validation for tags
        if (!tags.trim()) errors.tags = "Tags cannot be empty";
        else {
            const tagArray = tags.split(/\s+/).filter(tag => tag.trim() !== "");
            if (tagArray.length > 5) errors.tags = "Cannot have more than 5 tags";
            else if (tagArray.some(tag => tag.length > 20)) errors.tags = "Tag length cannot be more than 20 characters";
        }

        // Validation for username
        if (!username.trim()) errors.username = "Username cannot be empty";
    
        return errors;
    };
    
    // Render function for the form
    return (
        <form onSubmit={handleSubmit} id="questionForm">
            <div>
                <h2>Question Title:</h2>
                <input 
                    type="text" 
                    id="formTitleInput"
                    placeholder="Enter the title of your question"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <div className="error-message">{errors.title}</div>}
            </div>
            <div>
                <h2>Question Text:</h2>
                <textarea 
                    id="formTextInput"
                    placeholder="Describe your question in detail"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                {errors.text && <div className="error-message">{errors.text}</div>}
            </div>
            <div>
                <h2>Tags:</h2>
                <input 
                    type="text" 
                    id="formTagInput"
                    placeholder="Enter up to 5 tags separated by whitespace"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
                {errors.tags && <div className="error-message">{errors.tags}</div>}
            </div>
            <div>
                <h2>Username:</h2>
                <input 
                    type="text" 
                    id="formUsernameInput"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            <button type="submit" className="submitQuestionButton">Post Question</button>
        </form>
    );
};

export default AskQuestionComponent;
