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
        cy.get('.questionContainer .question-entry').should('have.length', 1);
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
          .should('contain', 'Jan 09, 2023 at');
    });

    it('sorts questions by Active view', () => {
        cy.get('.button-container .buttonDeco').contains('Active').click();
        // Adjust the expected format to match the new date-time format
        cy.get('.questionContainer .question-entry').first().find('.lastActivity p')
        //Question at the top of stack by most recent answer
          .should('contain', 'Jan 07, 2023 at');
    });

    it('sorts questions by Unanswered view', () => {
        cy.get('.button-container .buttonDeco').contains('Unanswered').click();
        cy.get('.questionContainer .question-entry').should('have.length', 3);
        // Verify the titles of the questions to ensure they are the unanswered ones
        cy.get('.questionContainer .question-entry').first().find('.postTitle a')
          .should('contain', 'Handling Async Operations in Redux');
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

    testPaginationAndViewCount('Newest', 6, 'How to use promises in JavaScript?');
    testPaginationAndViewCount('Active', 6, 'Handling Async Operations in Redux');
    testPaginationAndViewCount('Unanswered', 3);
    
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
        // Intercepting the API call and forcing it to return an error
        cy.intercept('GET', 'http://localhost:8000/api/users/check-session', { statusCode: 500 });
    
        // Reload the page to trigger the intercepted API call
        cy.visit('http://localhost:3000/#/home');
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
        cy.get('.questionContainer .question-entry').should('have.length', 1);
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
          .should('contain', 'Jan 09, 2023 at');
    });

    it('sorts questions by Active view', () => {
        cy.get('.button-container .buttonDeco').contains('Active').click();
        cy.get('.questionContainer .question-entry').first().find('.lastActivity p')
          .should('contain', 'Jan 07, 2023 at');
    });

    it('sorts questions by Unanswered view', () => {
        cy.get('.button-container .buttonDeco').contains('Unanswered').click();
        cy.get('.questionContainer .question-entry').should('have.length', 3);
        cy.get('.questionContainer .question-entry').first().find('.postTitle a')
          .should('contain', 'Handling Async Operations in Redux');
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

    testPaginationAndViewCount('Newest', 6, 'How to use promises in JavaScript?');
    testPaginationAndViewCount('Active', 6, 'Handling Async Operations in Redux');
    testPaginationAndViewCount('Unanswered', 3);
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
        cy.get('.searchBar').type('best practices [MongoDB]{enter}');
        cy.url().should('include', '/search?query=best%20practices%20[MongoDB]');
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
    
    testPaginationForViewType('Newest', 'How to use promises in JavaScript?', 6);
    testPaginationForViewType('Active', 'Handling Async Operations in Redux', 6);
    testPaginationForViewType('Unanswered', null, 3);
    
    

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
    testPaginationForSearch('[React]', 'Active', 'React State Management');
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
    

    it('guest user search for "React" matches registered user' , () =>{
        // Login the user before test
        cy.visit('http://localhost:3000/');
        cy.get('.welcome-button').contains('Continue as Guest').click();
        cy.visit('http://localhost:3000/#/search');
        cy.get('.searchBar').type('React{enter}');
        cy.url().should('include', '/search?query=React');
        cy.get('.questionContainer .question-entry').should('not.have.length', 0);
        cy.get('.questionContainer .question-entry').first().find('.postTitle a').should('contain', 'React');
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
});












