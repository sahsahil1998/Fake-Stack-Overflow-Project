// Importing React and necessary hooks
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importing the stylesheet for the home page
import '../stylesheets/homepage.css';

const HomePageComponent = ({ query }) => {
    // State hooks for managing questions data and display
    const [questions, setQuestions] = useState([]);
    const [displayedQuestions, setDisplayedQuestions] = useState([]);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [noQuestionsFound, setNoQuestionsFound] = useState(false);
    const [viewType, setViewType] = useState('newest'); // Default view type
    const navigate = useNavigate();

    // Effect hook to fetch questions based on query or viewType change
    useEffect(() => {
        const fetchURL = query 
            ? `http://localhost:8000/questions/search?query=${encodeURIComponent(query)}` 
            : 'http://localhost:8000/questions/';
    
        axios.get(fetchURL)
            .then(response => {
                setQuestions(response.data);
                setTotalQuestions(response.data.length);
                sortAndDisplayQuestions(response.data, viewType);
            })
            .catch(error => {
                console.error('Error fetching questions:', error);
                setNoQuestionsFound(true);
                setTotalQuestions(0);
            });
    }, [query, viewType]);

    // Effect hook to sort questions whenever the questions list or viewType changes
    useEffect(() => {
        sortAndDisplayQuestions(questions, viewType);
    }, [questions, viewType]);

    // Function to sort questions based on the selected view type
    const sortAndDisplayQuestions = (questionsToSort, viewType) => {
        let sortedQuestions = [...questionsToSort];
        switch (viewType) {
            case 'newest':
                sortedQuestions.sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time));
                break;
            case 'active':
                // Sorting based on the latest activity
                sortedQuestions.sort((a, b) => {
                    const lastAnswerA = a.last_answered_time ? new Date(a.last_answered_time) : new Date(0);
                    const lastAnswerB = b.last_answered_time ? new Date(b.last_answered_time) : new Date(0);
                    return lastAnswerB - lastAnswerA;
                });
                break;
            case 'unanswered':
                // Filtering out questions with no answers
                sortedQuestions = sortedQuestions.filter(q => q.answers.length === 0);
                break;
            default:
            // No default action needed
        }

        setDisplayedQuestions(sortedQuestions);
        setTotalQuestions(sortedQuestions.length);
        setNoQuestionsFound(sortedQuestions.length === 0);
    };

    // Function to render a message when no unanswered questions are found
    const renderNoUnansweredQuestionsMessage = () => (
        <div className="no-questions-message">
            <h2>No Unanswered Questions Yet</h2>
            <p>Looks like all questions have been answered. Why not ask a new question and get the conversation started?</p>
            <button onClick={() => navigate('/ask')} className="askQuestionButton">Ask a Question</button>
        </div>
    );

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
                <button onClick={() => navigate('/ask')} className='mainDivAskButton'>Ask a Question</button>
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

            {/* Container for displaying questions */}
            <div className="questionContainer">
                {noQuestionsFound ? (
                    viewType === 'unanswered' ? renderNoUnansweredQuestionsMessage() : <p>No questions found.</p>
                ) : (
                    displayedQuestions.map((question) => (
                        // Rendering each question with title, stats, and tags
                        <div key={question.qid} className="question-entry">
                            {/* Question statistics like answers count and views */}
                            <div className="postStats">
                                <p>{question.answers.length} answers</p>
                                <p>{question.views || 0} views</p>
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

export default HomePageComponent;
