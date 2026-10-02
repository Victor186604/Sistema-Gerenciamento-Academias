import { Router } from 'express';
import { autenticar, apenasAdmin, apenasSuperAdmin } from '../middleware/auth.js';

import { login } from '../controllers/auth.js';
import * as academias    from '../controllers/academias.js';
import * as alunos       from '../controllers/alunos.js';
import * as instrutores  from '../controllers/instrutores.js';
import * as exercicios   from '../controllers/exercicios.js';
import * as treinos      from '../controllers/treinos.js';
import * as mensalidades from '../controllers/mensalidades.js';
import * as empresas     from '../controllers/empresas.js';

const r = Router();

r.post('/auth/login', login);

r.use(autenticar);

r.get('/academias',          academias.listar);
r.post('/academias',         apenasAdmin, academias.criar);
r.put('/academias/:id',      apenasAdmin, academias.atualizar);
r.delete('/academias/:id',   apenasAdmin, academias.excluir);

r.get('/alunos',             alunos.listar);
r.post('/alunos',            alunos.criar);
r.put('/alunos/:id',         alunos.atualizar);
r.delete('/alunos/:id',      alunos.excluir);

r.get('/instrutores',        instrutores.listar);
r.post('/instrutores',       instrutores.criar);
r.put('/instrutores/:id',    instrutores.atualizar);
r.delete('/instrutores/:id', instrutores.excluir);

r.get('/exercicios',         exercicios.listar);
r.post('/exercicios',        exercicios.criar);
r.put('/exercicios/:id',     exercicios.atualizar);
r.delete('/exercicios/:id',  exercicios.excluir);

r.get('/treinos',            treinos.listar);
r.post('/treinos',           treinos.criar);
r.put('/treinos/:id',        treinos.atualizar);
r.delete('/treinos/:id',     treinos.excluir);

r.get('/mensalidades',             mensalidades.listar);
r.post('/mensalidades',            mensalidades.criar);
r.put('/mensalidades/:id',         mensalidades.atualizar);
r.patch('/mensalidades/:id/pagar', mensalidades.pagar);
r.delete('/mensalidades/:id',      mensalidades.excluir);

r.get('/empresas',          apenasSuperAdmin, empresas.listar);
r.post('/empresas',         apenasSuperAdmin, empresas.criar);
r.put('/empresas/:id',      apenasSuperAdmin, empresas.atualizar);
r.delete('/empresas/:id',   apenasSuperAdmin, empresas.excluir);

export default r;
