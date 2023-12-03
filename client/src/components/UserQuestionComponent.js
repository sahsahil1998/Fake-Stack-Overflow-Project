// QuestionsComponent.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuestionsComponent = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsData = await axios.get('http://localhost:8000/api/users/questions', { withCredentials: true });
        setQuestions(questionsData.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div>
      <h2>View All Questions</h2>
      <ul>
        {questions.map((question) => (
          <li key={question._id}>
            <h3>{question.title}</h3>
            <p>{question.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionsComponent;
