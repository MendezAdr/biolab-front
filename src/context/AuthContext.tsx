import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { type UsuarioLogueado, PERMISOS } from '../types/AuthTypes';

interface AuthContextType {
    usuario: UsuarioLogueado | null;
    login: (datosUsuario: UsuarioLogueado) => void;
    logout: () => void;
    tienePermiso: (permisoRequerido: number) => boolean;
}

// 1. Creamos el contexto vacío
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Creamos el Proveedor (El componente que envolverá tu app)
export function AuthProvider({ children }: { children: ReactNode }) {
    
    // Por ahora lo inicializamos en null. Cuando hagas el Login real, 
    // lo llenarás con los datos que devuelva el backend.
    const [usuario, setUsuario] = useState<UsuarioLogueado | null>(null);

    const login = (datosUsuario: UsuarioLogueado) => {
        setUsuario(datosUsuario);
        // Opcional: Aquí también guardarías el token JWT en localStorage
    };

    const logout = () => {
        setUsuario(null);
        // Opcional: Limpiarías el localStorage
    };

    // LA FUNCIÓN ESTRELLA: Comprueba si el usuario puede hacer algo
    const tienePermiso = (permisoRequerido: number): boolean => {
        if (!usuario) return false;
        
        // Si el usuario tiene el permiso 0 (Admin Total), puede hacer TODO
        if (usuario.permisos.includes(PERMISOS.TODOS)) return true;

        // Si no es admin, verificamos si su arreglo incluye el número solicitado
        return usuario.permisos.includes(permisoRequerido);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, tienePermiso }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. Creamos el Custom Hook para usarlo fácilmente en cualquier lado
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
}