import mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 2, // Reduced for serverless - Vercel has limited connections
  maxIdle: 2, // Maximum idle connections
  idleTimeout: 60000, // Close idle connections after 60 seconds
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export interface Participant {
  unique: string;
  name: string;
  email: string;
  present: boolean;
}

export async function getParticipants(): Promise<Participant[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM participants');
  return rows.map((row) => ({
    unique: row.unique_id || row.unique,
    name: row.name,
    email: row.email,
    present: Boolean(row.present),
  }));
}

export async function getParticipantByUniqueId(unique: string): Promise<Participant | null> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM participants WHERE unique_id = ?', [unique]);
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    unique: row.unique_id || row.unique,
    name: row.name,
    email: row.email,
    present: Boolean(row.present),
  };
}

export async function updateParticipant(unique: string, updates: Partial<Participant>) {
  const fields = [];
  const values = [];

  if (updates.present !== undefined) {
    fields.push('present = ?');
    values.push(updates.present);
  }

  if (fields.length === 0) return null;

  values.push(unique);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE participants SET ${fields.join(', ')} WHERE unique_id = ?`,
    values
  );

  return result.affectedRows > 0;
}

export async function deleteParticipant(unique: string) {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM participants WHERE unique_id = ?', [unique]);
  return result.affectedRows > 0;
}

export async function deleteAllParticipants() {
  await pool.query('DELETE FROM participants');
}

// Ensure database schema exists on server startup
async function ensureDatabase() {
  try {
    // Create a connection without specifying a database
    const connectionWithoutDb = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Create the database if it doesn't exist
    const dbName = process.env.DB_NAME || 'db_participants_semnasti2025_dev';
    await connectionWithoutDb.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connectionWithoutDb.end();

    // Now create the table using the pool (which connects to the specific database)
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unique_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        present BOOLEAN NOT NULL DEFAULT FALSE,
        INDEX idx_unique_id (unique_id),
        INDEX idx_present (present)
      )
    `;
    await pool.query(createTableSQL);
    console.log('✅ Database schema ensured: participants table ready');
  } catch (error) {
    console.error('❌ Failed to ensure database schema:', error);
  }
}

// Initialize database on module load (only in development)
if (process.env.NODE_ENV !== 'production') {
  ensureDatabase();
}