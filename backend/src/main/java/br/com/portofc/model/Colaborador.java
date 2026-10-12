package br.com.portofc.model;

import br.com.portofc.model.enums.StatusColaborador;
import br.com.portofc.model.enums.TipoContratacao;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "colaboradores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Colaborador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(length = 20)
    private String cpf;

    private String email;

    private String telefone;

    @Column(nullable = false)
    private String funcao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_contratacao", nullable = false, length = 30)
    private TipoContratacao tipoContratacao;

    @Column(name = "valor_hora", precision = 10, scale = 2)
    private BigDecimal valorHora;

    @Column(name = "salario_fixo", precision = 10, scale = 2)
    private BigDecimal salarioFixo;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal beneficios = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusColaborador status = StatusColaborador.ATIVO;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(name = "data_admissao")
    @Builder.Default
    private LocalDate dataAdmissao = LocalDate.now();
}
