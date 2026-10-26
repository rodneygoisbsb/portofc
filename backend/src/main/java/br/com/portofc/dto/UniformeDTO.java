package br.com.portofc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniformeDTO {
    private Long id;

    @NotBlank(message = "O tamanho é obrigatório")
    private String tamanho;

    private Integer quantidadeComprada;
    private Integer quantidadeEntregue;
    private Integer saldoEstoque;
    private String descricao;
}
