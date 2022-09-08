const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password:process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_POST,
    max: 20,
    idleTimeoutMillis: 0
});
pool.connect();

exports.fetchAllCountries = async () => {
    try {
        const {rows} = await pool.query("SELECT * FROM countries");
        return rows;
    } catch (error) {
        return error;
    }
};

exports.findCountry = async (name) => {
    try {
        const {rows} = await pool.query("SELECT * FROM countries where nicename=$1", [name]);
        return rows;
    } catch (error) {
        return error;
    }
};