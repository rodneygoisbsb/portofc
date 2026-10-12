package br.com.portofc.controller;

import br.com.portofc.dto.FolhaAulaRequestDTO;
import br.com.portofc.dto.FolhaAulaResponseDTO;
import br.com.portofc.model.enums.StatusFolha;
import br.com.portofc.service.FolhaAulaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folha-aulas")
@RequiredArgsConstructor
public class FolhaAulaController {

    private final FolhaAulaService folhaAulaService;

    @GetMapping
    public ResponseEntity<List<FolhaAulaResponseDTO>> listarPorMes(
            @RequestParam(required = false) String mesReferencia) {
        return ResponseEntity.ok(folhaAulaService.listarPorMes(mesReferencia));
    }

    @PostMapping
    public ResponseEntity<FolhaAulaResponseDTO> salvar(@Valid @RequestBody FolhaAulaRequestDTO dto) {
        return ResponseEntity.ok(folhaAulaService.registrarOuAtualizarFolha(dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FolhaAulaResponseDTO> atualizarStatus(
            @PathVariable Long id,
            @RequestParam StatusFolha status) {
        return ResponseEntity.ok(folhaAulaService.atualizarStatus(id, status));
    }
}
