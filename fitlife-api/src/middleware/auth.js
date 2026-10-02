import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }
  try {
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

export function apenasAdmin(req, res, next) {
  if (req.usuario.papel !== 'admin' && req.usuario.papel !== 'superadmin') {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  next();
}

export function apenasSuperAdmin(req, res, next) {
  if (req.usuario.papel !== 'superadmin') {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  next();
}
