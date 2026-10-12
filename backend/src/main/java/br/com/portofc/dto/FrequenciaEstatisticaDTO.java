package br.com.portofc.dto;

import br.com.portofc.model.enums.CategoriaAluno;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FrequenciaEstatisticaDTO {
    private Long alunoId;
    private String alunoNome;
    private String fotoUrl;
    private CategoriaAluno categoria;
    private long totalAulas;
    private long totalPresencas;
    private double percentualPresenca;
    private boolean alertaFrequenciaBaixa; // < 75%
}
