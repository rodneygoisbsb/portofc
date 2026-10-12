package br.com.portofc.dto;

import br.com.portofc.model.enums.StatusColaborador;
import br.com.portofc.model.enums.TipoContratacao;
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
public class ColaboradorResponseDTO {
    private Long id;
    private String nome;
    private String cpf;
    private String email;
    private String telefone;
    private String funcao;
    private TipoContratacao tipoContratacao;
    private BigDecimal valorHora;
    private BigDecimal salarioFixo;
    private BigDecimal beneficios;
    private StatusColaborador status;
    private String fotoUrl;
    private LocalDate dataAdmissao;
}
