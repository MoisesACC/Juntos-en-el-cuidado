import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getProfile } from '../services/storage';
import { MedicalProfile } from '../types';
import { QrCode, FileText, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '../components/Button';

const Dashboard: React.FC = () => {
  const { user } = React.useContext(AuthContext);
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        const data = await getProfile(user.id);
        setProfile(data);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-slate-500">Cargando información...</div>;

  const isProfileComplete = profile && profile.bloodType !== 'Desconocido' && profile.contacts.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Hola, {user.name}</h1>
        <p className="text-slate-600 mt-2">Gestiona tu información de emergencia y códigos QR desde aquí.</p>
      </header>

      {!isProfileComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
          <AlertCircle className="text-amber-600 w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-amber-800">Tu perfil está incompleto</h3>
            <p className="text-amber-700 text-sm mt-1">
              Para que el código QR sea efectivo, asegúrate de añadir contactos de emergencia y tu tipo de sangre.
            </p>
            <Link to="/dashboard/edit" className="inline-block mt-3 text-sm font-semibold text-amber-900 underline">
              Completar perfil ahora
            </Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Emergency Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ficha Médica</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Actualiza tus alergias, medicamentos y condiciones médicas. Esta es la información que verán los paramédicos.
          </p>
          <div className="flex gap-2">
              <Link to="/dashboard/edit" className="flex-1">
                <Button variant="outline" fullWidth>Editar Información</Button>
              </Link>
          </div>
          {profile?.lastUpdated && (
              <p className="text-xs text-slate-400 mt-4 text-center">
                  Última actualización: {new Date(profile.lastUpdated).toLocaleDateString()}
              </p>
          )}
        </div>

        {/* Card 2: QR Code */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Mi Código QR</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Descarga o imprime tu código QR personal. Llévalo siempre contigo en tu cartera o como adhesivo.
          </p>
          <Link to="/dashboard/qr">
            <Button variant="secondary" fullWidth>Ver y Descargar QR</Button>
          </Link>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
             <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                 <Smartphone className="w-5 h-5" />
                 Prueba tu código
             </h3>
             <p className="text-indigo-700 text-sm mt-1 max-w-lg">
                 Escanea tu propio código QR con tu celular para verificar que la información mostrada es correcta y legible.
             </p>
         </div>
         <div className="flex-shrink-0">
             <Link to={`/emergency/${user.id}`} target="_blank">
                <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
                    Ver vista previa pública
                </Button>
             </Link>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;