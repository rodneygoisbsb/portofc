package br.com.portofc.controller;

import br.com.portofc.dto.ChamadaLoteRequestDTO;
import br.com.portofc.dto.FrequenciaEstatisticaDTO;
import br.com.portofc.model.Frequencia;
import br.com.portofc.model.enums.CategoriaAluno;
import br.com.portofc.service.FrequenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/frequencias")
@RequiredArgsConstructor
public class FrequenciaController {

    private final FrequenciaService frequenciaService;

    @PostMapping("/chamada")
    public ResponseEntity<List<Frequencia>> registrarChamada(@Valid @RequestBody ChamadaLoteRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(frequenciaService.registrarChamadaEmLote(dto));
    }

    @GetMapping
    public ResponseEntity<List<Frequencia>> listarPorCategoriaEData(
            @RequestParam CategoriaAluno categoria,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(frequenciaService.listarPorCategoriaEData(categoria, data));
    }

    @GetMapping("/estatisticas")
    public ResponseEntity<List<FrequenciaEstatisticaDTO>> obterEstatisticas(
            @RequestParam(required = false) CategoriaAluno categoria) {
        return ResponseEntity.ok(frequenciaService.obterEstatisticasPorCategoria(categoria));
    }
}
