package br.com.portofc.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "orcamentos_metas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrcamentoMeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mes_referencia", nullable = false, length = 7) // Ex: "2026-08", "2026-09", "2026-10"
    private String mesReferencia;

    @Column(nullable = false)
    private String categoria;

    @Column(name = "valor_previsto", precision = 12, scale = 2, nullable = false)
    private BigDecimal valorPrevisto;

    @Column(name = "valor_executado", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal valorExecutado = BigDecimal.ZERO;
}
