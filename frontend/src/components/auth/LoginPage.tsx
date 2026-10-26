import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Por favor, informe seu e-mail institucional.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login(email, senha);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Falha ao autenticar. Verifique seus dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await loginGoogle(undefined, email || 'tainara@portofc.org.br');
    } catch (err: any) {
      setErrorMsg('Falha ao autenticar com o Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setSenha('123456');
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login(userEmail, '123456');
    } catch (err: any) {
      setErrorMsg('Falha no acesso rápido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/40">
          
          {/* Header & Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20 mb-4 ring-4 ring-slate-800/80">
              <Shield size={32} className="stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              PORTO <span className="text-emerald-400">FC</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Plataforma de Gestão Esportiva & Prestação de Contas
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs sm:text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: tainara@portofc.org.br"
                  required
                  className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ou continue com
            </span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
          >
            {/* Official Google multicolored G logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-sm">Entrar com o Google</span>
          </button>

          {/* Quick Demo Access Roles */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-1.5">
              <UserCheck size={14} className="text-emerald-400" />
              <span>Acesso Rápido para a Equipe:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickLogin('tainara@portofc.org.br')}
                className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                <p className="text-xs font-bold text-white leading-tight">Tainara</p>
                <p className="text-[10px] text-emerald-400 mt-0.5 truncate">Gestora Financeira</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('nayara@portofc.org.br')}
                className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                <p className="text-xs font-bold text-white leading-tight">Nayara</p>
                <p className="text-[10px] text-blue-400 mt-0.5 truncate">Gerente Geral</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ricardo.mendonca@portofc.org.br')}
                className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 transition-all cursor-pointer"
              >
                <p className="text-xs font-bold text-white leading-tight">Prof. Ricardo</p>
                <p className="text-[10px] text-amber-400 mt-0.5 truncate">Sub-7 e Sub-9</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('marcelo.vasconcelos@portofc.org.br')}
                className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                <p className="text-xs font-bold text-white leading-tight">Prof. Marcelo</p>
                <p className="text-[10px] text-purple-400 mt-0.5 truncate">Sub-15 a Adulto</p>
              </button>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Autenticação protegida via Backend Spring Boot & PostgreSQL</span>
          </div>

        </div>
      </div>
    </div>
  );
};
