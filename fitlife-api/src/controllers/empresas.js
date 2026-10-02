import pool from '../db/pool.js';

export async function listar(req, res) {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_resumo_empresa ORDER BY empresa`);
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function criar(req, res) {
  const { nome, cnpj, plano } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO empresas (nome, cnpj, plano) VALUES ($1,$2,$3) RETURNING *`,
      [nome, cnpj, plano || 'basic']
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, cnpj, plano, ativa } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE empresas SET nome=$1, cnpj=$2, plano=$3, ativa=$4 WHERE id=$5 RETURNING *`,
      [nome, cnpj, plano, ativa, id]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Empresa não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function excluir(req, res) {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM empresas WHERE id=$1`, [id]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ erro: err.message }); }
}
