import pool from '../db/pool.js';

function filtros(usuario) {
  return { empresaId: usuario.empresaId, academiaId: usuario.academiaId };
}

export async function listar(req, res) {
  const { empresaId, academiaId } = filtros(req.usuario);
  try {
    const { rows } = await pool.query(
      `SELECT a.*, ac.nome AS academia_nome, t.nome AS treino_nome
       FROM alunos a
       LEFT JOIN academias ac ON ac.id = a.academia_id
       LEFT JOIN treinos t ON t.id = a.treino_id
       WHERE a.empresa_id = $1 AND ($2::INT IS NULL OR a.academia_id = $2)
       ORDER BY a.nome`,
      [empresaId, academiaId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function criar(req, res) {
  const { empresaId } = filtros(req.usuario);
  const { nome, cpf, idade, matricula, telefone, treino_id, academia_id } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO alunos (empresa_id, nome, cpf, idade, matricula, telefone, treino_id, academia_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [empresaId, nome, cpf, idade, matricula, telefone, treino_id, academia_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ erro: 'CPF ou matrícula já cadastrado' });
    res.status(500).json({ erro: err.message });
  }
}

export async function atualizar(req, res) {
  const { empresaId } = filtros(req.usuario);
  const { id } = req.params;
  const { nome, cpf, idade, matricula, telefone, treino_id, academia_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE alunos SET nome=$1, cpf=$2, idade=$3, matricula=$4, telefone=$5, treino_id=$6, academia_id=$7
       WHERE id=$8 AND empresa_id=$9 RETURNING *`,
      [nome, cpf, idade, matricula, telefone, treino_id, academia_id, id, empresaId]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

export async function excluir(req, res) {
  const { empresaId } = filtros(req.usuario);
  const { id } = req.params;
  try {
    const { rows: atrasadas } = await pool.query(
      `SELECT COUNT(*) FROM mensalidades WHERE aluno_id=$1 AND status='Atrasado'`,
      [id]
    );
    if (parseInt(atrasadas[0].count) > 0) {
      return res.status(400).json({ erro: 'Aluno possui mensalidade(s) em atraso. Regularize antes de excluir.' });
    }
    await pool.query(`DELETE FROM alunos WHERE id=$1 AND empresa_id=$2`, [id, empresaId]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ erro: err.message }); }
}
