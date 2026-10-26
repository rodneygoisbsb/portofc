-- ==============================================================================
-- PORTO FC - ESQUEMA DE BANCO DE DADOS POSTGRESQL (SUPABASE)
-- Execute este script completo no SQL Editor do seu painel do Supabase
-- ==============================================================================

-- 1. TABELA DE ALUNOS
CREATE TABLE IF NOT EXISTS alunos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(20),
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(50),
    responsavel VARCHAR(255) NOT NULL,
    categoria VARCHAR(20) NOT NULL, -- SUB_7, SUB_9, SUB_11, SUB_13, SUB_15, SUB_17, ADULTO
    turma VARCHAR(100),
    horario_treino VARCHAR(100),
    turma_horario VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO', -- ATIVO, INATIVO, SUSPENSO
    foto_url TEXT,
    data_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes_medicas TEXT
);

-- 2. TABELA DE COLABORADORES (CORPO DOCENTE E ADMIN)
CREATE TABLE IF NOT EXISTS colaboradores (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(20),
    email VARCHAR(150),
    telefone VARCHAR(50),
    funcao VARCHAR(150) NOT NULL,
    tipo_contratacao VARCHAR(30) NOT NULL, -- CLT, PJ, HORISTA, VOLUNTARIO
    valor_hora NUMERIC(10, 2),
    salario_fixo NUMERIC(10, 2),
    beneficios NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO', -- ATIVO, INATIVO
    foto_url TEXT,
    data_admissao DATE DEFAULT CURRENT_DATE,
    data_nascimento DATE,
    chave_pix VARCHAR(100)
);

-- 3. TABELA DE FREQUÊNCIAS (CHAMADA DIÁRIA)
CREATE TABLE IF NOT EXISTS frequencias (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    data_aula DATE NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT FALSE,
    categoria VARCHAR(20) NOT NULL,
    observacao TEXT
);

-- 4. TABELA DE FOLHA DE PAGAMENTO / AULAS
CREATE TABLE IF NOT EXISTS folhas_aulas (
    id BIGSERIAL PRIMARY KEY,
    colaborador_id BIGINT NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    mes_referencia VARCHAR(7) NOT NULL, -- Ex: '2026-10'
    horas_registradas NUMERIC(8, 2) DEFAULT 0.00,
    valor_hora NUMERIC(10, 2) DEFAULT 0.00,
    total_bruto NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    beneficios NUMERIC(10, 2) DEFAULT 0.00,
    passagem NUMERIC(10, 2) DEFAULT 0.00,
    dias_transporte INTEGER DEFAULT 0,
    valor_diario_transporte NUMERIC(10, 2) DEFAULT 0.00,
    outros_beneficios NUMERIC(10, 2) DEFAULT 0.00,
    descontos NUMERIC(10, 2) DEFAULT 0.00,
    liquido_pagar NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', -- PAGO, PENDENTE, CANCELADO
    data_pagamento DATE,
    forma_pagamento VARCHAR(30),
    comprovante_url TEXT,
    comprovante_nome VARCHAR(255),
    comprovante_tipo VARCHAR(20),
    lancamento_financeiro_id BIGINT
);

-- 5. TABELA DE LANÇAMENTOS FINANCEIROS (LIVRO-CAIXA)
CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL, -- ENTRADA, SAIDA
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- SALARIOS, UNIFORMES, MATERIAIS, TORNEIOS, EVENTOS, ADMINISTRATIVO, REPASSES, etc.
    valor NUMERIC(12, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    forma_pagamento VARCHAR(30), -- PIX, BOLETO, TRANSFERENCIA, CARTAO_CREDITO, DINHEIRO
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', -- PAGO, PENDENTE, PROGRAMADO
    comprovante_url TEXT,
    comprovante_nome VARCHAR(255),
    comprovante_tipo VARCHAR(20), -- FOTO, ARQUIVO, URL
    colaborador_id BIGINT,
    folha_id BIGINT,
    data_criacao DATE DEFAULT CURRENT_DATE
);

-- 6. TABELA DE UNIFORMES (ALMOXARIFADO & GRADE)
CREATE TABLE IF NOT EXISTS uniformes (
    id BIGSERIAL PRIMARY KEY,
    tamanho VARCHAR(50) NOT NULL,
    quantidade_comprada INTEGER NOT NULL DEFAULT 0,
    quantidade_entregue INTEGER NOT NULL DEFAULT 0,
    saldo_estoque INTEGER NOT NULL DEFAULT 0,
    descricao VARCHAR(255),
    valor_unitario NUMERIC(10, 2) DEFAULT 0.00,
    valor_total NUMERIC(12, 2) DEFAULT 0.00
);

-- 7. TABELA DE MATERIAIS ESPORTIVOS & EQUIPAMENTOS
CREATE TABLE IF NOT EXISTS materiais (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    quantidade_estoque INTEGER NOT NULL DEFAULT 0,
    quantidade_minima INTEGER NOT NULL DEFAULT 5,
    local_armazenamento VARCHAR(150),
    valor_unitario NUMERIC(10, 2) DEFAULT 0.00,
    valor_total NUMERIC(12, 2) DEFAULT 0.00
);

-- 8. TABELA DE METAS ORÇAMENTÁRIAS / RUBRICAS (GOVERNAMENTAL)
CREATE TABLE IF NOT EXISTS orcamentos_metas (
    id BIGSERIAL PRIMARY KEY,
    mes_referencia VARCHAR(7),
    categoria VARCHAR(100) NOT NULL,
    valor_previsto NUMERIC(12, 2) NOT NULL,
    valor_executado NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- ÍNDICES PARA CONSULTAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_alunos_categoria ON alunos(categoria);
CREATE INDEX IF NOT EXISTS idx_alunos_status ON alunos(status);
CREATE INDEX IF NOT EXISTS idx_frequencias_aluno ON frequencias(aluno_id);
CREATE INDEX IF NOT EXISTS idx_frequencias_data ON frequencias(data_aula);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo_status ON lancamentos_financeiros(tipo, status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_categoria ON lancamentos_financeiros(categoria);
CREATE INDEX IF NOT EXISTS idx_folhas_mes ON folhas_aulas(mes_referencia);
