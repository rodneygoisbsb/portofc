package br.com.portofc.repository;

import br.com.portofc.model.Frequencia;
import br.com.portofc.model.enums.CategoriaAluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FrequenciaRepository extends JpaRepository<Frequencia, Long> {

    List<Frequencia> findByCategoriaAndDataAula(CategoriaAluno categoria, LocalDate dataAula);

    List<Frequencia> findByAlunoId(Long alunoId);

    List<Frequencia> findByDataAulaBetween(LocalDate inicio, LocalDate fim);

    @Query("SELECT COUNT(f) FROM Frequencia f WHERE f.aluno.id = :alunoId AND f.presente = true")
    long countPresencasByAlunoId(@Param("alunoId") Long alunoId);

    @Query("SELECT COUNT(f) FROM Frequencia f WHERE f.aluno.id = :alunoId")
    long countTotalAulasByAlunoId(@Param("alunoId") Long alunoId);

    @Query("SELECT COUNT(f) FROM Frequencia f WHERE f.presente = true")
    long countPresencasTotais();

    @Query("SELECT COUNT(f) FROM Frequencia f")
    long countTotalAulasGerais();
}
