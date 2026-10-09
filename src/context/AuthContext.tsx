import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface UsuarioActual {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rolNombre: string;
  // Permitimos explícitamente que sea un número (Bitmask de C#) o un arreglo
  permisos: number | number[]; 
}

interface AuthContextType {
  usuario: UsuarioActual | null;
  tasaBcv: number; 
  login: (user: UsuarioActual, tasa: number) => void; 
  logout: () => void;
  tienePermiso: (permisosRequeridos: number | number[]) => boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null);
  const [tasaBcv, setTasaBcv] = useState<number>(0);

  const login = (user: UsuarioActual, tasa: number) => {
    setUsuario(user);
    setTasaBcv(tasa);
  };

  const logout = () => {
    setUsuario(null);
    setTasaBcv(0);
  };

  const tienePermiso = (permisosRequeridos: number | number[]): boolean => {
    if (!usuario || usuario.permisos === undefined) return false;
    
    const requeridosArray = Array.isArray(permisosRequeridos) ? permisosRequeridos : [permisosRequeridos];

    // 1. LÓGICA DE PRODUCCIÓN: El backend envía un número entero (Flags Enum de C#)
    if (typeof usuario.permisos === 'number') {
        const misPermisos = usuario.permisos;
        
        // 511 representa el valor de TODOS los permisos sumados
        if ((misPermisos & 511) === 511) return true;
        
        // Operación a nivel de bits: Compara si el permiso requerido está contenido en la suma total
        return requeridosArray.some(permiso => (misPermisos & permiso) === permiso);
    } 
    
    // 2. LÓGICA DE DESARROLLO (Mocks): Los permisos vienen como un arreglo []
    if (Array.isArray(usuario.permisos)) {
        if (usuario.permisos.includes(511)) return true;
        return requeridosArray.some(permiso => (usuario.permisos as number[]).includes(permiso));
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ usuario, tasaBcv, login, logout, tienePermiso }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};