package br.com.portofc.controller;

import br.com.portofc.dto.LoginRequestDTO;
import br.com.portofc.dto.LoginResponseDTO;
import br.com.portofc.model.Colaborador;
import br.com.portofc.repository.ColaboradorRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final ColaboradorRepository colaboradorRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();

        // 1. Contas especiais da Diretoria / Gestão
        if (email.contains("tainara")) {
            return ResponseEntity.ok(LoginResponseDTO.builder()
                    .token("pfc_jwt_" + UUID.randomUUID().toString().replace("-", ""))
                    .id(100L)
                    .nome("Tainara")
                    .email(email)
                    .cargo("Gestora Financeira & Prestação de Contas")
                    .perfil("GESTOR")
                    .fotoUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80")
                    .build());
        }

        if (email.contains("nayara")) {
            return ResponseEntity.ok(LoginResponseDTO.builder()
                    .token("pfc_jwt_" + UUID.randomUUID().toString().replace("-", ""))
                    .id(101L)
                    .nome("Nayara")
                    .email(email)
                    .cargo("Gerente Geral")
                    .perfil("ADMIN")
                    .fotoUrl("https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80")
                    .build());
        }

        // 2. Colaboradores / Professores cadastrados no Banco de Dados
        Optional<Colaborador> colaboradorOpt = colaboradorRepository.findAll().stream()
                .filter(c -> c.getEmail() != null && c.getEmail().equalsIgnoreCase(email))
                .findFirst();

        if (colaboradorOpt.isPresent()) {
            Colaborador c = colaboradorOpt.get();
            String perfil = c.getFuncao().toLowerCase().contains("professor") ? "PROFESSOR" : "GESTOR";

            return ResponseEntity.ok(LoginResponseDTO.builder()
                    .token("pfc_jwt_" + UUID.randomUUID().toString().replace("-", ""))
                    .id(c.getId())
                    .nome(c.getNome())
                    .email(c.getEmail())
                    .cargo(c.getFuncao())
                    .perfil(perfil)
                    .fotoUrl(c.getFotoUrl() != null ? c.getFotoUrl() : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80")
                    .build());
        }

        // 3. Fallback genérico para usuário administrativo
        return ResponseEntity.ok(LoginResponseDTO.builder()
                .token("pfc_jwt_" + UUID.randomUUID().toString().replace("-", ""))
                .id(999L)
                .nome(email.split("@")[0].toUpperCase())
                .email(email)
                .cargo("Administrador(a)")
                .perfil("ADMIN")
                .fotoUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80")
                .build());
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponseDTO> loginGoogle(@RequestBody LoginRequestDTO request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "usuario.google@portofc.org.br";

        return login(request);
    }
}
