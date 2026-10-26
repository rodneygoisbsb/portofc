package br.com.portofc.repository;

import br.com.portofc.model.LancamentoFinanceiro;
import br.com.portofc.model.enums.StatusFinanceiro;
import br.com.portofc.model.enums.TipoLancamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface LancamentoFinanceiroRepository extends JpaRepository<LancamentoFinanceiro, Long> {

    List<LancamentoFinanceiro> findByTipo(TipoLancamento tipo);

    List<LancamentoFinanceiro> findByStatus(StatusFinanceiro status);

    List<LancamentoFinanceiro> findByCategoria(String categoria);

    @Query("SELECT COALESCE(SUM(l.valor), 0) FROM LancamentoFinanceiro l WHERE l.tipo = :tipo AND l.status = :status")
    BigDecimal sumValorByTipoAndStatus(@Param("tipo") TipoLancamento tipo, @Param("status") StatusFinanceiro status);

    @Query("SELECT COALESCE(SUM(l.valor), 0) FROM LancamentoFinanceiro l WHERE l.tipo = :tipo")
    BigDecimal sumValorByTipo(@Param("tipo") TipoLancamento tipo);

    @Query("SELECT l.categoria, COALESCE(SUM(l.valor), 0) FROM LancamentoFinanceiro l WHERE l.tipo = 'SAIDA' GROUP BY l.categoria")
    List<Object[]> sumDespesasPorCategoria();
}
