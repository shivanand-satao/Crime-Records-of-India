import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

let pool;

try {
    pool = mysql.createPool({
        host: process.env.my_host_name,   //host: 'localhost',  //can use 127.0.0.1
        user: process.env.my_username,
        password: process.env.my_password,
        database: process.env.my_database_name
    }).promise();
    console.log('Database connection established successfully.');
} catch (error) {
    console.error('Error establishing database connection:', error);
}

export default pool;
