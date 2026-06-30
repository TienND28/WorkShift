import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/admin/Modal";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { needsOnboarding, onboardingHomePath } from "@/lib/onboarding";

interface OpenAuthPromptOptions {
  message?: string;
  redirectTo?: string;
  onClose?: () => void;
}

interface AuthPromptContextValue {
  openAuthPrompt: (options?: OpenAuthPromptOptions) => void;
  closeAuthPrompt: () => void;
}

const defaultMessage =
  "Tham gia WorkShift để tìm việc làm, ca làm và kết nối với doanh nghiệp.";

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [onCloseHandler, setOnCloseHandler] = useState<(() => void) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetPromptState = useCallback(() => {
    setMessage(defaultMessage);
    setRedirectTo(null);
    setOnCloseHandler(null);
    setError(null);
  }, []);

  const closeAuthPrompt = useCallback(() => {
    setOpen(false);
    if (onCloseHandler) {
      onCloseHandler();
    }
    resetPromptState();
  }, [onCloseHandler, resetPromptState]);

  const openAuthPrompt = useCallback((options?: OpenAuthPromptOptions) => {
    setError(null);
    setMessage(options?.message ?? defaultMessage);
    setRedirectTo(options?.redirectTo ?? null);
    setOnCloseHandler(() => options?.onClose ?? null);
    setOpen(true);
  }, []);

  const handleGoogleSuccess = useCallback(
    async (idToken: string) => {
      setError(null);
      try {
        const user = await loginWithGoogle(idToken);
        setOpen(false);
        resetPromptState();

        if (needsOnboarding(user)) {
          navigate(onboardingHomePath(user), { replace: true });
          return;
        }

        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Đăng nhập thất bại");
        throw e;
      }
    },
    [loginWithGoogle, navigate, redirectTo, resetPromptState],
  );

  const value = useMemo(
    () => ({
      openAuthPrompt,
      closeAuthPrompt,
    }),
    [openAuthPrompt, closeAuthPrompt],
  );

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <Modal 
        open={open}
        title={<div className="text-center">Đăng nhập để tiếp tục</div>}
        onClose={closeAuthPrompt}
        className="items-center justify-center text-center">
        <p className="text-sm leading-relaxed text-neutral-600">{message}</p>
        <div className="mt-4 flex justify-center">
          <GoogleSignInButton onSuccess={handleGoogleSuccess} width={280} />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </Modal>
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);
  if (!context) {
    throw new Error("useAuthPrompt must be used inside AuthPromptProvider");
  }
  return context;
}
