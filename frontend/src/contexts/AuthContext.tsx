import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  
const checkAuth = async () => {
  try {
    setLoading(true);
    const res = await fetch('http://localhost:4000/api/user/me', {
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      console.log("✅ Authenticated user:", data);
      setUser(data?.user);
    } else {
      console.warn("❌ Not authenticated");
      setUser(null);
    }
  } catch (err) {
    console.error("Auth check error:", err);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

const login = async (email: string, password: string) => {
  setLoading(true);
  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Login failed: ${errText}`);
    }

    await checkAuth();
  } catch (err) {
    console.error("Login error:", err);
    throw err; // allow caller to handle error
  } finally {
    setLoading(false);
  }
};

   const logout = async () => {
    await fetch('http://localhost:4000/api/user/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};