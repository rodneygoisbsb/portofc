package br.com.portofc.repository;

import br.com.portofc.model.FolhaAula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolhaAulaRepository extends JpaRepository<FolhaAula, Long> {

    List<FolhaAula> findByMesReferencia(String mesReferencia);

    Optional<FolhaAula> findByColaboradorIdAndMesReferencia(Long colaboradorId, String mesReferencia);
}
