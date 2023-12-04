import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditAnswerComponent = () => {
    const [answer, setAnswer] = useState({ text: '' });
    const [isLoading, setIsLoading] = useState(false);
    //const [errors, setErrors] = useState({});
    const { answerId } = useParams(); 
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch the existing answer
        const fetchAnswer = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:8000/answers/${answerId}`);
                setAnswer(response.data);
            } catch (error) {
                console.error('Error fetching answer:', error);
            }
            setIsLoading(false);
        };
        fetchAnswer();
    }, [answerId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.put(`http://localhost:8000/answers/${answerId}`, answer);
            alert('Answer updated successfully');
            navigate('/some-redirect-path');
        } catch (error) {
            console.error('Error updating answer:', error);
        }
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this answer?')) {
            setIsLoading(true);
            try {
                await axios.delete(`http://localhost:8000/answers/${answerId}`);
                alert('Answer deleted successfully');
                navigate('/some-redirect-path');
            } catch (error) {
                console.error('Error deleting answer:', error);
            }
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setAnswer({ ...answer, text: e.target.value });
    };

    return (
        <div>
            <h2>Edit Answer</h2>
            <form onSubmit={handleUpdate}>
                <textarea value={answer.text} onChange={handleChange} />
                <button type="submit" disabled={isLoading}>Update Answer</button>
                <button type="button" onClick={handleDelete} disabled={isLoading}>Delete Answer</button>
            </form>
        </div>
    );
};

export default EditAnswerComponent;
