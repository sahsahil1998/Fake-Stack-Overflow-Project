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
        cy.exec('node ../server/init.js'); // Initialize the database
        cy.visit('http://localhost:3000/#/home');
    });

    afterEach(() => {
        cy.exec('node ../server/destroy.js'); // Clean up the database
    });

    it('loads the home page with default Newest view', () => {
        cy.get('.main-top h1').should('contain', 'All Questions');
        cy.get('.button-container .buttonDeco.active').should('contain', 'Newest');
    });

    it('displays the correct number of questions with all details', () => {
        cy.get('.questionContainer .question-entry').should('have.length', 5);
        cy.get('.questionContainer .question-entry').each(($el) => {
            cy.wrap($el).find('.postTitle a').should('exist');
            cy.wrap($el).find('.questionSummary').should('exist');
            cy.wrap($el).find('.tags .tagButton').should('exist');
            cy.wrap($el).find('.postStats p').should('exist');
            cy.wrap($el).find('.lastActivity p').should('exist');
        });
    });

    it('paginates to the next set of questions', () => {
        cy.get('.pagination-controls button').contains('Next').click();
        cy.get('.questionContainer .question-entry').should('have.length', 1);
    });

    it('sorts questions by Active view', () => {
        cy.get('.button-container .buttonDeco').contains('Active').click();
        cy.get('.button-container .buttonDeco.active').should('contain', 'Active');
    });

    it('sorts questions by Unanswered view', () => {
        cy.get('.button-container .buttonDeco').contains('Unanswered').click();
        cy.get('.button-container .buttonDeco.active').should('contain', 'Unanswered');
    });

    // Additional tests for error handling, navigation to question details, and other scenarios...
});








