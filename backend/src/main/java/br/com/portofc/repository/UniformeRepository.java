package br.com.portofc.repository;

import br.com.portofc.model.Uniforme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UniformeRepository extends JpaRepository<Uniforme, Long> {

    Optional<Uniforme> findByTamanho(String tamanho);
}
