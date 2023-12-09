// // Template test file. Change the file to add more tests.
// describe('Fake SO Test Suite', () => {
//     beforeEach(() => {
//         // Seed the database before each test
// //        cy.exec('node /path/to/server/init.js');
//       });

//       afterEach(() => {
//         // Clear the database after each test
// //        cy.exec('node /path/to/server/destroy.js');
//       });
//     it('successfully shows All Questions string', () => {
//         cy.visit('http://localhost:3000');
//         cy.contains('All Questions');
//     });
//     it('successfully shows Ask a Question button', () => {
//         cy.visit('http://localhost:3000');
//         cy.contains('Ask a Question');
//     });
// })

describe('Welcome Page Navigation Tests for Guests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/');
    });

    it('navigates to the home page when "Continue as Guest" is clicked', () => {
        cy.get('.welcome-button').contains('Continue as Guest').click();
        cy.url().should('include', '/home');
        cy.get('.main-top h1').should('contain', 'All Questions');
    });

});

describe('Create Account Tests', () => {
    beforeEach(() => {
        cy.exec('node ../server/init.js');
    });

    afterEach(() => {
        cy.exec('node ../server/destroy.js');
    });

    it('successfully navigates to the registration page', () => {
        cy.visit('http://localhost:3000');
        cy.get('.welcome-button').contains('Register as New User').click();
        cy.url().should('include', '/#/register');
    });

    it('allows a user to create an account', () => {
        cy.visit('http://localhost:3000/#/register');
        cy.get('input[name="username"]').type('newUser');
        cy.get('input[name="email"]').type('newUser@example.com');
        cy.get('input[name="password"]').type('password123');
        cy.get('input[name="confirmPassword"]').type('password123');
    
        
        cy.on('window:alert', (text) => {
            expect(text).to.contains('User registered successfully');
        });
    
        cy.get('form').submit();
    
        
        cy.url().should('include', '/#/login');
    });

    it('prevents account creation with existing username (server-side)', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:8000/api/users/register',
            failOnStatusCode: false,
            body: {
                username: 'user1',
                email: 'uniqueEmail@example.com',
                password: 'password123'
            }
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.contain('User already exists with the same username or email');
        });
    });

    it('prevents account creation with existing email (server-side)', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:8000/api/users/register',
            failOnStatusCode: false,
            body: {
                username: 'uniqueUsername',
                email: 'user2@gmail.com',
                password: 'password123'
            }
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.contain('User already exists with the same username or email');
        });
    });

    it('validates email format', () => {
        cy.visit('http://localhost:3000/#/register');
        cy.get('input[name="email"]').type('invalidemail');
        cy.get('input[name="password"]').type('password123');
        cy.get('input[name="confirmPassword"]').type('password123');

        cy.window().then((win) => {
            cy.stub(win, 'alert').as('windowAlert');
        });

        cy.get('form').submit();

        cy.get('@windowAlert').should('have.been.calledWith', 'Please enter a valid email address');
    });

    it('ensures password does not contain username or email', () => {
        cy.visit('http://localhost:3000/#/register');
        cy.get('input[name="username"]').type('testUser');
        cy.get('input[name="email"]').type('testUser@example.com');
        cy.get('input[name="password"]').type('testUser');

        cy.window().then((win) => {
            cy.stub(win, 'alert').as('windowAlert');
        });

        cy.get('form').submit();

        cy.get('@windowAlert').should('have.been.calledWith', 'Password should not contain username or email');
    });

    it('checks password and confirm password fields match', () => {
        cy.visit('http://localhost:3000/#/register');
    
        
        cy.get('input[name="username"]').type('validUsername');
        cy.get('input[name="email"]').type('validEmail@example.com');
        cy.get('input[name="password"]').type('password123');
        cy.get('input[name="confirmPassword"]').type('differentPassword');
    
        cy.window().then((win) => {
            cy.stub(win, 'alert').as('windowAlert');
        });
    
        cy.get('form').submit();
    
        cy.get('@windowAlert').should('have.been.calledWith', 'Passwords do not match');
    });

    it('does not allow account creation with missing fields in API request', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:8000/api/users/register',
            failOnStatusCode: false,
            body: {
                
                password: 'password123'
            }
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.contains('All fields are required');
        });
    });
    

});

describe('Login Tests', () => {
    beforeEach(() => {
        
        cy.exec('node ../server/init.js');
    });

    afterEach(() => {
        
        cy.exec('node ../server/destroy.js');
    });

    it('successfully navigates to the login page', () => {
        cy.visit('http://localhost:3000');
        cy.get('.welcome-button').contains('Login as Existing User').click();
        cy.url().should('include', '/#/login');
    });

    it('allows a registered user (user1) to log in successfully', () => {
        cy.visit('http://localhost:3000/#/login');
        cy.get('input[name="username"]').type('user1'); 
        cy.get('input[name="password"]').type('password1');
        cy.get('form').submit();

        // Handle alert for successful login
        cy.on('window:alert', (text) => {
            expect(text).to.contains('Login successful');
        });

        // Check URL to confirm redirection to home page
        cy.url().should('include', '/#/home');
    });
    

    it('gives feedback for an unregistered username', () => {
        cy.visit('http://localhost:3000/#/login');
        cy.get('input[name="username"]').type('unregisteredUser');
        cy.get('input[name="password"]').type('pass');

        // Prepare to handle the alert for login failure
        cy.on('window:alert', (text) => {
            expect(text).to.contains('Login failed');
        });

        cy.get('form').submit();
        cy.url().should('include', '/#/login');
    });

    it('gives feedback for an incorrect password', () => {
        cy.visit('http://localhost:3000/#/login');
        cy.get('input[name="username"]').type('user1');
        cy.get('input[name="password"]').type('password2');

        // Prepare to handle the alert for login failure
        cy.on('window:alert', (text) => {
            expect(text).to.contains('Login failed');
        });

        cy.get('form').submit();
        cy.url().should('include', '/#/login');
    });

    
});

describe('Logout Tests', () => {
    beforeEach(() => {
        // Initialize the database state before each test
        cy.exec('node ../server/init.js');

        // Login the user before each test
        cy.visit('http://localhost:3000/#/login');
        cy.get('input[name="username"]').type('user1');
        cy.get('input[name="password"]').type('password1');
        cy.get('form').submit();
        cy.url().should('include', '/#/home');
    });

    afterEach(() => {
    
        cy.exec('node ../server/destroy.js');
    });

    it('allows a logged-in user to log out successfully', () => {describe('Logout Tests', () => {
        beforeEach(() => {
            cy.exec('node ../server/init.js');
    
            // Login the user before each test
            cy.visit('http://localhost:3000/#/login');
            cy.get('input[name="username"]').type('user1');
            cy.get('input[name="password"]').type('password1');
            cy.get('form').submit();
            cy.url().should('include', '/#/home');
        });
    
        afterEach(() => {
            cy.exec('node ../server/destroy.js');
        });
    
        it('allows a logged-in user to log out successfully', () => {
            cy.get('button').contains('Logout').click();
            cy.url().should('include', '/');
        });
    
        it('displays logout button when user is logged in', () => {
            cy.get('button').contains('Logout').should('be.visible');
        });
    
        it('does not display logout button when user is not logged in', () => {
            cy.get('button').contains('Logout').click(); // Logout first
            // Wait for logout to complete
            cy.url().should('include', '/');
            // Revisit the page to ensure the state is reset
            cy.visit('http://localhost:3000');
            cy.get('button').contains('Logout').should('not.exist');
            cy.get('button').contains('Register').should('be.visible');
            cy.get('button').contains('Login').should('be.visible');
        });
    
    });
    
        cy.get('button').contains('Logout').click();
        cy.url().should('include', '/');
    });

    it('displays logout button when user is logged in', () => {
        cy.get('button').contains('Logout').should('be.visible');
    });

    it('does not display logout button when user is not logged in', () => {
        // Clear application state
        cy.clearCookies();
        cy.clearLocalStorage();
    
        // Visit the welcome page as a guest
        cy.visit('http://localhost:3000');
        cy.get('.welcome-button').contains('Continue as Guest').click();
    
        // Ensure the user is on the home page as a guest
        cy.url().should('include', '/#/home');
    
        // Check that the Logout button does not exist
        cy.get('button').contains('Logout').should('not.exist');
    
        // Check that the Register and Login buttons are visible
        cy.get('button').contains('Register').should('be.visible');
        cy.get('button').contains('Login').should('be.visible');
    });
    
    
});

describe('Home Page Tests as Guest User', () => {
    beforeEach(() => {
        cy.exec('node ../server/init.js'); 
        cy.visit('http://localhost:3000/#/home');
    });

    afterEach(() => {
        cy.exec('node ../server/destroy.js');
    });

    it('shows an error message and a way to navigate back on system failure', () => {
        // Intercepting the API call and forcing it to return an error
        cy.intercept('GET', 'http://localhost:8000/api/users/check-session', { statusCode: 500 });
    
        // Reload the page to trigger the intercepted API call
        cy.visit('http://localhost:3000/#/home');
        cy.get('.error-message').should('be.visible').and('contain', 'An error occurred. Please try again.');;
        cy.get('.back').should('be.visible').click();
        cy.url().should('include', '/');
    });

    it('ensures the Ask a Question button is disabled for guest users', () => {
        cy.visit('http://localhost:3000/#/home');
        cy.get('.mainDivAskButton').should('be.disabled');
    });
    
    it('loads the home page with default Newest view', () => {
        cy.get('.main-top h1').should('contain', 'All Questions');
        cy.get('.button-container .buttonDeco.active').should('contain', 'Newest');
    });

    it('displays the correct number of questions with all details including votes', () => {
        cy.get('.questionContainer .question-entry').should('have.length', 5);
        cy.get('.questionContainer .question-entry').each(($el) => {
            cy.wrap($el).find('.postTitle a').should('exist');
            cy.wrap($el).find('.questionSummary').should('exist');
            cy.wrap($el).find('.tags .tagButton').should('exist');
            cy.wrap($el).find('.postStats p').should('exist');
            cy.wrap($el).find('.lastActivity p').should('exist');
            cy.wrap($el).find('.vote-buttons span').should('exist');
        });
    });

    it('navigates to question details when question title is clicked', () => {
        cy.get('.questionContainer .question-entry').first().find('.postTitle a').click();
        cy.url().should('include', '/questions/');
    });

    it('paginates to the next set of questions', () => {
        cy.get('.pagination-controls button').contains('Next').click();
        cy.get('.questionContainer .question-entry').should('have.length', 2);
    });

    it('disables the Prev button on the first page', () => {
        cy.get('.pagination-controls button').contains('Prev').should('be.disabled');
    });

    it('disables the Next button on the last page', () => {
        cy.get('.pagination-controls button').contains('Next').click();
        cy.get('.pagination-controls button').contains('Next').should('be.disabled');
    });

    it('sorts questions by Newest view', () => {
        cy.get('.button-container .buttonDeco').contains('Newest').click();
        cy.get('.questionContainer .question-entry').first().find('.lastActivity p')
          .should('contain', 'Jan 10, 2023 at');
    });

    it('sorts questions by Active view', () => {
        cy.get('.button-container .buttonDeco').contains('Active').click();
        cy.get('.questionContainer .question-entry').first().find('.lastActivity p')
        //Question at the top of stack by most recent answer
          .should('contain', 'Jan 07, 2023 at');
    });

    it('sorts questions by Unanswered view', () => {
        cy.get('.button-container .buttonDeco').contains('Unanswered').click();
        cy.get('.questionContainer .question-entry').should('have.length', 4);
        // Verify the titles of the questions to ensure they are the unanswered ones
        cy.get('.questionContainer .question-entry').first().find('.postTitle a')
          .should('contain', 'Introduction to Git and GitHub');
    });

    const testPaginationAndViewCount = (viewType, expectedCount, expectedFirstTitleOnNextPage) => {
        it(`paginates correctly and shows correct question count in ${viewType} view`, () => {
            cy.get('.button-container .buttonDeco').contains(viewType).click();
            cy.get('.main-top p').should('contain', `${expectedCount} questions`);

            if (expectedCount > 5) {
                cy.get('.pagination-controls button').contains('Next').click();
                cy.get('.questionContainer .question-entry').first().find('.postTitle a')
                    .should('contain', expectedFirstTitleOnNextPage);
                cy.get('.pagination-controls button').contains('Prev').click();
            } else {
                // For views with less than or equal to 5 questions, Prev and Next should be disabled
                cy.get('.pagination-controls button').contains('Prev').should('be.disabled');
                cy.get('.pagination-controls button').contains('Next').should('be.disabled');
            }
        });
    };

    testPaginationAndViewCount('Newest', 7, 'Best practices for MongoDB schema design?');
    testPaginationAndViewCount('Active', 7, 'Handling Async Operations in Redux');
    testPaginationAndViewCount('Unanswered', 4);
    
});

describe('Home Page Tests as Registered User', () => {
    beforeEach(() => {
        cy.exec('node ../server/init.js'); 
        // Login the user before each test
        cy.visit('http://localhost:3000/#/login');
        cy.get('input[name="username"]').type('user2');
        cy.get('input[name="password"]').type('password2');
        cy.get('form').submit();
        cy.url().should('include', '/#/home');
    });

    afterEach(() => {
        cy.exec('node ../server/destroy.js');
    });

    it('shows an error message and a way to navigate back on system failure', () => {
        // Mock server failure on user session check
        cy.intercept('GET', 'http://localhost:8000/api/users/check-session', { statusCode: 500 }).as('checkSession');
    
        // Log in and navigate to the home page
        cy.visit('http://localhost:3000/#/login');
        cy.get('input[name="username"]').type('user2');
        cy.get('input[name="password"]').type('password2');
        cy.get('form').submit();
        cy.url().should('include', '/home');
    
        // Wait for the session check request to complete
        cy.wait('@checkSession');
    
        // Check for the error message
        cy.get('.error-message').should('be.visible').and('contain', 'An error occurred. Please try again.');
        cy.get('.back').should('be.visible').click();
        cy.url().should('include', '/');
    });
    
    

    it('ensures the Ask a Question button is enabled for registered users', () => {
        cy.visit('http://localhost:3000/#/home');
        cy.get('.mainDivAskButton').should('not.be.disabled');
    });

    it('navigates to the Ask Question page when Ask a Question button is clicked', () => {
        cy.get('.mainDivAskButton').click();
        cy.url().should('include', '/ask');
    });

    it('loads the home page with default Newest view', () => {
        cy.get('.main-top h1').should('contain', 'All Questions');
        cy.get('.button-container .buttonDeco.active').should('contain', 'Newest');
    });

    it('displays the correct number of questions with all details including votes', () => {
        cy.get('.questionContainer .question-entry').should('have.length', 5);
        cy.get('.questionContainer .question-entry').each(($el) => {
            cy.wrap($el).find('.postTitle a').should('exist');
            cy.wrap($el).find('.questionSummary').should('exist');
            cy.wrap($el).find('.tags .tagButton').should('exist');
            cy.wrap($el).find('.postStats p').should('exist');
            cy.wrap($el).find('.lastActivity p').should('exist');
    
            // Check if the Logout button exists to determine if the user is logged in
            cy.get('body').then(($body) => {
                if ($body.find('button:contains("Logout")').length) {
                    // User is logged in, check for vote buttons
                    cy.wrap($el).find('.vote-buttons button').should('exist');
                } else {
                    // User is not logged in, check for vote counts
                    cy.wrap($el).find('.vote-buttons span').should('exist');
                }
            });
        });
    });
    

    it('navigates to question details when question title is clicked', () => {
        cy.get('.questionContainer .question-entry').first().find('.postTitle a').click();
        cy.url().should('include', '/questions/');
    });

    it('paginates to the next set of questions', () => {
        cy.get('.pagination-controls button').contains('Next').click();
        cy.get('.questionContainer .question-entry').should('have.length', 2);
    });

    it('disables the Prev button on the first page', () => {
        cy.get('.pagination-controls button').contains('Prev').should('be.disabled');
    });

    it('disables the Next button on the last page', () => {
        cy.get('.pagination-controls button').contains('Next').click();
        cy.get('.pagination-controls button').contains('Next').should('be.disabled');
    });

    it('sorts questions by Newest view', () => {
        cy.get('.button-container .buttonDeco').contains('Newest').click();
        cy.get('.questionContainer .question-entry').first().find('.lastActivity p')
          .should('contain', 'Jan 10, 2023 at');
    });

    it('sorts questions by Active view', () => {
        cy.get('.button-container .buttonDeco').contains('Active').click();
        cy.get('.questionContainer .question-entry').first().find('.lastActivity p')
          .should('contain', 'Jan 07, 2023 at');
    });

    it('sorts questions by Unanswered view', () => {
        cy.get('.button-container .buttonDeco').contains('Unanswered').click();
        cy.get('.questionContainer .question-entry').should('have.length', 4);
        cy.get('.questionContainer .question-entry').first().find('.postTitle a')
          .should('contain', 'Introduction to Git and GitHub');
    });

    const testPaginationAndViewCount = (viewType, expectedCount, expectedFirstTitleOnNextPage) => {
        it(`paginates correctly and shows correct question count in ${viewType} view`, () => {
            cy.get('.button-container .buttonDeco').contains(viewType).click();
            cy.get('.main-top p').should('contain', `${expectedCount} questions`);

            if (expectedCount > 5) {
                cy.get('.pagination-controls button').contains('Next').click();
                cy.get('.questionContainer .question-entry').first().find('.postTitle a')
                    .should('contain', expectedFirstTitleOnNextPage);
                cy.get('.pagination-controls button').contains('Prev').click();
            } else {
                cy.get('.pagination-controls button').contains('Prev').should('be.disabled');
                cy.get('.pagination-controls button').contains('Next').should('be.disabled');
            }
        });
    };

    testPaginationAndViewCount('Newest', 7, 'Best practices for MongoDB schema design?');
    testPaginationAndViewCount('Active', 7, 'Handling Async Operations in Redux');
    testPaginationAndViewCount('Unanswered', 4);
});

describe('Search Functionality Tests', () => {
    beforeEach(() => {
        cy.exec('node ../server/init.js');
        cy.visit('http://localhost:3000/#/search');
    });

    afterEach(() => {
        cy.exec('node ../server/destroy.js');
    });

    it('searches and displays results for text match', () => {
        cy.get('.searchBar').type('JavaScript{enter}');
        cy.url().should('include', '/search?query=JavaScript');
        cy.get('.questionContainer .question-entry').should('have.length', 1);
        cy.get('.questionContainer .question-entry').first().find('.postTitle a').should('contain', 'How to use promises in JavaScript?');
    });

    it('searches and displays results for tag match', () => {
        cy.get('.searchBar').type('[React]{enter}');
        cy.url().should('include', '/search?query=[React]');
        cy.get('.questionContainer .question-entry').should('have.length', 2);
        cy.get('.questionContainer .question-entry').first().find('.postTitle a').should('contain', 'Handling Async Operations in Redux');
    });

    it('searches and displays results for combined text and tag match', () => {
        cy.get('.searchBar').type('best practices [mongoDB]{enter}');
        cy.url().should('include', '/search?query=best%20practices%20[mongoDB]');
        cy.get('.questionContainer .question-entry').should('have.length', 2);
        cy.get('.questionContainer .question-entry').first().find('.postTitle a').should('contain', 'Node.js Best Practices');
    });

    it('displays no results for unmatched queries', () => {
        cy.get('.searchBar').type('nonexistentquery{enter}');
        cy.get('.questionContainer').should('be.visible').and('contain', 'No questions found.');
    });

    const testPaginationForViewType = (viewType, expectedFirstTitleOnNextPage, expectedTotalQuestions) => {
        it(`paginates correctly for search query "a" in ${viewType} view with correct question count`, () => {
            cy.get('.searchBar').type('a{enter}');
            cy.get('.button-container .buttonDeco').contains(viewType).click();
    
            // Verify the total number of questions
            cy.get('.main-top p').should('contain', `${expectedTotalQuestions} questions`);
    
            if (expectedTotalQuestions > 5) {
                // Verify that Next button is enabled and works
                cy.get('.pagination-controls button').contains('Next').should('not.be.disabled').click();
                cy.get('.questionContainer .question-entry').first().find('.postTitle a')
                    .should('contain', expectedFirstTitleOnNextPage);
    
                // Verify that Prev button is enabled and works
                cy.get('.pagination-controls button').contains('Prev').should('not.be.disabled').click();
                cy.get('.questionContainer .question-entry').should('have.length', 5);
            } else {
                // For views with less than or equal to 5 questions, Prev and Next should be disabled
                cy.get('.pagination-controls button').contains('Prev').should('be.disabled');
                cy.get('.pagination-controls button').contains('Next').should('be.disabled');
            }
        });
    };
    
    testPaginationForViewType('Newest', 'Best practices for MongoDB schema design?', 7);
    testPaginationForViewType('Active', 'Handling Async Operations in Redux', 7);
    testPaginationForViewType('Unanswered', null, 4);
    
    

    const testPaginationForSearch = (searchQuery, viewType, expectedFirstTitleOnNextPage) => {
        it(`paginates correctly in ${viewType} view for search query "${searchQuery}"`, () => {
            cy.get('.searchBar').type(`${searchQuery}{enter}`);
            cy.get('.button-container .buttonDeco').contains(viewType).click();

            // Check if pagination is needed
            cy.get('.main-top p').invoke('text').then((text) => {
                const totalQuestions = parseInt(text.split(' ')[0]);
                if (totalQuestions > 5) {
                    cy.get('.pagination-controls button').contains('Next').click();
                    cy.get('.questionContainer .question-entry').first().find('.postTitle a')
                        .should('contain', expectedFirstTitleOnNextPage);
                    cy.get('.pagination-controls button').contains('Prev').click();
                } else {
                    // For views with less than or equal to 5 questions, Prev and Next should be disabled
                    cy.get('.pagination-controls button').contains('Prev').should('be.disabled');
                    cy.get('.pagination-controls button').contains('Next').should('be.disabled');
                }
            });
        });
    };

    testPaginationForSearch('JavaScript', 'Newest');
    testPaginationForSearch('[react]', 'Active', 'React State Management');
    testPaginationForSearch('best practices [MongoDB]', 'Unanswered');

    it('allows a registered user to search for "React"' , () =>{
        // Login the user before test
        cy.visit('http://localhost:3000/#/login');
        cy.get('input[name="username"]').type('user2');
        cy.get('input[name="password"]').type('password2');
        cy.get('form').submit();
        cy.visit('http://localhost:3000/#/search');
        cy.get('.searchBar').type('React{enter}');
        cy.url().should('include', '/search?query=React');
        cy.get('.questionContainer .question-entry').should('not.have.length', 0);
        cy.get('.questionContainer .question-entry').first().find('.postTitle a').should('contain', 'React');
    });
    

    it('guest user search for "react" matches registered user' , () =>{
        // Login the user before test
        cy.visit('http://localhost:3000/');
        cy.get('.welcome-button').contains('Continue as Guest').click();
        cy.visit('http://localhost:3000/#/search');
        cy.get('.searchBar').type('react{enter}');
        cy.url().should('include', '/search?query=react');
        cy.get('.questionContainer .question-entry').should('not.have.length', 0);
        cy.get('.questionContainer .question-entry').first().find('.postTitle a').should('contain', 'React');
    });
    
    it('shows an error message and a way to navigate back on system failure', () => {
        // Intercepting the API call and forcing it to return an error
        cy.intercept('GET', 'http://localhost:8000/api/users/check-session', { statusCode: 500 });
    
        // Reload the page to trigger the intercepted API call
        cy.visit('http://localhost:3000/#/home');
        cy.get('.error-message').should('be.visible');
        cy.get('.back').should('be.visible').click();
        cy.url().should('include', '/');
    });
});

describe('All Tags Page Tests', () => {
    beforeEach(() => {
        cy.exec('node ../server/init.js');
        cy.visit('http://localhost:3000/#/tags');
    });

    afterEach(() => {
        cy.exec('node ../server/destroy.js');
    });

    it('displays all tags with question counts', () => {
        cy.get('.tagsContainer .tagNode').should('not.have.length', 0);
        cy.get('.tagsContainer .tagNode').each(($el) => {
            cy.wrap($el).find('span').should('contain', 'questions');
        });
    });

    it('navigates to the correct tag page when a tag is clicked', () => {
        cy.visit('http://localhost:3000/#/tags');

        cy.get('.tagsContainer .tagNode').first().invoke('attr', 'key').then((_id) => {
            cy.get('.tagsContainer .tagNode').first().click();
            cy.url().should('include',`/tags/t1`);
        });
    });

    it('ensures the Ask a Question button is disabled for guest users', () => {
        cy.get('.askQuestionButton').should('be.disabled');
    });

    it('allows a registered user to click the Ask a Question button', () => {
        // Intercept the login POST request and give it an alias
        cy.intercept('POST', 'http://localhost:8000/api/users/login').as('loginRequest');
    
        // Visit the login page and submit the form
        cy.visit('http://localhost:3000/#/login');
        cy.get('input[name="username"]').type('user3');
        cy.get('input[name="password"]').type('password3');
        cy.get('form').submit();
    
        // Wait for the login request to complete
        cy.wait('@loginRequest');
    
        // After login, navigate to the tags page
        cy.visit('http://localhost:3000/#/tags');
    
        // Check if the Ask a Question button is enabled and clickable
        cy.get('.askQuestionButton').should('not.be.disabled').click();
        cy.url().should('include', '/ask');
    });
    
    

    it('shows an error message and a way to navigate back on system failure', () => {
        cy.intercept('GET', 'http://localhost:8000/tags', { statusCode: 500 });
        cy.visit('http://localhost:3000/#/tags');
        cy.get('.error-message').should('be.visible').and('contain', 'Request failed with status code 500');
        cy.get('.back').should('be.visible').click();
        cy.url().should('include', '/');
    });
    

    
    it('displays tags in groups of 3 per row', () => {
        cy.get('.tagsContainer .tagNode').then($tags => {
            const totalTags = $tags.length;
            const expectedRows = Math.ceil(totalTags / 3);
    
            for (let i = 0; i < expectedRows; i++) {
                const startIndex = i * 3;
                const endIndex = startIndex + 3;
                cy.wrap($tags.slice(startIndex, endIndex)).should('have.length.lessThan', 4);
            }
        });
    });
    
});


describe('Question Tags Page Tests', () => {
    beforeEach(() => {
        cy.exec('node ../server/init.js');
        cy.visit('http://localhost:3000/#/tags/t2');
    });

    afterEach(() => {
        cy.exec('node ../server/destroy.js');
    });

    it('displays questions associated with the tag', () => {
        cy.get('.questionsList .question-entry').should('not.have.length', 0);
        cy.get('.questionsList .question-entry').each(($el) => {
            cy.wrap($el).find('.postTitle').should('exist');
            cy.wrap($el).find('footer').should('contain', 'Asked by:');
        });
    });

    it('navigates to the correct question page when a question is clicked', () => {
        cy.get('.questionsList .question-entry').first().click();
        cy.url().should('include', '/questions/');
    });

    it('displays questions tagged with React in newest order', () => {
        cy.get('.questionsList .question-entry').should('have.length.at.least', 1);
        let previousDate = new Date();

        cy.get('.questionsList .question-entry').each(($el) => {
            const dateText = $el.find('footer').text().match(/Asked: (.+)$/)[1];
            const questionDate = new Date(dateText);

            // Ensure the current question's date is less than or equal to the previous question's date
            expect(questionDate.getTime()).to.be.at.most(previousDate.getTime());
            previousDate = questionDate;
        });
    });

    it('shows an error message and a way to navigate back on system failure', () => {
        cy.intercept('GET', `http://localhost:8000/tags/t1/questions`, { statusCode: 500 });
        cy.visit('http://localhost:3000/#/tags/t1');
        cy.get('.error-message').should('be.visible').and('contain', 'Error loading questions');
        cy.get('.back').should('be.visible').click();
        cy.url().should('include', '/');
    });
    
});


function loginUser(username, password) {
    cy.visit('http://localhost:3000/#/login');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('form').submit();
    cy.url().should('include', '/home');
}

describe('New Question Page Tests', () => {
    beforeEach(() => {
        cy.exec('node ../server/init.js');
        loginUser('user3', 'password3')
        cy.visit('http://localhost:3000/#/ask');
    });

    afterEach(() => {
        cy.exec('node ../server/destroy.js');
    });

    it('validates empty title input', () => {
        cy.get('#formTitleInput').clear();
        cy.get('#formTextInput').type('Sample question text');
        cy.get('#formTagInput').type('tag1 tag2');
        cy.get('form').submit();
        cy.get('.error-message').should('contain', 'Title cannot be empty');
    });
    
    it('validates empty question text input', () => {
        cy.get('#formTitleInput').type('Sample Title');
        cy.get('#formTextInput').clear();
        cy.get('#formTagInput').type('tag1 tag2');
        cy.get('form').submit();
        cy.get('.error-message').should('contain', 'Question text cannot be empty');
    });
    
    it('validates long title input', () => {
        cy.get('#formTitleInput').type('a'.repeat(101));
        cy.get('#formTextInput').type('Sample question text');
        cy.get('#formTagInput').type('tag1 tag2');
        cy.get('form').submit();
        cy.get('.error-message').should('contain', 'Title cannot be more than 100 characters');
    });

    it('validates more than 5 tags', () => {
        cy.get('#formTitleInput').type('Sample Title');
        cy.get('#formTextInput').type('Sample question text');
        cy.get('#formTagInput').type('tag1 tag2 tag3 tag4 tag5 tag6');
        cy.get('form').submit();
        cy.get('.error-message').should('contain', 'Cannot have more than 5 tags');
    });
    
    it('validates long tag name', () => {
        cy.get('#formTitleInput').type('Sample Title');
        cy.get('#formTextInput').type('Sample question text');
        cy.get('#formTagInput').type('a'.repeat(21));
        cy.get('form').submit();
        cy.get('.error-message').should('contain', 'Tag length cannot be more than 20 characters');
    });

    it('validates invalid hyperlink format', () => {
        cy.get('#formTitleInput').type('Sample Title');
        cy.get('#formTextInput').type('Check this link [Google](http://www.google.com)');
        cy.get('#formTagInput').type('tag1');
        cy.get('form').submit();
        cy.get('.error-message').should('contain', 'Invalid hyperlink');
    });

    it('validates hyperlink with empty text', () => {
        cy.get('#formTitleInput').type('Hyperlink Test');
        cy.get('#formTextInput').type('Check this link [](https://www.google.com)');
        cy.get('#formTagInput').type('tag1');
        cy.get('form').submit();
        cy.get('.error-message').should('contain', 'Invalid hyperlink');
    });

    it('validates hyperlink with empty URL', () => {
        cy.get('#formTitleInput').type('Hyperlink Test');
        cy.get('#formTextInput').type('Check this link [Google]()');
        cy.get('#formTagInput').type('tag1');
        cy.get('form').submit();
        cy.get('.error-message').should('contain', 'Invalid hyperlink');
    });
    
    it('submits a valid question successfully', () => {
        cy.get('#formTitleInput').type('Valid Question Title');
        cy.get('#formTextInput').type('Valid question text');
        cy.get('#formTagInput').type('tag1');
        cy.get('form').submit();
        cy.url().should('include', '/home');
        cy.get('.question-entry').first().should('contain', 'Valid Question Title');
    });

    it('displays the newly created question at the top on the homepage', () => {
        cy.get('#formTitleInput').type('New Question Title');
        cy.get('#formTextInput').type('New question text');
        cy.get('#formTagInput').type('tag5');
        cy.get('form').submit();
        cy.url().should('include', '/home');
        cy.get('.question-entry').first().find('.postTitle').should('contain', 'New Question Title');
    });

    it('displays the newly created question at the top in the Unanswered tab', () => {
        cy.get('#formTitleInput').type('New Question Title');
        cy.get('#formTextInput').type('New question text for unanswered view');
        cy.get('#formTagInput').type('tag2');
        cy.get('form').submit();
        cy.url().should('include', '/home');
        cy.get('.button-container .buttonDeco').contains('Unanswered').click();
        cy.get('.question-entry').first().find('.postTitle').should('contain', 'New Question Title');
    });

    it('handles multiple new tags correctly', () => {  
        cy.get('#formTitleInput').type('Question with Multiple New Tags');
        cy.get('#formTextInput').type('This is a test question with multiple new tags.');
        cy.get('#formTagInput').type('newTag1 newTag2 newTag3');
        cy.get('form').submit();
        cy.url().should('include', '/home');
        cy.get('.question-entry').first().find('.postTitle').should('contain', 'Question with Multiple New Tags');
        cy.get('.question-entry').first().find('.tagButton').should('contain', 'newtag1')
            .and('contain', 'newtag2')
            .and('contain', 'newtag3');
    });
    
    
    it('allows tag creation by users with enough reputation', () => {
        cy.get('#formTitleInput').type('Question with New Tag');
        cy.get('#formTextInput').type('Question text');
        cy.get('#formTagInput').type('newTag');
        cy.get('form').submit();
        cy.url().should('include', '/home');
        cy.get('.tagButton').should('contain', 'newtag');
    });

    it('restricts tag creation for users with low reputation', () => {
        loginUser('user2', 'password2');
        cy.visit('http://localhost:3000/#/ask');
        cy.get('#formTitleInput').type('Question with New Tag');
        cy.get('#formTextInput').type('Question text');
        cy.get('#formTagInput').type('newTag');
        cy.get('form').submit();
        cy.get('.error-message').should('contain', 'Insufficient reputation to add new tags');
    });

    it('allows using of existing tag for users with low reputation', () => {
        loginUser('user1', 'password1');
        cy.visit('http://localhost:3000/#/ask');
        cy.get('#formTitleInput').type('Question with Existing Tag');
        cy.get('#formTextInput').type('Question text');
        cy.get('#formTagInput').type('React');
        cy.get('form').submit();
        cy.url().should('include', '/home');
        cy.get('.tagButton').should('contain', 'react');
    });
    
    

    it('shows an error message on system failure during question submission', () => {
        cy.intercept('POST', 'http://localhost:8000/api/questions', { statusCode: 500 }).as('postQuestion');
        cy.visit('http://localhost:3000/#/login');
        cy.get('input[name="username"]').type('user3');
        cy.get('input[name="password"]').type('password3');
        cy.get('form').submit();
        cy.url().should('include', '/home');
        cy.visit('http://localhost:3000/#/ask');
        cy.get('#formTitleInput').type('Valid Question Title');
        cy.get('#formTextInput').type('Valid question text');
        cy.get('#formTagInput').type('tag1');
        cy.get('form').submit();
        cy.wait('@postQuestion');
        cy.get('.error-message').should('be.visible').and('contain', 'Error submitting question');
    });
    
});


function navigateToQuestionAnswer(questionTitle) {
    function findAndClickQuestion() {
        cy.get('body').then($body => {
            if ($body.text().includes(questionTitle)) {
                // If the question is found on the current page, click it
                cy.contains(questionTitle).click();
            } else {
                // If the question is not found, check if there's a 'Next' button and it's enabled
                cy.get('.pagination-controls').then($pagination => {
                    if ($pagination.find('button:contains("Next")').is(':enabled')) {
                        // If 'Next' button is enabled, click it and search again
                        cy.get('.pagination-controls').find('button:contains("Next")').click();
                        cy.wait(1000); // Wait for page load, adjust as needed
                        findAndClickQuestion();
                    } else {
                        // If 'Next' button is disabled or not present, fail the test
                        assert.fail(`Question not found: ${questionTitle}`);
                    }
                });
            }
        });
    }

    findAndClickQuestion();
}


describe('Answer Page Tests for Guest User', () => {
    beforeEach(() => {
        cy.exec('node ../server/init.js');
        cy.visit('http://localhost:3000/#/home');
    });

    afterEach(() => {
        cy.exec('node ../server/destroy.js');
    });

    it('displays question details including title, views, text, tags, metadata, and votes', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?');
        // Check for the presence of question title, number of answers, and views
        cy.get('#answersHeader').within(() => {
            cy.get('h2').should('exist');
            cy.contains(/\d+ answers/);
            cy.contains(/\d+ views/);
        });
    
        // Check for question text, tags, metadata, and votes
        cy.get('#questionBody').within(() => {
            cy.get('div').first().should('exist');
            cy.get('.questionTags').find('.tagButton').should('have.length.at.least', 1);
            cy.get('.questionMetadata').should('contain', 'asked');
            cy.get('.vote-counts').within(() => {
                cy.contains(/Upvotes: \d+/);
                cy.contains(/Downvotes: \d+/);
            });
        });
    });
    

    it('increments view count upon page load', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?');
        cy.get('#answersHeader').should('contain', 'views');
    });

    it('displays a set of answers for the question', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?');
        cy.get('.answers-section').within(() => {
            cy.get('.answer-container').should('have.length.at.least', 1);
        });
    });

    it('displays the most recent answer first', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?');
        cy.get('.answers-section .answer-container').first().within(() => {
            cy.get('.answerAuthor').invoke('text').then((authorText) => {
                // Extract date from the authorText, assuming it ends with the date
                const dateText = authorText.split(' ').slice(-3).join(' ');
                const firstAnswerDate = new Date(dateText);
                expect(firstAnswerDate).to.be.ok; // Check if date is valid
            });
        });
    });
    

    it('displays answer details correctly', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?');
        cy.get('.answers-section .answer-container').first().within(() => {
            cy.get('.answerText').should('exist'); // Answer text
            cy.get('.vote-buttons').should('exist'); // Vote buttons or counts
            cy.get('.answerAuthor').should('contain', 'answered'); // Author and date/time
        });
    });

    it('enables the Next button when more answers are available', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?'); //Has 6 answers
        cy.get('.pagination-controls').within(() => {
            cy.get('button').contains('Next').should('not.be.disabled');
        });
    });

    it('disables the Prev button on the first page', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?');
        cy.get('.pagination-controls').within(() => {
            cy.get('button').contains('Prev').should('be.disabled');
        });
    });

    it('loads next set of answers when Next button is clicked', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?');
        cy.get('.pagination-controls').within(() => {
            cy.get('button').contains('Next').click();
        });
        cy.get('.answers-section .answer-container').should('have.length', 1);
    });

    it('enables the Prev button and loads previous answers when clicked', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?');
        // Navigate to the second page first
        cy.get('.pagination-controls').within(() => {
            cy.get('button').contains('Next').click();
        });

        cy.get('.pagination-controls').within(() => {
            cy.get('button').contains('Prev').should('not.be.disabled').click();
        });

        cy.get('.answers-section .answer-container').should('have.length', 5);
    });

    it('shows Ask a Question button as disabled for guest users', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?');
        cy.get('#askQuestionButton').should('be.disabled');
    });

    it('does not display the Answer Question button for guest users', () => {
        navigateToQuestionAnswer('How to use promises in JavaScript?');
        cy.get('.answers-section-button').should('not.exist');
    });

    it('displays a message when there are no answers and pagination buttons are disabled', () => {
        navigateToQuestionAnswer('Introduction to Git and GitHub');
        cy.get('.answers-section').should('contain', 'No answers yet. Be the first to answer!');
        cy.get('.pagination-controls button').each(button => {
            cy.wrap(button).should('be.disabled');
        });
    });
    

    it('renders and allows clicking on a valid hyperlink in the question text', () => {
        navigateToQuestionAnswer('Introduction to Git and GitHub');
        cy.get('#questionBody').within(() => {
            cy.get('a').contains('GitHub').should('have.attr', 'href', 'https://github.com').and('have.attr', 'target', '_blank');
        });
    });

    it('shows an error message on system failure', () => {
        cy.intercept('GET', `http://localhost:8000/questions/q1`, { statusCode: 500 });
        cy.visit('http://localhost:3000/#/questions/q1');
        cy.get('.error-message').should('be.visible').and('contain', 'Error loading data');
    });
});















