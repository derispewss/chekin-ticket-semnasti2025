import mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Optimized for Vercel serverless environment
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 2,
  maxIdle: 2,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export interface Participant {
  unique: string;
  name: string;
  email: string;
  present: boolean;
  registered_at?: Date;
}

export interface EmailLog {
  id: number;
  participant_unique_id: string;
  email: string;
  status: 'success' | 'error';
  error_message?: string;
  sent_at: Date;
}

// Participant Functions
export async function getParticipants(): Promise<Participant[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM participants');
  return rows.map((row) => ({
    unique: row.unique_id || row.unique,
    name: row.name,
    email: row.email,
    present: Boolean(row.present),
    registered_at: row.registered_at ? new Date(row.registered_at) : undefined,
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
    registered_at: row.registered_at ? new Date(row.registered_at) : undefined,
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

// Email Logging Functions
export async function logEmailSend(
  uniqueId: string,
  email: string,
  status: 'success' | 'error',
  errorMessage?: string
) {
  try {
    await pool.query(
      'INSERT INTO email_logs (participant_unique_id, email, status, error_message) VALUES (?, ?, ?, ?)',
      [uniqueId, email, status, errorMessage || null]
    );
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

export async function getEmailLogs(filters?: { status?: 'success' | 'error'; limit?: number }) {
  let query = 'SELECT * FROM email_logs';
  const params: any[] = [];

  if (filters?.status) {
    query += ' WHERE status = ?';
    params.push(filters.status);
  }

  query += ' ORDER BY sent_at DESC';

  if (filters?.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as EmailLog[];
}

export async function deleteEmailLog(id: number) {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM email_logs WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function deleteAllEmailLogs() {
  await pool.query('DELETE FROM email_logs');
}

// Ensure database schema exists on server startup
async function ensureDatabase() {
  try {
    const connectionWithoutDb = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    const dbName = process.env.DB_NAME || 'db_participants_semnasti2025_dev';
    await connectionWithoutDb.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connectionWithoutDb.end();

    // Create participants table - registered_at NULL (no default)
    const createParticipantsTableSQL = `
      CREATE TABLE IF NOT EXISTS participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unique_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        present BOOLEAN NOT NULL DEFAULT FALSE,
        registered_at TIMESTAMP NULL,
        INDEX idx_unique_id (unique_id),
        INDEX idx_present (present),
        INDEX idx_registered_at (registered_at)
      )
    `;
    await pool.query(createParticipantsTableSQL);

    // Create email_logs table
    const createEmailLogsTableSQL = `
      CREATE TABLE IF NOT EXISTS email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        participant_unique_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        status ENUM('success', 'error') NOT NULL,
        error_message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_participant (participant_unique_id),
        INDEX idx_status (status),
        INDEX idx_sent_at (sent_at)
      )
    `;
    await pool.query(createEmailLogsTableSQL);

    console.log('✅ Database schema ensured: participants and email_logs tables ready');
  } catch (error) {
    console.error('❌ Failed to ensure database schema:', error);
  }
}

// Initialize database on module load (only in development)
if (process.env.NODE_ENV !== 'production') {
  ensureDatabase();
}