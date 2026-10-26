package br.com.portofc.dto;

import br.com.portofc.model.enums.CategoriaAluno;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChamadaLoteRequestDTO {

    @NotNull(message = "A categoria é obrigatória")
    private CategoriaAluno categoria;

    @NotNull(message = "A data da aula é obrigatória")
    private LocalDate dataAula;

    @NotNull(message = "A lista de alunos e presenças é obrigatória")
    private List<ChamadaItemDTO> itens;
}
