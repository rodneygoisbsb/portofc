package br.com.portofc.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntregaUniformeRequestDTO {

    @NotNull(message = "O ID do uniforme é obrigatório")
    private Long uniformeId;

    @NotNull(message = "A quantidade a ser entregue é obrigatória")
    @Min(value = 1, message = "A quantidade deve ser no mínimo 1")
    private Integer quantidade;

    private Long alunoId; // Opcional: registrar para qual aluno foi entregue
}
