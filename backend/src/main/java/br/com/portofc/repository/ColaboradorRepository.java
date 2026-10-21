package br.com.portofc.repository;

import br.com.portofc.model.Colaborador;
import br.com.portofc.model.enums.StatusColaborador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {

    List<Colaborador> findByStatus(StatusColaborador status);

    List<Colaborador> findByNomeContainingIgnoreCase(String nome);
}
