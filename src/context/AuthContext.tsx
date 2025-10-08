import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    refresh: () => void;
    fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {

        const makeRequest = (authToken: string | null) => {
            const headers = new Headers(options.headers);
            if (authToken) {
                headers.set('Authorization', `Bearer ${authToken}`);
            }
            return fetch(url, { ...options, headers });
        };

        // First attempt with current token
        let response = await makeRequest(token);

        // If we get 401 and have a token, try to refresh
        if (response.status === 401 && token) {
            console.log('Got 401, attempting token refresh...');
            const refreshSuccess = await refresh();

            if (refreshSuccess) {
                // Retry with the new token
                const newToken = localStorage.getItem('token');
                response = await makeRequest(newToken);
                console.log('Retried request after refresh, status:', response.status);
            } else {
                console.log('Refresh failed, user will be logged out');
                logout();
            }
        }

        return response;

    };

    const refresh = async () => {
        const response = await fetch('https://localhost:7101/refresh', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                login(data.token);
                return true;
            }
        }
        
        logout();
        return false;
    }

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout, loading, refresh, fetchWithAuth }}>
            {children}
        </AuthContext.Provider>
    );
};