package br.com.portofc.service;

import br.com.portofc.dto.ChamadaItemDTO;
import br.com.portofc.dto.ChamadaLoteRequestDTO;
import br.com.portofc.dto.FrequenciaEstatisticaDTO;
import br.com.portofc.exception.ResourceNotFoundException;
import br.com.portofc.model.Aluno;
import br.com.portofc.model.Frequencia;
import br.com.portofc.model.enums.CategoriaAluno;
import br.com.portofc.repository.AlunoRepository;
import br.com.portofc.repository.FrequenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FrequenciaService {

    private final FrequenciaRepository frequenciaRepository;
    private final AlunoRepository alunoRepository;

    @Transactional
    public List<Frequencia> registrarChamadaEmLote(ChamadaLoteRequestDTO dto) {
        List<Frequencia> frequenciasSalvas = new ArrayList<>();

        for (ChamadaItemDTO item : dto.getItens()) {
            Aluno aluno = alunoRepository.findById(item.getAlunoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado ID: " + item.getAlunoId()));

            Frequencia frequencia = Frequencia.builder()
                    .aluno(aluno)
                    .dataAula(dto.getDataAula())
                    .categoria(dto.getCategoria())
                    .presente(item.isPresente())
                    .observacao(item.getObservacao())
                    .build();

            frequenciasSalvas.add(frequenciaRepository.save(frequencia));
        }

        return frequenciasSalvas;
    }

    @Transactional(readOnly = true)
    public List<Frequencia> listarPorCategoriaEData(CategoriaAluno categoria, LocalDate data) {
        return frequenciaRepository.findByCategoriaAndDataAula(categoria, data);
    }

    @Transactional(readOnly = true)
    public List<FrequenciaEstatisticaDTO> obterEstatisticasPorCategoria(CategoriaAluno categoria) {
        List<Aluno> alunos = (categoria != null) ?
                alunoRepository.findByCategoria(categoria) :
                alunoRepository.findAll();

        return alunos.stream().map(aluno -> {
            long totalAulas = frequenciaRepository.countTotalAulasByAlunoId(aluno.getId());
            long presencas = frequenciaRepository.countPresencasByAlunoId(aluno.getId());

            double percentual = 100.0;
            if (totalAulas > 0) {
                percentual = Math.round(((double) presencas / totalAulas * 100.0) * 10.0) / 10.0;
            }

            return FrequenciaEstatisticaDTO.builder()
                    .alunoId(aluno.getId())
                    .alunoNome(aluno.getNome())
                    .fotoUrl(aluno.getFotoUrl())
                    .categoria(aluno.getCategoria())
                    .totalAulas(totalAulas)
                    .totalPresencas(presencas)
                    .percentualPresenca(percentual)
                    .alertaFrequenciaBaixa(percentual < 75.0)
                    .build();
        }).collect(Collectors.toList());
    }
}
