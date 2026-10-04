import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { type UsuarioLogueado, PERMISOS } from '../types/AuthTypes';

interface AuthContextType {
    usuario: UsuarioLogueado | null;
    login: (datosUsuario: UsuarioLogueado) => void;
    logout: () => void;
    tienePermiso: (permisoRequerido: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    
    const [usuario, setUsuario] = useState<UsuarioLogueado | null>(null);

    const login = (datosUsuario: UsuarioLogueado) => {
        setUsuario(datosUsuario);
    };

    const logout = () => {
        setUsuario(null);
    };

    const tienePermiso = (permisoRequerido: number): boolean => {
        
        
        if (!usuario) {
            
            return false;
        }

        if (usuario.permisos === undefined || usuario.permisos === null) {
            
            return false;
        }

        const permisos = usuario.permisos;
        

        // CASO 1: El backend lo mandó como un número entero (comportamiento normal de Flags en C#)
        if (typeof permisos === 'number') {
            const tieneAcceso = (permisos & permisoRequerido) === permisoRequerido;
            
            return tieneAcceso;
        }

        // CASO 2: El backend lo mandó como un string ("511")
        if (typeof permisos === 'string') {
            
            const num = parseInt(permisos, 10);
            if (!isNaN(num)) {
                const tieneAcceso = (num & permisoRequerido) === permisoRequerido;
                
                return tieneAcceso;
            }
            
            return false;
        }

        // CASO 3: Es un arreglo (usado en Mocks o contingencia de [] vacío)
        if (Array.isArray(permisos)) {
            
            if (permisos.length === 0) {
                
                return false;
            }
            if (permisos.includes(PERMISOS.TODOS)) {
                return true;
            }
            const tieneAcceso = permisos.includes(permisoRequerido);
        
            return tieneAcceso;
        }

        
        return false;
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, tienePermiso }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
}