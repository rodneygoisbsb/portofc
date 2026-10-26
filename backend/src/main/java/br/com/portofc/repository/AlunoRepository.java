package br.com.portofc.repository;

import br.com.portofc.model.Aluno;
import br.com.portofc.model.enums.CategoriaAluno;
import br.com.portofc.model.enums.StatusAluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    List<Aluno> findByCategoria(CategoriaAluno categoria);

    List<Aluno> findByStatus(StatusAluno status);

    List<Aluno> findByNomeContainingIgnoreCase(String nome);

    long countByStatus(StatusAluno status);
}
