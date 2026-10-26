# PORTO FC - Back-end (Spring Boot 3.x)

API RESTful para a plataforma administrativa da ONG esportiva **PORTO FC**.

## Tecnologias
- Java 17+
- Spring Boot 3.3.4
- Spring Data JPA
- PostgreSQL (driver de produção) & H2 (driver de desenvolvimento rápido)
- Lombok
- Bean Validation

## Requisitos
- Java JDK 17 ou 21 instalado e configurado no PATH
- Docker & Docker Compose (para banco PostgreSQL) OU execução com perfil H2 em memória

## Execução

### Opção 1: Com PostgreSQL via Docker (Recomendado)
1. Na raiz do repositório, inicie o banco de dados:
   ```bash
   docker-compose up -d
   ```
2. Inicie a aplicação Spring Boot:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

### Opção 2: Standalone sem Docker (Perfil H2 em memória)
Caso não tenha Docker ou PostgreSQL ativo no momento:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

## Dados Fictícios / Seeder
A carga inicial de dados fictícios completos é controlada pela propriedade no `application.properties`:
```properties
app.seed.enabled=true
```
- **Modo Demonstração / Homologação**: Deixe `app.seed.enabled=true`. Na inicialização, dezenas de alunos, frequências, colaboradores, folha de pagamento, lançamentos financeiros e uniformes serão injetados automaticamente.
- **Modo Produção / Banco Limpo**: Altere para `app.seed.enabled=false`.

## Documentação dos Endpoints REST
- `/api/dashboard/stats`: Métricas e resumos consolidados para o painel geral.
- `/api/alunos`: CRUD completo e filtros por categoria.
- `/api/frequencias`: Registro de chamada diária e histórico de presenças.
- `/api/colaboradores`: Gestão da equipe e instrutores.
- `/api/folha-aulas`: Cálculo automático de horas e fechamento mensal.
- `/api/financeiro`: Lançamentos de receitas e despesas com comprovantes.
- `/api/materiais`: Controle de estoque de equipamentos e grade de uniformes.
