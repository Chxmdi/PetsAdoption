const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory
app.use(session({
    secret: 'secret key', // Use a more secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Use `secure: true` in production if using HTTPS
}));

const usersFilePath = 'userCredentials.txt';
const petsFilePath = 'petsInfo.txt';

// Route to handle user account creation
app.post('/create-account', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required.", success: false });
    }

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read user data:', err);
            return res.status(500).json({ message: "Server error occurred. Please try again.", success: false });
        }

        const users = data.trim() ? data.split('\n') : [];
        const userExists = users.some(line => {
            const [fileUsername] = line.split(':').map(s => s.trim());
            return fileUsername === username;
        });

        if (userExists) {
            return res.json({ message: "Username already exists. Choose a different one.", success: false });
        }

        const userRecord = `${username}:${password}\n`;

        fs.appendFile(usersFilePath, userRecord, err => {
            if (err) {
                console.error('Failed to write user data:', err);
                return res.status(500).json({ message: "An error occurred while creating the account.", success: false });
            }
            res.json({ message: "Account successfully created!", success: true });
        });
    });
});
// Route to handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            res.json({ message: "Login failed due to server error.", success: false });
            return;
        }
        const userExists = data.split('\n').some(line => {
            const [fileUsername, filePassword] = line.split(':').map(s => s.trim());
            return fileUsername === username && filePassword === password;
        });

        if (userExists) {
            req.session.user = username; // Start a session
            res.json({ message: "Login successful.", success: true });
        } else {
            res.json({ message: "Invalid username or password.", success: false });
        }
    });
});

// Route to handle submitting pet information
app.post('/submit-pet', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "You must be logged in to submit pet information." });
    }

    const { petType, petAge, petGender,petBreed } = req.body;
    const username = req.session.user; // Retrieve the username from the session

    fs.readFile(petsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read pet data:', err);
            return res.status(500).json({ message: "An error occurred. Please try again later." });
        }

        const lines = data.trim() ? data.split('\n') : [];
        const newId = lines.length + 1; // Unique ID based on the number of existing entries
        const petRecord = `${newId}:${username}:${petType}:${petAge}:${petGender}:${petBreed}\n`;

        fs.appendFile(petsFilePath, petRecord, err => {
            if (err) {
                console.error('Failed to write pet data:', err);
                return res.status(500).json({ message: "An error occurred while saving pet info." });
            }
            res.json({ message: "Pet information successfully added!" });
        });
    });
});

// Route to handle form submission
app.post('/search-pets', (req, res) => {
    const { type, age, gender, breed } = req.body;

    fs.readFile('pets.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading pet records.");
        }
        
        let pets;
        try {
            pets = JSON.parse(data);
        } catch (parseErr) {
            console.error(parseErr);
            return res.status(500).send("Error parsing pet records.");
        }

        let filteredPets = pets.filter(pet => {
            const matchesType = type ? pet.type.toLowerCase() === type.toLowerCase() : true;
            const matchesAge = age ? pet.age === Number(age) : true; // assuming age is a number
            const matchesGender = gender ? pet.gender.toLowerCase() === gender.toLowerCase() : true;
            const matchesBreed = breed ? pet.breed.toLowerCase() === breed.toLowerCase() : true;
            
            return matchesType && matchesAge && matchesGender && matchesBreed;
        });

        res.json(filteredPets); // Sending filtered data back to the client
    });
});






  

// Route to handle user logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Failed to destroy the session:", err);
            return res.status(500).json({ message: "Failed to log out. Please try again.", success: false });
        }
        res.json({ message: "You have been successfully logged out.", success: true });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
