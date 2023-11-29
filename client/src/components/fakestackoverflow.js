import React from 'react';
import { Route, Routes, HashRouter } from 'react-router-dom';

// Importing individual page and layout components
import WelcomePageComponent from './WelcomePageComponent.js';
import HeaderComponent from './HeaderComponent.js';
import HomePageComponent from './HomePageComponent.js';
import TagsPageComponent from './TagsPageComponent.js';
import AnswersPageComponent from './AnswersPageComponent.js';
import AskQuestionComponent from './AskQuestionComponent.js';
import SearchResultsComponent from './SearchResultsComponent.js';
import SidebarComponent from './SidebarComponent.js';
import NewAnswerComponent from './NewAnswerComponent.js';
import QuestionTagsPage from './QuestionsTagsPage.js';
import RegistrationFormComponent from './RegistrationFormComponent.js';

// Importing global styles for the application
import '../stylesheets/index.css';

const FakeStackOverflow = () => {
  // Function to determine if it's the home page
  const isHomePage = window.location.hash === '#/home';

  return (
    <HashRouter>
      <div className='container'>
        {/* Conditionally render HeaderComponent and SidebarComponent */}
        {isHomePage && <HeaderComponent />}
        {isHomePage && <SidebarComponent />}

        <Routes>
          {/* Set WelcomePageComponent as the default route */}
          <Route path="/" element={<WelcomePageComponent />} />
          <Route path="/home" element={<HomePageComponent />} />
          {/* Other routes */}
          <Route path="/register" element={<RegistrationFormComponent />} />
          <Route path="/questions/:qid/answer" element={<NewAnswerComponent />} />
          <Route path="/questions/:qid" element={<AnswersPageComponent />} />
          <Route path="/tags" element={<TagsPageComponent />} />
          <Route path="/ask" element={<AskQuestionComponent />} />
          <Route path="/search" element={<SearchResultsComponent />} /> 
          <Route path="/tags/:tid" element={<QuestionTagsPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default FakeStackOverflow;
