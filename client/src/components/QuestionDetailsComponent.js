import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const QuestionDetailsComponent = () => {
  const [question, setQuestion] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const { qid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/questions/${qid}`);
        setQuestion(response.data);
        setEditTitle(response.data.title); // Initialize with fetched data
        setEditText(response.data.text); // Initialize with fetched data
      } catch (error) {
        console.error('Error fetching question details:', error);
      }
    };

    fetchQuestionDetails();
  }, [qid]);

  const handleRepost = async () => {
    try {
      await axios.post(`http://localhost:8000/questions/repost/${qid}`, { newTitle: editTitle, newText: editText });
      alert('Question reposted successfully');
      navigate('/userprofile/questions'); // Navigate back to the questions list
    } catch (error) {
      console.error('Error reposting question:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`http://localhost:8000/questions/${qid}`);
        alert('Question deleted successfully');
        navigate('/userprofile/questions');
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  if (!question) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Edit Question</h2>
      <div>
        <label>Title:</label>
        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
      </div>
      <div>
        <label>Text:</label>
        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
      </div>
      <button onClick={handleRepost}>Repost</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default QuestionDetailsComponent;
