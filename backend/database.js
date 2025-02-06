import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

let pool;

try {
    pool = mysql.createPool({
        host: process.env.host_name,   //host: 'localhost',  //can use 127.0.0.1
        user: process.env.username,
        password: process.env.password,
        database: process.env.database_name
    }).promise();
    console.log('Database connection established successfully.');
} catch (error) {
    console.error('Error establishing database connection:', error);
}

export default pool;
