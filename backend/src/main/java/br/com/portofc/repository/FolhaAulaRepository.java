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

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM FolhaAula f WHERE f.colaborador.id = :colaboradorId")
    void deleteByColaboradorId(@org.springframework.data.repository.query.Param("colaboradorId") Long colaboradorId);
}
