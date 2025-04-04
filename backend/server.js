import express from 'express';
import cors from 'cors';
import pool from './database.js'; // Ensure this file exists and is correctly configured

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

app.post('/addUser', async (req, res) => {
    const { username, password, email, full_name, department } = req.body;
    const query = 'INSERT INTO users (username, password, email, full_name, department) VALUES (?, ?, ?, ?, ?)';
    try {
        const [results] = await pool.query(query, [username, password, email, full_name, department]);
        res.status(201).json({ message: 'User added successfully', userId: results.insertId });
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/addAdmin', async (req, res) => {
    const { username, password, email, full_name, role } = req.body;
    const query = 'INSERT INTO admins (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)';
    try {
        const [results] = await pool.query(query, [username, password, email, full_name, role]);
        res.status(201).json({ message: 'Admin added successfully', adminId: results.insertId });
    } catch (error) {
        console.error('Error inserting admin:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/loginUser', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
        const [results] = await pool.query(query, [email, password]);
        
        if (results.length > 0) {
            res.json({ 
                success: true,
                message: 'User login successful', 
                user: results[0] 
            });
        } else {
            res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

app.post('/loginAdmin', async (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM admins WHERE username = ? AND password = ?';
    try {
        const [results] = await pool.query(query, [username, password]);
        if (results.length > 0) {
            res.json({ 
                success: true,
                message: 'Admin login successful', 
                admin: results[0] 
            });
        } else {
            res.status(401).json({ 
                success: false,
                message: 'Invalid username or password' 
            });
        }
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});