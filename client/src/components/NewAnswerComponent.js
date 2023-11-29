// Importing React hooks and additional libraries
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importing the stylesheet for the new answer page
import '../stylesheets/answerPage.css';

const NewAnswerComponent = () => {
    // State for holding user input for username and answer text
    const [username, setUsername] = useState('');
    const [answerText, setAnswerText] = useState('');
    // State for managing input validation errors
    const [errors, setErrors] = useState({});

    // Extracting question ID from URL parameters
    const { qid } = useParams();
    // Hook for programmatically navigating between routes
    const navigate = useNavigate();

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validating user inputs
        const validationErrors = validateAnswerInput(username, answerText);
        if (Object.keys(validationErrors).length === 0) {
            try {
                // POST request to submit the new answer
                await axios.post(`http://localhost:8000/questions/${qid}/answers`, {
                    text: answerText,
                    ans_by: username
                });
                // Navigating to the question's page after successful submission
                navigate(`/questions/${qid}`);
            } catch (error) {
                console.error('Error posting answer:', error);
            }
        } else {
            setErrors(validationErrors);
        }
    };

    // Function to validate answer input fields
    const validateAnswerInput = (username, answerText) => {
        let newErrors = {};
    
        if (!username.trim()) {
            newErrors.username = "Username cannot be empty";
        }
    
        if (!answerText.trim()) {
            newErrors.answerText = "Answer text cannot be empty";
        } else {
            // Validation for correctly formatted hyperlinks in the answer text
            const potentialHyperlinkRegex = /\[([^\]]*)]\(([^)]*)\)/g;
            let match;
            while ((match = potentialHyperlinkRegex.exec(answerText)) !== null) {
                if (match[1] === '' || match[2] === '' || !match[2].startsWith('https://')) {
                    newErrors.answerText = "Invalid hyperlink constraints";
                    break;
                }
            }
        }
    
        return newErrors;
    };

    // Render function for the new answer form
    return (
        <div className="new-answer-page">
            <h5>Provide Your Answer</h5>
            <form onSubmit={handleSubmit}>
                {/* Input field for username */}
                <div>
                    <label htmlFor="answerUsernameInput">Username: <span className="mandatory">*</span></label>
                    <input
                        id="answerUsernameInput"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your name here"
                    />
                    {errors.username && <span className="error">{errors.username}</span>}
                </div>
                {/* Textarea for answer text */}
                <div>
                    <label htmlFor="answerTextInput">Answer: <span className="mandatory">*</span></label>
                    <textarea
                        id="answerTextInput"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Your answer here..."
                    />
                    {errors.answerText && <span className="error">{errors.answerText}</span>}
                </div>
                {/* Submit button */}
                <button type="submit">Post Answer</button>
            </form>
        </div>
    );
};

export default NewAnswerComponent;
