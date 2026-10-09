import React, { useState, useEffect } from 'react';
import { usuariosService } from '../../services/usuarioService';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../config/ApiClient';
import { useNavigate } from 'react-router-dom'; // <-- AÑADIR ESTO

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate(); // <-- AÑADIR ESTO
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [backendListo, setBackendListo] = useState(false);

  // NUEVOS ESTADOS PARA TASA MANUAL
  const [requiereTasaManual, setRequiereTasaManual] = useState(false);
  const [tasaManualInput, setTasaManualInput] = useState('');
  const [usuarioPendiente, setUsuarioPendiente] = useState<any>(null);

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval>;

    const verificarConexion = async () => {
      try {
        await apiClient.get('/'); 
        setBackendListo(true);
        clearInterval(intervalo);
      } catch (err: any) {
        if (err.response) {
          setBackendListo(true);
          clearInterval(intervalo);
        }
      }
    };

    verificarConexion();

    if (!backendListo) {
      intervalo = setInterval(verificarConexion, 1000);
    }

    return () => clearInterval(intervalo);
  }, []);

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
          const cuentaActiva = info.isActive ?? info.IsActive ?? true;
          
          if (!cuentaActiva) {
              setError('Este usuario se encuentra inhabilitado. Por favor, contacte a la administración.');
              return;
          }

          // Armamos el objeto usuario que guardaremos
          const objetoUsuario = {
            id: info.id || info.Id,
            username: info.username || info.Username,
            nombre: info.nombre || info.Nombre,
            apellido: info.apellido || info.Apellido,
            rolNombre: info.rolNombre || info.rolName || info.RolName || 'Usuario',
            permisos: info.permisosSistema ?? info.PermisosSistema ?? info.permisos ?? info.Permisos ?? 0
          };

          // EVALUACIÓN DE TASA (Soportando camelCase y PascalCase)
          const tasaBackend = respuesta.tasaDolar ?? respuesta.TasaDolar;

          if (tasaBackend && tasaBackend > 0) {
              // Tasa automática OK, logueamos directo
              login(objetoUsuario, Number(tasaBackend));
              navigate('/', { replace: true });
          } else {
              // No hay tasa (sin internet), guardamos el usuario en espera y abrimos modal
              setUsuarioPendiente(objetoUsuario);
              setRequiereTasaManual(true);
          }

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

  const confirmarTasaManual = (e: React.FormEvent) => {
      e.preventDefault();
      const tasaNum = Number(tasaManualInput);
      
      if (!tasaNum || tasaNum <= 0) {
          setError("Debe ingresar un valor numérico válido mayor a cero.");
          return;
      }

      // Logueo exitoso usando la tasa manual inyectada
      login(usuarioPendiente, tasaNum);
      navigate('/', { replace: true });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-sky-950 relative overflow-hidden"
      style={{ 
        backgroundImage: "url('/src/assets/Bioanalisis.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'multiply'
      }}
    >
      <div className="absolute inset-0 bg-sky-950/80 backdrop-blur-sm z-0"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-sky-100 relative">
        
        {!backendListo && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl">
            <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-sky-900">Iniciando motor de base de datos...</p>
            <p className="text-xs text-slate-500 mt-1">Esto puede tomar unos segundos.</p>
          </div>
        )}

        {/* MODAL SOBREPUESTO DE TASA MANUAL */}
        {requiereTasaManual && (
           <div className="absolute inset-0 bg-white z-40 flex flex-col justify-center p-8 animate-fade-in">
              <div className="text-center mb-6">
                 <span className="text-4xl">⚠️</span>
                 <h2 className="text-xl font-bold text-sky-900 mt-4 mb-2">Servicio BCV Inaccesible</h2>
                 <p className="text-sm text-slate-500">
                    No se pudo establecer conexión con el Banco Central de Venezuela. 
                    Debe ingresar la tasa de cambio del día manualmente para poder facturar.
                 </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm border border-rose-200 rounded-xl text-center font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={confirmarTasaManual} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5 text-center">Valor Tasa BCV (Bs/$)</label>
                    <input 
                       type="number" 
                       step="0.01"
                       value={tasaManualInput}
                       onChange={(e) => setTasaManualInput(e.target.value)}
                       className="w-full text-center text-2xl font-black border border-slate-300 rounded-xl px-4 py-3 text-emerald-700 bg-emerald-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                       placeholder="Ej. 36.50"
                       autoFocus
                    />
                 </div>
                 
                 <div className="flex gap-3 pt-2">
                    <button 
                       type="button" 
                       onClick={() => { setRequiereTasaManual(false); setUsuarioPendiente(null); setError(''); }}
                       className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition-colors text-sm"
                    >
                       Cancelar
                    </button>
                    <button 
                       type="submit" 
                       className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 text-sm uppercase tracking-wider"
                    >
                       Continuar
                    </button>
                 </div>
              </form>
           </div>
        )}

        <div className="bg-sky-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-sky-500 opacity-20 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 rounded-full bg-emerald-500 opacity-20 blur-2xl"></div>
          
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-sky-100 rotate-3">
             <img 
                src="/src/assets/bioanalisis.png" 
                alt="Logo Laboratorio" 
                className="w-14 h-14 object-contain -rotate-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl">🔬</span>';
                }} 
              />
          </div>
          <h1 className="text-3xl font-serif italic font-bold text-white tracking-wide">RIV_CARR</h1>
          <p className="text-sky-200 text-xs font-bold uppercase tracking-widest mt-1">Sistema de Laboratorio</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-sky-900 mb-6 text-center">Iniciar Sesión</h2>
          
          {error && !requiereTasaManual && (
            <div className="mb-5 p-3 bg-rose-50 text-rose-700 text-sm border border-rose-200 rounded-xl text-center font-bold shadow-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={manejarSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-sky-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
                placeholder="ej. jperez"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-sky-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-300 disabled:shadow-none text-white font-bold py-3.5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 mt-2 text-sm uppercase tracking-wider"
            >
              {cargando ? 'Verificando...' : 'Ingresar al Sistema'}
            </button>
          </form>
          
          <p className="text-center text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-8">
            Uso exclusivo para personal autorizado
          </p>
        </div>
      </div>
    </div>
  );
}