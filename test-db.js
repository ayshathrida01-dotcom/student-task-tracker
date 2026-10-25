
const pool = require('./db');

async function testConnection() {
    try {
        const [rows] = await pool.query('SELECT VERSION() AS version');
        console.log('MySQL connected successfully!');
        console.log('MySQL version:', rows[0].version);
    } catch (error) {
        console.error('Connection failed:', error.message);
    } finally {
        await pool.end();
    }
}

testConnection();
