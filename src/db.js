import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Asegúrate de usar la contraseña correcta
  database: 'myu_db',
});

export default pool;
