// Importing React and Router components
import React from 'react';
import { Route, Routes, HashRouter } from 'react-router-dom';

// Importing individual page and layout components
import HeaderComponent from './HeaderComponent.js';
import HomePageComponent from './HomePageComponent.js';
import TagsPageComponent from './TagsPageComponent.js';
import AnswersPageComponent from './AnswersPageComponent.js';
import AskQuestionComponent from './AskQuestionComponent.js';
import SearchResultsComponent from './SearchResultsComponent.js';
import SidebarComponent from './SidebarComponent.js';
import NewAnswerComponent from './NewAnswerComponent.js';
import QuestionTagsPage from './QuestionsTagsPage.js';

// Importing global styles for the application
import '../stylesheets/index.css';

// Main routing component for the application
export default function FakeStackOverflow() {
    return (
        // Using HashRouter for client-side routing
        <HashRouter>
            <div className='container'>
                {/* Common header component for all pages */}
                <HeaderComponent />

                {/* Sidebar component, displayed on all pages */}
                <SidebarComponent />

                {/* Defining application routes */}
                <Routes>
                    {/* Route for the home page */}
                    <Route path="/" element={<HomePageComponent />} index />

                    {/* Route for adding a new answer to a question */}
                    <Route path="/questions/:qid/answer" element={<NewAnswerComponent />} />

                    {/* Route for viewing answers to a specific question */}
                    <Route path="/questions/:qid" element={<AnswersPageComponent />} />

                    {/* Route for the tags page */}
                    <Route path="/tags" element={<TagsPageComponent />} />

                    {/* Route for the ask question page */}
                    <Route path="/ask" element={<AskQuestionComponent />} />

                    {/* Route for the search results page */}
                    <Route path="/search" element={<SearchResultsComponent />} /> 

                    {/* Route for viewing questions associated with a specific tag */}
                    <Route path="/tags/:tid" element={<QuestionTagsPage />} />
                </Routes>
            </div>
        </HashRouter>
    );
}
