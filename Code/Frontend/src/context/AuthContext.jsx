import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attempt to restore session on mount
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('transitops_token');
      if (token) {
        try {
          const userData = await apiFetch('/auth/me');
          setUser({ ...userData, initials: userData.email.slice(0, 2).toUpperCase() });
        } catch (err) {
          console.error("Session restore failed", err);
          localStorage.removeItem('transitops_token');
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  async function login(email, password, role) {
    // OAuth2PasswordRequestForm requires form data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    // You could pass role here if your backend expected it, but the backend assigns roles per user.

    const data = await apiFetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    localStorage.setItem('transitops_token', data.access_token);
    
    // Fetch user details immediately after login
    const userData = await apiFetch('/auth/me');
    setUser({ ...userData, initials: userData.email.slice(0, 2).toUpperCase() });
  }

  function logout() {
    localStorage.removeItem('transitops_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
