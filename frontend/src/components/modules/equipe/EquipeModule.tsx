import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  UserPlus,
  Mail,
  Phone,
  Cake,
  Calendar,
  Copy,
  Check,
  Edit,
  Trash2,
  Upload,
  User,
  Search,
  Filter,
  Bus,
  Sliders,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  Eye,
  ReceiptText,
  ExternalLink,
  Image as ImageIcon,
  Paperclip,
  Link as LinkIcon,
  FileText,
  CreditCard,
  ArrowUpRight,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { equipeService } from '../../../services/equipeService';
import { financeiroService } from '../../../services/financeiroService';
import { authService, SolicitacaoCadastro } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import { Colaborador, FolhaAula, FormaPagamento, StatusFolha, TipoContratacao, TetoConfig } from '../../../types';

interface ColaboradorFormData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  funcao: string;
  tipoContratacao: TipoContratacao;
  valorHora: string;
  salarioFixo: string;
  beneficios: string;
  status: 'ATIVO' | 'INATIVO';
  fotoUrl: string;
  dataNascimento: string;
  chavePix: string;
}

const initialFormState: ColaboradorFormData = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  funcao: 'Professor de Futebol',
  tipoContratacao: 'HORISTA',
  valorHora: '50.00',
  salarioFixo: '',
  beneficios: '200.00',
  status: 'ATIVO',
  fotoUrl: '',
  dataNascimento: '',
  chavePix: '',
};

interface FolhaEditFormData {
  horasRegistradas: string;
  modoPassagem: 'AUTO' | 'MANUAL';
  diasTransporte: string;
  valorDiarioTransporte: string;
  passagemManual: string;
  outrosBeneficios: string;
  descontos: string;
  status: StatusFolha;
  dataPagamento: string;
}

export const EquipeModule: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'colaboradores' | 'folha' | 'solicitacoes'>('folha');
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [folhas, setFolhas] = useState<FolhaAula[]>([]);
  const [loading, setLoading] = useState(true);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCadastro[]>(() => authService.getSolicitacoes());

  const solicitacoesPendentes = useMemo(() => {
    return solicitacoes.filter((s) => s.status === 'PENDENTE');
  }, [solicitacoes]);

  const handleAprovarSolicitacao = (id: number, nome: string) => {
    try {
      authService.aprovarSolicitacao(id, user?.nome || 'Tainara');
      setSolicitacoes(authService.getSolicitacoes());
      loadData();
      alert(`Acesso autorizado para "${nome}" com sucesso! Agora o colaborador já pode acessar a plataforma.`);
    } catch (e: any) {
      alert(e.message || 'Erro ao aprovar solicitação.');
    }
  };

  const handleRecusarSolicitacao = (id: number, nome: string) => {
    if (confirm(`Deseja realmente recusar a solicitação de acesso de "${nome}"?`)) {
      authService.recusarSolicitacao(id);
      setSolicitacoes(authService.getSolicitacoes());
    }
  };

  // Filtro de Mês de Referência da Folha (Único filtro em Equipe)
  const [selectedMes, setSelectedMes] = useState('2026-10');

  // Teto Orçamentário Mensal de Salários
  const [tetoConfig, setTetoConfig] = useState<TetoConfig>({
    total: 90000.0,
    anual: 180000.0,
    mensal: 15000.0,
    diario: 750.0,
    duracaoMeses: 6,
  });
  const [isTetoModalOpen, setIsTetoModalOpen] = useState(false);
  const [tetoForm, setTetoForm] = useState({
    mensal: '15000',
  });

  // Modal Edição da Folha & Cálculo de Passagem
  const [isEditFolhaModalOpen, setIsEditFolhaModalOpen] = useState(false);
  const [editingFolha, setEditingFolha] = useState<FolhaAula | null>(null);
  const [folhaForm, setFolhaForm] = useState<FolhaEditFormData>({
    horasRegistradas: '40',
    modoPassagem: 'AUTO',
    diasTransporte: '16',
    valorDiarioTransporte: '11.00',
    passagemManual: '176.00',
    outrosBeneficios: '74.00',
    descontos: '0',
    status: 'PENDENTE',
    dataPagamento: '',
  });

  // Modal Visualização de Detalhes da Folha
  const [isViewFolhaModalOpen, setIsViewFolhaModalOpen] = useState(false);
  const [viewingFolha, setViewingFolha] = useState<FolhaAula | null>(null);

  // Modal de Efetuar Pagamento de Salário & Baixa no Financeiro
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingFolha, setPayingFolha] = useState<FolhaAula | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    dataPagamento: new Date().toISOString().split('T')[0],
    formaPagamento: 'PIX' as FormaPagamento,
    comprovanteUrl: '',
    comprovanteNome: '',
    comprovanteTipo: 'ARQUIVO' as 'FOTO' | 'ARQUIVO' | 'URL',
    observacao: '',
  });
  const [payingLoading, setPayingLoading] = useState(false);
  const [copiedPayPix, setCopiedPayPix] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Modal de Recibo e Comprovante de Pagamento
  const [isPayReceiptModalOpen, setIsPayReceiptModalOpen] = useState(false);
  const [receiptFolha, setReceiptFolha] = useState<FolhaAula | null>(null);

  // Filtros da aba de Colaboradores
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOnlyBirthdays, setFilterOnlyBirthdays] = useState(false);
  const [isBirthdayAlertDismissed, setIsBirthdayAlertDismissed] = useState(false);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

  // Modal Colaborador (Criação e Edição)
  const [isColabModalOpen, setIsColabModalOpen] = useState(false);
  const [editingColab, setEditingColab] = useState<Colaborador | null>(null);
  const [colabForm, setColabForm] = useState<ColaboradorFormData>(initialFormState);

  useEffect(() => {
    loadData();
    loadTeto();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [colabs, folhaList] = await Promise.all([
        equipeService.listarColaboradores(),
        equipeService.listarFolhas(selectedMes),
      ]);
      setColaboradores(colabs);
      setFolhas(folhaList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTeto = async () => {
    try {
      const t = await equipeService.obterTetoOrcamentario();
      setTetoConfig(t);
      setTetoForm({
        mensal: String(t.mensal || 15000),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Cálculo de aniversário idêntico ao módulo de Alunos
  const getAniversarioInfo = (dataNascStr?: string) => {
    if (!dataNascStr) return null;
    const parts = dataNascStr.split('-');
    if (parts.length < 3) return null;
    const mes = parseInt(parts[1], 10) - 1;
    const dia = parseInt(parts[2], 10);

    const hoje = new Date();
    const hojeZerado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    let anivEsteAno = new Date(hoje.getFullYear(), mes, dia);
    if (anivEsteAno.getTime() < hojeZerado.getTime()) {
      anivEsteAno = new Date(hoje.getFullYear() + 1, mes, dia);
    }

    const diffMs = anivEsteAno.getTime() - hojeZerado.getTime();
    const diasFaltantes = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const diaFmt = String(dia).padStart(2, '0');
    const mesFmt = String(mes + 1).padStart(2, '0');
    const dataTexto = `${diaFmt}/${mesFmt}`;

    const isHoje = diasFaltantes === 0;
    const isPerto = diasFaltantes <= 5;

    let mensagem = '';
    if (isHoje) {
      mensagem = 'Aniversariante do Dia';
    } else if (diasFaltantes === 1) {
      mensagem = 'Aniversário Amanhã';
    } else if (diasFaltantes <= 5) {
      mensagem = `Aniversário em ${diasFaltantes} dias`;
    } else {
      mensagem = dataTexto;
    }

    return {
      diasFaltantes,
      dataTexto,
      isHoje,
      isPerto,
      mensagem,
    };
  };

  const aniversariantesProximos = useMemo(() => {
    return colaboradores
      .filter((colab) => {
        const info = getAniversarioInfo(colab.dataNascimento);
        return info && info.isPerto;
      })
      .sort((a, b) => {
        const infoA = getAniversarioInfo(a.dataNascimento);
        const infoB = getAniversarioInfo(b.dataNascimento);
        return (infoA?.diasFaltantes ?? 999) - (infoB?.diasFaltantes ?? 999);
      });
  }, [colaboradores]);

  const filteredColaboradores = useMemo(() => {
    return colaboradores.filter((colab) => {
      const matchSearch =
        searchTerm === '' ||
        colab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colab.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (colab.email && colab.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (colab.chavePix && colab.chavePix.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchBirthday = !filterOnlyBirthdays || getAniversarioInfo(colab.dataNascimento)?.isPerto;
      return matchSearch && matchBirthday;
    });
  }, [colaboradores, searchTerm, filterOnlyBirthdays]);

  // Cálculos consolidados da Folha de Pagamento do Mês Selecionado
  const folhasExibicao = useMemo(() => {
    return folhas.map((f) => {
      // Localiza o colaborador cadastrado para garantir sincronia total de fotos, cargos e vínculo
      const colabCadastrado = colaboradores.find((c) => c.id === f.colaboradorId);
      const isHorista = (colabCadastrado?.tipoContratacao || f.tipoContratacao) === 'HORISTA';

      const valorHora = isHorista
        ? (colabCadastrado?.valorHora || f.valorHora || 50.0)
        : (f.valorHora || 25.0);

      const nome = colabCadastrado?.nome || f.colaboradorNome;
      const funcao = colabCadastrado?.funcao || f.colaboradorFuncao;
      const fotoUrl = colabCadastrado?.fotoUrl || f.colaboradorFotoUrl;
      const tipoContratacao = colabCadastrado?.tipoContratacao || f.tipoContratacao || 'HORISTA';

      const diasTransporte = f.diasTransporte !== undefined ? f.diasTransporte : (isHorista ? 16 : 20);
      const valorDiarioTransporte = f.valorDiarioTransporte !== undefined ? f.valorDiarioTransporte : 11.0;
      const passagemMes = f.passagem !== undefined ? f.passagem : diasTransporte * valorDiarioTransporte;
      const outrosBeneficiosMes = f.outrosBeneficios !== undefined ? f.outrosBeneficios : Math.max(0, f.beneficios - passagemMes);
      const beneficiosMes = passagemMes + outrosBeneficiosMes;

      const totalBruto = isHorista ? f.horasRegistradas * valorHora : f.totalBruto;
      const liquidoPagar = totalBruto + beneficiosMes - f.descontos;

      return {
        ...f,
        colaboradorNome: nome,
        colaboradorFuncao: funcao,
        colaboradorFotoUrl: fotoUrl,
        tipoContratacao,
        valorHora,
        totalBruto,
        diasTransporte,
        valorDiarioTransporte,
        passagem: passagemMes,
        outrosBeneficios: outrosBeneficiosMes,
        beneficios: beneficiosMes,
        liquidoPagar,
      };
    });
  }, [folhas, colaboradores]);

  // Teto Orçamentário Mensal (referente ao mês selecionado)
  const tetoMensalAtivo = tetoConfig.mensal || 15000.0;

  const totalFolhaBruta = folhasExibicao.reduce((acc, f) => acc + f.totalBruto, 0);
  const totalFolhaLiquida = folhasExibicao.reduce((acc, f) => acc + f.liquidoPagar, 0);
  const totalFolhaPaga = folhasExibicao.filter((f) => f.status === 'PAGO').reduce((acc, f) => acc + f.liquidoPagar, 0);
  const totalPassagem = folhasExibicao.reduce((acc, f) => acc + (f.passagem || 0), 0);
  const folhasPagasCount = folhasExibicao.filter((f) => f.status === 'PAGO').length;

  // Percentual consumido do teto mensal no mês selecionado
  const percentualTetoConsumido = tetoMensalAtivo > 0 ? (totalFolhaLiquida / tetoMensalAtivo) * 100 : 0;
  const saldoLivreTeto = tetoMensalAtivo - totalFolhaLiquida;

  const handleToggleFolhaStatus = async (folha: FolhaAula) => {
    if (folha.status === 'PENDENTE') {
      handleOpenPayModal(folha);
    } else {
      handleOpenReceiptModal(folha);
    }
  };

  const handleOpenPayModal = (folha: FolhaAula) => {
    const baseFolha = folhas.find((f) => f.id === folha.id) || folha;
    setPayingFolha(baseFolha);
    setCopiedPayPix(false);
    setPaymentForm({
      dataPagamento: new Date().toISOString().split('T')[0],
      formaPagamento: (baseFolha.formaPagamento as FormaPagamento) || 'PIX',
      comprovanteUrl: baseFolha.comprovanteUrl || '',
      comprovanteNome: baseFolha.comprovanteNome || '',
      comprovanteTipo: baseFolha.comprovanteTipo || 'ARQUIVO',
      observacao: `Salário: ${baseFolha.colaboradorNome} (${baseFolha.colaboradorFuncao}) - ${formatMesNome(baseFolha.mesReferencia)}`,
    });
    setIsPayModalOpen(true);
  };

  const handleOpenReceiptModal = (folha: FolhaAula) => {
    const baseFolha = folhas.find((f) => f.id === folha.id) || folha;
    setReceiptFolha(baseFolha);
    setIsPayReceiptModalOpen(true);
  };

  const handlePhotoUploadPay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A foto deve ter no máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPaymentForm((prev) => ({
          ...prev,
          comprovanteUrl: reader.result as string,
          comprovanteNome: file.name,
          comprovanteTipo: 'FOTO',
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUploadPay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPaymentForm((prev) => ({
          ...prev,
          comprovanteUrl: reader.result as string,
          comprovanteNome: file.name,
          comprovanteTipo: file.type.startsWith('image/') ? 'FOTO' : 'ARQUIVO',
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFolha) return;

    try {
      setPayingLoading(true);

      const colab = colaboradores.find((c) => c.id === payingFolha.colaboradorId);
      const nomeColab = colab?.nome || payingFolha.colaboradorNome;
      const funcaoColab = colab?.funcao || payingFolha.colaboradorFuncao;

      // 1. Lança automaticamente a saída no Financeiro com categoria SALARIOS
      const novoLancamento = await financeiroService.salvarLancamento({
        tipo: 'SAIDA',
        categoria: 'SALARIOS',
        descricao: paymentForm.observacao || `Salário: ${nomeColab} (${funcaoColab}) - ${formatMesNome(payingFolha.mesReferencia)}`,
        valor: payingFolha.liquidoPagar,
        dataVencimento: paymentForm.dataPagamento,
        dataPagamento: paymentForm.dataPagamento,
        formaPagamento: paymentForm.formaPagamento,
        status: 'PAGO',
        comprovanteUrl: paymentForm.comprovanteUrl,
        comprovanteNome: paymentForm.comprovanteNome,
        comprovanteTipo: paymentForm.comprovanteTipo,
        colaboradorId: payingFolha.colaboradorId,
        folhaId: payingFolha.id,
      });

      // 2. Atualiza a folha de pagamento para PAGO vinculando o lançamento financeiro
      await equipeService.atualizarStatusFolha(payingFolha.id, 'PAGO', {
        dataPagamento: paymentForm.dataPagamento,
        formaPagamento: paymentForm.formaPagamento,
        comprovanteUrl: paymentForm.comprovanteUrl,
        comprovanteNome: paymentForm.comprovanteNome,
        comprovanteTipo: paymentForm.comprovanteTipo,
        lancamentoFinanceiroId: novoLancamento.id,
      });

      // 3. Recarrega os dados atualizados
      await loadData();

      setIsPayModalOpen(false);
      setPaymentSuccessMsg(
        `Pagamento de ${formatBRL(payingFolha.liquidoPagar)} para ${nomeColab} realizado e lançado no Financeiro!`
      );
      setTimeout(() => setPaymentSuccessMsg(null), 6000);
    } catch (err) {
      console.error('Erro ao efetuar pagamento', err);
      alert('Erro ao registrar o pagamento.');
    } finally {
      setPayingLoading(false);
    }
  };

  const handleEstornarPayment = async (folha: FolhaAula) => {
    if (
      !confirm(
        `Deseja realmente estornar o pagamento de "${folha.colaboradorNome}"? Esta ação reverterá o status da folha para PENDENTE e excluirá a saída lançada no Financeiro.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      if (folha.lancamentoFinanceiroId) {
        await financeiroService.deletarLancamento(folha.lancamentoFinanceiroId);
      }
      await equipeService.atualizarStatusFolha(folha.id, 'PENDENTE');
      await loadData();
      setIsPayReceiptModalOpen(false);
      setIsViewFolhaModalOpen(false);
      setPaymentSuccessMsg(`Pagamento de "${folha.colaboradorNome}" estornado com sucesso.`);
      setTimeout(() => setPaymentSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Erro ao estornar pagamento', err);
      alert('Erro ao estornar o pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditFolhaModal = (folha: FolhaAula) => {
    // Busca a folha original mensal cadastrada para não herdar multiplicações de projeção da tabela
    const baseFolha = folhas.find((f) => f.id === folha.id) || folha;
    setEditingFolha(baseFolha);
    const dias = baseFolha.diasTransporte !== undefined ? String(baseFolha.diasTransporte) : '16';
    const tarifa = baseFolha.valorDiarioTransporte !== undefined ? String(baseFolha.valorDiarioTransporte) : '11.00';
    const passagem = baseFolha.passagem !== undefined ? String(baseFolha.passagem) : '176.00';
    const outros = baseFolha.outrosBeneficios !== undefined ? String(baseFolha.outrosBeneficios) : '74.00';

    setFolhaForm({
      horasRegistradas: String(baseFolha.horasRegistradas || 40),
      modoPassagem: 'AUTO',
      diasTransporte: dias,
      valorDiarioTransporte: tarifa,
      passagemManual: passagem,
      outrosBeneficios: outros,
      descontos: String(baseFolha.descontos || 0),
      status: baseFolha.status || 'PENDENTE',
      dataPagamento: baseFolha.dataPagamento || '',
    });
    setIsEditFolhaModalOpen(true);
  };

  const handleOpenViewFolhaModal = (folha: FolhaAula) => {
    setViewingFolha(folha);
    setIsViewFolhaModalOpen(true);
  };

  const handleSaveFolha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolha) return;

    const horasNum = parseFloat(folhaForm.horasRegistradas.replace(',', '.')) || 0;
    const isHorista = editingFolha.tipoContratacao === 'HORISTA';
    const valorHoraNum = editingFolha.valorHora || 50;

    const totalBrutoCalculado = isHorista
      ? horasNum * valorHoraNum
      : (editingFolha.totalBruto || 4500.0);

    let passagemCalculada = 0;
    let diasTransporteNum = 0;
    let valorDiarioNum = 11.0;

    if (folhaForm.modoPassagem === 'AUTO') {
      diasTransporteNum = parseInt(folhaForm.diasTransporte, 10) || 0;
      valorDiarioNum = parseFloat(folhaForm.valorDiarioTransporte.replace(',', '.')) || 0;
      passagemCalculada = diasTransporteNum * valorDiarioNum;
    } else {
      passagemCalculada = parseFloat(folhaForm.passagemManual.replace(',', '.')) || 0;
      valorDiarioNum = 11.0;
      diasTransporteNum = valorDiarioNum > 0 ? Math.round(passagemCalculada / valorDiarioNum) : 0;
    }

    const outrosBenNum = parseFloat(folhaForm.outrosBeneficios.replace(',', '.')) || 0;
    const totalBeneficios = passagemCalculada + outrosBenNum;
    const descontosNum = parseFloat(folhaForm.descontos.replace(',', '.')) || 0;
    const liquidoCalculado = totalBrutoCalculado + totalBeneficios - descontosNum;

    await equipeService.salvarFolha({
      id: editingFolha.id,
      colaboradorId: editingFolha.colaboradorId,
      mesReferencia: editingFolha.mesReferencia || selectedMes,
      horasRegistradas: horasNum,
      valorHora: valorHoraNum,
      totalBruto: totalBrutoCalculado,
      diasTransporte: diasTransporteNum,
      valorDiarioTransporte: valorDiarioNum,
      passagem: passagemCalculada,
      outrosBeneficios: outrosBenNum,
      beneficios: totalBeneficios,
      descontos: descontosNum,
      liquidoPagar: liquidoCalculado,
      status: folhaForm.status,
      dataPagamento: folhaForm.status === 'PAGO' ? folhaForm.dataPagamento || new Date().toISOString().split('T')[0] : undefined,
    });

    setIsEditFolhaModalOpen(false);
    loadData();
  };

  const handleOpenTetoModal = () => {
    setTetoForm({
      mensal: String(tetoConfig.mensal || 15000),
    });
    setIsTetoModalOpen(true);
  };

  const handleSaveTeto = async (e: React.FormEvent) => {
    e.preventDefault();
    const mensalVal = parseFloat(tetoForm.mensal.replace(',', '.')) || 0;
    const updated: TetoConfig = {
      ...tetoConfig,
      mensal: mensalVal,
      total: mensalVal * (tetoConfig.duracaoMeses || 6),
      anual: mensalVal * 12,
      diario: Math.round((mensalVal / 20) * 100) / 100,
    };
    await equipeService.atualizarTetoOrcamentario(updated);
    setTetoConfig(updated);
    setIsTetoModalOpen(false);
  };

  const handleOpenCreateModal = () => {
    setEditingColab(null);
    setColabForm({ ...initialFormState });
    setIsColabModalOpen(true);
  };

  const handleOpenEditModal = (colab: Colaborador) => {
    setEditingColab(colab);
    setColabForm({
      nome: colab.nome || '',
      cpf: colab.cpf || '',
      email: colab.email || '',
      telefone: colab.telefone || '',
      funcao: colab.funcao || '',
      tipoContratacao: colab.tipoContratacao || 'HORISTA',
      valorHora: colab.valorHora !== undefined && colab.valorHora !== null ? String(colab.valorHora) : '',
      salarioFixo: colab.salarioFixo !== undefined && colab.salarioFixo !== null ? String(colab.salarioFixo) : '',
      beneficios: colab.beneficios !== undefined && colab.beneficios !== null ? String(colab.beneficios) : '0',
      status: colab.status || 'ATIVO',
      fotoUrl: colab.fotoUrl || '',
      dataNascimento: colab.dataNascimento || '',
      chavePix: colab.chavePix || '',
    });
    setIsColabModalOpen(true);
  };

  const handleDeleteColaborador = async (colab: Colaborador) => {
    if (confirm(`Tem certeza que deseja excluir o colaborador "${colab.nome}"? Esta ação removerá o profissional do cadastro.`)) {
      try {
        await equipeService.deletarColaborador(colab.id);
        loadData();
      } catch (err) {
        console.error('Erro ao excluir colaborador', err);
        alert('Não foi possível excluir o colaborador.');
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setColabForm((prev) => ({ ...prev, fotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyPix = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setCopiedPixId(chave);
    setTimeout(() => {
      setCopiedPixId(null);
    }, 2000);
  };

  const handleSaveColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colabForm.nome.trim()) {
      alert('O Nome Completo é obrigatório.');
      return;
    }

    const valorHoraNum = colabForm.tipoContratacao === 'HORISTA'
      ? (colabForm.valorHora.trim() === '' ? 0 : parseFloat(colabForm.valorHora.replace(',', '.')) || 0)
      : undefined;

    const salarioFixoNum = colabForm.tipoContratacao === 'MENSALISTA'
      ? (colabForm.salarioFixo.trim() === '' ? 0 : parseFloat(colabForm.salarioFixo.replace(',', '.')) || 0)
      : undefined;

    const beneficiosNum = colabForm.beneficios.trim() === '' ? 0 : parseFloat(colabForm.beneficios.replace(',', '.')) || 0;

    await equipeService.salvarColaborador({
      ...(editingColab ? { id: editingColab.id } : {}),
      nome: colabForm.nome.trim(),
      cpf: colabForm.cpf.trim() || undefined,
      email: colabForm.email.trim() || undefined,
      telefone: colabForm.telefone.trim() || undefined,
      funcao: colabForm.funcao.trim(),
      tipoContratacao: colabForm.tipoContratacao,
      valorHora: valorHoraNum,
      salarioFixo: salarioFixoNum,
      beneficios: beneficiosNum,
      status: colabForm.status,
      dataNascimento: colabForm.dataNascimento || undefined,
      chavePix: colabForm.chavePix.trim() || undefined,
      fotoUrl:
        colabForm.fotoUrl ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    setIsColabModalOpen(false);
    loadData();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatMesNome = (mesStr: string) => {
    if (!mesStr) return '';
    const parts = mesStr.split('-');
    if (parts.length < 2) return mesStr;
    const nomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const idx = parseInt(parts[1], 10) - 1;
    return `${nomes[idx] || parts[1]} de ${parts[0]}`;
  };

  const formatarData = (dataStr?: string) => {
    if (!dataStr) return 'Não informado';
    const parts = dataStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dataStr;
  };

  // Cálculos dinâmicos em tempo real dentro do modal de edição da folha
  const modalCalculos = useMemo(() => {
    const horasNum = parseFloat(folhaForm.horasRegistradas.replace(',', '.')) || 0;
    const isHorista = editingFolha?.tipoContratacao === 'HORISTA';
    const valorHoraNum = editingFolha?.valorHora || 50;

    const totalBruto = isHorista ? horasNum * valorHoraNum : (editingFolha?.totalBruto || 4500.0);

    let passagem = 0;
    if (folhaForm.modoPassagem === 'AUTO') {
      const dias = parseInt(folhaForm.diasTransporte, 10) || 0;
      const tarifa = parseFloat(folhaForm.valorDiarioTransporte.replace(',', '.')) || 0;
      passagem = dias * tarifa;
    } else {
      passagem = parseFloat(folhaForm.passagemManual.replace(',', '.')) || 0;
    }

    const outros = parseFloat(folhaForm.outrosBeneficios.replace(',', '.')) || 0;
    const totalBeneficios = passagem + outros;
    const descontos = parseFloat(folhaForm.descontos.replace(',', '.')) || 0;
    const liquido = totalBruto + totalBeneficios - descontos;

    return {
      totalBruto,
      passagem,
      outros,
      totalBeneficios,
      descontos,
      liquido,
    };
  }, [folhaForm, editingFolha]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Equipe</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestão dos colaboradores e controle financeiro.
          </p>
        </div>
        <Button variant="emerald" icon={<UserPlus size={18} />} onClick={handleOpenCreateModal}>
          Novo Colaborador
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('folha')}
          className={`pb-3 px-4 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'folha'
            ? 'border-blue-700 text-blue-700'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <DollarSign size={17} />
          Folha de Pagamento
        </button>
        <button
          onClick={() => setActiveTab('colaboradores')}
          className={`pb-3 px-4 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'colaboradores'
            ? 'border-blue-700 text-blue-700'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Briefcase size={17} />
          <span>Colaboradores</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
            {colaboradores.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('solicitacoes')}
          className={`pb-3 px-4 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'solicitacoes'
            ? 'border-blue-700 text-blue-700'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <UserCheck size={17} />
          <span>Aprovações de Cadastro</span>
          {solicitacoesPendentes.length > 0 ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold animate-pulse">
              {solicitacoesPendentes.length} {solicitacoesPendentes.length === 1 ? 'pendente' : 'pendentes'}
            </span>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              0
            </span>
          )}
        </button>
      </div>

      {/* Alerta Discreto de Aniversários Próximos */}
      {aniversariantesProximos.length > 0 && !isBirthdayAlertDismissed && (
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl px-3.5 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 rounded-md bg-amber-100 text-amber-700 shrink-0">
              <Cake size={13} />
            </span>
            <span className="font-semibold text-amber-950 shrink-0">Aniversários Próximos:</span>
            <span className="text-amber-800">
              {aniversariantesProximos.length === 1
                ? '1 colaborador faz aniversário nos próximos 5 dias'
                : `${aniversariantesProximos.length} colaboradores fazem aniversário nos próximos 5 dias`}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('colaboradores');
                setFilterOnlyBirthdays(!filterOnlyBirthdays);
              }}
              className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-white hover:bg-amber-100/50 border border-amber-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {filterOnlyBirthdays && activeTab === 'colaboradores' ? 'Ver todos' : 'Filtrar'}
            </button>
            <button
              type="button"
              onClick={() => setIsBirthdayAlertDismissed(true)}
              className="p-1 text-amber-500 hover:text-amber-800 rounded-md hover:bg-amber-100/60 transition-colors cursor-pointer"
              title="Dispensar aviso"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'folha' ? (
        <div className="space-y-6">
          {/* Barra de Filtro de Mês de Referência (Único filtro em Folha de Pagamento) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={15} className="text-blue-600" /> Mês de Referência:
              </span>
              <select
                value={selectedMes}
                onChange={(e) => {
                  setSelectedMes(e.target.value);
                  equipeService.listarFolhas(e.target.value).then(setFolhas);
                }}
                className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-600/30 cursor-pointer shadow-2xs hover:bg-slate-100 transition-colors"
              >
                <option value="2026-10">Outubro / 2026</option>
                <option value="2026-09">Setembro / 2026</option>
                <option value="2026-08">Agosto / 2026</option>
                <option value="2026-07">Julho / 2026</option>
                <option value="2026-06">Junho / 2026</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Estatísticas e pagamentos dos colaboradores consolidados do mês
            </div>
          </div>

          {/* 4 Cards de Métricas e Teto Orçamentário Referentes ao Mês Selecionado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Teto Mensal */}
            <Card className="p-4 border-blue-200/80 bg-gradient-to-br from-white to-blue-50/20 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md truncate">
                    Teto Mensal
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenTetoModal}
                    className="text-[11px] text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer bg-white hover:bg-blue-50 px-2 py-0.5 rounded-lg transition-all border border-blue-200/70 shrink-0"
                    title="Ajustar teto orçamentário mensal"
                  >
                    <Sliders size={11} className="text-blue-600" /> Ajustar Teto
                  </button>
                </div>

                <div className="mt-2.5">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {formatBRL(tetoMensalAtivo)}
                  </h3>
                </div>

                {/* Barra de Progresso Compacta */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium truncate">Gasto: {formatBRL(totalFolhaLiquida)}</span>
                    <span
                      className={`font-bold text-[10px] px-1.5 py-0.2 rounded shrink-0 ${
                        percentualTetoConsumido > 100
                          ? 'text-rose-700 bg-rose-50'
                          : percentualTetoConsumido > 85
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-emerald-700 bg-emerald-50'
                      }`}
                    >
                      {Math.round(percentualTetoConsumido)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentualTetoConsumido > 100
                          ? 'bg-rose-500'
                          : percentualTetoConsumido > 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percentualTetoConsumido)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <p className="text-[11px] truncate">
                  {saldoLivreTeto >= 0 ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 truncate">
                      <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                      Saldo disponível: {formatBRL(saldoLivreTeto)}
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center gap-1 truncate">
                      <AlertCircle size={13} className="text-rose-600 shrink-0" />
                      Teto excedido em {formatBRL(Math.abs(saldoLivreTeto))}
                    </span>
                  )}
                </p>
              </div>
            </Card>

            {/* Card 2: Total Bruto (Mês) */}
            <Card className="p-4 hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Bruto (Mês)
                  </span>
                  <span className="p-1.5 bg-slate-50 text-slate-500 rounded-lg">
                    <Briefcase size={14} />
                  </span>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{formatBRL(totalFolhaBruta)}</h3>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 truncate">Horas e vencimentos contratuais</p>
              </div>
            </Card>

            {/* Card 3: Total Líquido (Mês) */}
            <Card className="p-4 hover:border-blue-200 transition-all flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Líquido a Pagar
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-blue-100/70">
                    <Bus size={11} /> {formatBRL(totalPassagem)}
                  </span>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xl font-bold text-blue-700 tracking-tight">{formatBRL(totalFolhaLiquida)}</h3>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 truncate">Líquido a ser transferido no mês</p>
              </div>
            </Card>

            {/* Card 4: Efetivamente Pago */}
            <Card className="p-4 hover:border-emerald-200 transition-all flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Efetivamente Pago
                  </span>
                  <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <CheckCircle2 size={14} />
                  </span>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xl font-bold text-emerald-700 tracking-tight">{formatBRL(totalFolhaPaga)}</h3>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <p className="text-[11px] text-emerald-700 font-medium truncate">
                  {folhasPagasCount} de {folhasExibicao.length} colaboradores pagos
                </p>
              </div>
            </Card>
          </div>

          {/* Mensagem de Feedback de Pagamento / Baixa */}
          {paymentSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between gap-2 text-xs font-medium animate-in fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{paymentSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setPaymentSuccessMsg(null)}
                className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Tabela de Apuração da Folha Compacta e Otimizada */}
          <Card noPadding className="border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[620px] overflow-y-auto relative scrollbar-thin">
              <table className="w-full text-sm text-slate-600 border-separate border-spacing-0">
                <thead className="sticky top-0 z-20 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-2xs">
                  <tr>
                    <th className="py-4 px-6 text-left sticky top-0 bg-slate-50 z-20 border-b border-slate-200 font-semibold w-[30%]">
                      Nome / Profissional
                    </th>
                    <th className="py-4 px-4 text-center sticky top-0 bg-slate-50 z-20 border-b border-slate-200 font-semibold w-[10%]">
                      Horas
                    </th>
                    <th className="py-4 px-4 text-center sticky top-0 bg-slate-50 z-20 border-b border-slate-200 font-semibold w-[12%]">
                      Total Bruto
                    </th>
                    <th className="py-4 px-4 text-center sticky top-0 bg-slate-50 z-20 border-b border-slate-200 font-semibold w-[14%]">
                      Benefícios / Descontos
                    </th>
                    <th className="py-4 px-4 text-center sticky top-0 bg-slate-50 z-20 border-b border-slate-200 font-semibold w-[13%]">
                      Líquido a Pagar
                    </th>
                    <th className="py-4 px-4 text-center sticky top-0 bg-slate-50 z-20 border-b border-slate-200 font-semibold w-[10%]">
                      Status
                    </th>
                    <th className="py-4 px-6 text-center sticky top-0 bg-slate-50 z-20 border-b border-slate-200 font-semibold w-[11%]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {folhasExibicao.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Coluna Nome / Profissional espaçosa */}
                      <td className="py-4 px-6 text-left border-b border-slate-100">
                        <div
                          className="flex items-center gap-3.5 cursor-pointer group"
                          onClick={() => handleOpenViewFolhaModal(item)}
                          title="Clique para ver os detalhes da folha"
                        >
                          <img
                            src={item.colaboradorFotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                            alt={item.colaboradorNome}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 shrink-0 group-hover:ring-blue-300 transition-all"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors text-sm">
                              {item.colaboradorNome}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-xs text-slate-500 font-normal">{item.colaboradorFuncao}</span>
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${item.tipoContratacao === 'HORISTA'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                                  }`}
                              >
                                {item.tipoContratacao === 'HORISTA' ? 'Horista' : 'Mensalista'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Horas */}
                      <td className="py-4 px-4 text-center font-semibold text-slate-800 border-b border-slate-100">
                        {item.horasRegistradas}h
                      </td>

                      {/* Total Bruto */}
                      <td className="py-4 px-4 text-center font-semibold text-slate-800 border-b border-slate-100">
                        {formatBRL(item.totalBruto)}
                      </td>

                      {/* Benefícios / Descontos */}
                      <td className="py-4 px-4 text-center text-xs border-b border-slate-100">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-emerald-600 font-semibold">+{formatBRL(item.beneficios)}</span>
                          <span className="text-rose-600 font-semibold">-{formatBRL(item.descontos)}</span>
                        </div>
                      </td>

                      {/* Líquido a Pagar */}
                      <td className="py-4 px-4 text-center font-bold text-slate-900 text-sm border-b border-slate-100">
                        {formatBRL(item.liquidoPagar)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center border-b border-slate-100">
                        {item.status === 'PAGO' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenReceiptModal(item)}
                            className="inline-flex flex-col items-center group cursor-pointer"
                            title="Clique para ver o recibo e comprovante"
                          >
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 group-hover:bg-emerald-100 transition-colors">
                              <CheckCircle size={13} />
                              Pago
                            </span>
                            {item.dataPagamento && (
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {formatarData(item.dataPagamento)}
                              </span>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenPayModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
                            title="Pendente - Clique para efetuar o pagamento"
                          >
                            <Clock size={13} />
                            Pendente
                          </button>
                        )}
                      </td>

                      {/* Ações: Pagar / Recibo, Detalhes e Editar */}
                      <td className="py-4 px-6 text-center border-b border-slate-100">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status === 'PENDENTE' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenPayModal(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs hover:shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                              title="Efetuar pagamento e dar baixa no Financeiro"
                            >
                              <DollarSign size={13} />
                              Pagar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenReceiptModal(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                              title="Ver recibo e comprovante de pagamento"
                            >
                              <ReceiptText size={13} className="text-emerald-600" />
                              Recibo
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenViewFolhaModal(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer border border-slate-200/80"
                            title="Visualizar todos os detalhes da folha"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditFolhaModal(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer border border-slate-200/80"
                            title="Editar dados da folha"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : activeTab === 'colaboradores' ? (
        /* Aba Corpo Docente & Administrativo */
        <div className="space-y-4">
          {/* Barra de Filtro e Busca */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, função, email ou PIX..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {filterOnlyBirthdays && (
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Cake size={13} className="text-amber-600" /> Filtrando Aniversariantes
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">
                Total: <b>{filteredColaboradores.length}</b> {filteredColaboradores.length === 1 ? 'membro' : 'membros'}
              </span>
            </div>
          </div>

          {/* Grid de Cards de Colaboradores */}
          {filteredColaboradores.length === 0 ? (
            <Card className="text-center py-12">
              <User size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Nenhum colaborador encontrado</p>
              <p className="text-xs text-slate-400 mt-1">Tente ajustar seus termos de busca ou desativar os filtros.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredColaboradores.map((c) => {
                const anivInfo = getAniversarioInfo(c.dataNascimento);

                return (
                  <Card key={c.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      {/* Topo do Card: Foto, Status e Badge de Contratação */}
                      <div className="flex items-start justify-between gap-2">
                        <img
                          src={c.fotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                          alt={c.nome}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs shrink-0"
                        />
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge variant={c.status === 'ATIVO' ? 'success' : 'neutral'}>{c.status}</Badge>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-md border ${c.tipoContratacao === 'HORISTA'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                          >
                            {c.tipoContratacao === 'HORISTA' ? 'Horista' : 'Mensalista'}
                          </span>
                        </div>
                      </div>

                      {/* Nome e Tag de Aniversário */}
                      <div className="mt-3">
                        <h4 className="font-bold text-slate-900 leading-snug text-base">{c.nome}</h4>
                        {anivInfo?.isPerto && (
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${anivInfo.isHoje
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              title={`Aniversário: ${anivInfo.dataTexto}`}
                            >
                              <Cake size={11} className="text-amber-600 shrink-0" />
                              <span>{anivInfo.mensagem}</span>
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-blue-700 font-medium mt-1 leading-tight">{c.funcao}</p>
                      </div>

                      {/* Informações de Contato e Cadastro */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                        <p className="flex items-center gap-2 truncate" title={c.email || 'Não informado'}>
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{c.email || 'Não informado'}</span>
                        </p>

                        <p className="flex items-center gap-2">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span>{c.telefone || 'Não informado'}</span>
                        </p>

                        <p className="flex items-center gap-2">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>Nascimento: <b>{c.dataNascimento ? formatarData(c.dataNascimento) : 'Não informada'}</b></span>
                        </p>

                        {/* Chave PIX com botão rápido de cópia */}
                        {c.chavePix && (
                          <div className="mt-2 bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 block">
                                Chave PIX (Pagamentos)
                              </span>
                              <span className="text-xs font-mono font-medium text-slate-800 truncate block" title={c.chavePix}>
                                {c.chavePix}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyPix(c.chavePix!)}
                              title="Copiar Chave PIX"
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
                            >
                              {copiedPixId === c.chavePix ? (
                                <Check size={14} className="text-emerald-600" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rodapé: Tipo de Contratação, Remuneração e Ações */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-slate-400 font-medium">
                          {c.tipoContratacao === 'HORISTA' ? 'Valor / Hora' : 'Salário Fixo'}
                        </span>
                        <span className="font-bold text-slate-800">
                          {c.tipoContratacao === 'HORISTA'
                            ? `${formatBRL(c.valorHora || 50)}/h`
                            : `${formatBRL(c.salarioFixo || 4500)} fixo`}
                        </span>
                      </div>

                      {/* Botões de Ação: Editar e Excluir */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(c)}
                          className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit size={13} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteColaborador(c)}
                          className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200/70 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Excluir Colaborador"
                        >
                          <Trash2 size={13} />
                          <span className="hidden sm:inline">Excluir</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Aba de Aprovações de Cadastro */
        <div className="space-y-6">
          {/* Banner Informativo */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md border border-blue-800/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 ring-4 ring-blue-500/10">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Controle de Acessos & Autorização de Cadastros</h3>
                  <p className="text-xs text-blue-200/90 mt-0.5 max-w-xl leading-relaxed">
                    Painel exclusivo de autorização da diretoria (<strong>Tainara</strong> & <strong>Nayara</strong>). Novos colaboradores que solicitam cadastro no site ficam retidos até receberem sua autorização oficial.
                  </p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-blue-800/50 border border-blue-700/60 text-xs font-semibold text-blue-200 shrink-0 self-start sm:self-auto">
                {solicitacoesPendentes.length} {solicitacoesPendentes.length === 1 ? 'pendência aguardando' : 'pendências aguardando'}
              </div>
            </div>
          </div>

          {/* Lista de Solicitações Pendentes */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <span>Solicitações Pendentes de Avaliação</span>
            </h4>

            {solicitacoesPendentes.length === 0 ? (
              <Card className="text-center py-12 bg-white/70">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3 ring-8 ring-emerald-50/50">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-base font-bold text-slate-800">Tudo em dia!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Não há novas solicitações de cadastro pendentes. Todos os colaboradores estão devidamente autorizados.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {solicitacoesPendentes.map((sol) => (
                  <Card key={sol.id} className="p-5 border-amber-200/70 bg-gradient-to-br from-white to-amber-50/20 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-xs">
                          {sol.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{sol.nome}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Mail size={13} className="text-slate-400" />
                            <span>{sol.email}</span>
                          </p>
                        </div>
                      </div>
                      <Badge variant="warning">Aguardando</Badge>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 font-medium block text-[10px] uppercase">Função Solicitada</span>
                        <span className="font-semibold text-slate-800">{sol.cargo}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 font-medium block text-[10px] uppercase">Data do Pedido</span>
                        <span className="font-medium text-slate-600">
                          {new Date(sol.dataSolicitacao).toLocaleDateString('pt-BR')} às {new Date(sol.dataSolicitacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAprovarSolicitacao(sol.id, sol.nome)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle size={15} />
                        <span>Autorizar Acesso</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRecusarSolicitacao(sol.id, sol.nome)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X size={15} />
                        <span>Recusar</span>
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de Solicitações Já Avaliadas */}
          {solicitacoes.some(s => s.status !== 'PENDENTE') && (
            <div className="mt-8 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Histórico Recente de Cadastros
              </h4>
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Nome & E-mail</th>
                      <th className="py-3 px-4">Cargo</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Data da Avaliação</th>
                      <th className="py-3 px-4">Aprovado Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {solicitacoes.filter(s => s.status !== 'PENDENTE').map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {item.nome}
                          <span className="block text-[11px] font-normal text-slate-400">{item.email}</span>
                        </td>
                        <td className="py-3 px-4">{item.cargo}</td>
                        <td className="py-3 px-4">
                          <Badge variant={item.status === 'APROVADO' ? 'success' : 'danger'}>
                            {item.status === 'APROVADO' ? 'Autorizado' : 'Recusado'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {item.dataAprovacao ? new Date(item.dataAprovacao).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {item.aprovadoPor || 'Diretoria'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalhes da Folha de Pagamento (Somente Leitura) */}
      <Modal
        isOpen={isViewFolhaModalOpen}
        onClose={() => setIsViewFolhaModalOpen(false)}
        title="Detalhamento da Folha de Pagamento"
        description="Ficha completa de proventos, benefícios e remuneração do colaborador."
        maxWidth="lg"
      >
        {viewingFolha && (() => {
          const colabInfo = colaboradores.find((c) => c.id === viewingFolha.colaboradorId);
          const periodoDescricao = `Mês de Referência: ${formatMesNome(viewingFolha.mesReferencia || selectedMes)}`;

          return (
            <div className="space-y-5">
              {/* Cabeçalho do Colaborador */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={
                    viewingFolha.colaboradorFotoUrl ||
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
                  }
                  alt={viewingFolha.colaboradorNome}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-600/20 shadow-xs shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{viewingFolha.colaboradorNome}</h3>
                    <Badge variant={viewingFolha.status === 'PAGO' ? 'success' : 'warning'}>
                      {viewingFolha.status === 'PAGO' ? 'PAGO' : 'PENDENTE'}
                    </Badge>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${viewingFolha.tipoContratacao === 'HORISTA'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                    >
                      {viewingFolha.tipoContratacao === 'HORISTA' ? 'Horista' : 'Mensalista'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {viewingFolha.colaboradorFuncao} • Equipe Porto FC
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200/60 font-medium">
                    <Filter size={12} className="text-blue-600" />
                    <span>Visão atual selecionada: <strong>{periodoDescricao}</strong></span>
                  </div>
                </div>
              </div>

              {/* Informações Cadastrais e de Contato do Colaborador (se houver) */}
              {colabInfo && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Email
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate select-all">
                      {colabInfo.email || 'Não informado'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Telefone
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate select-all">
                      {colabInfo.telefone || 'Não informado'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Chave PIX
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate select-all">
                      {colabInfo.chavePix || 'Não informada'}
                    </p>
                  </div>
                </div>
              )}

              {/* Blocos de Detalhes da Folha */}
              <div className="space-y-4">
                {/* 1. Proventos e Horas */}
                <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-500" />
                    Remuneração Base
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Horas
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {viewingFolha.horasRegistradas}h
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {viewingFolha.tipoContratacao === 'HORISTA' ? 'Valor por Hora' : 'Remuneração Fixo'}
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {viewingFolha.tipoContratacao === 'HORISTA'
                          ? `${formatBRL(viewingFolha.valorHora || 50)}/h`
                          : formatBRL(viewingFolha.totalBruto)}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Bruto
                      </span>
                      <p className="text-base font-bold text-blue-700 mt-0.5">
                        {formatBRL(viewingFolha.totalBruto)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Benefícios e Passagem */}
                <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-200/70">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">

                    Benefícios e Passagem
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Passagem
                      </span>
                      <p className="text-base font-bold text-blue-800 mt-0.5">
                        {formatBRL(viewingFolha.passagem || 0)}
                      </p>

                    </div>

                    <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Outros Benefícios
                      </span>
                      <p className="text-base font-bold text-emerald-700 mt-0.5">
                        {formatBRL(viewingFolha.outrosBeneficios || 0)}
                      </p>

                    </div>

                    <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Benefícios
                      </span>
                      <p className="text-base font-bold text-emerald-600 mt-0.5">
                        +{formatBRL(viewingFolha.beneficios)}
                      </p>

                    </div>
                  </div>
                </div>

                {/* 3. Descontos e Líquido Final */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-200/70">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                      Descontos Aplicados
                    </span>
                    <p className="text-xl font-bold text-rose-700 mt-1">
                      -{formatBRL(viewingFolha.descontos)}
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Faltas, adiantamentos e penalidades contratuais
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-300 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Líquido a Pagar
                        </span>

                      </div>
                      <p className="text-2xl font-black text-emerald-800 mt-1">
                        {formatBRL(viewingFolha.liquidoPagar)}
                      </p>
                    </div>
                    <div className="mt-2 text-[11px] text-emerald-700 font-medium">
                      Status:{' '}
                      <strong>
                        {viewingFolha.status === 'PAGO'
                          ? `Pago${viewingFolha.dataPagamento ? ` em ${formatarData(viewingFolha.dataPagamento)}` : ''}`
                          : 'Aguardando Pagamento'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações do Modal de Visualização */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
                <Button variant="outline" type="button" onClick={() => setIsViewFolhaModalOpen(false)}>
                  Fechar
                </Button>
                <div className="flex items-center gap-2">
                  {viewingFolha.status === 'PENDENTE' ? (
                    <Button
                      variant="emerald"
                      type="button"
                      icon={<DollarSign size={14} />}
                      onClick={() => {
                        setIsViewFolhaModalOpen(false);
                        handleOpenPayModal(viewingFolha);
                      }}
                    >
                      Efetuar Pagamento
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      type="button"
                      icon={<ReceiptText size={14} className="text-emerald-600" />}
                      onClick={() => {
                        setIsViewFolhaModalOpen(false);
                        handleOpenReceiptModal(viewingFolha);
                      }}
                    >
                      Ver Recibo / Comprovante
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    type="button"
                    icon={<Edit size={14} />}
                    onClick={() => {
                      setIsViewFolhaModalOpen(false);
                      handleOpenEditFolhaModal(viewingFolha);
                    }}
                  >
                    Editar Dados da Folha
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal Editar Apuração da Folha & Cálculo de Passagem */}
      <Modal
        isOpen={isEditFolhaModalOpen}
        onClose={() => setIsEditFolhaModalOpen(false)}
        title={`Editar Apuração - ${editingFolha?.colaboradorNome || 'Colaborador'}`}
        description="Ajuste as horas registradas, cálculo de passagem, benefícios e descontos"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveFolha} className="space-y-4">
          {/* Mensagem explicativa sobre folha base mensal */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-center gap-2.5 text-xs text-blue-800">
            <AlertCircle size={15} className="shrink-0 text-blue-600" />
            <span>
              A folha é gerenciada com base <strong>mensal</strong> ({editingFolha?.mesReferencia || selectedMes}). As horas e proventos que você editar aqui serão registrados para o mês. Os filtros de semana, dia ou total na tabela são projeções proporcionais para consulta.
            </span>
          </div>

          {/* Card Resumo do Profissional */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={editingFolha?.colaboradorFotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                alt=""
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-200/80 shrink-0"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">{editingFolha?.colaboradorNome}</p>
                <p className="text-xs text-slate-500">{editingFolha?.colaboradorFuncao}</p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${editingFolha?.tipoContratacao === 'HORISTA'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
              >
                {editingFolha?.tipoContratacao === 'HORISTA' ? 'Horista' : 'Mensalista'}
              </span>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                {editingFolha?.tipoContratacao === 'HORISTA'
                  ? `${formatBRL(editingFolha?.valorHora || 50)}/h`
                  : 'Salário Contratual'}
              </p>
            </div>
          </div>

          {/* Horas Trabalhadas e Bruto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Horas Registradas no Mês <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={folhaForm.horasRegistradas}
                onChange={(e) => setFolhaForm({ ...folhaForm, horasRegistradas: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-semibold text-slate-800"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Total de horas de aulas ministradas
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Total Bruto Calculado
              </label>
              <div className="w-full px-3.5 py-2 text-sm bg-slate-100/80 border border-slate-200/80 rounded-xl font-bold text-slate-900 flex items-center justify-between">
                <span>{formatBRL(modalCalculos.totalBruto)}</span>

              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Calculado automaticamente a partir do valor contratual.
              </span>
            </div>
          </div>

          {/* Seção de Passagem (Vale-Transporte) com Calculadora Integrada */}
          <div className="p-4 bg-blue-50/40 border border-blue-200/70 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                Passagem
              </h5>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFolhaForm({ ...folhaForm, modoPassagem: 'AUTO' })}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${folhaForm.modoPassagem === 'AUTO'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                >
                  Calcular por Dias
                </button>
                <button
                  type="button"
                  onClick={() => setFolhaForm({ ...folhaForm, modoPassagem: 'MANUAL' })}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${folhaForm.modoPassagem === 'MANUAL'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                >
                  Valor Manual
                </button>
              </div>
            </div>

            {folhaForm.modoPassagem === 'AUTO' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Aulas Ministradas
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={folhaForm.diasTransporte}
                    onChange={(e) => setFolhaForm({ ...folhaForm, diasTransporte: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30"
                    placeholder="Ex: 16"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Tarifa Diária
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={folhaForm.valorDiarioTransporte}
                    onChange={(e) => setFolhaForm({ ...folhaForm, valorDiarioTransporte: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30"
                    placeholder="Ex: 11.00"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Total da Passagem
                  </label>
                  <div className="w-full px-3 py-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-900 rounded-xl font-bold flex items-center justify-between">
                    <span>{formatBRL(modalCalculos.passagem)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Valor Total de Passagem (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={folhaForm.passagemManual}
                  onChange={(e) => setFolhaForm({ ...folhaForm, passagemManual: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30"
                  placeholder="0,00"
                />
              </div>
            )}
          </div>

          {/* Outros Benefícios e Descontos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Outros Benefícios (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={folhaForm.outrosBeneficios}
                onChange={(e) => setFolhaForm({ ...folhaForm, outrosBeneficios: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                placeholder="0,00"
              />

            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Descontos (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={folhaForm.descontos}
                onChange={(e) => setFolhaForm({ ...folhaForm, descontos: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-rose-700 font-semibold"
                placeholder="0,00"
              />

            </div>
          </div>

          {/* Status do Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Status do Pagamento
              </label>
              <select
                value={folhaForm.status}
                onChange={(e) => setFolhaForm({ ...folhaForm, status: e.target.value as StatusFolha })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 font-semibold"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Data do Pagamento
              </label>
              <input
                type="date"
                value={folhaForm.dataPagamento}
                onChange={(e) => setFolhaForm({ ...folhaForm, dataPagamento: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30"
              />
            </div>
          </div>

          {/* Demonstrativo em Tempo Real sem fórmulas expostas */}
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs space-y-1 w-full sm:w-auto">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                Demonstrativo de Fechamento
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300 text-xs">
                <span>Bruto: <b className="text-white">{formatBRL(modalCalculos.totalBruto)}</b></span>
                <span>Passagem: <b className="text-white">{formatBRL(modalCalculos.passagem)}</b></span>
                <span>Outros: <b className="text-white">{formatBRL(modalCalculos.outros)}</b></span>
                <span>Descontos: <b className="text-rose-400">{formatBRL(modalCalculos.descontos)}</b></span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-emerald-400 font-semibold block">Líquido a Pagar</span>
              <span className="text-xl font-bold text-white">{formatBRL(modalCalculos.liquido)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsEditFolhaModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              Salvar Apuração
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Ajustar Teto Mensal da Equipe */}
      <Modal
        isOpen={isTetoModalOpen}
        onClose={() => setIsTetoModalOpen(false)}
        title="Ajustar Teto Mensal de Salários"
        description="Defina o limite orçamentário mensal para o pagamento da equipe."
        maxWidth="md"
      >
        <form onSubmit={handleSaveTeto} className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Teto Mensal da Folha de Pagamento (R$) <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Valor máximo estipulado para a soma dos salários e benefícios dos colaboradores no mês selecionado.
            </p>
            <input
              type="number"
              step="100"
              min="0"
              required
              value={tetoForm.mensal}
              onChange={(e) => setTetoForm({ mensal: e.target.value })}
              className="w-full px-3.5 py-2.5 text-base bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-bold text-slate-900"
              placeholder="Ex: 15000"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsTetoModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Salvar Teto Mensal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Cadastro / Edição de Colaborador */}
      <Modal
        isOpen={isColabModalOpen}
        onClose={() => setIsColabModalOpen(false)}
        title={editingColab ? 'Editar Dados do Colaborador' : 'Cadastrar Novo Membro da Equipe'}
        description="Preencha os dados cadastrais, vínculo de contratação e dados para pagamento."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveColaborador} className="space-y-4">
          {/* Seção da Foto do Colaborador */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              {colabForm.fotoUrl ? (
                <img
                  src={colabForm.fotoUrl}
                  alt="Foto do Colaborador"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-600/30 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-200 text-slate-400 flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                  <User size={30} />
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">Sem foto</span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">
                  Foto do Perfil
                </span>
                {colabForm.fotoUrl && (
                  <button
                    type="button"
                    onClick={() => setColabForm({ ...colabForm, fotoUrl: '' })}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} /> Remover foto
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors shadow-xs">
                  <Upload size={14} />
                  <span>Escolher foto do dispositivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                <span className="text-xs text-slate-400">ou cole a URL abaixo</span>
              </div>
              <input
                type="url"
                value={colabForm.fotoUrl}
                onChange={(e) => setColabForm({ ...colabForm, fotoUrl: e.target.value })}
                placeholder="https://exemplo.com/foto-do-colaborador.jpg"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700"
              />
            </div>
          </div>

          {/* Dados Principais */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Nome Completo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={colabForm.nome}
              onChange={(e) => setColabForm({ ...colabForm, nome: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              placeholder="Ex: Prof. Ricardo Antunes Mendonça"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                CPF
              </label>
              <input
                type="text"
                value={colabForm.cpf}
                onChange={(e) => setColabForm({ ...colabForm, cpf: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={colabForm.dataNascimento}
                onChange={(e) => setColabForm({ ...colabForm, dataNascimento: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">E-mail</label>
              <input
                type="email"
                value={colabForm.email}
                onChange={(e) => setColabForm({ ...colabForm, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                placeholder="colaborador@portofc.org.br"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Celular</label>
              <input
                type="text"
                value={colabForm.telefone}
                onChange={(e) => setColabForm({ ...colabForm, telefone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                placeholder="(61) 99999-8888"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Cargo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={colabForm.funcao}
                onChange={(e) => setColabForm({ ...colabForm, funcao: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                placeholder="Ex: Professor de Futebol de Base"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Status
              </label>
              <select
                value={colabForm.status}
                onChange={(e) => setColabForm({ ...colabForm, status: e.target.value as 'ATIVO' | 'INATIVO' })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          </div>

          {/* Tipo de Contratação e Remuneração */}
          <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Dados Financeiros
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Tipo de Contratação <span className="text-rose-500">*</span>
                </label>
                <select
                  value={colabForm.tipoContratacao}
                  onChange={(e) =>
                    setColabForm({ ...colabForm, tipoContratacao: e.target.value as TipoContratacao })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                >
                  <option value="HORISTA">Horista</option>
                  <option value="MENSALISTA">Mensalista</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  {colabForm.tipoContratacao === 'HORISTA' ? 'Valor da Hora (R$)' : 'Salário Fixo Mensal (R$)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={colabForm.tipoContratacao === 'HORISTA' ? colabForm.valorHora : colabForm.salarioFixo}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (colabForm.tipoContratacao === 'HORISTA') {
                      setColabForm({ ...colabForm, valorHora: v });
                    } else {
                      setColabForm({ ...colabForm, salarioFixo: v });
                    }
                  }}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Benefícios (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={colabForm.beneficios}
                  onChange={(e) => setColabForm({ ...colabForm, beneficios: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Auxílio transporte, alimentação ou bonificações
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  <span>Chave Pix</span>
                </label>
                <input
                  type="text"
                  value={colabForm.chavePix}
                  onChange={(e) => setColabForm({ ...colabForm, chavePix: e.target.value })}
                  placeholder="Insira sua chave Pix"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsColabModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              {editingColab ? 'Salvar Alterações' : 'Cadastrar Membro'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Efetuar Pagamento de Salário & Baixa no Financeiro */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Efetuar Pagamento de Salário"
        description="Confirme a quitação dos proventos e registre a saída automaticamente no Financeiro."
        maxWidth="lg"
      >
        {payingFolha && (() => {
          const colab = colaboradores.find((c) => c.id === payingFolha.colaboradorId);
          const chavePix = colab?.chavePix;
          return (
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              {/* Card do Colaborador & Proventos */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={colab?.fotoUrl || payingFolha.colaboradorFotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {colab?.nome || payingFolha.colaboradorNome}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {colab?.funcao || payingFolha.colaboradorFuncao}
                    </p>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 mt-1 inline-block">
                      Mês: {formatMesNome(payingFolha.mesReferencia)}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right w-full sm:w-auto p-2.5 sm:p-0 bg-white sm:bg-transparent rounded-xl border sm:border-0 border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Valor Líquido a Pagar
                  </span>
                  <span className="text-2xl font-black text-emerald-700 block mt-0.5">
                    {formatBRL(payingFolha.liquidoPagar)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Bruto {formatBRL(payingFolha.totalBruto)} • Benefícios +{formatBRL(payingFolha.beneficios)}
                  </span>
                </div>
              </div>

              {/* Chave PIX do Colaborador */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                    <DollarSign size={14} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                      Chave PIX Cadastrada:
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate block">
                      {chavePix || 'Nenhuma chave cadastrada'}
                    </span>
                  </div>
                </div>
                {chavePix && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(chavePix);
                      setCopiedPayPix(true);
                      setTimeout(() => setCopiedPayPix(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    {copiedPayPix ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    {copiedPayPix ? 'Copiado!' : 'Copiar PIX'}
                  </button>
                )}
              </div>

              {/* Dados do Pagamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Data do Pagamento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.dataPagamento}
                    onChange={(e) => setPaymentForm({ ...paymentForm, dataPagamento: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Forma de Pagamento <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={paymentForm.formaPagamento}
                    onChange={(e) => setPaymentForm({ ...paymentForm, formaPagamento: e.target.value as FormaPagamento })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 font-semibold"
                  >
                    <option value="PIX">PIX</option>
                    <option value="TRANSFERENCIA">Transferência Bancária (TED/DOC)</option>
                    <option value="DINHEIRO">Dinheiro em Espécie</option>
                    <option value="BOLETO">Boleto Bancário</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Anexar Comprovante de Pagamento */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">
                    Comprovante de Pagamento (Opcional)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, comprovanteTipo: 'ARQUIVO' })}
                      className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                        paymentForm.comprovanteTipo === 'ARQUIVO'
                          ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      Arquivo / PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, comprovanteTipo: 'FOTO' })}
                      className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                        paymentForm.comprovanteTipo === 'FOTO'
                          ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, comprovanteTipo: 'URL' })}
                      className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                        paymentForm.comprovanteTipo === 'URL'
                          ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      Link
                    </button>
                  </div>
                </div>

                {paymentForm.comprovanteTipo === 'FOTO' && (
                  <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                    {paymentForm.comprovanteUrl ? (
                      <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={paymentForm.comprovanteUrl}
                            alt=""
                            className="w-9 h-9 rounded object-cover shrink-0 border"
                          />
                          <span className="text-xs font-semibold text-slate-700 truncate">
                            {paymentForm.comprovanteNome || 'Foto Anexada'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentForm({ ...paymentForm, comprovanteUrl: '', comprovanteNome: '' })}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-1">
                        <ImageIcon size={20} className="text-slate-400" />
                        <span className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                          Clique para selecionar a foto do comprovante
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUploadPay}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}

                {paymentForm.comprovanteTipo === 'ARQUIVO' && (
                  <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                    {paymentForm.comprovanteUrl ? (
                      <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip size={16} className="text-blue-600 shrink-0" />
                          <span className="text-xs font-semibold text-slate-700 truncate">
                            {paymentForm.comprovanteNome || 'Arquivo Anexado'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentForm({ ...paymentForm, comprovanteUrl: '', comprovanteNome: '' })}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-1">
                        <Upload size={20} className="text-slate-400" />
                        <span className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                          Clique para enviar comprovante (PDF ou Imagem)
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          onChange={handleFileUploadPay}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}

                {paymentForm.comprovanteTipo === 'URL' && (
                  <div className="relative">
                    <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://exemplo.com/comprovante..."
                      value={paymentForm.comprovanteUrl}
                      onChange={(e) => setPaymentForm({ ...paymentForm, comprovanteUrl: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30"
                    />
                  </div>
                )}
              </div>

              {/* Informação de Integração Automática com Financeiro */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <strong>Integração Financeira Automática:</strong> Ao confirmar, este pagamento será registrado como <strong>saída paga</strong> de <strong>{formatBRL(payingFolha.liquidoPagar)}</strong> na categoria <em>Salários / Folha</em> no módulo Financeiro com comprovante anexado.
                </div>
              </div>

              {/* Rodapé de Ações */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setIsPayModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="emerald"
                  type="submit"
                  icon={payingLoading ? undefined : <CheckCircle size={16} />}
                  loading={payingLoading}
                >
                  Confirmar Pagamento e Baixa
                </Button>
              </div>
            </form>
          );
        })()}
      </Modal>

      {/* Modal Visualizar Recibo e Detalhes do Pagamento */}
      <Modal
        isOpen={isPayReceiptModalOpen}
        onClose={() => setIsPayReceiptModalOpen(false)}
        title="Recibo de Pagamento de Salário"
        description="Detalhes da quitação e comprovante vinculado ao Financeiro."
        maxWidth="md"
      >
        {receiptFolha && (() => {
          const colab = colaboradores.find((c) => c.id === receiptFolha.colaboradorId);
          return (
            <div className="space-y-4">
              {/* Header do Recibo */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={colab?.fotoUrl || receiptFolha.colaboradorFotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt=""
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{receiptFolha.colaboradorNome}</h4>
                    <p className="text-xs text-slate-500">{receiptFolha.colaboradorFuncao}</p>
                    <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                      Pago em: {formatarData(receiptFolha.dataPagamento)} • Forma: {receiptFolha.formaPagamento || 'PIX'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Valor Quitado</span>
                  <span className="text-xl font-black text-emerald-800">{formatBRL(receiptFolha.liquidoPagar)}</span>
                </div>
              </div>

              {/* Demonstrativo de Proventos */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Horas Registradas:</span>
                  <span className="font-semibold text-slate-800">{receiptFolha.horasRegistradas}h</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Bruto:</span>
                  <span className="font-semibold text-slate-800">{formatBRL(receiptFolha.totalBruto)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Passagem + Benefícios:</span>
                  <span className="font-semibold text-emerald-700">+{formatBRL(receiptFolha.beneficios)}</span>
                </div>
                {receiptFolha.descontos > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Descontos:</span>
                    <span className="font-semibold text-rose-600">-{formatBRL(receiptFolha.descontos)}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Líquido Pago:</span>
                  <span className="text-emerald-700">{formatBRL(receiptFolha.liquidoPagar)}</span>
                </div>
              </div>

              {/* Comprovante Anexado */}
              {receiptFolha.comprovanteUrl ? (
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Comprovante Anexado
                  </span>
                  {receiptFolha.comprovanteTipo === 'FOTO' || receiptFolha.comprovanteUrl.startsWith('data:image') ? (
                    <div className="space-y-2">
                      <img
                        src={receiptFolha.comprovanteUrl}
                        alt="Comprovante"
                        className="max-h-48 rounded-lg mx-auto border object-contain"
                      />
                      <a
                        href={receiptFolha.comprovanteUrl}
                        download={receiptFolha.comprovanteNome || 'comprovante.jpg'}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center justify-center gap-1"
                      >
                        <ExternalLink size={13} /> Abrir / Baixar Comprovante
                      </a>
                    </div>
                  ) : (
                    <a
                      href={receiptFolha.comprovanteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border flex items-center justify-between text-xs font-semibold text-blue-700"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Paperclip size={15} />
                        {receiptFolha.comprovanteNome || 'Visualizar Arquivo Anexado'}
                      </span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  Nenhum comprovante anexado a este pagamento.
                </div>
              )}

              {/* Rodapé com botão de estornar ou fechar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleEstornarPayment(receiptFolha)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-rose-200"
                >
                  Estornar Pagamento
                </button>
                <Button variant="outline" type="button" onClick={() => setIsPayReceiptModalOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
