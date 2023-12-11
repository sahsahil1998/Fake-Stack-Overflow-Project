[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/hxTav0v1)
Login with your Northeastern credentials and read the Project Specifications [here](https://northeastern-my.sharepoint.com/:w:/g/personal/j_mitra_northeastern_edu/EcUflH7GXMBEjXGjx-qRQMkB7cfHNaHk9LYqeHRm7tgrKg?e=oZEef3).

Add design docs in *images/*

## Instructions to setup and run project
1. Clone the repository to your local machine.
2. Navigate to the "server" directory and "client" directory in separate terminals and execute npm install in each to install dependencies.
    - cd server
    - cd client
3. In the server directory, the init.js file will populate the inital data. un the following command to initialize the database:
    - node  init.js mongodb://127.0.0.1://27017/fake_so
4. This command will populate and create a database named "fake_so."
5. From the "server" directory, run the server using either:
    - nodemon server.js OR node server.js
6. From the "client" directory, start the client using:
    - npm start from the client
7. To run the test cases, execute the following command in the root of the project: 
    - npx cypress open

## Sahil Sah's Contribution
1. Initial setup, Setting Up Schema and checking if it is populated as expected. 
2. Debugging :- Running cypress tests and debugging the code to ensure test cases are passing.
3. Creating relevant backend points and working on corresponding UI page.
4. Created relevant cypress testcases.
5. Worked on satisfying the use cases in the document. 

## Vaishnavi Madhekar's Contribution
1. Debugging the code and fixing bugs.
2. Validating CSS across the whole web page application for constitent UI.
3. Design documents - class and sequence diagrams.
4. Creating relevant backend points and working on corresponding UI pages.
5. Worked on satisfying the use cases in the document. 

## Test cases

| Use-case Name   | Test case Name |
|-----------------|----------------|
| Home Page       | Test-1         |
|                 | Test-2         |
| Login           | Test-1         |
|                 | Test-2         |

## Design Patterns Used

- Design Pattern Name:
Singleton Patttern
- Problem Solved:
The Singleton Pattern is implemented to ensure the creation of a single, frozen instance of the database. This pattern resolves issues related to managing multiple instances and provides a globally accessible point for interaction.
- Location in code where pattern is used:
The implementation of the Singleton Pattern can be found in the server.js file, where a singular instance of the associated class is created. This instance is then utilized universally across the application, ensuring consistency and centralized control over the database interactions.
The constructor in the class DataBaseService includes a check for single instance and throws an error if someone creates another instance of it.
The single instance of it is created in server.js file where the server connects to the database.