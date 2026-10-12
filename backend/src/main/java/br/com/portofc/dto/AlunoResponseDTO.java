package br.com.portofc.dto;

import br.com.portofc.model.enums.CategoriaAluno;
import br.com.portofc.model.enums.StatusAluno;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlunoResponseDTO {

    private Long id;
    private String nome;
    private String cpf;
    private LocalDate dataNascimento;
    private Integer idade;
    private String telefone;
    private String responsavel;
    private CategoriaAluno categoria;
    private String turmaHorario;
    private StatusAluno status;
    private String fotoUrl;
    private LocalDate dataMatricula;
    private String observacoesMedicas;
    private double taxaFrequencia; // ex: 92.5%
    private boolean alertaFrequenciaBaixa; // < 75%
}
