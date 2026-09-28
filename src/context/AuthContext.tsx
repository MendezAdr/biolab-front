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
        console.log(`\n🔍 --- INICIANDO EVALUACIÓN DE PERMISOS ---`);
        console.log(`🎯 Permiso requerido: ${permisoRequerido}`);
        
        if (!usuario) {
            console.log("❌ Bloqueado: No hay usuario en el contexto.");
            return false;
        }

        if (usuario.permisos === undefined || usuario.permisos === null) {
            console.log("❌ Bloqueado: usuario.permisos es undefined o null.", usuario);
            return false;
        }

        const permisos = usuario.permisos;
        console.log(`📦 Datos de permisos recibidos crudos:`, permisos);
        console.log(`🏷️ Tipo de dato nativo (typeof):`, typeof permisos);
        console.log(`🧮 ¿Es un Array válido?:`, Array.isArray(permisos));

        // CASO 1: El backend lo mandó como un número entero (comportamiento normal de Flags en C#)
        if (typeof permisos === 'number') {
            console.log("⚙️ Entrando a evaluación por BITMASK (Número)");
            const tieneAcceso = (permisos & permisoRequerido) === permisoRequerido;
            console.log(`🧮 Operación: (${permisos} & ${permisoRequerido}) === ${permisoRequerido} -> Resultado: ${tieneAcceso}`);
            return tieneAcceso;
        }

        // CASO 2: El backend lo mandó como un string ("511")
        if (typeof permisos === 'string') {
            console.log("⚙️ Entrando a evaluación por STRING");
            const num = parseInt(permisos, 10);
            if (!isNaN(num)) {
                const tieneAcceso = (num & permisoRequerido) === permisoRequerido;
                console.log(`🧮 Operación tras parseo: (${num} & ${permisoRequerido}) === ${permisoRequerido} -> Resultado: ${tieneAcceso}`);
                return tieneAcceso;
            }
            console.log("❌ Bloqueado: El string no se pudo convertir a número válido.");
            return false;
        }

        // CASO 3: Es un arreglo (usado en Mocks o contingencia de [] vacío)
        if (Array.isArray(permisos)) {
            console.log("⚙️ Entrando a evaluación por ARRAY");
            if (permisos.length === 0) {
                console.warn("⚠️ ADVERTENCIA: Los permisos llegaron como un arreglo vacío []. Significa que falló el mapeo en usuarioService.login.");
                return false;
            }
            if (permisos.includes(PERMISOS.TODOS)) {
                console.log("✅ Aprobado: El arreglo contiene el comodín TODOS (511).");
                return true;
            }
            const tieneAcceso = permisos.includes(permisoRequerido);
            console.log(`🧮 Operación: ¿Arreglo incluye ${permisoRequerido}? -> Resultado: ${tieneAcceso}`);
            return tieneAcceso;
        }

        console.log("❌ Bloqueado: El formato de los permisos no coincidió con ninguna regla.");
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