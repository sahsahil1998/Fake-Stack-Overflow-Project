import React from 'react';
import { Route, Routes, HashRouter } from 'react-router-dom';

// Importing individual page and layout components
import WelcomePageComponent from './WelcomePageComponent.js';
import HomePageComponent from './HomePageComponent.js';
import TagsPageComponent from './TagsPageComponent.js';
import AnswersPageComponent from './AnswersPageComponent.js';
import AskQuestionComponent from './AskQuestionComponent.js';
import SearchResultsComponent from './SearchResultsComponent.js';
import NewAnswerComponent from './NewAnswerComponent.js';
import QuestionTagsPage from './QuestionsTagsPage.js';
import RegistrationFormComponent from './RegistrationFormComponent.js';
import LoginPageComponent from './LoginPageComponent.js';
import MainLayout from './MainLayout.js';
import UserProfile from './UserProfile.js';

const FakeStackOverflow = () => {
  return (
    <HashRouter>
      <div className='container'>
        <Routes>
          {/* Set WelcomePageComponent as the default route */}
          <Route path="/" element={<WelcomePageComponent />} />

          {/* Individual routes for login and registration */}
          <Route path="/login" element={<LoginPageComponent />} />
          <Route path="/register" element={<RegistrationFormComponent />} />

          {/* Nested routes within MainLayout for authenticated pages */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePageComponent />} />
            {/* Other routes inside MainLayout */}
            <Route path="/questions/:qid/answer" element={<NewAnswerComponent />} />
            <Route path="/questions/:qid" element={<AnswersPageComponent />} />
            <Route path="/tags" element={<TagsPageComponent />} />
            <Route path="/ask" element={<AskQuestionComponent />} />
            <Route path="/search" element={<SearchResultsComponent />} /> 
            <Route path="/tags/:tid" element={<QuestionTagsPage />} />
            <Route path="/userprofile" element={<UserProfile />} />
          </Route>
        </Routes>
      </div>
    </HashRouter>
  );
};
export default FakeStackOverflow;
