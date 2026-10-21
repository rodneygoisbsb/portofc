package br.com.portofc.seeder;

import br.com.portofc.model.*;
import br.com.portofc.model.enums.*;
import br.com.portofc.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    private final AlunoRepository alunoRepository;
    private final FrequenciaRepository frequenciaRepository;
    private final ColaboradorRepository colaboradorRepository;
    private final FolhaAulaRepository folhaAulaRepository;
    private final LancamentoFinanceiroRepository lancamentoRepository;
    private final OrcamentoMetaRepository orcamentoMetaRepository;
    private final MaterialRepository materialRepository;
    private final UniformeRepository uniformeRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("[PORTO FC] Seeder desativado (app.seed.enabled=false). Operando em modo de produção/banco limpo.");
            return;
        }

        if (alunoRepository.count() > 0) {
            log.info("[PORTO FC] Banco de dados já populado. Pulando execução do seeder.");
            return;
        }

        log.info("[PORTO FC] Iniciando carga de dados fictícios para demonstração imediata...");

        seedAlunosEFrequencias();
        seedEquipeEFolha();
        seedFinanceiroEOrcamento();
        seedMateriaisEUniformes();

        log.info("[PORTO FC] Carga de dados concluída com sucesso! Sistema 100% navegável.");
    }

    private void seedAlunosEFrequencias() {
        List<Aluno> alunos = new ArrayList<>();

        // Sub-7 (Idades ~5 a 7 anos: nascidos entre 2019 e 2021)
        alunos.add(Aluno.builder()
                .nome("Lucas Gabriel Silveira")
                .cpf("045.221.890-11")
                .dataNascimento(LocalDate.of(2019, 4, 15))
                .responsavel("Mariana Silveira (Mãe)")
                .telefone("(61) 98123-4501")
                .categoria(CategoriaAluno.SUB_7)
                .turmaHorario("Terça e Quinta - 08:30 às 09:30")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80")
                .observacoesMedicas("Alergia leve a picada de insetos.")
                .build());

        alunos.add(Aluno.builder()
                .nome("Enzo Miguel Ribeiro")
                .cpf("051.443.120-33")
                .dataNascimento(LocalDate.of(2020, 2, 20))
                .responsavel("Carlos Ribeiro (Pai)")
                .telefone("(61) 98455-1122")
                .categoria(CategoriaAluno.SUB_7)
                .turmaHorario("Terça e Quinta - 08:30 às 09:30")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Theo Henrique Souza")
                .cpf("062.889.340-55")
                .dataNascimento(LocalDate.of(2019, 11, 8))
                .responsavel("Patricia Souza (Mãe)")
                .telefone("(61) 99122-3344")
                .categoria(CategoriaAluno.SUB_7)
                .turmaHorario("Terça e Quinta - 08:30 às 09:30")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80")
                .build());

        // Sub-9 (Idades ~8 a 9 anos: nascidos entre 2017 e 2018)
        alunos.add(Aluno.builder()
                .nome("Davi Lucca Farias")
                .cpf("044.908.712-44")
                .dataNascimento(LocalDate.of(2017, 6, 12))
                .responsavel("Juliana Farias (Mãe)")
                .telefone("(61) 98234-9988")
                .categoria(CategoriaAluno.SUB_9)
                .turmaHorario("Segunda e Quarta - 09:00 às 10:15")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Bernardo Ramos Costa")
                .cpf("058.112.443-90")
                .dataNascimento(LocalDate.of(2018, 1, 25))
                .responsavel("Fernando Costa (Pai)")
                .telefone("(61) 98711-2299")
                .categoria(CategoriaAluno.SUB_9)
                .turmaHorario("Segunda e Quarta - 09:00 às 10:15")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Arthur Vinicius Gomes")
                .cpf("061.332.991-02")
                .dataNascimento(LocalDate.of(2017, 9, 30))
                .responsavel("Renata Gomes (Mãe)")
                .telefone("(61) 99654-7812")
                .categoria(CategoriaAluno.SUB_9)
                .turmaHorario("Segunda e Quarta - 09:00 às 10:15")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80")
                .build());

        // Sub-15 (Idades ~13 a 15 anos: nascidos entre 2011 e 2013)
        alunos.add(Aluno.builder()
                .nome("Matheus Henrique Moreira")
                .cpf("039.812.556-78")
                .dataNascimento(LocalDate.of(2012, 3, 14))
                .responsavel("Sandra Moreira (Mãe)")
                .telefone("(61) 99233-4411")
                .categoria(CategoriaAluno.SUB_15)
                .turmaHorario("Terça e Quinta - 14:30 às 16:00")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Gabriel dos Santos Lima")
                .cpf("042.990.112-33")
                .dataNascimento(LocalDate.of(2011, 8, 22))
                .responsavel("Antônio Lima (Pai)")
                .telefone("(61) 98511-7788")
                .categoria(CategoriaAluno.SUB_15)
                .turmaHorario("Terça e Quinta - 14:30 às 16:00")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Pedro Henrique Carvalho")
                .cpf("049.223.778-19")
                .dataNascimento(LocalDate.of(2013, 1, 10))
                .responsavel("Luciana Carvalho (Mãe)")
                .telefone("(61) 98844-3322")
                .categoria(CategoriaAluno.SUB_15)
                .turmaHorario("Terça e Quinta - 14:30 às 16:00")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Joaquim Barbosa Neto")
                .cpf("047.551.992-04")
                .dataNascimento(LocalDate.of(2012, 10, 5))
                .responsavel("Joaquim Barbosa Filho (Pai)")
                .telefone("(61) 99199-0011")
                .categoria(CategoriaAluno.SUB_15)
                .turmaHorario("Terça e Quinta - 14:30 às 16:00")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80")
                .build());

        // Sub-17 (Idades ~16 a 17 anos: nascidos entre 2009 e 2010)
        alunos.add(Aluno.builder()
                .nome("Felipe Augusto Barreto")
                .cpf("033.456.789-01")
                .dataNascimento(LocalDate.of(2009, 5, 18))
                .responsavel("Marcos Barreto (Pai)")
                .telefone("(61) 99311-5522")
                .categoria(CategoriaAluno.SUB_17)
                .turmaHorario("Segunda e Quarta - 16:00 às 17:30")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Rodrigo Alencar Tavares")
                .cpf("036.789.012-34")
                .dataNascimento(LocalDate.of(2010, 2, 11))
                .responsavel("Eliane Alencar (Mãe)")
                .telefone("(61) 98422-9900")
                .categoria(CategoriaAluno.SUB_17)
                .turmaHorario("Segunda e Quarta - 16:00 às 17:30")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Caio Vinicius Martins")
                .cpf("038.991.223-45")
                .dataNascimento(LocalDate.of(2009, 12, 4))
                .responsavel("Valéria Martins (Mãe)")
                .telefone("(61) 98112-8877")
                .categoria(CategoriaAluno.SUB_17)
                .turmaHorario("Segunda e Quarta - 16:00 às 17:30")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80")
                .build());

        // Adulto (Idades > 18 anos)
        alunos.add(Aluno.builder()
                .nome("Bruno Cesar Guimarães")
                .cpf("022.654.891-23")
                .dataNascimento(LocalDate.of(2004, 7, 20))
                .responsavel("Próprio (Maior de Idade)")
                .telefone("(61) 98155-3322")
                .categoria(CategoriaAluno.ADULTO)
                .turmaHorario("Terça e Quinta - 19:30 às 21:00")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Leandro Paiva Dantas")
                .cpf("019.883.221-99")
                .dataNascimento(LocalDate.of(2003, 11, 15))
                .responsavel("Próprio (Maior de Idade)")
                .telefone("(61) 99988-1122")
                .categoria(CategoriaAluno.ADULTO)
                .turmaHorario("Terça e Quinta - 19:30 às 21:00")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Diego Armando Freitas")
                .cpf("025.123.445-66")
                .dataNascimento(LocalDate.of(2002, 6, 9))
                .responsavel("Próprio (Maior de Idade)")
                .telefone("(61) 98765-4321")
                .categoria(CategoriaAluno.ADULTO)
                .turmaHorario("Terça e Quinta - 19:30 às 21:00")
                .status(StatusAluno.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80")
                .build());

        alunos.add(Aluno.builder()
                .nome("Guilherme Siqueira Lins")
                .cpf("031.554.887-12")
                .dataNascimento(LocalDate.of(2001, 8, 30))
                .responsavel("Próprio (Maior de Idade)")
                .telefone("(61) 99123-9988")
                .categoria(CategoriaAluno.ADULTO)
                .turmaHorario("Terça e Quinta - 19:30 às 21:00")
                .status(StatusAluno.INATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
                .build());

        List<Aluno> salvos = alunoRepository.saveAll(alunos);

        // Gerar 30 dias de presenças com taxas variadas (alguns alunos com 90%, outros < 75% para alerta visual)
        LocalDate hoje = LocalDate.now();
        List<Frequencia> frequencias = new ArrayList<>();

        for (int i = 0; i < salvos.size(); i++) {
            Aluno a = salvos.get(i);
            // Alunos 2, 7 e 11 terão frequências mais baixas (~60% a 70%) para acionar o alerta < 75%
            boolean baixaFrequencia = (i == 2 || i == 7 || i == 11);

            for (int dias = 28; dias >= 1; dias -= 3) { // 10 aulas no último mês
                LocalDate dataAula = hoje.minusDays(dias);
                boolean presente;
                if (baixaFrequencia) {
                    presente = (dias % 2 == 0); // ~50% a 60%
                } else {
                    presente = (dias % 7 != 0); // ~85% a 95%
                }

                frequencias.add(Frequencia.builder()
                        .aluno(a)
                        .dataAula(dataAula)
                        .presente(presente)
                        .categoria(a.getCategoria())
                        .observacao(presente ? "Participou ativamente do treino tático." : "Falta justificada por motivos escolares/saúde.")
                        .build());
            }
        }
        frequenciaRepository.saveAll(frequencias);
    }

    private void seedEquipeEFolha() {
        List<Colaborador> colaboradores = new ArrayList<>();

        // Professor 1 (Horista - R$ 50,00/h)
        colaboradores.add(Colaborador.builder()
                .nome("Prof. Ricardo Antunes Mendonça")
                .cpf("312.445.678-90")
                .email("ricardo.mendonca@portofc.org.br")
                .telefone("(61) 98111-2233")
                .funcao("Professor de Futebol de Base (Sub-7 e Sub-9)")
                .tipoContratacao(TipoContratacao.HORISTA)
                .valorHora(BigDecimal.valueOf(50.00))
                .beneficios(BigDecimal.valueOf(250.00)) // Auxílio transporte
                .status(StatusColaborador.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80")
                .dataNascimento(LocalDate.of(1987, 10, 20))
                .chavePix("312.445.678-90")
                .build());

        // Professor 2 (Horista - R$ 60,00/h)
        colaboradores.add(Colaborador.builder()
                .nome("Prof. Marcelo Vasconcelos")
                .cpf("421.998.112-05")
                .email("marcelo.vasconcelos@portofc.org.br")
                .telefone("(61) 99222-3344")
                .funcao("Professor Técnico Principal (Sub-15, Sub-17 e Adulto)")
                .tipoContratacao(TipoContratacao.HORISTA)
                .valorHora(BigDecimal.valueOf(60.00))
                .beneficios(BigDecimal.valueOf(300.00))
                .status(StatusColaborador.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80")
                .dataNascimento(LocalDate.of(1984, 10, 23))
                .chavePix("marcelo.vasconcelos@portofc.org.br")
                .build());

        // Coordenador (Mensalista - R$ 4.500,00)
        colaboradores.add(Colaborador.builder()
                .nome("Fabrício Nogueira da Rocha")
                .cpf("218.665.432-11")
                .email("fabricio.rocha@portofc.org.br")
                .telefone("(61) 99333-4455")
                .funcao("Coordenador Pedagógico e Esportivo")
                .tipoContratacao(TipoContratacao.MENSALISTA)
                .salarioFixo(BigDecimal.valueOf(4500.00))
                .beneficios(BigDecimal.valueOf(500.00))
                .status(StatusColaborador.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80")
                .dataNascimento(LocalDate.of(1981, 5, 14))
                .chavePix("+5561993334455")
                .build());

        // Apoio Administrativo (Mensalista - R$ 2.200,00)
        colaboradores.add(Colaborador.builder()
                .nome("Camila Duarte Peixoto")
                .cpf("541.223.789-40")
                .email("camila.duarte@portofc.org.br")
                .telefone("(61) 98444-5566")
                .funcao("Assistente Administrativa e de Prestação de Contas")
                .tipoContratacao(TipoContratacao.MENSALISTA)
                .salarioFixo(BigDecimal.valueOf(2200.00))
                .beneficios(BigDecimal.valueOf(350.00))
                .status(StatusColaborador.ATIVO)
                .fotoUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80")
                .dataNascimento(LocalDate.of(1993, 8, 30))
                .chavePix("camila.duarte@portofc.org.br")
                .build());

        List<Colaborador> salvos = colaboradorRepository.saveAll(colaboradores);

        // Folha de Aulas do Mês Vigente (2026-10)
        String mesAtual = "2026-10";

        // Prof. Ricardo: 40 horas * R$ 50 = R$ 2000,00 + R$ 250 benefícios - R$ 150 descontos = R$ 2100,00
        FolhaAula f1 = FolhaAula.builder()
                .colaborador(salvos.get(0))
                .mesReferencia(mesAtual)
                .horasRegistradas(BigDecimal.valueOf(40))
                .valorHora(BigDecimal.valueOf(50.00))
                .totalBruto(BigDecimal.valueOf(2000.00))
                .diasTransporte(16)
                .valorDiarioTransporte(BigDecimal.valueOf(11.00))
                .passagem(BigDecimal.valueOf(176.00))
                .outrosBeneficios(BigDecimal.valueOf(74.00))
                .beneficios(BigDecimal.valueOf(250.00))
                .descontos(BigDecimal.valueOf(150.00))
                .liquidoPagar(BigDecimal.valueOf(2100.00))
                .status(StatusFolha.PAGO)
                .dataPagamento(LocalDate.of(2026, 10, 5))
                .build();

        // Prof. Marcelo: 48 horas * R$ 60 = R$ 2880,00 + R$ 300 benefícios - R$ 200 descontos = R$ 2980,00
        FolhaAula f2 = FolhaAula.builder()
                .colaborador(salvos.get(1))
                .mesReferencia(mesAtual)
                .horasRegistradas(BigDecimal.valueOf(48))
                .valorHora(BigDecimal.valueOf(60.00))
                .totalBruto(BigDecimal.valueOf(2880.00))
                .diasTransporte(20)
                .valorDiarioTransporte(BigDecimal.valueOf(11.00))
                .passagem(BigDecimal.valueOf(220.00))
                .outrosBeneficios(BigDecimal.valueOf(80.00))
                .beneficios(BigDecimal.valueOf(300.00))
                .descontos(BigDecimal.valueOf(200.00))
                .liquidoPagar(BigDecimal.valueOf(2980.00))
                .status(StatusFolha.PENDENTE)
                .build();

        // Coordenador Fabrício: Salário R$ 4500,00 + R$ 500 benefícios - R$ 450 descontos = R$ 4550,00
        FolhaAula f3 = FolhaAula.builder()
                .colaborador(salvos.get(2))
                .mesReferencia(mesAtual)
                .horasRegistradas(BigDecimal.valueOf(160))
                .valorHora(BigDecimal.valueOf(28.12))
                .totalBruto(BigDecimal.valueOf(4500.00))
                .diasTransporte(22)
                .valorDiarioTransporte(BigDecimal.valueOf(11.00))
                .passagem(BigDecimal.valueOf(242.00))
                .outrosBeneficios(BigDecimal.valueOf(258.00))
                .beneficios(BigDecimal.valueOf(500.00))
                .descontos(BigDecimal.valueOf(450.00))
                .liquidoPagar(BigDecimal.valueOf(4550.00))
                .status(StatusFolha.PAGO)
                .dataPagamento(LocalDate.of(2026, 10, 5))
                .build();

        // Assistente Camila: Salário R$ 2200,00 + R$ 350 benefícios - R$ 180 descontos = R$ 2370,00
        FolhaAula f4 = FolhaAula.builder()
                .colaborador(salvos.get(3))
                .mesReferencia(mesAtual)
                .horasRegistradas(BigDecimal.valueOf(160))
                .valorHora(BigDecimal.valueOf(13.75))
                .totalBruto(BigDecimal.valueOf(2200.00))
                .diasTransporte(20)
                .valorDiarioTransporte(BigDecimal.valueOf(11.00))
                .passagem(BigDecimal.valueOf(220.00))
                .outrosBeneficios(BigDecimal.valueOf(130.00))
                .beneficios(BigDecimal.valueOf(350.00))
                .descontos(BigDecimal.valueOf(180.00))
                .liquidoPagar(BigDecimal.valueOf(2370.00))
                .status(StatusFolha.PAGO)
                .dataPagamento(LocalDate.of(2026, 10, 5))
                .build();

        folhaAulaRepository.saveAll(List.of(f1, f2, f3, f4));
    }

    private void seedFinanceiroEOrcamento() {
        List<LancamentoFinanceiro> lancamentos = new ArrayList<>();

        // ENTRADAS (Repasses, Doações, Patrocínios)
        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.ENTRADA)
                .descricao("Repasse Convênio Esporte Cidadão - Parcela 01")
                .categoria("REPASSES")
                .valor(BigDecimal.valueOf(45000.00))
                .dataVencimento(LocalDate.of(2026, 8, 10))
                .dataPagamento(LocalDate.of(2026, 8, 10))
                .formaPagamento(FormaPagamento.TRANSFERENCIA)
                .status(StatusFinanceiro.PAGO)
                .comprovanteUrl("https://exemplo.com/comprovantes/repasse_01.pdf")
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.ENTRADA)
                .descricao("Patrocínio Master - Supermercados Central")
                .categoria("PATROCINIOS")
                .valor(BigDecimal.valueOf(12000.00))
                .dataVencimento(LocalDate.of(2026, 9, 5))
                .dataPagamento(LocalDate.of(2026, 9, 5))
                .formaPagamento(FormaPagamento.PIX)
                .status(StatusFinanceiro.PAGO)
                .comprovanteUrl("https://exemplo.com/comprovantes/patrocinio_central.pdf")
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.ENTRADA)
                .descricao("Campanha de Doações de Pais e Amigos do Clube")
                .categoria("DOACOES")
                .valor(BigDecimal.valueOf(3850.00))
                .dataVencimento(LocalDate.of(2026, 9, 20))
                .dataPagamento(LocalDate.of(2026, 9, 20))
                .formaPagamento(FormaPagamento.PIX)
                .status(StatusFinanceiro.PAGO)
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.ENTRADA)
                .descricao("Repasse Termo de Fomento - Parcela 02")
                .categoria("REPASSES")
                .valor(BigDecimal.valueOf(45000.00))
                .dataVencimento(LocalDate.of(2026, 10, 15))
                .dataPagamento(LocalDate.of(2026, 10, 15))
                .formaPagamento(FormaPagamento.TRANSFERENCIA)
                .status(StatusFinanceiro.PAGO)
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.ENTRADA)
                .descricao("Inscrições Torneio Beneficente Solidário")
                .categoria("EVENTOS")
                .valor(BigDecimal.valueOf(2500.00))
                .dataVencimento(LocalDate.of(2026, 10, 25))
                .formaPagamento(FormaPagamento.PIX)
                .status(StatusFinanceiro.PENDENTE)
                .build());

        // SAÍDAS / DESPESAS
        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.SAIDA)
                .descricao("Confecção dos Kits de Uniformes Oficiais (120 jogos)")
                .categoria("UNIFORMES")
                .valor(BigDecimal.valueOf(8400.00))
                .dataVencimento(LocalDate.of(2026, 8, 15))
                .dataPagamento(LocalDate.of(2026, 8, 15))
                .formaPagamento(FormaPagamento.BOLETO)
                .status(StatusFinanceiro.PAGO)
                .comprovanteUrl("https://exemplo.com/comprovantes/nf_uniformes.pdf")
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.SAIDA)
                .descricao("Aquisição de Bolas Topper, Cones e Coletes")
                .categoria("MATERIAIS")
                .valor(BigDecimal.valueOf(3250.00))
                .dataVencimento(LocalDate.of(2026, 8, 22))
                .dataPagamento(LocalDate.of(2026, 8, 22))
                .formaPagamento(FormaPagamento.BOLETO)
                .status(StatusFinanceiro.PAGO)
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.SAIDA)
                .descricao("Folha de Pagamento Professores & Coordenação - Agosto")
                .categoria("SALARIOS")
                .valor(BigDecimal.valueOf(11600.00))
                .dataVencimento(LocalDate.of(2026, 9, 5))
                .dataPagamento(LocalDate.of(2026, 9, 5))
                .formaPagamento(FormaPagamento.TRANSFERENCIA)
                .status(StatusFinanceiro.PAGO)
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.SAIDA)
                .descricao("Aluguel do Campo de Grama Sintética e Quadra")
                .categoria("ADMINISTRATIVO")
                .valor(BigDecimal.valueOf(3500.00))
                .dataVencimento(LocalDate.of(2026, 9, 10))
                .dataPagamento(LocalDate.of(2026, 9, 10))
                .formaPagamento(FormaPagamento.BOLETO)
                .status(StatusFinanceiro.PAGO)
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.SAIDA)
                .descricao("Transporte e Lanches para Torneio Regional Sub-15")
                .categoria("TORNEIOS")
                .valor(BigDecimal.valueOf(1850.00))
                .dataVencimento(LocalDate.of(2026, 9, 25))
                .dataPagamento(LocalDate.of(2026, 9, 25))
                .formaPagamento(FormaPagamento.PIX)
                .status(StatusFinanceiro.PAGO)
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.SAIDA)
                .descricao("Folha de Pagamento Professores & Apoio - Setembro")
                .categoria("SALARIOS")
                .valor(BigDecimal.valueOf(11800.00))
                .dataVencimento(LocalDate.of(2026, 10, 5))
                .dataPagamento(LocalDate.of(2026, 10, 5))
                .formaPagamento(FormaPagamento.TRANSFERENCIA)
                .status(StatusFinanceiro.PAGO)
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.SAIDA)
                .descricao("Manutenção de Equipamentos e Redes de Traves")
                .categoria("MATERIAIS")
                .valor(BigDecimal.valueOf(820.00))
                .dataVencimento(LocalDate.of(2026, 10, 12))
                .dataPagamento(LocalDate.of(2026, 10, 12))
                .formaPagamento(FormaPagamento.PIX)
                .status(StatusFinanceiro.PAGO)
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.SAIDA)
                .descricao("Honorários de Contabilidade e Auditoria Fiscal")
                .categoria("ADMINISTRATIVO")
                .valor(BigDecimal.valueOf(1200.00))
                .dataVencimento(LocalDate.of(2026, 10, 20))
                .formaPagamento(FormaPagamento.BOLETO)
                .status(StatusFinanceiro.PENDENTE)
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.SAIDA)
                .descricao("Premiação e Troféus da Copa da Amizade")
                .categoria("EVENTOS")
                .valor(BigDecimal.valueOf(1600.00))
                .dataVencimento(LocalDate.of(2026, 10, 28))
                .formaPagamento(FormaPagamento.BOLETO)
                .status(StatusFinanceiro.PROGRAMADO)
                .build());

        lancamentos.add(LancamentoFinanceiro.builder()
                .tipo(TipoLancamento.SAIDA)
                .descricao("Lote Adicional de Uniformes de Treino (Tam 10 e 12)")
                .categoria("UNIFORMES")
                .valor(BigDecimal.valueOf(2400.00))
                .dataVencimento(LocalDate.of(2026, 11, 05))
                .formaPagamento(FormaPagamento.BOLETO)
                .status(StatusFinanceiro.PROGRAMADO)
                .build());

        lancamentoRepository.saveAll(lancamentos);

        // Metas Orçamentárias dos Primeiros 3 Meses
        List<OrcamentoMeta> metas = List.of(
                OrcamentoMeta.builder().mesReferencia("2026-08").categoria("Geral").valorPrevisto(BigDecimal.valueOf(30000.00)).valorExecutado(BigDecimal.valueOf(23250.00)).build(),
                OrcamentoMeta.builder().mesReferencia("2026-09").categoria("Geral").valorPrevisto(BigDecimal.valueOf(25000.00)).valorExecutado(BigDecimal.valueOf(16950.00)).build(),
                OrcamentoMeta.builder().mesReferencia("2026-10").categoria("Geral").valorPrevisto(BigDecimal.valueOf(28000.00)).valorExecutado(BigDecimal.valueOf(17820.00)).build()
        );
        orcamentoMetaRepository.saveAll(metas);
    }

    private void seedMateriaisEUniformes() {
        // Estoque Geral de Materiais
        List<Material> materiais = List.of(
                Material.builder().nome("Bolas de Futsal Penalty Max 500").categoria("Bolas").quantidadeEstoque(24).quantidadeMinima(10).localArmazenamento("Armário A1").build(),
                Material.builder().nome("Bolas de Campo Topper Slick").categoria("Bolas").quantidadeEstoque(30).quantidadeMinima(12).localArmazenamento("Armário A2").build(),
                Material.builder().nome("Coletes de Treino (Azul/Verde)").categoria("Coletes").quantidadeEstoque(60).quantidadeMinima(20).localArmazenamento("Gaveteiro B").build(),
                Material.builder().nome("Cones Tradicionais e Pratos Demarcatórios").categoria("Equipamentos").quantidadeEstoque(120).quantidadeMinima(40).localArmazenamento("Caixa Central").build(),
                Material.builder().nome("Escadas de Agilidade e Coordenação").categoria("Equipamentos").quantidadeEstoque(8).quantidadeMinima(4).localArmazenamento("Suporte de Parede").build(),
                Material.builder().nome("Cronômetros Digitais Profissionais").categoria("Acessórios").quantidadeEstoque(5).quantidadeMinima(2).localArmazenamento("Armário do Professor").build(),
                Material.builder().nome("Kit de Primeiros Socorros e Gelo Instantâneo").categoria("Saúde").quantidadeEstoque(4).quantidadeMinima(2).localArmazenamento("Sala da Coordenação").build()
        );
        materialRepository.saveAll(materiais);

        // Grade de Uniformes com comprados, entregues e saldo
        List<Uniforme> uniformes = List.of(
                Uniforme.builder().tamanho("Tam 6 (Sub-7)").quantidadeComprada(25).quantidadeEntregue(18).descricao("Kit Completo Camisa, Calção e Meiões").build(),
                Uniforme.builder().tamanho("Tam 8 (Sub-9)").quantidadeComprada(30).quantidadeEntregue(24).descricao("Kit Completo Camisa, Calção e Meiões").build(),
                Uniforme.builder().tamanho("Tam 10 (Sub-9)").quantidadeComprada(25).quantidadeEntregue(15).descricao("Kit Completo Camisa, Calção e Meiões").build(),
                Uniforme.builder().tamanho("Tam 12 (Sub-15)").quantidadeComprada(35).quantidadeEntregue(28).descricao("Kit Completo Camisa, Calção e Meiões").build(),
                Uniforme.builder().tamanho("Tam 14 (Sub-15)").quantidadeComprada(30).quantidadeEntregue(22).descricao("Kit Completo Camisa, Calção e Meiões").build(),
                Uniforme.builder().tamanho("P (Sub-17)").quantidadeComprada(25).quantidadeEntregue(20).descricao("Kit Completo Camisa, Calção e Meiões").build(),
                Uniforme.builder().tamanho("M (Sub-17/Adulto)").quantidadeComprada(40).quantidadeEntregue(32).descricao("Kit Completo Camisa, Calção e Meiões").build(),
                Uniforme.builder().tamanho("G (Adulto)").quantidadeComprada(30).quantidadeEntregue(19).descricao("Kit Completo Camisa, Calção e Meiões").build(),
                Uniforme.builder().tamanho("GG (Adulto)").quantidadeComprada(15).quantidadeEntregue(8).descricao("Kit Completo Camisa, Calção e Meiões").build()
        );

        for (Uniforme u : uniformes) {
            u.calcularSaldo();
        }
        uniformeRepository.saveAll(uniformes);
    }
}
