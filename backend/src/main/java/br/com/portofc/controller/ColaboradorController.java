package br.com.portofc.controller;

import br.com.portofc.dto.ColaboradorRequestDTO;
import br.com.portofc.dto.ColaboradorResponseDTO;
import br.com.portofc.service.ColaboradorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colaboradores")
@RequiredArgsConstructor
public class ColaboradorController {

    private final ColaboradorService colaboradorService;

    @GetMapping
    public ResponseEntity<List<ColaboradorResponseDTO>> listarTodos(@RequestParam(required = false) String busca) {
        return ResponseEntity.ok(colaboradorService.listarTodos(busca));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ColaboradorResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(colaboradorService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ColaboradorResponseDTO> criar(@Valid @RequestBody ColaboradorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(colaboradorService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ColaboradorResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ColaboradorRequestDTO dto) {
        return ResponseEntity.ok(colaboradorService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        colaboradorService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
