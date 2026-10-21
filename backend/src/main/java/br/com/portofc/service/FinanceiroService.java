package br.com.portofc.service;

import br.com.portofc.dto.LancamentoRequestDTO;
import br.com.portofc.dto.LancamentoResponseDTO;
import br.com.portofc.dto.OrcamentoMesDTO;
import br.com.portofc.exception.ResourceNotFoundException;
import br.com.portofc.model.LancamentoFinanceiro;
import br.com.portofc.model.OrcamentoMeta;
import br.com.portofc.model.enums.StatusFinanceiro;
import br.com.portofc.model.enums.TipoLancamento;
import br.com.portofc.repository.LancamentoFinanceiroRepository;
import br.com.portofc.repository.OrcamentoMetaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private final LancamentoFinanceiroRepository lancamentoRepository;
    private final OrcamentoMetaRepository orcamentoMetaRepository;

    @Transactional(readOnly = true)
    public List<LancamentoResponseDTO> listarTodos(TipoLancamento tipo, StatusFinanceiro status, String categoria) {
        List<LancamentoFinanceiro> lista = lancamentoRepository.findAll();

        return lista.stream()
                .filter(l -> tipo == null || l.getTipo() == tipo)
                .filter(l -> status == null || l.getStatus() == status)
                .filter(l -> categoria == null || categoria.isBlank() || l.getCategoria().equalsIgnoreCase(categoria))
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LancamentoResponseDTO buscarPorId(Long id) {
        LancamentoFinanceiro lancamento = lancamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lançamento financeiro não encontrado com o ID: " + id));
        return toResponseDTO(lancamento);
    }

    @Transactional
    public LancamentoResponseDTO criar(LancamentoRequestDTO dto) {
        LancamentoFinanceiro lancamento = LancamentoFinanceiro.builder()
                .tipo(dto.getTipo())
                .descricao(dto.getDescricao())
                .categoria(dto.getCategoria())
                .valor(dto.getValor())
                .dataVencimento(dto.getDataVencimento())
                .dataPagamento(dto.getDataPagamento())
                .formaPagamento(dto.getFormaPagamento())
                .status(dto.getStatus() != null ? dto.getStatus() : StatusFinanceiro.PENDENTE)
                .comprovanteUrl(dto.getComprovanteUrl())
                .dataCriacao(LocalDate.now())
                .build();

        LancamentoFinanceiro salvo = lancamentoRepository.save(lancamento);
        return toResponseDTO(salvo);
    }

    @Transactional
    public LancamentoResponseDTO atualizar(Long id, LancamentoRequestDTO dto) {
        LancamentoFinanceiro l = lancamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lançamento financeiro não encontrado com o ID: " + id));

        l.setTipo(dto.getTipo());
        l.setDescricao(dto.getDescricao());
        l.setCategoria(dto.getCategoria());
        l.setValor(dto.getValor());
        l.setDataVencimento(dto.getDataVencimento());
        l.setDataPagamento(dto.getDataPagamento());
        l.setFormaPagamento(dto.getFormaPagamento());
        if (dto.getStatus() != null) {
            l.setStatus(dto.getStatus());
        }
        l.setComprovanteUrl(dto.getComprovanteUrl());

        LancamentoFinanceiro atualizado = lancamentoRepository.save(l);
        return toResponseDTO(atualizado);
    }

    @Transactional
    public void deletar(Long id) {
        if (!lancamentoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lançamento não encontrado com ID: " + id);
        }
        lancamentoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<OrcamentoMesDTO> obterResumoOrcamento() {
        List<OrcamentoMeta> metas = orcamentoMetaRepository.findAll();
        Map<String, List<OrcamentoMeta>> metasPorMes = metas.stream()
                .collect(Collectors.groupingBy(OrcamentoMeta::getMesReferencia));

        List<OrcamentoMesDTO> resultado = new ArrayList<>();
        metasPorMes.forEach((mes, itens) -> {
            BigDecimal totalPrevisto = itens.stream()
                    .map(OrcamentoMeta::getValorPrevisto)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalRealizado = itens.stream()
                    .map(OrcamentoMeta::getValorExecutado)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal diferenca = totalPrevisto.subtract(totalRealizado);

            resultado.add(OrcamentoMesDTO.builder()
                    .mesReferencia(mes)
                    .previsto(totalPrevisto)
                    .realizado(totalRealizado)
                    .diferenca(diferenca)
                    .build());
        });

        return resultado;
    }

    public LancamentoResponseDTO toResponseDTO(LancamentoFinanceiro l) {
        return LancamentoResponseDTO.builder()
                .id(l.getId())
                .tipo(l.getTipo())
                .descricao(l.getDescricao())
                .categoria(l.getCategoria())
                .valor(l.getValor())
                .dataVencimento(l.getDataVencimento())
                .dataPagamento(l.getDataPagamento())
                .formaPagamento(l.getFormaPagamento())
                .status(l.getStatus())
                .comprovanteUrl(l.getComprovanteUrl())
                .dataCriacao(l.getDataCriacao())
                .build();
    }
}
