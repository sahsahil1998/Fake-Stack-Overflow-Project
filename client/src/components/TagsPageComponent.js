// Importing React and necessary hooks
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importing a helper function to fetch tags
import { fetchTags } from "../helpers/helper.js";

// Importing the stylesheet for the tags page
import '../stylesheets/tagsPage.css';

export default function TagsPageComponent() {
    // State hooks for managing tags data, loading state, and errors
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hook for programmatic navigation
    const navigate = useNavigate();

    // Effect hook to fetch tags on component mount
    useEffect(() => {
        setIsLoading(true);
        fetchTags()
            .then(data => {
                setTags(data);
            })
            .catch(err => {
                setError(err.message || 'Error loading tags');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);
    

    // Function to handle 'Ask a Question' button click
    const handleAskQuestionClick = () => {
        navigate('/ask'); // Navigating to the ask question page
    };

    // Render loading state
    if (isLoading) return <p>Loading...</p>;
    // Render error state
    if (error) return <p>Error loading data!</p>;

    // Render function for the tags page
    return (
        <div>
            {/* Header section with tags count and 'Ask a Question' button */}
            <div id="tagsHeader">
                <span>{tags.length} Tags</span>
                <h3>All Tags</h3>
                <button onClick={handleAskQuestionClick} className="askQuestionButton">Ask a Question</button>
            </div>
            {/* Container for displaying all the tags */}
            <div className="tagsContainer">
                {tags.map(tag => (
                    <div className="tagNode" key={tag.tid} onClick={() => navigate(`/tags/${tag.tid}`)}>
                        <span>{tag.name} ({tag.questionCount} questions)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
