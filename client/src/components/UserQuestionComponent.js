import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const QuestionsComponent = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/users/questions`, { withCredentials: true });
        if (response.data && response.data.questions) {
          setQuestions(response.data.questions);
          console.log("Fetched questions: ", response.data.questions);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestions([]);
      }
    };
  
    fetchQuestions();
  }, []);

  console.log("Rendering with questions: ", questions);

  if (questions.length === 0) {
    return (
        <div>
            <h2>Your Asked Questions:</h2>
            <p>No questions asked yet!</p>
        </div>
    );
}

  return (
    <div>
      <h1>Your Asked Questions:</h1>
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
