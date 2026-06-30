import type { AuthUser } from "@/types/auth.types";
import { authApi } from "@/lib/api/auth.api";
import {
  clearAuthStorage,
  tokenStorage,
  userStorage,
} from "@/lib/auth/storage";

type Listener = () => void;

let user: AuthUser | null = userStorage.get();
const listeners = new Set<Listener>();
let hydratePromise: Promise<AuthUser | null> | null = null;

const notify = () => listeners.forEach((l) => l());

const applyAuthResult = (result: {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}) => {
  tokenStorage.setTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
  user = result.user;
  userStorage.set(result.user);
  notify();
};

const isUnauthorized = (err: unknown) =>
  typeof err === "object" &&
  err !== null &&
  "status" in err &&
  (err as { status: number }).status === 401;

export const authStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): AuthUser | null {
    return user;
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStorage.getAccess() && user);
  },

  async loginWithGoogle(idToken: string): Promise<AuthUser> {
    const result = await authApi.googleLogin(idToken);
    applyAuthResult(result);
    return result.user;
  },

  async verifyEmailLogin(token: string): Promise<AuthUser> {
    const result = await authApi.verifyEmailLogin(token);
    applyAuthResult(result);
    return result.user;
  },

  async selectProfileType(
    profileType: AuthUser["profileTypes"][number],
  ): Promise<AuthUser> {
    const result = await authApi.selectProfileType(profileType);
    applyAuthResult(result);
    return result.user;
  },

  setUser(next: AuthUser) {
    user = next;
    userStorage.set(next);
    notify();
  },

  async refreshMe(): Promise<AuthUser | null> {
    if (!tokenStorage.getAccess()) return null;
    try {
      const me = await authApi.getMe();
      user = me;
      userStorage.set(me);
      notify();
      return me;
    } catch {
      return user;
    }
  },

  async hydrate(): Promise<AuthUser | null> {
    if (hydratePromise) {
      return hydratePromise;
    }

    hydratePromise = (async () => {
      const access = tokenStorage.getAccess();
      const cached = userStorage.get();

      if (!access) {
        user = null;
        notify();
        return null;
      }

      // Hiển thị user đã cache ngay, tránh nháy về chưa đăng nhập
      if (cached) {
        user = cached;
        notify();
      }

      try {
        const me = await authApi.getMe();
        user = me;
        userStorage.set(me);
        notify();
        return me;
      } catch (err) {
        if (isUnauthorized(err)) {
          clearAuthStorage();
          user = null;
        } else if (cached) {
          // 429 / mạng / server tạm lỗi — giữ phiên đã đăng nhập
          user = cached;
        } else {
          clearAuthStorage();
          user = null;
        }
        notify();
        return user;
      }
    })().finally(() => {
      hydratePromise = null;
    });

    return hydratePromise;
  },

  async logout(): Promise<void> {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh && tokenStorage.getAccess()) {
        await authApi.logout(refresh);
      }
    } catch {
      /* ignore */
    } finally {
      clearAuthStorage();
      user = null;
      notify();
    }
  },
};
