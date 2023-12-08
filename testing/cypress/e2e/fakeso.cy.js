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
    
        // Prepare to handle the alert
        cy.on('window:alert', (text) => {
            expect(text).to.contains('User registered successfully');
        });
    
        cy.get('form').submit();
    
        // The alert assertion will be checked when the alert occurs
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
                email: 'user2@example.com',
                password: 'password123'
            }
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.contain('User already exists with the same username or email');
        });
    });

    it('validates email format', () => {
        cy.visit('http://localhost:3000/#/register');
        cy.get('input[name="email"]').type('invalidEmail');
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
    
        // Enter valid data for all fields
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
    

    // Add more tests as needed
});



