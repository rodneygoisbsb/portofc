package br.com.portofc.repository;

import br.com.portofc.model.OrcamentoMeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrcamentoMetaRepository extends JpaRepository<OrcamentoMeta, Long> {

    List<OrcamentoMeta> findByMesReferencia(String mesReferencia);
}
