import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile } from '../services/storage';
import { MedicalProfile } from '../types';
import { Phone, AlertTriangle, FileText, Activity, Pill, User } from 'lucide-react';

const EmergencyPublic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        const data = await getProfile(id);
        setProfile(data);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-slate-500">Cargando datos de emergencia...</div>;

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-red-50 text-center">
        <AlertTriangle className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-red-800">Perfil No Encontrado</h1>
        <p className="text-red-600 mt-2">El código QR escaneado no corresponde a un usuario activo o ha sido eliminado.</p>
      </div>
    );
  }

  // --- High Contrast / Emergency UI Design ---
  return (
    <div className="min-h-screen bg-white pb-12 font-sans">
      {/* Emergency Header - Red for Visibility */}
      <div className="bg-red-600 text-white p-4 sticky top-0 z-50 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2 animate-pulse">
            <AlertTriangle className="w-6 h-6 fill-white text-red-600" />
            <span className="font-bold tracking-wider text-sm md:text-base">EMERGENCIA MÉDICA</span>
        </div>
        {/* Do not show full ID in production if not necessary, but helpful for debug */}
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* Basic Info */}
        <section className="text-center border-b pb-6">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400 overflow-hidden">
                {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <User className="w-12 h-12" />
                )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">{profile.fullName}</h1>
            {profile.birthDate && (
                <p className="text-slate-600 mt-1 text-lg">
                    Nacimiento: {new Date(profile.birthDate).toLocaleDateString()} 
                    {/* Simple age calc */}
                    <span className="ml-2 font-semibold">
                       ({new Date().getFullYear() - new Date(profile.birthDate).getFullYear()} años)
                    </span>
                </p>
            )}
            <div className="mt-4 inline-block bg-red-100 text-red-800 px-6 py-2 rounded-full font-bold text-xl border border-red-200">
                SANGRE: {profile.bloodType}
            </div>
        </section>

        {/* Call Buttons - Sticky Action */}
        <section className="space-y-3">
            <h2 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2">Contactar Inmediatamente</h2>
            {profile.contacts.length === 0 ? (
                <p className="text-slate-400 italic">No hay contactos registrados.</p>
            ) : (
                profile.contacts.map(contact => (
                    <a 
                        key={contact.id} 
                        href={`tel:${contact.phone}`}
                        className="flex items-center justify-between bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">{contact.name}</span>
                            <span className="text-green-100 text-sm">{contact.relation}</span>
                        </div>
                        <div className="bg-white/20 p-2 rounded-full">
                            <Phone className="w-6 h-6" />
                        </div>
                    </a>
                ))
            )}
        </section>

        <hr className="border-slate-200 my-6" />

        {/* Medical Details */}
        <div className="grid md:grid-cols-1 gap-6">
            {/* Allergies - Critical */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
                <h3 className="text-red-600 font-bold flex items-center gap-2 text-lg mb-2">
                    <AlertTriangle className="w-5 h-5" /> Alergias
                </h3>
                <p className="text-slate-900 text-lg font-medium">
                    {profile.allergies || "No registras alergias"}
                </p>
            </div>

            {/* Conditions */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-blue-700 font-bold flex items-center gap-2 text-lg mb-2">
                    <Activity className="w-5 h-5" /> Condiciones Médicas
                </h3>
                <p className="text-slate-800 text-lg leading-relaxed">
                    {profile.conditions || "Sin condiciones registradas"}
                </p>
            </div>

             {/* Meds */}
             <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-indigo-700 font-bold flex items-center gap-2 text-lg mb-2">
                    <Pill className="w-5 h-5" /> Medicación
                </h3>
                <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-line">
                    {profile.medications || "Sin medicación registrada"}
                </p>
            </div>
            
            {/* Notes */}
             {profile.notes && (
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                    <h3 className="text-amber-800 font-bold flex items-center gap-2 text-lg mb-2">
                        <FileText className="w-5 h-5" /> Notas Importantes
                    </h3>
                    <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-line">
                        {profile.notes}
                    </p>
                </div>
            )}
        </div>

        <div className="text-center text-slate-400 text-xs mt-12 mb-4">
            <p>Sistema "Juntos en el Cuidado"</p>
            <p>Información provista por el usuario. No sustituye diagnóstico médico profesional.</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPublic;