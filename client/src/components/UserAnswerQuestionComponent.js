// AnswersComponent.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnswersComponent = () => {
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const answersData = await axios.get('http://localhost:8000/api/users/answers', { withCredentials: true });
        setAnswers(answersData.data);
      } catch (error) {
        console.error('Error fetching answers:', error);
      }
    };

    fetchAnswers();
  }, []);

  return (
    <div>
      <h2>View All Answers</h2>
      <ul>
        {answers.map((answer) => (
          <li key={answer._id}>
            <p>{answer.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnswersComponent;
