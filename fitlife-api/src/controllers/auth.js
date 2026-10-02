import pool from '../db/pool.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha obrigatórios' });
  }
  if (typeof senha !== 'string' || typeof email !== 'string') {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT u.*, e.nome AS empresa_nome, e.plano
       FROM usuarios u
       LEFT JOIN empresas e ON e.id = u.empresa_id
       WHERE LOWER(u.email) = LOWER($1) AND u.ativo = true`,
      [email.trim()]
    );

    const usuario = rows[0];
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Compatibilidade: pgcrypto pode gerar $2a$ ou $2y$; bcryptjs espera $2a$ ou $2b$
    let hash = usuario.senha_hash;
    if (hash.startsWith('$2y$')) {
      hash = hash.replace(/^\$2y\$/, '$2b$');
    }

    const senhaValida = await bcrypt.compare(senha, hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      {
        id:         usuario.id,
        empresaId:  usuario.empresa_id,
        academiaId: usuario.academia_id,
        papel:      usuario.papel,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: {
        id:          usuario.id,
        nome:        usuario.nome,
        email:       usuario.email,
        papel:       usuario.papel,
        empresaId:   usuario.empresa_id,
        empresaNome: usuario.empresa_nome,
        academiaId:  usuario.academia_id,
      },
    });

  } catch (err) {
    console.error('[auth.login] Erro interno:', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
