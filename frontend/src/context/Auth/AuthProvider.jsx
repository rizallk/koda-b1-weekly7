import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import {
  ApiError,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshSession,
} from '@/features/auth/services/authService';
import { setApiAccessToken, setApiRefreshHandler } from '@/lib/apiClient';

const EMPTY_SESSION = {
  user: null,
  userRole: null,
  accessToken: null,
  expiresAtUtc: null,
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ status: 'checking', ...EMPTY_SESSION });
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((session) => {
    if (!session?.accessToken) {
      setApiAccessToken(null);
      setAuth({ status: 'anonymous', ...EMPTY_SESSION });
      return;
    }

    const { user = null, accessToken, expiresAtUtc = null } = session;
    setApiAccessToken(accessToken);
    setAuth({
      status: 'authenticated',
      user,
      userRole: user?.roles?.[0] ?? null,
      accessToken,
      expiresAtUtc,
    });
  }, []);

  const clearSession = useCallback(() => {
    setApiAccessToken(null);
    setAuth({ status: 'anonymous', ...EMPTY_SESSION });
  }, []);

  useEffect(() => {
    let active = true;

    const initSession = async () => {
      try {
        const session = await refreshSession();
        if (active) {
          applySession(session);
        }
      } catch {
        if (active) {
          clearSession();
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    return () => {
      active = false;
    };
  }, [applySession, clearSession]);

  useEffect(() => {
    setApiRefreshHandler(async () => {
      try {
        const session = await refreshSession();
        applySession(session);
        return session?.accessToken ?? null;
      } catch (error) {
        clearSession();
        throw error;
      }
    });

    return () => setApiRefreshHandler(null);
  }, [applySession, clearSession]);

  const login = useCallback(
    async (credentials) => {
      try {
        setIsLoading(true);
        const session = await loginUser(credentials);
        applySession(session);
        return session;
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [applySession],
  );

  const refreshAccessToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await refreshSession();
      applySession(session);
      return session;
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        clearSession();
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [applySession, clearSession]);

  const loadCurrentUser = useCallback(async () => {
    if (!auth.accessToken) {
      throw new ApiError(401, 'Access Token belum tersedia.');
    }

    try {
      setIsLoading(true);
      const user = await getCurrentUser(auth.accessToken);
      setAuth((prev) => ({
        ...prev,
        user,
        userRole: user?.roles?.[0] ?? null,
      }));
      return user;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
      const { accessToken } = await refreshAccessToken();
      setIsLoading(true);
      const user = await getCurrentUser(accessToken);
      setAuth((prev) => ({
        ...prev,
        user,
        userRole: user?.roles?.[0] ?? null,
      }));
      return user;
    } finally {
      setIsLoading(false);
    }
  }, [auth.accessToken, refreshAccessToken]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await logoutUser();
    } finally {
      clearSession();
      setIsLoading(false);
    }
  }, [clearSession]);

  const contextValue = useMemo(
    () => ({
      ...auth,
      isChecking: auth.status === 'checking',
      isAuthenticated:
        auth.status === 'authenticated' && Boolean(auth.accessToken),
      login,
      refreshAccessToken,
      loadCurrentUser,
      logout,
      isLoading,
    }),
    [auth, login, refreshAccessToken, loadCurrentUser, logout, isLoading],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
