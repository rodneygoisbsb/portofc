package br.com.portofc.model;

import br.com.portofc.model.enums.FormaPagamento;
import br.com.portofc.model.enums.StatusFinanceiro;
import br.com.portofc.model.enums.TipoLancamento;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "lancamentos_financeiros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LancamentoFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoLancamento tipo;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private String categoria; // Ex: UNIFORMES, MATERIAIS, SALARIOS, TORNEIOS, EVENTOS, ADMINISTRATIVO, REPASSES, DOACOES, PATROCINIOS

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate dataVencimento;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", length = 30)
    private FormaPagamento formaPagamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusFinanceiro status = StatusFinanceiro.PENDENTE;

    @Column(name = "comprovante_url")
    private String comprovanteUrl;

    @Column(name = "data_criacao")
    @Builder.Default
    private LocalDate dataCriacao = LocalDate.now();
}
