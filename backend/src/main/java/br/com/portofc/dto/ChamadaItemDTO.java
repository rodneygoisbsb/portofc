package br.com.portofc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChamadaItemDTO {
    private Long alunoId;
    private String alunoNome;
    private boolean presente;
    private String observacao;
}
