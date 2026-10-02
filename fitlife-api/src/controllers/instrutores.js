import pool from '../db/pool.js';

export async function listar(req, res) {
  const { empresaId, academiaId } = req.usuario;
  try {
    const { rows } = await pool.query(
      `SELECT i.*, a.nome AS academia_nome FROM instrutores i
       LEFT JOIN academias a ON a.id = i.academia_id
       WHERE i.empresa_id=$1 AND ($2::INT IS NULL OR i.academia_id=$2)
       ORDER BY i.nome`,
      [empresaId, academiaId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function criar(req, res) {
  const { empresaId } = req.usuario;
  const { nome, cpf, idade, especialidade, academia_id } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO instrutores (empresa_id, nome, cpf, idade, especialidade, academia_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [empresaId, nome, cpf, idade, especialidade, academia_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ erro: 'CPF já cadastrado' });
    res.status(500).json({ erro: err.message });
  }
}

export async function atualizar(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  const { nome, cpf, idade, especialidade, academia_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE instrutores SET nome=$1, cpf=$2, idade=$3, especialidade=$4, academia_id=$5
       WHERE id=$6 AND empresa_id=$7 RETURNING *`,
      [nome, cpf, idade, especialidade, academia_id, id, empresaId]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Instrutor não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function excluir(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM instrutores WHERE id=$1 AND empresa_id=$2`, [id, empresaId]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ erro: err.message }); }
}
