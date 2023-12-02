// Importing React and necessary hooks
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

// Importing the stylesheet for the home page
import '../stylesheets/homepage.css';

const HomePageComponent = ({ query }) => {
    // State hooks for managing questions data and display
    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const questionsPerPage = 5;
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [noQuestionsFound, setNoQuestionsFound] = useState(false);
    const [viewType, setViewType] = useState('newest'); // Default view type
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Added state to track authentication
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user session status on component mount
        axios.get('http://localhost:8000/api/users/check-session', { withCredentials: true })
            .then(response => {
                setIsAuthenticated(response.data.isLoggedIn);
            })
            .catch(error => console.error('Error checking user session:', error));
    }, []);

    // Reset currentPage to 1 when viewType changes
    useEffect(() => {
        setCurrentPage(1);
    }, [viewType]);
    
    // Effect hook to fetch questions based on query, viewType, or currentPage change
    useEffect(() => {
        const fetchURL = query 
            ? `http://localhost:8000/questions/search?query=${encodeURIComponent(query)}&sort=${viewType}&page=${currentPage}&limit=${questionsPerPage}`
            : `http://localhost:8000/questions/?sort=${viewType}&page=${currentPage}&limit=${questionsPerPage}`;
    
        axios.get(fetchURL)
            .then(response => {
                setQuestions(response.data.questions);
                setTotalQuestions(response.data.totalCount);
                setNoQuestionsFound(response.data.questions.length === 0);
            })
            .catch(error => {
                console.error('Error fetching questions:', error);
                setNoQuestionsFound(true);
                setTotalQuestions(0);
            });
    }, [query, viewType, currentPage]);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalQuestions / questionsPerPage);

    // Function to handle pagination
    const handlePagination = (direction) => {
        if (direction === 'next') {
            setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
        } else if (direction === 'prev') {
            setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));
        }
    };

    // Function to format the date and time of questions
    const formatDate = (askDateTime) => {
        const now = new Date();
        const askDate = new Date(askDateTime);
        const diffInSeconds = Math.floor((now - askDate) / 1000);
    
        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    
        return new Intl.DateTimeFormat('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false, 
            hourCycle: 'h23'
        }).format(askDate).replace(/,/g, '');
    };

    
// Render function for the home page
return (
    <div className="main-content" id="homeDiv">
        {/* Section displaying total questions and ask question button */}
        <div className='main-top'>
            <h1>All Questions</h1>
            <p>{totalQuestions} questions</p>
            {/* Conditionally render the button based on isAuthenticated */}
            {isAuthenticated ? (
                    <button onClick={() => navigate('/ask')} className='mainDivAskButton'>Ask a Question</button>
                ) : (
                    <button disabled className='mainDivAskButton'>Ask a Question</button>
                )}
        </div>

        {/* Buttons to change the view type of questions */}
        <div className="buttons-top">
            <div className='button-container'>
                {/* Buttons for Newest, Active, Unanswered view types */}
                <button onClick={() => setViewType('newest')} className={`buttonDeco ${viewType === 'newest' ? 'active' : ''}`}>Newest</button>
                <button onClick={() => setViewType('active')} className={`buttonDeco ${viewType === 'active' ? 'active' : ''}`}>Active</button>
                <button onClick={() => setViewType('unanswered')} className={`buttonDeco ${viewType === 'unanswered' ? 'active' : ''}`}>Unanswered</button>
            </div>
        </div>

        {/* Pagination Controls */}
        <div className="pagination-controls">
            <button onClick={() => handlePagination('prev')} disabled={currentPage === 1}>Prev</button>
            <button onClick={() => handlePagination('next')} disabled={currentPage === totalPages}>Next</button>
        </div>

        {/* Container for displaying questions */}
        <div className="questionContainer">
            {noQuestionsFound ? (
                <p>No questions found.</p>
            ) : (
                questions.map((question) => (
                    <div key={question.qid} className="question-entry">
                        {/* Question statistics like answers count and views */}
                        <div className="postStats">
                            <p>{question.answers.length} answers</p>
                            <p>{question.views || 0} views</p>
                            {/*}
                            
                            <div className="voting-buttons">
                                    <button onClick={() => handleVote(question.qid, 'upvote')}>Upvote</button>
                                    <p>Upvotes: {question.upvotes}</p>
                                    <button onClick={() => handleVote(question.qid, 'downvote')}>Downvote</button>
                                    <p>Downvotes: {question.downvotes}</p>
                            </div>
                */}
                        </div>
                        {/* Question title and navigation */}
                        <h2 className="postTitle">
                            <a href="#/" onClick={(e) => {
                                e.preventDefault();
                                navigate(`/questions/${question.qid}`);
                            }}>
                                {question.title}
                            </a>
                        </h2>
                        {/* Display the summary */}
                        <p className="questionSummary">{question.summary}</p>
                        {/* Question metadata like author and ask date */}
                        <div className="lastActivity">
                            <p>
                                {question.asked_by} asked {formatDate(question.ask_date_time)}
                            </p>
                        </div>
                        {/* Displaying tags associated with the question */}
                        <div className="tags">
                            {question.tags.map((tag, index) => (
                                <button key={index} className="tagButton">{tag.name}</button>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

};

//Define prop types
HomePageComponent.propTypes = {
    query: PropTypes.string
};  

export default HomePageComponent;
