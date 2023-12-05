import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AnswersComponent = () => {
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        const fetchAnswers = async () => {
            try {
                const answersData = await axios.get('http://localhost:8000/api/users/answers', { withCredentials: true });
                const sortedAnswers = answersData.data.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));
                setAnswers(sortedAnswers);
            } catch (error) {
                console.error('Error fetching answers:', error);
            }
        };
        fetchAnswers();
    }, []);

    if (answers.length === 0) {
        return (
            <div>
                <h2>Your Answers:</h2>
                <p>No answers created yet!</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Your Answers:</h1>
            <ul>
                {answers.map((answer) => (
                    <li key={answer._id}>
                        <Link to={`/userprofile/answers/edit/${answer.aid}`}>
                            {answer.text.substring(0, 50)}...
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AnswersComponent;
