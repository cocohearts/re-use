import supabase from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import React, { createContext, useState, useEffect, useContext } from 'react';

const supabaseProjectId = import.meta.env.VITE_PROJECT_REF;

console.log(supabaseProjectId);

const AuthContext = createContext<{
  user: User | null;
  token: any;
}>({ user: null, token: null });

export const useAuthContext = () => useContext(AuthContext);

export default function AuthProvider(props: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then((result) => {
      setCurrentUser(result.data.user);
      const token = getToken();
      setAuthToken(token);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user: currentUser, token: authToken }}>
      {props.children}
    </AuthContext.Provider>
  );
}

const getToken = () => {
  const storageKey = `sb-${supabaseProjectId}-auth-token`;
  const sessionDataString = localStorage.getItem(storageKey);
  const sessionData = JSON.parse(sessionDataString || 'null');
  const token = sessionData?.access_token;

  return token;
};
