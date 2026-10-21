package br.com.portofc.service;

import br.com.portofc.dto.FolhaAulaRequestDTO;
import br.com.portofc.dto.FolhaAulaResponseDTO;
import br.com.portofc.exception.ResourceNotFoundException;
import br.com.portofc.model.Colaborador;
import br.com.portofc.model.FolhaAula;
import br.com.portofc.model.enums.StatusFolha;
import br.com.portofc.repository.ColaboradorRepository;
import br.com.portofc.repository.FolhaAulaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolhaAulaService {

    private final FolhaAulaRepository folhaAulaRepository;
    private final ColaboradorRepository colaboradorRepository;

    @Transactional(readOnly = true)
    public List<FolhaAulaResponseDTO> listarPorMes(String mesReferencia) {
        List<FolhaAula> lista = (mesReferencia != null && !mesReferencia.isBlank()) ?
                folhaAulaRepository.findByMesReferencia(mesReferencia) :
                folhaAulaRepository.findAll();

        return lista.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional
    public FolhaAulaResponseDTO registrarOuAtualizarFolha(FolhaAulaRequestDTO dto) {
        Colaborador colaborador = colaboradorRepository.findById(dto.getColaboradorId())
                .orElseThrow(() -> new ResourceNotFoundException("Colaborador não encontrado ID: " + dto.getColaboradorId()));

        BigDecimal valorHora = dto.getValorHora();
        if (valorHora == null || valorHora.compareTo(BigDecimal.ZERO) == 0) {
            valorHora = colaborador.getValorHora() != null ? colaborador.getValorHora() : BigDecimal.ZERO;
        }

        BigDecimal horas = dto.getHorasRegistradas() != null ? dto.getHorasRegistradas() : BigDecimal.ZERO;
        BigDecimal beneficios = dto.getBeneficios() != null ? dto.getBeneficios() : (colaborador.getBeneficios() != null ? colaborador.getBeneficios() : BigDecimal.ZERO);
        BigDecimal descontos = dto.getDescontos() != null ? dto.getDescontos() : BigDecimal.ZERO;

        BigDecimal totalBruto = horas.multiply(valorHora);
        if (totalBruto.compareTo(BigDecimal.ZERO) == 0 && colaborador.getSalarioFixo() != null) {
            totalBruto = colaborador.getSalarioFixo();
        }
        BigDecimal liquidoPagar = totalBruto.add(beneficios).subtract(descontos);

        FolhaAula folha = folhaAulaRepository.findByColaboradorIdAndMesReferencia(dto.getColaboradorId(), dto.getMesReferencia())
                .orElse(FolhaAula.builder()
                        .colaborador(colaborador)
                        .mesReferencia(dto.getMesReferencia())
                        .build());

        folha.setHorasRegistradas(horas);
        folha.setValorHora(valorHora);
        folha.setTotalBruto(totalBruto);
        folha.setBeneficios(beneficios);
        folha.setPassagem(dto.getPassagem());
        folha.setDiasTransporte(dto.getDiasTransporte());
        folha.setValorDiarioTransporte(dto.getValorDiarioTransporte());
        folha.setOutrosBeneficios(dto.getOutrosBeneficios());
        folha.setDescontos(descontos);
        folha.setLiquidoPagar(liquidoPagar);
        folha.setStatus(dto.getStatus() != null ? dto.getStatus() : StatusFolha.PENDENTE);
        folha.setDataPagamento(dto.getDataPagamento());

        FolhaAula salva = folhaAulaRepository.save(folha);
        return toResponseDTO(salva);
    }

    @Transactional
    public FolhaAulaResponseDTO atualizarStatus(Long id, StatusFolha novoStatus) {
        FolhaAula folha = folhaAulaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folha não encontrada com o ID: " + id));

        folha.setStatus(novoStatus);
        FolhaAula salva = folhaAulaRepository.save(folha);
        return toResponseDTO(salva);
    }

    public FolhaAulaResponseDTO toResponseDTO(FolhaAula f) {
        return FolhaAulaResponseDTO.builder()
                .id(f.getId())
                .colaboradorId(f.getColaborador().getId())
                .colaboradorNome(f.getColaborador().getNome())
                .colaboradorFuncao(f.getColaborador().getFuncao())
                .colaboradorFotoUrl(f.getColaborador().getFotoUrl())
                .tipoContratacao(f.getColaborador().getTipoContratacao())
                .mesReferencia(f.getMesReferencia())
                .horasRegistradas(f.getHorasRegistradas())
                .valorHora(f.getValorHora())
                .totalBruto(f.getTotalBruto())
                .beneficios(f.getBeneficios())
                .passagem(f.getPassagem())
                .diasTransporte(f.getDiasTransporte())
                .valorDiarioTransporte(f.getValorDiarioTransporte())
                .outrosBeneficios(f.getOutrosBeneficios())
                .descontos(f.getDescontos())
                .liquidoPagar(f.getLiquidoPagar())
                .status(f.getStatus())
                .dataPagamento(f.getDataPagamento())
                .build();
    }
}
