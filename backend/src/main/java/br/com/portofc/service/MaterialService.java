package br.com.portofc.service;

import br.com.portofc.dto.EntregaUniformeRequestDTO;
import br.com.portofc.dto.MaterialDTO;
import br.com.portofc.dto.UniformeDTO;
import br.com.portofc.exception.ResourceNotFoundException;
import br.com.portofc.model.Material;
import br.com.portofc.model.Uniforme;
import br.com.portofc.repository.MaterialRepository;
import br.com.portofc.repository.UniformeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final UniformeRepository uniformeRepository;

    @Transactional(readOnly = true)
    public List<MaterialDTO> listarMateriais() {
        return materialRepository.findAll().stream()
                .map(this::toMaterialDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MaterialDTO salvarMaterial(MaterialDTO dto) {
        Material material;
        if (dto.getId() != null) {
            material = materialRepository.findById(dto.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado com ID: " + dto.getId()));
            material.setNome(dto.getNome());
            material.setCategoria(dto.getCategoria());
            material.setQuantidadeEstoque(dto.getQuantidadeEstoque());
            material.setQuantidadeMinima(dto.getQuantidadeMinima() != null ? dto.getQuantidadeMinima() : 5);
            material.setLocalArmazenamento(dto.getLocalArmazenamento());
        } else {
            material = Material.builder()
                    .nome(dto.getNome())
                    .categoria(dto.getCategoria())
                    .quantidadeEstoque(dto.getQuantidadeEstoque())
                    .quantidadeMinima(dto.getQuantidadeMinima() != null ? dto.getQuantidadeMinima() : 5)
                    .localArmazenamento(dto.getLocalArmazenamento())
                    .build();
        }

        Material salvo = materialRepository.save(material);
        return toMaterialDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<UniformeDTO> listarUniformes() {
        return uniformeRepository.findAll().stream()
                .map(this::toUniformeDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UniformeDTO entregarUniforme(EntregaUniformeRequestDTO dto) {
        Uniforme uniforme = uniformeRepository.findById(dto.getUniformeId())
                .orElseThrow(() -> new ResourceNotFoundException("Uniforme não encontrado ID: " + dto.getUniformeId()));

        int entregueAtual = uniforme.getQuantidadeEntregue() != null ? uniforme.getQuantidadeEntregue() : 0;
        int novaQuantidadeEntregue = entregueAtual + dto.getQuantidade();

        uniforme.setQuantidadeEntregue(novaQuantidadeEntregue);
        uniforme.calcularSaldo();

        Uniforme salvo = uniformeRepository.save(uniforme);
        return toUniformeDTO(salvo);
    }

    public MaterialDTO toMaterialDTO(Material m) {
        return MaterialDTO.builder()
                .id(m.getId())
                .nome(m.getNome())
                .categoria(m.getCategoria())
                .quantidadeEstoque(m.getQuantidadeEstoque())
                .quantidadeMinima(m.getQuantidadeMinima())
                .localArmazenamento(m.getLocalArmazenamento())
                .build();
    }

    public UniformeDTO toUniformeDTO(Uniforme u) {
        return UniformeDTO.builder()
                .id(u.getId())
                .tamanho(u.getTamanho())
                .quantidadeComprada(u.getQuantidadeComprada())
                .quantidadeEntregue(u.getQuantidadeEntregue())
                .saldoEstoque(u.getSaldoEstoque())
                .descricao(u.getDescricao())
                .build();
    }
}
