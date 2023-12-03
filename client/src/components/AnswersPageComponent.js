// Importing necessary React hooks and components
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CommentsComponent from './CommentsComponent';
// Importing stylesheet for the page
import '../stylesheets/answerPage.css';

// Component for displaying answers to a specific question
const AnswersPageComponent = () => {
    const { qid } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // State for managing pagination
    const [currentPage, setCurrentPage] = useState(1);
    const answersPerPage = 5;

    useEffect(() => {
        // Fetch user session status on component mount
        axios.get('http://localhost:8000/api/users/check-session', { withCredentials: true })
            .then(response => {
                console.log(response.data.user)
                setIsAuthenticated(response.data.isLoggedIn);
                console.log(response.data.isLoggedIn);
                // console.log(isAuthenticated);

            })
            .catch(error => console.error('Error checking user session:', error));
    }, []);

    useEffect(() => {
        const fetchQuestionData = async () => {
            try {
                const questionResponse = await axios.get(`http://localhost:8000/questions/${qid}`);
                setQuestion(questionResponse.data);
                await axios.put(`http://localhost:8000/questions/increaseviewcount/${qid}`);
            } catch (error) {
                setError('Error loading question data. Please try again later.');
            }
        };

        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get('http://localhost:8000/api/users/check-session', { withCredentials: true });
                if (userResponse.data.isLoggedIn) {
                    setUser(userResponse.data.user);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchQuestionData();
        fetchUserData();
    }, [qid]);

    // Helper function to format date and time
    const formatDate = (dateTime) => {
        const date = new Date(dateTime);
        return new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false
        }).format(date);
    };

    // Function to convert markdown-style hyperlinks in text to HTML anchor tags
    const renderTextWithHyperlinks = (text) => {
        const hyperlinkRegex = /\[([^\]]+)]\((https?:\/\/[^)]+)\)/g;
        let parts = [];
        let match;
        let lastIndex = 0;

        while ((match = hyperlinkRegex.exec(text)) !== null) {
            parts.push(text.substring(lastIndex, match.index));
            parts.push(
                <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer">
                    {match[1]}
                </a>
            );
            lastIndex = match.index + match[0].length;
        }
        parts.push(text.substring(lastIndex));
        return parts;
    };

    // Handling error display
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    // Displaying a loading message while the data is being fetched
    if (!question) {
        return <div>Loading question...</div>;
    }

    // Change page handler
    const paginate = pageNumber => setCurrentPage(pageNumber);

    // Calculate the current answers to display
    const indexOfLastAnswer = currentPage * answersPerPage;
    const indexOfFirstAnswer = indexOfLastAnswer - answersPerPage;
    const currentAnswers = question && question.answers
                            ? question.answers.slice(indexOfFirstAnswer, indexOfLastAnswer)
                            : [];

    // Total number of pages
    const totalPages = Math.ceil(question.answers.length / answersPerPage);

    const PaginationControls = () => {
        // Check if the current page is the last page
        const isLastPage = currentPage === totalPages;
    
        return (
            <div className="pagination-controls">
                {[...Array(totalPages).keys()].map(number => {
                    const pageNumber = number + 1;
                    const isDisabled = pageNumber === currentPage;
    
                    return (
                        <button 
                            key={number} 
                            onClick={() => paginate(pageNumber)} 
                            className={currentPage === pageNumber ? 'active' : ''} 
                            disabled={isDisabled}>
                            Prev
                        </button>
                    );
                })}
    
                {/* Next Button */}
                <button 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={isLastPage}>
                    Next
                </button>
            </div>
        );
    };

    // Rendering the component UI
    return (
        <div className="answers-page">
            {question ? (
                <>
                    <div id="answersHeader">
                        <span>{question.answers.length} answers</span>
                        <h2>{question.title}</h2>
                        <button onClick={() => navigate('/ask')} id="askQuestionButton" className="mainDivAskButton">Ask a Question</button>
                    </div>
    
                    <div id="questionBody">
                        <div>{renderTextWithHyperlinks(question.text)}</div>
                        <span>{question.views} views</span>
                        <div className="questionMetadata">
                            {question.asked_by ? `${question.asked_by.username} asked ${formatDate(question.ask_date_time)}` : 'Unknown user'}
                        </div>
                        <div className="questionTags">
                            {question.tags.map(tag => (
                                <span key={tag.tid} className="tagButton">{tag.name}</span>
                            ))}
                        </div>
                    </div>
    
                    {/* Comments for the Question */}
                    <div className="comments-section">
                        <h4>Comments on Question:</h4>
                        <CommentsComponent parentId={qid} type="question" user={user}/>
                    </div>
    
                    <h3>Answers:</h3>
                    <div className="answers-section">
                        {currentAnswers.length > 0 ? currentAnswers.map(answer => (
                            <div key={answer.aid} className="answer-container">
                                <div className="answerText">{renderTextWithHyperlinks(answer.text)}</div>
                                <div className="answerAuthor">
                                    {answer.ans_by ? `${answer.ans_by.username} answered ${formatDate(answer.ans_date_time)}` : 'Unknown user'}
                                </div>
                                
                                {/* Comments for each Answer */}
                                <div className="comments-section">
                                    <h4>Comments on Answer:</h4>
                                    <CommentsComponent parentId={answer.aid} type="answer" user={user} />
                                </div>
    
                                <hr style={{ borderTop: "1px dotted #000" }} />
                            </div>
                        )) : (
                            <div>No answers yet. Be the first to answer!</div>
                        )}
                    </div>
    
                    {/* Pagination Controls */}
                    <PaginationControls />
                </>
            ) : (
                <div>Loading question...</div>
            )}
    
            {isAuthenticated && (
                <button onClick={() => navigate(`/questions/${qid}/answer`)} className='answers-section-button'>Answer Question</button>
            )}
        </div>
    );
    
};

export default AnswersPageComponent;
