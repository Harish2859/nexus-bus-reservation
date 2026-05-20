import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('nexus_user')); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('nexus_token') || null);

    const login = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('nexus_user', JSON.stringify(userData));
        localStorage.setItem('nexus_token', tokenData);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('nexus_user');
        localStorage.removeItem('nexus_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be wrapped within an AuthProvider.');
    return context;
};
