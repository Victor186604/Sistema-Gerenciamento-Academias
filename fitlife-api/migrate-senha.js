// migrate-senha.js
// Converte hashes $2y$ (pgcrypto) para $2b$ (bcryptjs) no banco.
// Execute UMA ÚNICA VEZ após o primeiro deploy.
//
// Como rodar:
//   cd fitlife-api
//   node migrate-senha.js

import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: String(process.env.DB_PASSWORD ?? ''),
});

async function migrar() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, email FROM usuarios WHERE senha_hash LIKE '$2y$%'`
    );

    if (rows.length === 0) {
      console.log('Nenhum hash $2y$ encontrado. Banco já compatível.');
      return;
    }

    console.log(`Migrando ${rows.length} usuário(s)...`);
    for (const row of rows) {
      await client.query(
        `UPDATE usuarios
         SET senha_hash = '$2b$' || SUBSTRING(senha_hash FROM 5)
         WHERE id = $1`,
        [row.id]
      );
      console.log(`  ✓ ${row.email}`);
    }
    console.log('Migração concluída.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrar().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
