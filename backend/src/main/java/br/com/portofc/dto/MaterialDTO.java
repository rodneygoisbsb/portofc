package br.com.portofc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialDTO {
    private Long id;

    @NotBlank(message = "O nome do material é obrigatório")
    private String nome;

    @NotBlank(message = "A categoria é obrigatória")
    private String categoria;

    @NotNull(message = "A quantidade é obrigatória")
    private Integer quantidadeEstoque;

    private Integer quantidadeMinima;
    private String localArmazenamento;
}
