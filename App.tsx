import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { getCurrentUser, logoutUser } from './services/storage';
import { supabase } from './services/supabaseClient';
import { User } from './types';
import { ShieldCheck, HeartPulse, LogOut, QrCode, User as UserIcon, Menu, X } from 'lucide-react';
import { Button } from './components/Button';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import QRView from './pages/QRView';
import EmergencyPublic from './pages/EmergencyPublic';

// Context
export const AuthContext = React.createContext<{
  user: User | null;
  loading: boolean;
  refreshUser: () => void;
  logout: () => void;
}>({
  user: null,
  loading: true,
  refreshUser: () => {},
  logout: () => {},
});

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = React.useContext(AuthContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Don't show layout on emergency pages or landing/login if not needed
  const isPublicEmergency = location.pathname.startsWith('/emergency/');
  if (isPublicEmergency) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
              <HeartPulse className="w-8 h-8" />
              <span className="hidden sm:inline">Juntos en el Cuidado</span>
              <span className="sm:hidden">Juntos</span>
            </Link>

            {user ? (
              <>
                <div className="hidden md:flex items-center gap-6">
                  <Link to="/dashboard" className={`text-sm font-medium hover:text-blue-600 ${location.pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-600'}`}>Inicio</Link>
                  <Link to="/dashboard/edit" className={`text-sm font-medium hover:text-blue-600 ${location.pathname === '/dashboard/edit' ? 'text-blue-600' : 'text-slate-600'}`}>Mi Ficha</Link>
                  <Link to="/dashboard/qr" className={`text-sm font-medium hover:text-blue-600 ${location.pathname === '/dashboard/qr' ? 'text-blue-600' : 'text-slate-600'}`}>Mi QR</Link>
                  <div className="h-6 w-px bg-slate-200 mx-2"></div>
                  <button onClick={logout} className="text-slate-500 hover:text-red-600 flex items-center gap-1 text-sm">
                    <LogOut className="w-4 h-4" /> Salir
                  </button>
                </div>
                {/* Mobile Menu Button */}
                <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
                  {menuOpen ? <X /> : <Menu />}
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="outline" className="py-1 px-3 text-sm">Ingresar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {menuOpen && user && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-2 space-y-2">
             <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Dashboard</Link>
             <Link to="/dashboard/edit" onClick={() => setMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Editar Ficha Médica</Link>
             <Link to="/dashboard/qr" onClick={() => setMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Ver Código QR</Link>
             <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left py-2 text-red-600 font-medium">Cerrar Sesión</button>
          </div>
        )}
      </nav>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
             <ShieldCheck className="w-6 h-6 text-emerald-500" />
             <span className="text-white font-semibold">Seguridad y Privacidad Primero</span>
          </div>
          <p className="text-sm">Juntos en el Cuidado &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check Supabase session on mount
  useEffect(() => {
    checkUser();
    
    // Listen for auth changes (sign in, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
         setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || 'Usuario'
         });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch (error) {
      console.error("Auth initialization failed:", error);
      // Even if it fails, stop loading so the app can render (likely showing login)
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = () => {
    checkUser();
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login isRegister={false} />} />
            <Route path="/login" element={<Login isRegister={false} />} />
            <Route path="/register" element={<Login isRegister={true} />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/edit" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
            <Route path="/dashboard/qr" element={<ProtectedRoute><QRView /></ProtectedRoute>} />
            
            <Route path="/emergency/:id" element={<EmergencyPublic />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthContext.Provider>
  );
}