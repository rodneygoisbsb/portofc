package br.com.portofc.controller;

import br.com.portofc.dto.LancamentoRequestDTO;
import br.com.portofc.dto.LancamentoResponseDTO;
import br.com.portofc.dto.OrcamentoMesDTO;
import br.com.portofc.model.enums.StatusFinanceiro;
import br.com.portofc.model.enums.TipoLancamento;
import br.com.portofc.service.FinanceiroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financeiro")
@RequiredArgsConstructor
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    @GetMapping
    public ResponseEntity<List<LancamentoResponseDTO>> listarTodos(
            @RequestParam(required = false) TipoLancamento tipo,
            @RequestParam(required = false) StatusFinanceiro status,
            @RequestParam(required = false) String categoria) {
        return ResponseEntity.ok(financeiroService.listarTodos(tipo, status, categoria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LancamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(financeiroService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<LancamentoResponseDTO> criar(@Valid @RequestBody LancamentoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(financeiroService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LancamentoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody LancamentoRequestDTO dto) {
        return ResponseEntity.ok(financeiroService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        financeiroService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orcamento")
    public ResponseEntity<List<OrcamentoMesDTO>> obterResumoOrcamento() {
        return ResponseEntity.ok(financeiroService.obterResumoOrcamento());
    }
}
