import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser } from '../services/storage';
import { AuthContext } from '../App';
import { Button } from '../components/Button';
import { HeartPulse, Lock, Mail } from 'lucide-react';

interface LoginProps {
  isRegister: boolean;
}

const Login: React.FC<LoginProps> = ({ isRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for register
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    
    // Fix: Trim whitespace that often causes "Invalid email" errors
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      if (isRegister) {
        if (!name) throw new Error("El nombre es requerido");
        if (cleanPassword.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");
        
        await registerUser(cleanEmail, cleanPassword, name);
        // If successful without session (email confirm needed), registerUser throws specific object caught below
        // If successful with session, we proceed
      } else {
        await loginUser(cleanEmail, cleanPassword);
      }
      
      refreshUser();
      navigate('/dashboard');

    } catch (err: any) {
      console.error("Auth error:", err);

      // Handle "Check your email" special case
      if (err.message === 'CONFIRM_EMAIL_REQUIRED') {
        setSuccessMsg(`Hemos enviado un enlace de confirmación a ${cleanEmail}. Por favor verifica tu correo para continuar.`);
        setIsLoading(false);
        return;
      }

      // Handle Object Error (The [object Object] fix)
      let msg = 'Error de autenticación.';
      
      if (typeof err === 'string') {
        msg = err;
      } else if (err.message) {
        msg = err.message;
      } else if (err.error_description) {
        msg = err.error_description;
      }

      // Handle Supabase Rate Limits
      if (msg.includes('security purposes') || msg.includes('429')) {
        msg = 'Demasiados intentos. Por favor espera unos segundos antes de intentar nuevamente.';
      }
      
      // Handle Specific Invalid Email
      if (msg.includes('invalid') && msg.includes('email')) {
        msg = 'El formato del correo electrónico no es válido.';
      }

      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
          </h1>
          <p className="text-slate-500 mt-2">
            {isRegister ? 'Comienza a proteger a quien más quieres.' : 'Accede a tu panel de control.'}
          </p>
        </div>

        {successMsg && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm mb-4 text-center border border-green-200 flex flex-col items-center">
             <Mail className="w-6 h-6 mb-2" />
             {successMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegister}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <div className="relative">
                <input
                type="password"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            {isRegister && <p className="text-xs text-slate-400 mt-1">Mínimo 6 caracteres</p>}
          </div>

          <Button fullWidth type="submit" isLoading={isLoading}>
            {isRegister ? 'Registrarse' : 'Ingresar'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <Link 
            to={isRegister ? '/login' : '/register'} 
            className="text-blue-600 font-semibold hover:underline"
            onClick={() => { setError(''); setSuccessMsg(''); }}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;