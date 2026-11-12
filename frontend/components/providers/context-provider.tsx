"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider } from "next-themes";

export type SessionUser = {
  id: string;
  email: string;
  perfil: string;
  permissoes: string[];
};
type AppContextValue = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  can: (permission: string) => boolean;
};
const AppContext = createContext<AppContextValue | null>(null);

export function ContextProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: SessionUser | null;
}) {
  const [user, setUser] = useState(initialUser);
  const context = useMemo(
    () => ({
      user,
      setUser,
      can: (permission: string) =>
        user?.permissoes.includes(permission) ?? false,
    }),
    [user],
  );
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppContext.Provider value={context}>{children}</AppContext.Provider>
    </ThemeProvider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used inside ContextProvider.");
  return context;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = useAppContext();
  return can(permission) ? children : fallback;
}
