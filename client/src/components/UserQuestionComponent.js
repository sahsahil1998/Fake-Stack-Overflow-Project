import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const QuestionsComponent = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/users/questions`, { withCredentials: true });
        setQuestions(response.data);
        console.log("State set with: ", response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  console.log("Rendering with questions: ", questions);

  return (
    <div>
      <h2>View All Questions</h2>
      {questions && questions.length > 0 ? (
        <ul>
          {questions.map((question) => (
            <li key={question._id}>
              <Link to={`/questions/details/${question.qid}`}>{question.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No questions available.</p>
      )}
    </div>
  );
};

export default QuestionsComponent;
