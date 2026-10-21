package br.com.portofc.service;

import br.com.portofc.dto.ColaboradorRequestDTO;
import br.com.portofc.dto.ColaboradorResponseDTO;
import br.com.portofc.exception.ResourceNotFoundException;
import br.com.portofc.model.Colaborador;
import br.com.portofc.model.enums.StatusColaborador;
import br.com.portofc.repository.ColaboradorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ColaboradorService {

    private final ColaboradorRepository colaboradorRepository;

    @Transactional(readOnly = true)
    public List<ColaboradorResponseDTO> listarTodos(String busca) {
        List<Colaborador> lista;
        if (busca != null && !busca.isBlank()) {
            lista = colaboradorRepository.findByNomeContainingIgnoreCase(busca);
        } else {
            lista = colaboradorRepository.findAll();
        }
        return lista.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ColaboradorResponseDTO buscarPorId(Long id) {
        Colaborador colab = colaboradorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Colaborador não encontrado com o ID: " + id));
        return toResponseDTO(colab);
    }

    @Transactional
    public ColaboradorResponseDTO criar(ColaboradorRequestDTO dto) {
        Colaborador colaborador = Colaborador.builder()
                .nome(dto.getNome())
                .cpf(dto.getCpf())
                .email(dto.getEmail())
                .telefone(dto.getTelefone())
                .funcao(dto.getFuncao())
                .tipoContratacao(dto.getTipoContratacao())
                .valorHora(dto.getValorHora())
                .salarioFixo(dto.getSalarioFixo())
                .beneficios(dto.getBeneficios())
                .status(dto.getStatus() != null ? dto.getStatus() : StatusColaborador.ATIVO)
                .fotoUrl(dto.getFotoUrl())
                .dataAdmissao(LocalDate.now())
                .dataNascimento(dto.getDataNascimento())
                .chavePix(dto.getChavePix())
                .build();

        Colaborador salvo = colaboradorRepository.save(colaborador);
        return toResponseDTO(salvo);
    }

    @Transactional
    public ColaboradorResponseDTO atualizar(Long id, ColaboradorRequestDTO dto) {
        Colaborador colab = colaboradorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Colaborador não encontrado com o ID: " + id));

        colab.setNome(dto.getNome());
        colab.setCpf(dto.getCpf());
        colab.setEmail(dto.getEmail());
        colab.setTelefone(dto.getTelefone());
        colab.setFuncao(dto.getFuncao());
        colab.setTipoContratacao(dto.getTipoContratacao());
        colab.setValorHora(dto.getValorHora());
        colab.setSalarioFixo(dto.getSalarioFixo());
        colab.setBeneficios(dto.getBeneficios());
        if (dto.getStatus() != null) {
            colab.setStatus(dto.getStatus());
        }
        if (dto.getFotoUrl() != null) {
            colab.setFotoUrl(dto.getFotoUrl());
        }
        colab.setDataNascimento(dto.getDataNascimento());
        colab.setChavePix(dto.getChavePix());

        Colaborador atualizado = colaboradorRepository.save(colab);
        return toResponseDTO(atualizado);
    }

    @Transactional
    public void deletar(Long id) {
        if (!colaboradorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Colaborador não encontrado com o ID: " + id);
        }
        colaboradorRepository.deleteById(id);
    }

    public ColaboradorResponseDTO toResponseDTO(Colaborador c) {
        return ColaboradorResponseDTO.builder()
                .id(c.getId())
                .nome(c.getNome())
                .cpf(c.getCpf())
                .email(c.getEmail())
                .telefone(c.getTelefone())
                .funcao(c.getFuncao())
                .tipoContratacao(c.getTipoContratacao())
                .valorHora(c.getValorHora())
                .salarioFixo(c.getSalarioFixo())
                .beneficios(c.getBeneficios())
                .status(c.getStatus())
                .fotoUrl(c.getFotoUrl())
                .dataAdmissao(c.getDataAdmissao())
                .dataNascimento(c.getDataNascimento())
                .chavePix(c.getChavePix())
                .build();
    }
}
