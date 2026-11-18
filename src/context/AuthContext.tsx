import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleAuthProvider } from '../lib/firebase';

const OWNER_EMAILS = new Set(['contato@macieldsgn.com', 'palazzomotos@gmail.com']);

function isOwnerEmailAddress(email?: string | null): boolean {
  return Boolean(email && OWNER_EMAILS.has(email.trim().toLowerCase()));
}

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      if (!nextUser.emailVerified) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      if (isOwnerEmailAddress(nextUser.email)) {
        setIsAdmin(true);
        setAuthReady(true);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, 'admins', nextUser.uid));
        setIsAdmin(adminSnap.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      if (!cred.user.emailVerified) {
        await signOut(auth);
        throw new Error('Sua conta precisa estar com o e-mail verificado.');
      }
      if (!isOwnerEmailAddress(cred.user.email)) {
        const adminSnap = await getDoc(doc(db, 'admins', cred.user.uid));
        if (!adminSnap.exists()) {
          await signOut(auth);
          throw new Error(
            `A conta ${cred.user.email} não possui permissão administrativa para a Palazzo Motos.`,
          );
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível concluir o login com Google.';
      setAuthError(msg);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!cred.user.emailVerified) {
        try {
          await sendEmailVerification(cred.user);
        } catch {
          // Ignore rate-limit errors on resend
        }
        await signOut(auth);
        throw new Error(
          `E-mail ainda não verificado. Enviamos um link de confirmação para ${cred.user.email}; confirme na sua caixa de entrada e entre novamente.`,
        );
      }
      if (!isOwnerEmailAddress(cred.user.email)) {
        const adminSnap = await getDoc(doc(db, 'admins', cred.user.uid));
        if (!adminSnap.exists()) {
          await signOut(auth);
          throw new Error('Usuário autenticado, porém sem perfil administrativo autorizado.');
        }
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      let message = err instanceof Error ? err.message : 'Falha ao entrar.';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        message = 'E-mail ou senha incorretos.';
      } else if (code === 'auth/operation-not-allowed') {
        message =
          'Login por E-mail/Senha não está habilitado no Firebase Console. Utilize o botão "Entrar com Google" ou ative o provedor no console.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      let message = 'Não foi possível enviar o e-mail de recuperação.';
      if (code === 'auth/user-not-found') {
        message = 'Nenhuma conta encontrada para este e-mail.';
      } else if (code === 'auth/operation-not-allowed') {
        message = 'Recuperação de senha indisponível para login exclusivamente Google.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        authError,
        clearAuthError: () => setAuthError(null),
        loginWithGoogle,
        loginWithEmail,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return ctx;
}
