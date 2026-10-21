package br.com.portofc.model;

import br.com.portofc.model.enums.StatusFolha;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "folhas_aulas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolhaAula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "colaborador_id", nullable = false)
    private Colaborador colaborador;

    @Column(name = "mes_referencia", nullable = false, length = 7) // Ex: "2026-10"
    private String mesReferencia;

    @Column(name = "horas_registradas", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal horasRegistradas = BigDecimal.ZERO;

    @Column(name = "valor_hora", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal valorHora = BigDecimal.ZERO;

    @Column(name = "total_bruto", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalBruto = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal beneficios = BigDecimal.ZERO;

    @Column(name = "passagem", precision = 10, scale = 2)
    private BigDecimal passagem;

    @Column(name = "dias_transporte")
    private Integer diasTransporte;

    @Column(name = "valor_diario_transporte", precision = 10, scale = 2)
    private BigDecimal valorDiarioTransporte;

    @Column(name = "outros_beneficios", precision = 10, scale = 2)
    private BigDecimal outrosBeneficios;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal descontos = BigDecimal.ZERO;

    @Column(name = "liquido_pagar", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal liquidoPagar = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusFolha status = StatusFolha.PENDENTE;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @PrePersist
    @PreUpdate
    public void calcularValores() {
        if (horasRegistradas != null && valorHora != null && valorHora.compareTo(BigDecimal.ZERO) > 0) {
            this.totalBruto = horasRegistradas.multiply(valorHora);
        }
        BigDecimal ben = beneficios != null ? beneficios : BigDecimal.ZERO;
        BigDecimal desc = descontos != null ? descontos : BigDecimal.ZERO;
        BigDecimal bruto = totalBruto != null ? totalBruto : BigDecimal.ZERO;
        this.liquidoPagar = bruto.add(ben).subtract(desc);
    }
}
