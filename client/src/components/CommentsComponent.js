import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const CommentsComponent = ({ parentId, type }) => {
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const commentsPerPage = 3; // Display 3 comments per page

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const url = type === 'question' 
                            ? `http://localhost:8000/comments/question/${parentId}?page=${currentPage}&limit=${commentsPerPage}` 
                            : `http://localhost:8000/comments/answer/${parentId}?page=${currentPage}&limit=${commentsPerPage}`;
                const response = await axios.get(url);
                setComments(response.data.comments);
                setError(null);
            } catch (err) {
                setError("Failed to load comments.");
            }
        };

        fetchComments();
    }, [parentId, currentPage, type]);

    const handleNext = () => {
        setCurrentPage(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // Display message if no comments are available
    const renderComments = () => {
        if (comments.length === 0) {
            return <p>No comments yet.</p>;
        }
        return comments.map(comment => (
            <div key={comment._id}>
                <p>{comment.commented_by.username}: {comment.text}</p>
                <p>Votes: {comment.votes}</p>
            </div>
        ));
    };

    return (
        <div>
            {error && <p>{error}</p>}
            {renderComments()}
            <button onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
            <button onClick={handleNext}>Next</button>
        </div>
    );
};

// Move prop types definition outside the component function
CommentsComponent.propTypes = {
    parentId: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['question', 'answer']).isRequired
};

export default CommentsComponent;
