import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CustomUser = {
  id: string | number;
  full_name?: string;
  email?: string;
  phone?: string;
  uid?: string; // Adding for backwards compatibility with Firebase expectations
  onboarded?: boolean;
};

type AuthCtx = {
  user: CustomUser | null;
  session: CustomUser | null;
  loading: boolean;
  signIn: (user: CustomUser, token: string) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  signIn: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("ff_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
  }, []);

  const signIn = (newUser: CustomUser, token: string) => {
    if (!newUser.uid) newUser.uid = String(newUser.id); // For backward compatibility with existing components
    setUser(newUser);
    localStorage.setItem("ff_user", JSON.stringify(newUser));
    localStorage.setItem("ff_token", token);
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("ff_user");
    localStorage.removeItem("ff_token");
  };

  return (
    <Ctx.Provider
      value={{
        user,
        session: user,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
