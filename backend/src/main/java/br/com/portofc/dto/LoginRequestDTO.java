package br.com.portofc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {
    @NotBlank(message = "O e-mail é obrigatório")
    private String email;

    private String senha;
    private String googleToken;
    private String provider; // 'LOCAL' ou 'GOOGLE'
}
