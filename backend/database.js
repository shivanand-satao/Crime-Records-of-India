
import mysql from 'mysql2'
import dotenv from 'dotenv';

dotenv.config();


const pool= mysql.createPool({
    host :process.env.MY_HOST_NAME,   //host: 'localhost',  //can use 127.0.0.1
    user :process.env.MY_USERNAME,
    password:process.env.MY_PASSWORD,
    database :process.env.MY_DATABASE_NAME
}).promise();


async function print() {
    const [res] = await pool.query("select * from Auto_theft;");
    return res;
}

async function fetchData() {
    const re = await print();
    console.log(re);
}

fetchData();
