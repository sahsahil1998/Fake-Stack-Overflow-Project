// Importing necessary React hooks and components
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importing stylesheet for the page
import '../stylesheets/answerPage.css';

// Component for displaying answers to a specific question
const AnswersPageComponent = () => {
    // Extracting the question ID from the URL parameters
    const { qid } = useParams();
    // Hook for navigating programmatically
    const navigate = useNavigate();
    // State for storing the question data
    const [question, setQuestion] = useState(null);
    // State for storing potential errors
    const [error, setError] = useState('');

    // Effect hook for fetching question data on component mount or when qid changes
    useEffect(() => {
        const fetchQuestionData = async () => {
            try {
                // Fetching question data from the server
                const response = await axios.get(`http://localhost:8000/questions/${qid}`);
                setQuestion(response.data);
                // Incrementing view count of the question
                await axios.put(`http://localhost:8000/questions/increaseviewcount/${qid}`);
            } catch (error) {
                // Handling errors in data fetching
                console.error('Error fetching question data:', error);
                setError('Error loading question data. Please try again later.');
            }
        };

        fetchQuestionData();
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

    // Rendering the component UI
    return (
        <div className="answers-page">
            <div id="answersHeader">
                <span>{question.answers.length} answers</span>
                <h2>{question.title}</h2>
                <button onClick={() => navigate('/ask')} id="askQuestionButton" className="mainDivAskButton">Ask a Question</button>
            </div>
            <div id="questionBody">
                <div>{renderTextWithHyperlinks(question.text)}</div>
                <span>{question.views} views</span>
                <div className="questionMetadata">
                    {question.asked_by} asked {formatDate(question.ask_date_time)}
                </div>
                <div className="questionTags">
                    {question.tags.map(tag => (
                        <span key={tag.tid} className="tagButton">{tag.name}</span>
                    ))}
                </div>
            </div>
            <h3>Answers:</h3>
            <div className="answers-section">
                {question.answers.length > 0 ? (
                    question.answers.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time)).map(answer => (
                        <div key={answer.aid}>
                            <div className="answerText">{renderTextWithHyperlinks(answer.text)}</div>
                            <div className="answerAuthor">{answer.ans_by} answered {formatDate(answer.ans_date_time)}</div>
                            <hr style={{ borderTop: "1px dotted #000" }} />
                        </div>
                    ))
                ) : (
                    <div>No answers yet. Be the first to answer!</div>
                )}
            </div>
            <button onClick={() => navigate(`/questions/${qid}/answer`)}>Answer Question</button>
        </div>
    );
};

export default AnswersPageComponent;
