import React, { useState } from 'react';
import { User, Mail, Lock, Camera, Check, ShieldCheck, Key, Save, Phone, CreditCard, Sparkles } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/authService';

export const PerfilModule: React.FC = () => {
  const { user } = useAuth();
  
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefone, setTelefone] = useState(user?.telefone || '(61) 98100-2026');
  const [chavePix, setChavePix] = useState(user?.chavePix || user?.email || '');
  const [fotoUrl, setFotoUrl] = useState(user?.fotoUrl || '');
  
  // Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isDiretoria = user?.cargo?.includes('Gestora') || user?.cargo?.includes('Gerente') || user?.perfil === 'ADMIN' || user?.perfil === 'GESTOR';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A foto deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nome.trim()) {
      setErrorMsg('O nome é obrigatório.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('O e-mail é obrigatório.');
      return;
    }

    // Se preencheu nova senha, validar
    if (novaSenha) {
      if (novaSenha.length < 6) {
        setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (novaSenha !== confirmarNovaSenha) {
        setErrorMsg('A confirmação da nova senha não confere.');
        return;
      }
    }

    try {
      if (user?.id) {
        const updatePayload: any = {
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
          chavePix: chavePix.trim(),
          fotoUrl: fotoUrl.trim(),
        };

        if (novaSenha) {
          updatePayload.senhaHash = novaSenha;
        }

        authService.updateAccount(user.id, updatePayload);
        setSavedSuccess(true);
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarNovaSenha('');
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar alterações.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <User className="text-blue-700" size={26} />
            <span>Meu Perfil & Configurações de Conta</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie seus dados de acesso, informações pessoais, foto institucional e credenciais.
          </p>
        </div>
        <Badge variant={isDiretoria ? 'success' : 'neutral'} className="self-start sm:self-auto text-xs py-1 px-3">
          {isDiretoria ? 'Diretoria Executiva (Acesso Total)' : 'Membro Autorizado'}
        </Badge>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in zoom-in-95 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Check size={18} />
          </div>
          <span>Seus dados foram atualizados com sucesso e já estão ativos no sistema!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Card Foto & Informações Gerais */}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
            {/* Foto Avatar */}
            <div className="relative group shrink-0">
              <img
                src={
                  fotoUrl ||
                  user?.fotoUrl ||
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                }
                alt={user?.nome || 'Usuário'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-blue-100 shadow-md"
              />
              <label
                htmlFor="photo-upload-profile"
                className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer"
              >
                <Camera size={20} className="mb-1" />
                <span>Alterar Foto</span>
              </label>
              <input
                id="photo-upload-profile"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Info Resumo */}
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-xl font-bold text-slate-900">{user?.nome}</h3>
              <p className="text-sm font-medium text-blue-700 mt-0.5">{user?.cargo}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Mail size={13} />
                  <span>{user?.email}</span>
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Conta Ativa & Autenticada</span>
                </span>
              </div>
            </div>
          </div>

          {/* Campos Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Nome Completo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                E-mail de Acesso <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(61) 99999-9999"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Chave PIX (Para repasses e controle)
              </label>
              <div className="relative">
                <CreditCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="CPF, E-mail ou Telefone"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Card Alteração de Senha */}
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Key size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Segurança & Alteração de Senha</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Caso deseje mudar sua senha de acesso, preencha os campos abaixo. Deixe em branco para manter a senha atual.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Nova Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 dígitos"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Botão de Salvar Alterações */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="emerald"
            icon={<Save size={18} />}
            className="w-full sm:w-auto px-8 py-3 text-sm font-bold shadow-md shadow-emerald-600/20"
          >
            Salvar Alterações do Perfil
          </Button>
        </div>
      </form>
    </div>
  );
};
