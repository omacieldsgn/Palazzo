import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Lock, Mail } from 'lucide-react';
import { PALAZZO_LOGO_PATH } from '../../data/demoData';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AdminLoginPage() {
  const { user, isAdmin, authReady, authError, loginWithGoogle, loginWithEmail, resetPassword } =
    useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  useEffect(() => {
    document.title = 'Login Administrativo — Palazzo Motos';
  }, []);

  useEffect(() => {
    if (authReady && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [authReady, user, isAdmin, navigate]);

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
      showToast('Sessão administrativa iniciada', 'success');
      navigate('/admin', { replace: true });
    } catch {
      // handled by context authError
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (recoveryMode) {
        await resetPassword(email);
        setRecoverySent(true);
        showToast('Link de recuperação enviado para seu e-mail.', 'success');
      } else {
        await loginWithEmail(email, password);
        showToast('Bem-vindo ao painel Palazzo Motos.', 'success');
        navigate('/admin', { replace: true });
      }
    } catch {
      // handled by context authError
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-[#080909] text-[#F3F3F3] palazzo-grid-bg flex flex-col justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#858989] hover:text-[#B7F21B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a vitrine</span>
          </Link>
        </div>

        <div className="bg-[#141515] border border-[#303434] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-8">
            <img
              src={PALAZZO_LOGO_PATH}
              alt="Palazzo Motos"
              className="h-12 w-auto object-contain mx-auto mb-4"
            />
            <h1 className="font-display text-xl font-extrabold uppercase tracking-tight text-[#F3F3F3]">
              Painel Administrativo
            </h1>
            <p className="text-xs sm:text-sm text-[#858989] mt-1">
              Acesso exclusivo para gestão de estoque e vitrine
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-[#F15B5B]/10 border border-[#F15B5B]/40 text-xs sm:text-sm text-[#F15B5B] leading-relaxed"
            >
              {authError}
            </div>
          )}

          {recoverySent && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-lg bg-[#B7F21B]/10 border border-[#B7F21B]/40 text-xs sm:text-sm text-[#B7F21B]"
            >
              Instruções de redefinição enviadas. Verifique sua caixa de entrada.
            </div>
          )}

          {/* Primary Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="w-full h-11 rounded-lg bg-[#B7F21B] text-[#101010] text-sm font-bold uppercase tracking-wide hover:bg-[#D0FF36] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" aria-hidden="true" />
            <span>Entrar com Google</span>
          </button>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#242727]" />
            </div>
            <span className="relative px-3 bg-[#141515] text-[11px] uppercase tracking-wider text-[#5D6262]">
              ou com e-mail e senha
            </span>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium uppercase tracking-wider text-[#858989] mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 text-[#5D6262] absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@macieldsgn.com"
                  className="w-full h-11 pl-10 pr-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] placeholder:text-[#5D6262] focus:outline-none focus:border-[#B7F21B]"
                />
              </div>
            </div>

            {!recoveryMode && (
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium uppercase tracking-wider text-[#858989] mb-1.5"
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-[#5D6262] absolute left-3.5 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-3 rounded-lg bg-[#0D0F0F] border border-[#303434] text-sm text-[#F3F3F3] placeholder:text-[#5D6262] focus:outline-none focus:border-[#B7F21B]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg border border-[#303434] bg-[#1C1F1F] text-sm font-semibold text-[#F3F3F3] hover:border-[#B7F21B] hover:text-[#B7F21B] transition-colors disabled:opacity-50"
            >
              {submitting
                ? 'Processando...'
                : recoveryMode
                  ? 'Enviar link de recuperação'
                  : 'Entrar com E-mail'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setRecoveryMode((v) => !v);
                setRecoverySent(false);
              }}
              className="text-xs text-[#858989] hover:text-[#B7F21B] transition-colors"
            >
              {recoveryMode ? 'Voltar para o login' : 'Esqueci minha senha'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
