import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface User {
  name: string;
  role: string;
  email: string;
}

interface UseAuthOptions {
  redirectOnUnauthenticated?: boolean;
}

export function useAuth(options?: UseAuthOptions) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("awgyms_admin");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("awgyms_admin");
      }
    } else if (options?.redirectOnUnauthenticated) {
      navigate("/login");
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("awgyms_admin");
    navigate("/login");
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
}
