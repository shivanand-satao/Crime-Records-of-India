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
            // Send only necessary user data
            const userData = {
                id: results[0].id,
                email: results[0].email,
                username: results[0].username,
                department: results[0].department,
                full_name: results[0].full_name
            };
            
            res.json({ 
                success: true,
                message: 'User login successful', 
                user: userData
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
            message: 'Internal server error' 
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

app.get('/showTables', async (req, res) => {
    try {
        const [results] = await pool.query('SHOW TABLES');
        const excludedTables = ['admins', 'audit_log', 'views_log', 'users', 'response'];
        
        // Filter out the excluded tables
        const tables = results
            .map(row => Object.values(row)[0])
            .filter(tableName => !excludedTables.includes(tableName));
        
        res.json({ 
            success: true,
            tables: tables
        });
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching tables' 
        });
    }
});

app.get('/showAllTables', async (req, res) => {
    try {
        const [results] = await pool.query('SHOW TABLES');
        
        // Get all tables without filtering
        const tables = results.map(row => Object.values(row)[0]);
        
        res.json({ 
            success: true,
            tables: tables
        });
    } catch (error) {
        console.error('Error fetching all tables:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching tables' 
        });
    }
});

app.get('/getTableData/:tableName', async (req, res) => {
    try {
        const tableName = req.params.tableName;
        console.log(`Fetching data for table: ${tableName}`);
        
        // Use parameterized query to prevent SQL injection
        const [results] = await pool.query(`SELECT * FROM ??`, [tableName]);
        console.log(`Found ${results.length} rows`);
        
        // Get columns from the first row
        const columns = results.length > 0 ? Object.keys(results[0]) : [];
        
        res.json({ 
            success: true,
            data: results,
            columns: columns
        });
        
    } catch (error) {
        console.error('Error fetching table data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching table data',
            error: error.message
        });
    }
});

app.get('/getTableGroups', async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                CASE 
                    WHEN table_name LIKE '%murder%' THEN 'Murder Related'
                    WHEN table_name LIKE '%custodial%' THEN 'Custodial Cases'
                    WHEN table_name LIKE '%theft%' THEN 'Theft Cases'
                    WHEN table_name LIKE '%rape%' THEN 'Sexual Offenses'
                    WHEN table_name LIKE '%police%' THEN 'Police Related'
                    ELSE 'Other Cases'
                END as category,
                GROUP_CONCAT(table_name) as tables
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
            AND table_name NOT IN ('admins', 'audit_log', 'views_log', 'users', 'response')
            GROUP BY category
        `);
        
        res.json({ 
            success: true,
            groups: results
        });
    } catch (error) {
        console.error('Error fetching table groups:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching table groups' 
        });
    }
});

app.get('/getColumnValues/:tableName/:columnName', async (req, res) => {
    try {
        const { tableName, columnName } = req.params;
        const query = `SELECT DISTINCT ${columnName} FROM ${tableName} ORDER BY ${columnName}`;
        const [results] = await pool.query(query);
        
        res.json({ 
            success: true,
            values: results.map(row => row[columnName])
        });
    } catch (error) {
        console.error('Error fetching column values:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching filter values' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});