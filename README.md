# PORTO FC - Plataforma Administrativa

> Sistema de gestão integrado para a ONG esportiva **PORTO FC** (Escola de Futebol e Futsal).
> Desenvolvido com arquitetura moderna e acabamento de alto padrão (**React 19 + TypeScript + Tailwind CSS** no Front-end e **Java Spring Boot 3.x + JPA + PostgreSQL** no Back-end).

---

## 🌟 Funcionalidades Principais

1. **Painel Geral (Dashboard)**
   - **Saldo Disponível**: Total Recebido (Pago) - Total Gasto (Pago).
   - **Saldo Livre**: Total Recebido - (Total Pago + Despesas Comprometidas/Programadas).
   - Distribuição de despesas por categoria em gráfico interativo de rosca (Recharts).
   - Execução orçamentária (Previsto x Realizado) por mês.
   - Indicador de alunos ativos e taxa média de assiduidade dos treinos.

2. **Gestão de Alunos & Atletas**
   - Matrículas por categoria esportiva (**Sub-7, Sub-9, Sub-15, Sub-17 e Adulto**).
   - Filtros por pílulas (*Pill Tabs*), busca instantânea, avatares realistas e seleção em lote.
   - Detecção e alerta visual para alunos com menos de **75% de presença**.

3. **Chamada Diária & Frequência**
   - Chamada rápida diária por categoria/turma com botão de presença/falta e justificativas.
   - Cálculo automático de presença individual e percentual geral da turma.

4. **Equipe & Folha de Pagamento**
   - Gestão de professores horistas e coordenação mensalista.
   - Apuração automática de remuneração de aulas:
     - `Total Bruto = Horas Registradas * Valor da Hora`
     - `Líquido a Pagar = Total Bruto + Benefícios - Descontos`
   - Quitação e acompanhamento de status (*Pago* / *Pendente*).

5. **Financeiro & Orçamento**
   - Livro-caixa com lançamentos de receitas (repasses, doações, patrocínios) e despesas (uniformes, materiais, salários, torneios, etc.).
   - Anexo de comprovantes fiscais e status (*Pago*, *Pendente*, *Programado*).
   - Acompanhamento trimestral de execução orçamentária.

6. **Materiais & Estoque de Uniformes**
   - Grade completa de tamanhos com fórmula automática: `Saldo em Estoque = Comprado - Entregue aos Alunos`.
   - Baixa e entrega rápida de fardamentos para novos atletas.
   - Controle de equipamentos esportivos (bolas, coletes, cones, kits de primeiros socorros).

7. **Prestação de Contas Oficial**
   - Relatório semestral consolidado agrupando metas físicas e dados financeiros.
   - Layout otimizado para impressão e exportação em PDF (*Print-Ready*).

---

## 🚀 Como Executar o Projeto

### Modo 1: Inicialização Rápida com Mocks (Demonstração Imediata)
Não requer banco de dados ou Java instalado. A interface carrega 100% navegável com a massa rica de dados fictícios:

```bash
# 1. Acesse o diretório do frontend
cd frontend

# 2. Instale as dependências (caso ainda não tenha feito)
npm install

# 3. Inicie o servidor Vite
npm run dev
```

Acesse no navegador: `http://localhost:5173`.
O indicador no rodapé da Sidebar mostrará **Modo Demonstração (Mocks)** ativo.

---

### Modo 2: Execução Completa com Back-end e PostgreSQL

#### Passo A: Subir o Banco de Dados (Docker)
Na raiz do repositório:
```bash
docker-compose up -d
```
*(Inicia o PostgreSQL 16 na porta `5432`, com banco `portofc_db`, usuário `portofc_user` e senha `portofc_password`)*.

#### Passo B: Iniciar a API Spring Boot
No diretório `backend`:
```bash
cd backend
mvn spring-boot:run
```
*(Caso não utilize Docker, execute com o perfil H2 em memória: `mvn spring-boot:run -Dspring-boot.run.profiles=h2`)*.

#### Passo C: Iniciar o Front-end Conectado à API Real
No diretório `frontend`:
1. Edite o arquivo `.env`:
   ```properties
   VITE_USE_MOCKS=false
   VITE_API_URL=http://localhost:8080/api
   ```
2. Execute a aplicação:
   ```bash
   npm run dev
   ```

---

## ⚙️ Alternância entre Dados Fictícios e Modo Produção Limpo

| Configuração | Demonstração com Seeds / Mocks | Produção Limpa (Banco Real) |
|---|---|---|
| **Back-end** (`backend/.../application.properties`) | `app.seed.enabled=true` | `app.seed.enabled=false` |
| **Front-end** (`frontend/.env`) | `VITE_USE_MOCKS=true` | `VITE_USE_MOCKS=false` |

---

## 🛠️ Tecnologias Utilizadas

- **Front-end**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Axios, Zod.
- **Back-end**: Java 17, Spring Boot 3.3.4, Spring Data JPA, Lombok, Bean Validation.
- **Banco de Dados**: PostgreSQL 16 (produção local) / H2 Database (desenvolvimento standalone).
- **Orquestração**: Docker Compose.
