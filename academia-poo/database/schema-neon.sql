-- ============================================================
-- FitLife Academia — Schema para Neon PostgreSQL
-- Cole este arquivo no SQL Editor do Neon e execute
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE empresas (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(120) NOT NULL,
  cnpj        VARCHAR(20)  UNIQUE,
  plano       VARCHAR(20)  NOT NULL DEFAULT 'basic' CHECK (plano IN ('basic','pro','enterprise')),
  ativa       BOOLEAN      NOT NULL DEFAULT true,
  criada_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE usuarios (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT          REFERENCES empresas(id) ON DELETE CASCADE,
  nome        VARCHAR(120) NOT NULL,
  email       VARCHAR(200) NOT NULL UNIQUE,
  senha_hash  TEXT         NOT NULL,
  papel       VARCHAR(20)  NOT NULL DEFAULT 'operador'
                           CHECK (papel IN ('superadmin','admin','operador')),
  academia_id INT,
  ativo       BOOLEAN      NOT NULL DEFAULT true,
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE academias (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT          NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome        VARCHAR(120) NOT NULL,
  cidade      VARCHAR(80),
  bairro      VARCHAR(80),
  capacidade  INT          NOT NULL DEFAULT 0,
  status      VARCHAR(20)  NOT NULL DEFAULT 'Ativa' CHECK (status IN ('Ativa','Inativa')),
  criada_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE usuarios
  ADD CONSTRAINT fk_usuario_academia
  FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE SET NULL;

CREATE TABLE instrutores (
  id            SERIAL PRIMARY KEY,
  empresa_id    INT          NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  academia_id   INT          REFERENCES academias(id) ON DELETE SET NULL,
  nome          VARCHAR(120) NOT NULL,
  cpf           VARCHAR(20)  NOT NULL,
  idade         SMALLINT,
  especialidade VARCHAR(80),
  criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (empresa_id, cpf)
);

CREATE TABLE exercicios (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT          NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome        VARCHAR(120) NOT NULL,
  grupo       VARCHAR(40)  NOT NULL,
  series      SMALLINT     NOT NULL DEFAULT 3,
  reps        SMALLINT     NOT NULL DEFAULT 12,
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE treinos (
  id           SERIAL PRIMARY KEY,
  empresa_id   INT          NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome         VARCHAR(120) NOT NULL,
  instrutor_id INT          REFERENCES instrutores(id) ON DELETE SET NULL,
  criado_em    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE treino_exercicios (
  treino_id    INT NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
  exercicio_id INT NOT NULL REFERENCES exercicios(id) ON DELETE CASCADE,
  ordem        SMALLINT DEFAULT 0,
  PRIMARY KEY (treino_id, exercicio_id)
);

CREATE TABLE alunos (
  id           SERIAL PRIMARY KEY,
  empresa_id   INT          NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  academia_id  INT          REFERENCES academias(id) ON DELETE SET NULL,
  treino_id    INT          REFERENCES treinos(id) ON DELETE SET NULL,
  nome         VARCHAR(120) NOT NULL,
  cpf          VARCHAR(20)  NOT NULL,
  idade        SMALLINT,
  matricula    VARCHAR(40)  NOT NULL,
  telefone     VARCHAR(20),
  ativo        BOOLEAN      NOT NULL DEFAULT true,
  criado_em    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (empresa_id, cpf),
  UNIQUE (empresa_id, matricula)
);

CREATE TABLE mensalidades (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT           NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  aluno_id    INT           NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  valor       NUMERIC(10,2) NOT NULL,
  vencimento  DATE          NOT NULL,
  status      VARCHAR(20)   NOT NULL DEFAULT 'Pendente'
                            CHECK (status IN ('Pago','Pendente','Atrasado')),
  pago_em     TIMESTAMPTZ,
  criado_em   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_academias_empresa    ON academias(empresa_id);
CREATE INDEX idx_instrutores_empresa  ON instrutores(empresa_id);
CREATE INDEX idx_exercicios_empresa   ON exercicios(empresa_id);
CREATE INDEX idx_treinos_empresa      ON treinos(empresa_id);
CREATE INDEX idx_alunos_empresa       ON alunos(empresa_id);
CREATE INDEX idx_alunos_academia      ON alunos(academia_id);
CREATE INDEX idx_mensalidades_aluno   ON mensalidades(aluno_id);
CREATE INDEX idx_mensalidades_empresa ON mensalidades(empresa_id);
CREATE INDEX idx_mensalidades_status  ON mensalidades(status);
CREATE INDEX idx_usuarios_email       ON usuarios(email);

-- Views
CREATE VIEW vw_mensalidades_atrasadas AS
  SELECT m.*, a.nome AS aluno_nome, a.empresa_id
  FROM mensalidades m
  JOIN alunos a ON a.id = m.aluno_id
  WHERE m.status = 'Pendente' AND m.vencimento < CURRENT_DATE;

CREATE VIEW vw_resumo_empresa AS
  SELECT
    e.id,
    e.nome AS empresa,
    COUNT(DISTINCT ac.id)  AS total_academias,
    COUNT(DISTINCT al.id)  AS total_alunos,
    COUNT(DISTINCT i.id)   AS total_instrutores,
    SUM(CASE WHEN m.status = 'Atrasado' THEN 1 ELSE 0 END) AS mensalidades_atrasadas,
    SUM(CASE WHEN m.status = 'Pago'     THEN m.valor ELSE 0 END) AS receita_total
  FROM empresas e
  LEFT JOIN academias   ac ON ac.empresa_id = e.id
  LEFT JOIN alunos      al ON al.empresa_id = e.id
  LEFT JOIN instrutores  i ON  i.empresa_id = e.id
  LEFT JOIN mensalidades m ON  m.empresa_id = e.id
  GROUP BY e.id, e.nome;

-- Função para atualizar mensalidades vencidas
CREATE OR REPLACE FUNCTION fn_atualizar_status_mensalidades()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE mensalidades
  SET status = 'Atrasado'
  WHERE status = 'Pendente'
    AND vencimento < CURRENT_DATE;
END;
$$;

-- ============================================================
-- SUPER ADMIN inicial (troque o e-mail e a senha antes de rodar)
-- ============================================================
INSERT INTO empresas (nome, cnpj, plano) VALUES
  ('Administração FitLife', '00.000.000/0000-00', 'enterprise');

INSERT INTO usuarios (empresa_id, nome, email, senha_hash, papel) VALUES
  (1, 'Super Admin', 'onemorecode233@gmail.com',
   crypt('Onemorecode@1', gen_salt('bf')), 'superadmin');
