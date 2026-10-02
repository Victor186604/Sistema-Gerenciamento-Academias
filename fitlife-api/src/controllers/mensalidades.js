import pool from '../db/pool.js';

export async function listar(req, res) {
  const { empresaId, academiaId } = req.usuario;
  try {
    const { rows } = await pool.query(
      `SELECT m.*, a.nome AS aluno_nome, a.academia_id
       FROM mensalidades m
       JOIN alunos a ON a.id = m.aluno_id
       WHERE m.empresa_id=$1 AND ($2::INT IS NULL OR a.academia_id=$2)
       ORDER BY m.vencimento DESC`,
      [empresaId, academiaId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function criar(req, res) {
  const { empresaId } = req.usuario;
  const { aluno_id, valor, vencimento, status } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO mensalidades (empresa_id, aluno_id, valor, vencimento, status)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [empresaId, aluno_id, valor, vencimento, status || 'Pendente']
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function atualizar(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  const { aluno_id, valor, vencimento, status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE mensalidades SET aluno_id=$1, valor=$2, vencimento=$3, status=$4
       WHERE id=$5 AND empresa_id=$6 RETURNING *`,
      [aluno_id, valor, vencimento, status, id, empresaId]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Mensalidade não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function pagar(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE mensalidades SET status='Pago', pago_em=NOW() WHERE id=$1 AND empresa_id=$2 RETURNING *`,
      [id, empresaId]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Mensalidade não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function excluir(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM mensalidades WHERE id=$1 AND empresa_id=$2`, [id, empresaId]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ erro: err.message }); }
}
