import supabase from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import React, { createContext, useState, useEffect, useContext } from 'react';

const supabaseProjectId = import.meta.env.VITE_PROJECT_REF;

const AuthContext = createContext<{
  user: User | null;
  token: any;
  authReady: boolean;
}>({ user: null, token: null, authReady: false });

export const useAuthContext = () => useContext(AuthContext);

export default function AuthProvider(props: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<any>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getUser().then((result) => {
      setCurrentUser(result.data.user);

      // Get auth token for passing to server on all endpoints that require authentication
      const token = getToken();
      setAuthToken(token);

      // To notify useAuthContext when these are ready
      setAuthReady(true);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user: currentUser, token: authToken, authReady }}
    >
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
