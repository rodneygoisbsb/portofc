package br.com.portofc.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "uniformes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Uniforme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String tamanho; // ex: Sub-7 (Tam 6), Sub-9 (Tam 8), Tam 10, Tam 12, Tam 14, P, M, G, GG

    @Column(name = "quantidade_comprada", nullable = false)
    @Builder.Default
    private Integer quantidadeComprada = 0;

    @Column(name = "quantidade_entregue", nullable = false)
    @Builder.Default
    private Integer quantidadeEntregue = 0;

    @Column(name = "saldo_estoque", nullable = false)
    @Builder.Default
    private Integer saldoEstoque = 0;

    private String descricao;

    @PrePersist
    @PreUpdate
    public void calcularSaldo() {
        int comprada = quantidadeComprada != null ? quantidadeComprada : 0;
        int entregue = quantidadeEntregue != null ? quantidadeEntregue : 0;
        this.saldoEstoque = Math.max(0, comprada - entregue);
    }
}
