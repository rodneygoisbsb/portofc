-- ==============================================================================
-- PORTO FC - SCRIPT DE CARGA DE DADOS DE DEMONSTRAÇÃO (SEED)
-- Execute este script no SQL Editor do Supabase para popular o banco de dados.
-- ==============================================================================

-- 1. LIMPEZA PREVENTIVA (opcional, para garantir re-execuções sem duplicidade)
TRUNCATE TABLE frequencias, folhas_aulas, lancamentos_financeiros, uniformes, materiais, orcamentos_metas, alunos, colaboradores RESTART IDENTITY CASCADE;

-- 2. INSERÇÃO DE ALUNOS
INSERT INTO alunos (id, nome, cpf, data_nascimento, telefone, responsavel, categoria, turma, horario_treino, turma_horario, status, foto_url, data_matricula, observacoes_medicas) VALUES
(1, 'Lucas Gabriel Silveira', '045.221.890-11', '2019-10-17', '(61) 98123-4501', 'Mariana Silveira (Mãe)', 'SUB_7', 'Turma A', '08:30 às 09:30', 'Turma A - 08:30 às 09:30', 'ATIVO', 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80', '2026-02-10', 'Alergia leve a picada de insetos.'),
(2, 'Enzo Miguel Ribeiro', '051.443.120-33', '2020-10-21', '(61) 98455-1122', 'Carlos Ribeiro (Pai)', 'SUB_7', 'Turma A', '08:30 às 09:30', 'Turma A - 08:30 às 09:30', 'ATIVO', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80', '2026-02-12', NULL),
(3, 'Theo Henrique Souza', '062.889.340-55', '2019-10-25', '(61) 99122-3344', 'Patricia Souza (Mãe)', 'SUB_7', 'Turma B', '10:00 às 11:00', 'Turma B - 10:00 às 11:00', 'ATIVO', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', '2026-03-01', NULL),
(4, 'Davi Lucca Farias', '044.908.712-44', '2017-10-22', '(61) 98234-9988', 'Juliana Farias (Mãe)', 'SUB_9', 'Segunda e Quarta', '09:00 às 10:15', 'Segunda e Quarta - 09:00 às 10:15', 'ATIVO', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '2026-02-05', NULL),
(5, 'Bernardo Ramos Costa', '058.112.443-90', '2018-01-25', '(61) 98711-2299', 'Fernando Costa (Pai)', 'SUB_9', 'Segunda e Quarta', '09:00 às 10:15', 'Segunda e Quarta - 09:00 às 10:15', 'ATIVO', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '2026-02-08', NULL),
(6, 'Arthur Vinicius Gomes', '061.332.991-02', '2017-09-30', '(61) 99654-7812', 'Renata Gomes (Mãe)', 'SUB_9', 'Segunda e Quarta', '09:00 às 10:15', 'Segunda e Quarta - 09:00 às 10:15', 'ATIVO', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '2026-02-15', NULL),
(7, 'Lucas Rafael Martins', '048.910.223-11', '2017-11-14', '(61) 98111-2233', 'Patrícia Martins (Mãe)', 'SUB_9', 'Terça e Quinta', '15:30 às 16:45', 'Terça e Quinta - 15:30 às 16:45', 'ATIVO', 'https://images.unsplash.com/photo-1546525848-3ce03ca516f6?w=150&auto=format&fit=crop&q=80', '2026-02-18', NULL),
(8, 'Heitor Rezende Silveira', '055.671.889-40', '2018-03-08', '(61) 98222-4455', 'Marcelo Silveira (Pai)', 'SUB_9', 'Terça e Quinta', '15:30 às 16:45', 'Terça e Quinta - 15:30 às 16:45', 'ATIVO', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', '2026-02-20', NULL),
(9, 'Murilo Albuquerque Castro', '063.112.908-62', '2017-08-19', '(61) 99333-6677', 'Carla Castro (Mãe)', 'SUB_9', 'Terça e Quinta', '15:30 às 16:45', 'Terça e Quinta - 15:30 às 16:45', 'ATIVO', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '2026-02-25', NULL),
(10, 'Matheus Henrique Moreira', '039.812.556-78', '2012-03-14', '(61) 99233-4411', 'Sandra Moreira (Mãe)', 'SUB_15', 'Terça e Quinta', '14:30 às 16:00', 'Terça e Quinta - 14:30 às 16:00', 'ATIVO', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', '2026-01-20', NULL),
(11, 'Gabriel dos Santos Lima', '042.990.112-33', '2011-08-22', '(61) 98511-7788', 'Antônio Lima (Pai)', 'SUB_15', 'Terça e Quinta', '14:30 às 16:00', 'Terça e Quinta - 14:30 às 16:00', 'ATIVO', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', '2026-01-22', 'Acompanhamento pós entorse tornozelo.'),
(12, 'Pedro Henrique Carvalho', '049.223.778-19', '2013-01-10', '(61) 98844-3322', 'Luciana Carvalho (Mãe)', 'SUB_15', 'Terça e Quinta', '14:30 às 16:00', 'Terça e Quinta - 14:30 às 16:00', 'ATIVO', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', '2026-02-01', NULL),
(13, 'Joaquim Barbosa Neto', '047.551.992-04', '2012-10-20', '(61) 99199-0011', 'Joaquim Barbosa Filho (Pai)', 'SUB_15', 'Terça e Quinta', '14:30 às 16:00', 'Terça e Quinta - 14:30 às 16:00', 'ATIVO', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', '2026-02-03', NULL),
(14, 'Felipe Augusto Barreto', '033.456.789-01', '2009-10-21', '(61) 99311-5522', 'Marcos Barreto (Pai)', 'SUB_17', 'Segunda e Quarta', '16:00 às 17:30', 'Segunda e Quarta - 16:00 às 17:30', 'ATIVO', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', '2026-01-15', NULL),
(15, 'Rodrigo Alencar Tavares', '036.789.012-34', '2010-02-11', '(61) 98422-9900', 'Eliane Alencar (Mãe)', 'SUB_17', 'Segunda e Quarta', '16:00 às 17:30', 'Segunda e Quarta - 16:00 às 17:30', 'ATIVO', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', '2026-01-18', NULL),
(16, 'Caio Vinicius Martins', '038.991.223-45', '2009-12-04', '(61) 98112-8877', 'Valéria Martins (Mãe)', 'SUB_17', 'Segunda e Quarta', '16:00 às 17:30', 'Segunda e Quarta - 16:00 às 17:30', 'ATIVO', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', '2026-01-25', NULL),
(17, 'Bruno Cesar Guimarães', '022.654.891-23', '2004-10-19', '(61) 98155-3322', 'Próprio (Maior de Idade)', 'ADULTO', 'Terça e Quinta', '19:30 às 21:00', 'Terça e Quinta - 19:30 às 21:00', 'ATIVO', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', '2026-01-10', NULL),
(18, 'Leandro Paiva Dantas', '019.883.221-99', '2003-11-15', '(61) 99988-1122', 'Próprio (Maior de Idade)', 'ADULTO', 'Terça e Quinta', '19:30 às 21:00', 'Terça e Quinta - 19:30 às 21:00', 'ATIVO', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', '2026-01-12', NULL),
(19, 'Diego Armando Freitas', '025.123.445-66', '2002-06-09', '(61) 98765-4321', 'Próprio (Maior de Idade)', 'ADULTO', 'Terça e Quinta', '19:30 às 21:00', 'Terça e Quinta - 19:30 às 21:00', 'ATIVO', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', '2026-02-02', NULL),
(20, 'Guilherme Siqueira Lins', '031.554.887-12', '2001-08-30', '(61) 99123-9988', 'Próprio (Maior de Idade)', 'ADULTO', 'Terça e Quinta', '19:30 às 21:00', 'Terça e Quinta - 19:30 às 21:00', 'INATIVO', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '2026-01-08', 'Trancou matrícula temporariamente.');

-- 3. INSERÇÃO DE COLABORADORES
INSERT INTO colaboradores (id, nome, cpf, email, telefone, funcao, tipo_contratacao, valor_hora, salario_fixo, beneficios, status, foto_url, data_admissao, data_nascimento, chave_pix) VALUES
(1, 'Prof. Ricardo Antunes Mendonça', '312.445.678-90', 'ricardo.mendonca@portofc.org.br', '(61) 98111-2233', 'Professor de Futebol de Base (Sub-7 e Sub-9)', 'HORISTA', 50.00, 0.00, 250.00, 'ATIVO', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '2026-01-10', '1987-10-20', '312.445.678-90'),
(2, 'Prof. Marcelo Vasconcelos', '421.998.112-05', 'marcelo.vasconcelos@portofc.org.br', '(61) 99222-3344', 'Professor Técnico Principal (Sub-15, Sub-17 e Adulto)', 'HORISTA', 60.00, 0.00, 300.00, 'ATIVO', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', '2026-01-10', '1984-10-23', 'marcelo.vasconcelos@portofc.org.br'),
(3, 'Fabrício Nogueira da Rocha', '218.665.432-11', 'fabricio.rocha@portofc.org.br', '(61) 99333-4455', 'Coordenador Pedagógico e Esportivo', 'CLT', 0.00, 4500.00, 500.00, 'ATIVO', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', '2026-01-05', '1981-05-14', '+5561993334455'),
(4, 'Camila Duarte Peixoto', '541.223.789-40', 'camila.duarte@portofc.org.br', '(61) 98444-5566', 'Assistente Administrativa e de Prestação de Contas', 'CLT', 0.00, 2200.00, 350.00, 'ATIVO', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', '2026-01-15', '1993-08-30', 'camila.duarte@portofc.org.br');

-- 4. INSERÇÃO DE FOLHAS DE PAGAMENTO
INSERT INTO folhas_aulas (id, colaborador_id, mes_referencia, horas_registradas, valor_hora, total_bruto, beneficios, passagem, dias_transporte, valor_diario_transporte, outros_beneficios, descontos, liquido_pagar, status, data_pagamento, forma_pagamento) VALUES
(1, 1, '2026-10', 40.00, 50.00, 2000.00, 250.00, 176.00, 16, 11.00, 74.00, 150.00, 2100.00, 'PAGO', '2026-10-05', 'PIX'),
(2, 2, '2026-10', 48.00, 60.00, 2880.00, 300.00, 220.00, 20, 11.00, 80.00, 200.00, 2980.00, 'PENDENTE', NULL, 'PIX'),
(3, 3, '2026-10', 160.00, 28.12, 4500.00, 500.00, 242.00, 22, 11.00, 258.00, 450.00, 4550.00, 'PAGO', '2026-10-05', 'TRANSFERENCIA'),
(4, 4, '2026-10', 160.00, 13.75, 2200.00, 350.00, 220.00, 20, 11.00, 130.00, 180.00, 2370.00, 'PAGO', '2026-10-05', 'TRANSFERENCIA');

-- 5. INSERÇÃO DE LANÇAMENTOS FINANCEIROS
INSERT INTO lancamentos_financeiros (id, tipo, descricao, categoria, valor, data_vencimento, data_pagamento, forma_pagamento, status, comprovante_url, data_criacao) VALUES
(1, 'ENTRADA', 'Repasse Convênio Esporte Cidadão - Parcela 01', 'REPASSES', 45000.00, '2026-08-10', '2026-08-10', 'TRANSFERENCIA', 'PAGO', 'https://exemplo.com/comprovantes/repasse_01.pdf', '2026-08-01'),
(2, 'ENTRADA', 'Patrocínio Master - Supermercados Central', 'PATROCINIOS', 12000.00, '2026-09-05', '2026-09-05', 'PIX', 'PAGO', 'https://exemplo.com/comprovantes/patrocinio_central.pdf', '2026-09-01'),
(3, 'ENTRADA', 'Campanha de Doações de Pais e Amigos do Clube', 'DOACOES', 3850.00, '2026-09-20', '2026-09-20', 'PIX', 'PAGO', NULL, '2026-09-15'),
(4, 'ENTRADA', 'Repasse Termo de Fomento - Parcela 02', 'REPASSES', 45000.00, '2026-10-15', '2026-10-15', 'TRANSFERENCIA', 'PAGO', NULL, '2026-10-01'),
(5, 'ENTRADA', 'Inscrições Torneio Beneficente Solidário', 'EVENTOS', 2500.00, '2026-10-25', NULL, 'PIX', 'PENDENTE', NULL, '2026-10-05'),
(6, 'SAIDA', 'Confecção dos Kits de Uniformes Oficiais (120 jogos)', 'UNIFORMES', 8400.00, '2026-08-15', '2026-08-15', 'BOLETO', 'PAGO', 'https://exemplo.com/comprovantes/nf_uniformes.pdf', '2026-08-05'),
(7, 'SAIDA', 'Aquisição de Bolas Topper, Cones e Coletes', 'MATERIAIS', 3250.00, '2026-08-22', '2026-08-22', 'BOLETO', 'PAGO', NULL, '2026-08-10'),
(8, 'SAIDA', 'Folha de Pagamento Professores & Coordenação - Agosto', 'SALARIOS', 11600.00, '2026-09-05', '2026-09-05', 'TRANSFERENCIA', 'PAGO', NULL, '2026-08-31'),
(9, 'SAIDA', 'Aluguel do Campo de Grama Sintética e Quadra', 'ADMINISTRATIVO', 3500.00, '2026-09-10', '2026-09-10', 'BOLETO', 'PAGO', NULL, '2026-09-01'),
(10, 'SAIDA', 'Transporte e Lanches para Torneio Regional Sub-15', 'TORNEIOS', 1850.00, '2026-09-25', '2026-09-25', 'PIX', 'PAGO', NULL, '2026-09-20'),
(11, 'SAIDA', 'Folha de Pagamento Professores & Apoio - Setembro', 'SALARIOS', 11800.00, '2026-10-05', '2026-10-05', 'TRANSFERENCIA', 'PAGO', NULL, '2026-09-30'),
(12, 'SAIDA', 'Manutenção de Equipamentos e Redes de Traves', 'MATERIAIS', 820.00, '2026-10-12', '2026-10-12', 'PIX', 'PAGO', NULL, '2026-10-02'),
(13, 'SAIDA', 'Honorários de Contabilidade e Auditoria Fiscal', 'ADMINISTRATIVO', 1200.00, '2026-10-20', NULL, 'BOLETO', 'PENDENTE', NULL, '2026-10-05'),
(14, 'SAIDA', 'Premiação e Troféus da Copa da Amizade', 'EVENTOS', 1600.00, '2026-10-28', NULL, 'BOLETO', 'PROGRAMADO', NULL, '2026-10-05'),
(15, 'SAIDA', 'Lote Adicional de Uniformes de Treino (Tam 10 e 12)', 'UNIFORMES', 2400.00, '2026-11-05', NULL, 'BOLETO', 'PROGRAMADO', NULL, '2026-10-05');

-- 6. INSERÇÃO DE UNIFORMES
INSERT INTO uniformes (id, tamanho, quantidade_comprada, quantidade_entregue, saldo_estoque, descricao, valor_unitario, valor_total) VALUES
(1, 'Tam 6 (Sub-7)', 25, 18, 7, 'Kit Camisa, Calção e Meiões', 65.00, 1625.00),
(2, 'Tam 8 (Sub-9)', 30, 24, 6, 'Kit Camisa, Calção e Meiões', 65.00, 1950.00),
(3, 'Tam 10 (Sub-9)', 25, 15, 10, 'Kit Camisa, Calção e Meiões', 65.00, 1625.00),
(4, 'Tam 12 (Sub-15)', 35, 28, 7, 'Kit Camisa, Calção e Meiões', 70.00, 2450.00),
(5, 'Tam 14 (Sub-15)', 30, 22, 8, 'Kit Camisa, Calção e Meiões', 70.00, 2100.00),
(6, 'P (Sub-17)', 25, 20, 5, 'Kit Camisa, Calção e Meiões', 75.00, 1875.00),
(7, 'M (Sub-17/Adulto)', 40, 32, 8, 'Kit Camisa, Calção e Meiões', 75.00, 3000.00),
(8, 'G (Adulto)', 30, 19, 11, 'Kit Camisa, Calção e Meiões', 75.00, 2250.00),
(9, 'GG (Adulto)', 15, 8, 7, 'Kit Camisa, Calção e Meiões', 75.00, 1125.00);

-- 7. INSERÇÃO DE MATERIAIS
INSERT INTO materiais (id, nome, categoria, quantidade_estoque, quantidade_minima, local_armazenamento, valor_unitario, valor_total) VALUES
(1, 'Bolas de Futsal Penalty Max 500', 'Bolas', 24, 10, 'Armário A1', 149.90, 3597.60),
(2, 'Bolas de Campo Topper Slick', 'Bolas', 30, 12, 'Armário A2', 119.50, 3585.00),
(3, 'Coletes de Treino (Azul/Verde)', 'Coletes', 60, 20, 'Gaveteiro B', 18.00, 1080.00),
(4, 'Cones Tradicionais e Pratos Demarcatórios', 'Equipamentos', 120, 40, 'Caixa Central', 6.50, 780.00),
(5, 'Escadas de Agilidade e Coordenação', 'Equipamentos', 8, 4, 'Suporte de Parede', 75.00, 600.00),
(6, 'Cronômetros Digitais Profissionais', 'Acessórios', 5, 2, 'Armário do Professor', 65.00, 325.00),
(7, 'Kit de Primeiros Socorros e Gelo Instantâneo', 'Saúde', 4, 2, 'Sala da Coordenação', 110.00, 440.00);

-- 8. INSERÇÃO DE METAS ORÇAMENTÁRIAS
INSERT INTO orcamentos_metas (id, mes_referencia, categoria, valor_previsto, valor_executado) VALUES
(1, '2026-08', 'Geral', 30000.00, 23250.00),
(2, '2026-09', 'Geral', 25000.00, 16950.00),
(3, '2026-10', 'Geral', 28000.00, 17820.00),
(4, '2026-11', 'Geral', 28000.00, 18500.00),
(5, '2026-12', 'Geral', 32000.00, 24100.00),
(6, '2027-01', 'Geral', 22000.00, 14800.00),
(7, '2027-02', 'Geral', 25000.00, 18200.00),
(8, '2027-03', 'Geral', 28000.00, 19400.00),
(9, '2027-04', 'Geral', 27000.00, 18900.00),
(10, '2027-05', 'Geral', 28000.00, 20100.00),
(11, '2027-06', 'Geral', 29000.00, 21500.00),
(12, '2027-07', 'Geral', 30000.00, 22000.00);

-- 9. INSERÇÃO DE FREQUÊNCIAS (HISTÓRICO DE CHAMADA)
INSERT INTO frequencias (aluno_id, data_aula, presente, categoria, observacao) VALUES
(1, '2026-10-15', true, 'SUB_7', 'Excelente participação nos chutes a gol'),
(2, '2026-10-15', true, 'SUB_7', 'Treino técnico concluído'),
(3, '2026-10-15', false, 'SUB_7', 'Atestado médico: gripe forte'),
(10, '2026-10-15', true, 'SUB_15', 'Ótimo condicionamento físico'),
(11, '2026-10-15', false, 'SUB_15', 'Falta não justificada'),
(12, '2026-10-15', true, 'SUB_15', 'Atuação destacada na zaga'),
(13, '2026-10-15', true, 'SUB_15', 'Treino tático de posicionamento'),
(17, '2026-10-15', true, 'ADULTO', 'Treino de finalizações'),
(18, '2026-10-15', true, 'ADULTO', 'Participação integral'),
(4, '2026-10-14', true, 'SUB_9', 'Treino de passe e condução'),
(5, '2026-10-14', true, 'SUB_9', 'Boa evolução técnica'),
(6, '2026-10-14', true, 'SUB_9', 'Treino tático concluído'),
(14, '2026-10-14', true, 'SUB_17', 'Treino de força e velocidade'),
(15, '2026-10-14', false, 'SUB_17', 'Compromisso escolar à tarde'),
(16, '2026-10-14', true, 'SUB_17', 'Participação destacada no meio-campo'),
(1, '2026-10-13', true, 'SUB_7', 'Condução de bola com os dois pés'),
(2, '2026-10-13', true, 'SUB_7', 'Treino com bola nova'),
(3, '2026-10-13', false, 'SUB_7', 'Consulta médica de rotina');

-- 10. SINCRONIZAÇÃO DAS SEQUÊNCIAS DO POSTGRESQL (Para futuros INSERTs)
SELECT setval('alunos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM alunos));
SELECT setval('colaboradores_id_seq', (SELECT COALESCE(MAX(id), 1) FROM colaboradores));
SELECT setval('folhas_aulas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM folhas_aulas));
SELECT setval('lancamentos_financeiros_id_seq', (SELECT COALESCE(MAX(id), 1) FROM lancamentos_financeiros));
SELECT setval('uniformes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM uniformes));
SELECT setval('materiais_id_seq', (SELECT COALESCE(MAX(id), 1) FROM materiais));
SELECT setval('orcamentos_metas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM orcamentos_metas));
SELECT setval('frequencias_id_seq', (SELECT COALESCE(MAX(id), 1) FROM frequencias));
