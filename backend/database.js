import mysql from 'mysql2'
import dotenv from 'dotenv';

dotenv.config();


const pool= mysql.createPool({
    host :process.env.my_host_name,   //host: 'localhost',  //can use 127.0.0.1
    user :process.env.my_username ,
    password:process.env.my_password,
    database :process.env.my_database_name
}).promise();



pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }

    if (connection) connection.release();

    return;
});

export default pool;