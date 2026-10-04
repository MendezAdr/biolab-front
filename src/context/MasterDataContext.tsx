import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { usuariosService } from '../services/usuarioService';
import { useAuth } from './AuthContext';
import type { Usuario } from '../types/UsuarioModel';

// 1. Definimos el tipado estricto del contexto
interface MasterDataContextType {
  usuariosMemoria: Usuario[];
  obtenerNombreUsuario: (id: number) => string;
  recargarUsuarios: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | null>(null);

export const MasterDataProvider = ({ children }: { children: ReactNode }) => {
  const { usuario } = useAuth();
  
  // 2. Tipamos el estado para evitar el error 'never'
  const [usuariosMemoria, setUsuariosMemoria] = useState<Usuario[]>([]);

  const cargarUsuarios = async () => {
    // 3. Validación estricta: Si el usuario o su ID son nulos, cancelamos la petición
    if (!usuario?.id) return; 
    
    try {
      const data = await usuariosService.getAll(usuario.id);
      setUsuariosMemoria(data || []);
    } catch (error) {
      console.error("Error cargando el catálogo de usuarios en memoria:", error);
    }
  };

  useEffect(() => {
    if (usuario?.id) {
      cargarUsuarios();
    } else {
      // Limpieza de seguridad: Si cierra sesión, borramos la memoria RAM
      setUsuariosMemoria([]); 
    }
  }, [usuario?.id]); // Escuchamos específicamente el cambio de ID

  // Función inyectora inteligente
  const obtenerNombreUsuario = (id: number) => {
    const user = usuariosMemoria.find(u => u.id === id);
    // Podemos incluir el apellido para mayor precisión en la auditoría
    return user ? `${user.nombre} ${user.apellido}` : `Desconocido (ID: ${id})`;
  };

  return (
    <MasterDataContext.Provider value={{ 
      usuariosMemoria, 
      obtenerNombreUsuario, 
      recargarUsuarios: cargarUsuarios 
    }}>
      {children}
    </MasterDataContext.Provider>
  );
};

// Hook personalizado con validación de seguridad
export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error("useMasterData debe utilizarse dentro de un MasterDataProvider");
  }
  return context;
};