import { useEffect, useState } from "react";
import { authStorage } from "@/services/auth";

export const useSession = () => {
  const [session, setSession] = useState(() => authStorage.getSession());

  useEffect(() => {
    return authStorage.subscribe(() => {
      setSession(authStorage.getSession());
    });
  }, []);

  return session;
};
