import supabase from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext<[User | null]>([null]);

export const useAuthContext = () => useContext(AuthContext);

export default function AuthProvider(props: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then((result) => {
      setCurrentUser(result.data.user);
    });
  }, []);

  return (
    <AuthContext.Provider value={[currentUser]}>
      {props.children}
    </AuthContext.Provider>
  );
}
