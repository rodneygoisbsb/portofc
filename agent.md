Você é um Arquiteto de Software e Engenheiro Full-Stack Senior especializado em ecossistemas de alta produtividade (React + TypeScript + Tailwind CSS no Front-end e Java Spring Boot no Back-end com PostgreSQL).

Seu objetivo é implementar o MVP funcional, robusto e com acabamento visual de alto padrão da plataforma administrativa da ONG esportiva "PORTO FC" (escola de futebol e futsal).

====================================================================
ESTRUTURA DE REPOSITÓRIO & AMBIENTE
====================================================================
- O repositório Git local já foi inicializado manualmente com o arquivo de contexto.
- Organize o projeto em uma estrutura limpa e modular de monorepo/diretórios:
  ├── frontend/   (Aplicação React + Vite + TypeScript + Tailwind)
  ├── backend/    (Aplicação Java Spring Boot)
  └── docker-compose.yml (Para instanciar o PostgreSQL e ferramentas auxiliares localmente)
- Faça commits semânticos e bem documentados durante cada etapa da construção.

====================================================================
STACK TECNOLÓGICA
====================================================================
- Front-end: React 18+, TypeScript, Tailwind CSS, Lucide React (ícones), React Hook Form, Zod, Axios / TanStack Query, Recharts (para gráficos e dashboards).
- Back-end: Java 17/21 com Spring Boot 3.x, Spring Data JPA, Spring Validation, Lombok, Spring Security (ou controle simples de sessão/JWT).
- Banco de Dados: PostgreSQL (script de schema/migrações via Flyway ou DDL inicial completo).
- Execução: 100% local com scripts simples (`npm run dev` e `mvn spring-boot:run`).

====================================================================
CAMADA DE DADOS FICTÍCIOS (MOCKS & SEED DATA) - OBRIGATÓRIO
====================================================================
O sistema precisa nascer 100% navegável e demonstrável logo no primeiro boot, sem exigir cadastro manual inicial.

1. Back-end Seeder / data.sql:
   - Crie uma rotina de carga inicial (via `CommandLineRunner`, `data.sql` ou seeder JPA) controlada pela propriedade `app.seed.enabled=true` no `application.properties`.
   - Massa de dados a ser injetada automaticamente:
     * Alunos: Pelo menos 15 a 20 alunos distribuídos nas categorias Sub-7, Sub-9, Sub-15, Sub-17 e Adulto, com datas de nascimento coerentes, responsáveis, contatos e URLs de fotos/avatares realistas (usando DiceBear, Unsplash Portraits ou Pravatar).
     * Frequência: Registros dos últimos 30 dias para cálculo de frequências médias e taxas de presença variadas (alguns alunos com 90%, outros com 70% para disparar alertas).
     * Equipe: Pelo menos 4 colaboradores (ex: 2 Professores com valor/hora de R$ 50,00 e R$ 60,00, 1 Coordenador com salário fixo e 1 Apoio administrativo).
     * Folha de Aulas: Registros de horas do mês vigente calculando automaticamente o valor bruto e líquido a pagar.
     * Financeiro: Cerca de 15 lançamentos entre Entradas (repasses, doações, patrocínios) e Saídas divididas por categorias (Uniformes, Materiais, Salários, Torneios, Eventos, Administrativo) com status variados (Pago, Pendente, Programado).
     * Materiais & Uniformes: Estoque cadastrado com quantidades compradas, quantidades entregues e saldo restante.
     * Orçamento Mensal: Metas previstas vs. executadas dos primeiros 3 meses do projeto.

2. Front-end Mock Fallback:
   - Configure os serviços de API do Front-end com suporte a mock imediato via flag de ambiente (`VITE_USE_MOCKS=true/false`).
   - Se o backend ainda não estiver em execução ou a flag estiver ativa, a UI deve carregar os mesmos dados fictícios diretamente da pasta `src/mocks/` sem quebrar telas ou gráficos.

3. Transição Fácil para Produção:
   - Apenas mudando `app.seed.enabled=false` no backend e `VITE_USE_MOCKS=false` no frontend, a aplicação deve operar em modo de produção com banco limpo para entrada de dados reais.

====================================================================
DIRETRIZES VISUAIS E DE DESIGN (UI/UX)
====================================================================
Baseie-se na interface moderna do modelo de dashboard (Catbridge) com as seguintes diretrizes:
1. Cores e Fundo: Fundo ultra-limpo e suave (Tailwind `bg-slate-50` ou `bg-gray-50/50`, NUNCA cinza escuro ou pesado). Paleta do PORTO FC: Azul royal/marinho esportivo como cor primária (`#1E40AF` / `#1D4ED8`), branco puro nos cards, e verde esmeralda (`#10B981` ou `#059669`) para ações principais/criação ("+ Adicionar").
2. Cards e Sombras: TODOS os cards, contêineres e tabelas devem ter fundo branco (`bg-white`), cantos arredondados (`rounded-2xl`), bordas sutis (`border border-slate-100`) e sombras bem projetadas e suaves (`shadow-md` ou `shadow-lg`).
3. Sidebar: Fixa à esquerda com a marca "PORTO FC", menus com ícones Lucide modernos e navegação com abas ativas em destaque de pílula suave.
4. Topbar: Barra superior limpa com busca instantânea, central de alertas/notificações, perfil do administrador e botão de logout.
5. Tabelas e Listagens:
   - Filtros no topo em formato de pílulas (Pill Tabs) para alternar categorias ("Todos", "Sub-7", "Sub-9", "Sub-15", "Sub-17", "Adulto").
   - Checkbox com suporte a seleção múltipla e barra contextual de ações em lote.
   - Avatares circulares para colaboradores e alunos.
   - Badges coloridos suaves para status (`Ativo`, `Inativo`, `Pago`, `Pendente`, `Programado`).
   - Empty state ilustrado e elegante quando pesquisas não retornarem dados.
6. Modais e Telas de Cadastro: Formulários claros e limpos com divisão de seções, inputs com `focus:ring-2`, upload de foto e botões destacados de confirmação.

====================================================================
REGRAS DE NEGÓCIO E MÓDULOS ESSENCIAIS
====================================================================
1. PAINEL GERAL (DASHBOARD):
   - Cards de métricas com fórmulas calculadas:
     * Saldo Disponível = Total Recebido (Pago) - Total Gasto (Pago).
     * Saldo Livre = Total Recebido - (Total Pago + Despesas Comprometidas/Programadas).
   - Gráfico de pizza/rosca ou barras de despesas por categoria.
   - Gráfico de execução orçamentária (Previsto x Realizado).
   - Resumo rápido de alunos ativos e taxa de frequência global.

2. MÓDULO DE ALUNOS:
   - Cadastro: Nome, CPF, Data de Nascimento, Telefone, Responsável, Categoria (calculada pela idade ou selecionada), Horário/Turma, Status e Foto.
   - Listagem com filtro rápido por categoria, busca com debounce e visualização detalhada.

3. MÓDULO DE FREQUÊNCIA:
   - Chamada rápida diária por Categoria/Turma.
   - Cálculo automático de presença individual e percentual geral da turma. Alertas visuais para alunos com menos de 75% de presença.

4. MÓDULO DE EQUIPE & FOLHA DE PAGAMENTO:
   - Cadastro fixo: Nome, CPF, Função, Tipo de Contratação, Valor da Hora/Aula ou Salário Fixo, Benefícios, Status.
   - Apuração mensal: O sistema deve herdar o valor da hora/aula do cadastro e calcular:
     `Total Bruto = Horas Registradas * Valor da Hora`
     `Líquido a Pagar = Total Bruto + Benefícios - Descontos`.

5. MÓDULO FINANCEIRO & ORÇAMENTO:
   - Registro de receitas e despesas com categoria, forma de pagamento, status (Pago, Pendente, Programado) e campo para comprovante.
   - Visão de Orçamento Mensal confrontando Previsto x Comprometido x Pago x Diferença.

6. MÓDULO DE MATERIAIS & UNIFORMES:
   - Controle de estoque geral de materiais esportivos.
   - Grade de uniformes com cálculo de `Estoque = Comprado - Entregue aos alunos`.

7. PRESTAÇÃO DE CONTAS:
   - Relatório consolidado agrupando dados dos 6 meses do projeto com opção de exportação/impressão.

====================================================================
ENTREGÁVEIS ESPERADOS
====================================================================
1. Arquivo `docker-compose.yml` para o PostgreSQL.
2. Back-end Spring Boot completo com entidades, DTOs, controllers, services, migrations e seeder com a massa de dados fictícios rica.
3. Front-end React + TypeScript + Tailwind completo, com layout inspirado no modelo Catbridge, componentes reutilizáveis e camada de mocks integrada.
4. `README.md` detalhado explicando como rodar tanto no modo com dados fictícios quanto no modo limpo para produção.

Comece estruturando as entidades de dados e configurando a base do projeto para inicialização imediata.