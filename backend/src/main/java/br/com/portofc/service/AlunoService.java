package br.com.portofc.service;

import br.com.portofc.dto.AlunoRequestDTO;
import br.com.portofc.dto.AlunoResponseDTO;
import br.com.portofc.exception.ResourceNotFoundException;
import br.com.portofc.model.Aluno;
import br.com.portofc.model.enums.CategoriaAluno;
import br.com.portofc.model.enums.StatusAluno;
import br.com.portofc.repository.AlunoRepository;
import br.com.portofc.repository.FrequenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final FrequenciaRepository frequenciaRepository;

    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> listarTodos(CategoriaAluno categoria, String busca) {
        List<Aluno> lista;

        if (categoria != null) {
            lista = alunoRepository.findByCategoria(categoria);
        } else if (busca != null && !busca.isBlank()) {
            lista = alunoRepository.findByNomeContainingIgnoreCase(busca);
        } else {
            lista = alunoRepository.findAll();
        }

        return lista.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AlunoResponseDTO buscarPorId(Long id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com o ID: " + id));
        return toResponseDTO(aluno);
    }

    @Transactional
    public AlunoResponseDTO criar(AlunoRequestDTO dto) {
        CategoriaAluno cat = dto.getCategoria();
        if (cat == null && dto.getDataNascimento() != null) {
            cat = calcularCategoriaPorIdade(dto.getDataNascimento());
        }

        String turmaHorarioCalculado = dto.getTurmaHorario();
        if (turmaHorarioCalculado == null && (dto.getTurma() != null || dto.getHorarioTreino() != null)) {
            turmaHorarioCalculado = ((dto.getTurma() != null ? dto.getTurma() : "") + " - " + (dto.getHorarioTreino() != null ? dto.getHorarioTreino() : "")).trim();
        }

        Aluno aluno = Aluno.builder()
                .nome(dto.getNome())
                .cpf(dto.getCpf())
                .dataNascimento(dto.getDataNascimento())
                .telefone(dto.getTelefone())
                .responsavel(dto.getResponsavel())
                .categoria(cat)
                .turma(dto.getTurma())
                .horarioTreino(dto.getHorarioTreino())
                .turmaHorario(turmaHorarioCalculado)
                .status(dto.getStatus() != null ? dto.getStatus() : StatusAluno.ATIVO)
                .fotoUrl(dto.getFotoUrl())
                .observacoesMedicas(dto.getObservacoesMedicas())
                .dataMatricula(LocalDate.now())
                .build();

        Aluno salvo = alunoRepository.save(aluno);
        return toResponseDTO(salvo);
    }

    @Transactional
    public AlunoResponseDTO atualizar(Long id, AlunoRequestDTO dto) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com o ID: " + id));

        aluno.setNome(dto.getNome());
        aluno.setCpf(dto.getCpf());
        aluno.setDataNascimento(dto.getDataNascimento());
        aluno.setTelefone(dto.getTelefone());
        aluno.setResponsavel(dto.getResponsavel());
        if (dto.getCategoria() != null) {
            aluno.setCategoria(dto.getCategoria());
        }
        aluno.setTurma(dto.getTurma());
        aluno.setHorarioTreino(dto.getHorarioTreino());
        if (dto.getTurmaHorario() != null) {
            aluno.setTurmaHorario(dto.getTurmaHorario());
        } else if (dto.getTurma() != null || dto.getHorarioTreino() != null) {
            aluno.setTurmaHorario(((dto.getTurma() != null ? dto.getTurma() : "") + " - " + (dto.getHorarioTreino() != null ? dto.getHorarioTreino() : "")).trim());
        }
        if (dto.getStatus() != null) {
            aluno.setStatus(dto.getStatus());
        }
        if (dto.getFotoUrl() != null) {
            aluno.setFotoUrl(dto.getFotoUrl());
        }
        aluno.setObservacoesMedicas(dto.getObservacoesMedicas());

        Aluno atualizado = alunoRepository.save(aluno);
        return toResponseDTO(atualizado);
    }

    @Transactional
    public void deletar(Long id) {
        if (!alunoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Aluno não encontrado com o ID: " + id);
        }
        alunoRepository.deleteById(id);
    }

    public AlunoResponseDTO toResponseDTO(Aluno aluno) {
        int idade = Period.between(aluno.getDataNascimento(), LocalDate.now()).getYears();

        long totalAulas = frequenciaRepository.countTotalAulasByAlunoId(aluno.getId());
        long presencas = frequenciaRepository.countPresencasByAlunoId(aluno.getId());

        double taxaFreq = 100.0;
        if (totalAulas > 0) {
            taxaFreq = Math.round(((double) presencas / totalAulas * 100.0) * 10.0) / 10.0;
        }

        return AlunoResponseDTO.builder()
                .id(aluno.getId())
                .nome(aluno.getNome())
                .cpf(aluno.getCpf())
                .dataNascimento(aluno.getDataNascimento())
                .idade(idade)
                .telefone(aluno.getTelefone())
                .responsavel(aluno.getResponsavel())
                .categoria(aluno.getCategoria())
                .turma(aluno.getTurma())
                .horarioTreino(aluno.getHorarioTreino())
                .turmaHorario(aluno.getTurmaHorario())
                .status(aluno.getStatus())
                .fotoUrl(aluno.getFotoUrl())
                .dataMatricula(aluno.getDataMatricula())
                .observacoesMedicas(aluno.getObservacoesMedicas())
                .taxaFrequencia(taxaFreq)
                .alertaFrequenciaBaixa(taxaFreq < 75.0)
                .build();
    }

    private CategoriaAluno calcularCategoriaPorIdade(LocalDate dataNasc) {
        int idade = Period.between(dataNasc, LocalDate.now()).getYears();
        if (idade <= 7) return CategoriaAluno.SUB_7;
        if (idade <= 9) return CategoriaAluno.SUB_9;
        if (idade <= 15) return CategoriaAluno.SUB_15;
        if (idade <= 17) return CategoriaAluno.SUB_17;
        return CategoriaAluno.ADULTO;
    }
}
