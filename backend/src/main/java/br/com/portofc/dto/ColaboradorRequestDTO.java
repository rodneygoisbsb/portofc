package br.com.portofc.dto;

import br.com.portofc.model.enums.StatusColaborador;
import br.com.portofc.model.enums.TipoContratacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColaboradorRequestDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    private String cpf;
    private String email;
    private String telefone;

    @NotBlank(message = "A função é obrigatória")
    private String funcao;

    @NotNull(message = "O tipo de contratação é obrigatório")
    private TipoContratacao tipoContratacao;

    private BigDecimal valorHora;
    private BigDecimal salarioFixo;
    private BigDecimal beneficios;
    private StatusColaborador status;
    private String fotoUrl;
    private LocalDate dataNascimento;
    private String chavePix;
}
