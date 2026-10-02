-- ============================================================
-- FitLife - Dados de Exemplo
-- ============================================================

INSERT INTO empresas (nome, cnpj, plano) VALUES
  ('FitLife Rede', '11.111.111/0001-11', 'pro'),
  ('GymPower Brasil', '22.222.222/0001-22', 'basic');

INSERT INTO usuarios (empresa_id, nome, email, senha_hash, papel) VALUES
  (2, 'Admin FitLife', 'admin@fitliferede.com',   crypt('senha123', gen_salt('bf')), 'admin'),
  (3, 'Admin GymPower', 'admin@gympower.com',     crypt('senha123', gen_salt('bf')), 'admin'),
  (2, 'Operador SP',   'op.sp@fitliferede.com',   crypt('senha123', gen_salt('bf')), 'operador'),
  (2, 'Operador RJ',   'op.rj@fitliferede.com',   crypt('senha123', gen_salt('bf')), 'operador');

INSERT INTO academias (empresa_id, nome, cidade, bairro, capacidade) VALUES
  (2, 'FitLife Pinheiros',  'São Paulo',        'Pinheiros',  200),
  (2, 'FitLife Botafogo',   'Rio de Janeiro',   'Botafogo',   150),
  (3, 'GymPower Centro',    'Belo Horizonte',   'Centro',     120);

UPDATE usuarios SET academia_id = 1 WHERE email = 'op.sp@fitliferede.com';
UPDATE usuarios SET academia_id = 2 WHERE email = 'op.rj@fitliferede.com';

INSERT INTO instrutores (empresa_id, academia_id, nome, cpf, idade, especialidade) VALUES
  (2, 1, 'Carlos Souza',  '111.111.111-11', 35, 'Musculação'),
  (2, 1, 'Fernanda Lima', '222.222.222-22', 29, 'Crossfit'),
  (2, 2, 'Rafael Moura',  '333.111.111-11', 42, 'Yoga'),
  (3, 3, 'Ana Pereira',   '444.111.111-11', 31, 'Funcional');

INSERT INTO exercicios (empresa_id, nome, grupo, series, reps) VALUES
  (2, 'Supino Reto',        'Peito',   4, 10),
  (2, 'Supino Inclinado',   'Peito',   3, 12),
  (2, 'Crucifixo',          'Peito',   3, 15),
  (2, 'Agachamento Livre',  'Pernas',  4, 12),
  (2, 'Leg Press',          'Pernas',  4, 15),
  (2, 'Remada Curvada',     'Costas',  4, 10),
  (2, 'Puxada Frontal',     'Costas',  4, 10),
  (2, 'Desenvolvimento',    'Ombro',   4, 12),
  (2, 'Elevação Lateral',   'Ombro',   3, 15),
  (2, 'Rosca Direta',       'Bíceps',  3, 12),
  (2, 'Tríceps Pulley',     'Tríceps', 3, 15),
  (2, 'Abdominal Crunch',   'Abdômen', 3, 20),
  (2, 'Hip Thrust',         'Glúteos', 4, 12),
  (2, 'Burpee',             'Funcional',3,10);

INSERT INTO treinos (empresa_id, nome, instrutor_id) VALUES
  (2, 'Treino A – Peito e Costas', 1),
  (2, 'Treino B – Ombro e Braço',  1),
  (2, 'Treino Funcional',          2);

INSERT INTO treino_exercicios (treino_id, exercicio_id, ordem) VALUES
  (1, 1, 1),(1, 6, 2),(1, 7, 3),(1, 3, 4),
  (2, 8, 1),(2, 9, 2),(2, 10, 3),(2, 11, 4),
  (3, 14,1),(3, 4, 2),(3, 12,3);

INSERT INTO alunos (empresa_id, academia_id, treino_id, nome, cpf, idade, matricula, telefone) VALUES
  (2, 1, 1, 'João Silva',     '444.444.444-44', 22, 'MAT-001', '(92) 99999-0001'),
  (2, 1, 2, 'Maria Oliveira', '555.555.555-55', 28, 'MAT-002', '(92) 99999-0002'),
  (2, 2, 3, 'Pedro Santos',   '666.666.666-66', 19, 'MAT-003', '(92) 99999-0003'),
  (3, 3, NULL,'Ana Lima',     '777.777.777-77', 25, 'MAT-001', '(31) 99999-0001');

INSERT INTO mensalidades (empresa_id, aluno_id, valor, vencimento, status) VALUES
  (2, 1, 99.90,  '2026-06-10', 'Pago'),
  (2, 2, 149.90, '2026-06-15', 'Pendente'),
  (2, 3, 99.90,  '2026-05-30', 'Atrasado'),
  (3, 4, 89.90,  '2026-06-20', 'Pendente');

