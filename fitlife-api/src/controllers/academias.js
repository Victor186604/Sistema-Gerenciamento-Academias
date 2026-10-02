import pool from '../db/pool.js';

export async function listar(req, res) {
  const { empresaId, academiaId } = req.usuario;
  try {
    const { rows } = await pool.query(
      `SELECT a.*, COUNT(al.id) AS total_alunos
       FROM academias a
       LEFT JOIN alunos al ON al.academia_id = a.id
       WHERE a.empresa_id=$1 AND ($2::INT IS NULL OR a.id=$2)
       GROUP BY a.id ORDER BY a.nome`,
      [empresaId, academiaId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function criar(req, res) {
  const { empresaId } = req.usuario;
  const { nome, cidade, bairro, capacidade } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO academias (empresa_id, nome, cidade, bairro, capacidade)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [empresaId, nome, cidade, bairro, capacidade]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function atualizar(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  const { nome, cidade, bairro, capacidade, status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE academias SET nome=$1, cidade=$2, bairro=$3, capacidade=$4, status=$5
       WHERE id=$6 AND empresa_id=$7 RETURNING *`,
      [nome, cidade, bairro, capacidade, status, id, empresaId]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Academia não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function excluir(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM academias WHERE id=$1 AND empresa_id=$2`, [id, empresaId]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ erro: err.message }); }
}
