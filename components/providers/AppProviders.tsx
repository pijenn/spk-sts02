"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AuthModal } from "@/components/AuthModal";
import {
  fetchAllCardsCached,
  fetchAllRelicsCached,
  getApiBaseUrl,
} from "@/lib/fetch-cache";
import type { AuthUser, Card, Relic } from "@/lib/types";

const AUTH_STORAGE_KEY = "spk_sts2_auth_session";

interface AppContextValue {
  cards: Card[];
  relics: Relic[];
  cardsById: Map<string, Card>;
  relicsById: Map<string, Relic>;
  isCatalogLoading: boolean;
  catalogError: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  openAuthModal: (onAuthenticated?: (user: AuthUser) => void) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [hasPendingAuthAction, setHasPendingAuthAction] = useState<boolean>(false);
  const pendingCallbackRef = useRef<((authedUser: AuthUser) => void) | null>(null);

  // Pulihkan sesi autentikasi dari localStorage setelah hidrasi klien
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const saved = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as AuthUser;
          if (parsed?.user_id && parsed?.username) {
            setUser(parsed);
          }
        }
      } catch {
        // Abaikan jika penyimpanan lokal tidak valid
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Fetch satu kali untuk seluruh katalog ~577 kartu & ~296 relik ke memori klien (TTL 5 menit)
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchAllCardsCached(), fetchAllRelicsCached()])
      .then(([loadedCards, loadedRelics]) => {
        if (cancelled) return;
        setCards(loadedCards);
        setRelics(loadedRelics);
        setCatalogError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setCatalogError(
          err instanceof Error ? err.message : "Gagal memuat katalog kartu & relik."
        );
      })
      .finally(() => {
        if (!cancelled) setIsCatalogLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const cardsById = useMemo(
    () => new Map<string, Card>(cards.map((c) => [c.card_id, c])),
    [cards]
  );

  const relicsById = useMemo(
    () => new Map<string, Relic>(relics.map((r) => [r.relic_id, r])),
    [relics]
  );

  const persistUser = useCallback((authed: AuthUser) => {
    setUser(authed);
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authed));
    } catch {
      // Abaikan kegagalan kuota penyimpanan
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<AuthUser> => {
      const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as AuthUser & { detail?: string };
      if (!res.ok) {
        throw new Error(data.detail || "Autentikasi gagal.");
      }
      persistUser(data);
      return data;
    },
    [persistUser]
  );

  const register = useCallback(
    async (username: string, password: string): Promise<AuthUser> => {
      const res = await fetch(`${getApiBaseUrl()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as AuthUser & { detail?: string };
      if (!res.ok) {
        throw new Error(data.detail || "Registrasi gagal.");
      }
      persistUser(data);
      return data;
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Abaikan
    }
  }, []);

  const openAuthModal = useCallback(
    (onAuthenticated?: (authedUser: AuthUser) => void) => {
      pendingCallbackRef.current = onAuthenticated || null;
      setHasPendingAuthAction(Boolean(onAuthenticated));
      setIsAuthModalOpen(true);
    },
    []
  );

  const handleModalAuthSuccess = useCallback((authedUser: AuthUser) => {
    setIsAuthModalOpen(false);
    setHasPendingAuthAction(false);
    const cb = pendingCallbackRef.current;
    pendingCallbackRef.current = null;
    if (cb) {
      cb(authedUser);
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      cards,
      relics,
      cardsById,
      relicsById,
      isCatalogLoading,
      catalogError,
      user,
      login,
      register,
      logout,
      openAuthModal,
    }),
    [
      cards,
      relics,
      cardsById,
      relicsById,
      isCatalogLoading,
      catalogError,
      user,
      login,
      register,
      logout,
      openAuthModal,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {isAuthModalOpen && (
        <AuthModal
          hasPendingAction={hasPendingAuthAction}
          onClose={() => {
            pendingCallbackRef.current = null;
            setHasPendingAuthAction(false);
            setIsAuthModalOpen(false);
          }}
          onSuccess={handleModalAuthSuccess}
        />
      )}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext wajib digunakan di dalam <AppProviders>.");
  }
  return ctx;
}
