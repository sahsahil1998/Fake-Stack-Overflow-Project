import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const QuestionsComponent = () => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const [repostData, setRepostData] = useState({
    questionId: null,
    newTitle: '',
    newText: '',
  });

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

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRepostClick = (questionId) => {
    // Set the questionId for which the user wants to repost
    console.log("in hehre");
    setRepostData({
      questionId,
      newTitle: '',
      newText: '',
    });
  };

  const handleRepost = async () => {
    console.log("in hehre");
    try {
      console.log("question id", repostData.questionId);
      const response = await axios.post(`http://localhost:8000/questions/repost/${repostData.questionId}`, {
        newTitle: repostData.newTitle,
        newText: repostData.newText,
      });

      // Handle the response as needed
      console.log('Repost successful', response.data);
    } catch (error) {
      // Handle errors
      console.error('Repost failed:', error);
    } finally {
      // Reset repostData after reposting
      setRepostData({
        questionId: null,
        newTitle: '',
        newText: '',
      });
    }
  };

  return (
    <div>
      <h2>View All Questions</h2>
      <ul>
        {currentQuestions.map((question) => (
          <li key={question._id}>
            <Link to={`/questions/${question.qid}`}>
              <h3>{question.title}</h3>
            </Link>
            <p>{question.text}</p>
            <button onClick={() => handleRepostClick(question.qid)}>Repost</button>
          </li>
        ))}
      </ul>

      <Pagination
        questionsPerPage={questionsPerPage}
        totalQuestions={questions.length}
        paginate={paginate}
        currentPage={currentPage}
      />

      {/* Modal or Form for Reposting */}
      {repostData.questionId && (
        <div>
          <label>New Title:</label>
          <input
            type="text"
            value={repostData.newTitle}
            onChange={(e) => setRepostData({ ...repostData, newTitle: e.target.value })}
          />

          <label>New Text:</label>
          <textarea
            value={repostData.newText}
            onChange={(e) => setRepostData({ ...repostData, newText: e.target.value })}
          />

          <button onClick={handleRepost}>Repost</button>
        </div>
      )}
    </div>
  );
};

const Pagination = ({ questionsPerPage, totalQuestions, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalQuestions / questionsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination">
        {pageNumbers.map((number) => (
          <li key={number} className={number === currentPage ? 'active' : ''}>
            <button onClick={() => paginate(number)}>{number}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// PropTypes validation for Pagination component
Pagination.propTypes = {
  questionsPerPage: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  paginate: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default QuestionsComponent;
