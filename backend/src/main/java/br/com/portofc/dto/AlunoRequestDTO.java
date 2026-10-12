package br.com.portofc.dto;

import br.com.portofc.model.enums.CategoriaAluno;
import br.com.portofc.model.enums.StatusAluno;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlunoRequestDTO {

    @NotBlank(message = "O nome do aluno é obrigatório")
    private String nome;

    private String cpf;

    @NotNull(message = "A data de nascimento é obrigatória")
    private LocalDate dataNascimento;

    private String telefone;

    @NotBlank(message = "O nome do responsável é obrigatório")
    private String responsavel;

    @NotNull(message = "A categoria é obrigatória")
    private CategoriaAluno categoria;

    private String turmaHorario;

    private StatusAluno status;

    private String fotoUrl;

    private String observacoesMedicas;
}
