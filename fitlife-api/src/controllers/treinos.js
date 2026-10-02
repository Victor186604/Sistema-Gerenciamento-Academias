import pool from '../db/pool.js';

export async function listar(req, res) {
  const { empresaId } = req.usuario;
  try {
    const { rows: treinos } = await pool.query(
      `SELECT t.*, i.nome AS instrutor_nome FROM treinos t
       LEFT JOIN instrutores i ON i.id = t.instrutor_id
       WHERE t.empresa_id=$1 ORDER BY t.nome`,
      [empresaId]
    );
    const { rows: links } = await pool.query(
      `SELECT te.treino_id, te.exercicio_id FROM treino_exercicios te
       JOIN treinos t ON t.id = te.treino_id WHERE t.empresa_id=$1`,
      [empresaId]
    );
    const resultado = treinos.map(t => ({
      ...t,
      exercicio_ids: links.filter(l => l.treino_id === t.id).map(l => l.exercicio_id),
    }));
    res.json(resultado);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function criar(req, res) {
  const { empresaId } = req.usuario;
  const { nome, instrutor_id, exercicio_ids = [] } = req.body;
  const client = await (await import('../db/pool.js')).default.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO treinos (empresa_id, nome, instrutor_id) VALUES ($1,$2,$3) RETURNING *`,
      [empresaId, nome, instrutor_id]
    );
    const treino = rows[0];
    for (const exId of exercicio_ids) {
      await client.query(`INSERT INTO treino_exercicios (treino_id, exercicio_id) VALUES ($1,$2)`, [treino.id, exId]);
    }
    await client.query('COMMIT');
    res.status(201).json({ ...treino, exercicio_ids });
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ erro: err.message }); }
  finally { client.release(); }
}

export async function atualizar(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  const { nome, instrutor_id, exercicio_ids = [] } = req.body;
  const client = await (await import('../db/pool.js')).default.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE treinos SET nome=$1, instrutor_id=$2 WHERE id=$3 AND empresa_id=$4 RETURNING *`,
      [nome, instrutor_id, id, empresaId]
    );
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ erro: 'Treino não encontrado' }); }
    await client.query(`DELETE FROM treino_exercicios WHERE treino_id=$1`, [id]);
    for (const exId of exercicio_ids) {
      await client.query(`INSERT INTO treino_exercicios (treino_id, exercicio_id) VALUES ($1,$2)`, [id, exId]);
    }
    await client.query('COMMIT');
    res.json({ ...rows[0], exercicio_ids });
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ erro: err.message }); }
  finally { client.release(); }
}

export async function excluir(req, res) {
  const { empresaId } = req.usuario;
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM treinos WHERE id=$1 AND empresa_id=$2`, [id, empresaId]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ erro: err.message }); }
}
