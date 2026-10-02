import pool from '../db/pool.js';

export async function listar(req, res) {
  const { empresaId } = req.usuario;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM exercicios WHERE empresa_id=$1 ORDER BY grupo, nome`,
      [empresaId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function criar(req, res) {
  const { empresaId } = req.usuario;
  const { nome, grupo, series, reps } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO exercicios (empresa_id, nome, grupo, series, reps) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [empresaId, nome, grupo, series, reps]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function atualizar(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  const { nome, grupo, series, reps } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE exercicios SET nome=$1, grupo=$2, series=$3, reps=$4 WHERE id=$5 AND empresa_id=$6 RETURNING *`,
      [nome, grupo, series, reps, id, empresaId]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Exercício não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function excluir(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM exercicios WHERE id=$1 AND empresa_id=$2`, [id, empresaId]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ erro: err.message }); }
}
