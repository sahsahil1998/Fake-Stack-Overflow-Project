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
        // Seed the database before each test
        cy.exec('node ./server/init.js');
    });

    afterEach(() => {
        // Clear the database after each test
        cy.exec('node /server/destroy.js');
    });

    it('successfully navigates to the registration page', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Register').click();
        cy.url().should('include', '/register');
    });

    it('allows a user to create an account', () => {
        cy.visit('http://localhost:3000/register');
        cy.get('input[name="username"]').type('newUser');
        cy.get('input[name="email"]').type('newUser@example.com');
        cy.get('input[name="password"]').type('password123');
        cy.get('input[name="confirmPassword"]').type('password123');
        cy.get('form').submit();
        cy.contains('User registered successfully');
        cy.url().should('include', '/login');
    });

    it('prevents account creation with an existing email or username', () => {
        cy.visit('http://localhost:3000/register');
        cy.get('input[name="username"]').type('existingUser');
        cy.get('input[name="email"]').type('existingUser@example.com');
        cy.get('input[name="password"]').type('password123');
        cy.get('input[name="confirmPassword"]').type('password123');
        cy.get('form').submit();
        cy.contains('Registration failed'); // Adjust this message based on your actual error response
    });

    it('validates email format', () => {
        cy.visit('http://localhost:3000/register');
        cy.get('input[name="email"]').type('invalidEmail');
        cy.get('form').submit();
        cy.contains('Please enter a valid email address');
    });

    it('ensures password does not contain username or email', () => {
        cy.visit('http://localhost:3000/register');
        cy.get('input[name="username"]').type('testUser');
        cy.get('input[name="email"]').type('testUser@example.com');
        cy.get('input[name="password"]').type('testUser');
        cy.get('form').submit();
        cy.contains('Password should not contain username or email');
    });

    it('checks password and confirm password fields match', () => {
        cy.visit('http://localhost:3000/register');
        cy.get('input[name="password"]').type('password123');
        cy.get('input[name="confirmPassword"]').type('differentPassword');
        cy.get('form').submit();
        cy.contains('Passwords do not match');
    });
});
