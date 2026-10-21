package br.com.portofc.controller;

import br.com.portofc.dto.EntregaUniformeRequestDTO;
import br.com.portofc.dto.MaterialDTO;
import br.com.portofc.dto.UniformeDTO;
import br.com.portofc.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materiais")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public ResponseEntity<List<MaterialDTO>> listarMateriais() {
        return ResponseEntity.ok(materialService.listarMateriais());
    }

    @PostMapping
    public ResponseEntity<MaterialDTO> salvarMaterial(@Valid @RequestBody MaterialDTO dto) {
        return ResponseEntity.ok(materialService.salvarMaterial(dto));
    }

    @GetMapping("/uniformes")
    public ResponseEntity<List<UniformeDTO>> listarUniformes() {
        return ResponseEntity.ok(materialService.listarUniformes());
    }

    @PostMapping("/uniformes/entrega")
    public ResponseEntity<UniformeDTO> entregarUniforme(@Valid @RequestBody EntregaUniformeRequestDTO dto) {
        return ResponseEntity.ok(materialService.entregarUniforme(dto));
    }
}
