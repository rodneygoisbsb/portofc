package br.com.portofc.model;

import br.com.portofc.model.enums.CategoriaAluno;
import br.com.portofc.model.enums.StatusAluno;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "alunos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(length = 20)
    private String cpf;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    private String telefone;

    @Column(nullable = false)
    private String responsavel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoriaAluno categoria;

    @Column(name = "turma")
    private String turma;

    @Column(name = "horario_treino")
    private String horarioTreino;

    @Column(name = "turma_horario")
    private String turmaHorario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusAluno status = StatusAluno.ATIVO;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(name = "data_matricula")
    @Builder.Default
    private LocalDate dataMatricula = LocalDate.now();

    @Column(name = "observacoes_medicas", columnDefinition = "TEXT")
    private String observacoesMedicas;
}
