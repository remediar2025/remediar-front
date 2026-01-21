import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export const useAuthCheck = () => {
  const { user, checkTokenExpiration } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        router.push("/login");
        setIsChecking(false);
        return;
      }

      if (!checkTokenExpiration()) {
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    const timer = setTimeout(checkAuth, 1500);

    return () => clearTimeout(timer);
  }, [user, router, checkTokenExpiration]);

  return { 
    user, 
    isAuthenticated: !!user && !!localStorage.getItem("token"),
    isChecking
  };
};