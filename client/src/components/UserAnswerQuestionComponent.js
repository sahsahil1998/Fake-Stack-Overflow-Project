import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AnswersComponent = () => {
    const [answers, setAnswers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnswers = async () => {
            try {
                const answersData = await axios.get('http://localhost:8000/api/users/answers', { withCredentials: true });
                // Sort answers by recent first
                const sortedAnswers = answersData.data.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));
                setAnswers(sortedAnswers);
            } catch (error) {
                console.error('Error fetching answers:', error);
            }
        };
        fetchAnswers();
    }, []);

    const handleAnswerClick = (answerId) => {
        // Navigate to the edit/delete answer form, passing the answerId
        navigate(`/edit-answer/${answerId}`);
    };

    return (
        <div>
            <h2>View All Answers</h2>
            <ul>
                {answers.map((answer) => (
                    <li key={answer._id}>
                        <button onClick={() => handleAnswerClick(answer._id)}>
                            {answer.text.substring(0, 50)}...
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AnswersComponent;
