import React, { useState } from 'react';
import { usuariosService } from '../../services/usuarioService';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setCargando(true);
    try {
      const respuesta = await usuariosService.login({ username, contrasena: password });
      
      const exito = respuesta.exito || respuesta.Exito;
      
      if (exito) {
          const info = respuesta.usuarioInfo || respuesta.UsuarioInfo;
          
          // Inyectamos al usuario en la memoria global de React
          login({
            id: info.id || info.Id,
            username: info.username || info.Username,
            nombre: info.nombre || info.Nombre,
            apellido: info.apellido || info.Apellido,
            rolNombre: info.rolNombre || info.rolName || info.RolName || 'Usuario',
            
            // LA CORRECCIÓN CLAVE: 
            // Buscamos 'permisosSistema' (como viene de C#) y usamos ?? para respetar el 0
            permisos: info.permisosSistema ?? info.PermisosSistema ?? info.permisos ?? info.Permisos ?? []
          });

      } else {
          setError(respuesta.mensaje || respuesta.Mensaje || 'Credenciales inválidas.');
      }
    } catch (err: any) {
      const mensajeError = err.response?.data?.Mensaje || err.message || 'Error de conexión con el servidor.';
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        <div className="bg-emerald-600 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-3xl">🔬</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest">RIV_CARR</h1>
          <p className="text-emerald-100 text-sm mt-1">Sistema de Gestión de Laboratorio</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Iniciar Sesión</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm border border-rose-200 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={manejarSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors" 
                placeholder="ej. jperez"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors" 
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg shadow-md transition-colors mt-2"
            >
              {cargando ? 'Verificando...' : 'Ingresar al Sistema'}
            </button>
          </form>
          
          <p className="text-center text-xs text-slate-400 mt-6">
            Uso exclusivo para personal autorizado.
          </p>
        </div>
      </div>
    </div>
  );
}