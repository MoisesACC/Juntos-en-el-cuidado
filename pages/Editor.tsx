import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { getProfile, saveProfile } from '../services/storage';
import { MedicalProfile, Contact, BloodType } from '../types';
import { Button } from '../components/Button';
import { Trash2, Plus, Sparkles, Save, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cleanMedicalNotes } from '../services/geminiService';

const Editor: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [profile, setProfile] = useState<MedicalProfile>({
    id: '',
    fullName: '',
    birthDate: '',
    bloodType: BloodType.UNKNOWN,
    allergies: '',
    conditions: '',
    medications: '',
    notes: '',
    contacts: [],
    lastUpdated: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const data = await getProfile(user.id);
          if (data) {
            setProfile(data);
          } else {
             // If no profile exists yet in DB (rare if registered correctly), init one
             setProfile(prev => ({ ...prev, id: user.id, fullName: user.name }));
          }
        } catch (e) {
          console.error("Error loading profile", e);
        } finally {
          setFetching(false);
        }
      }
    };
    loadData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...profile.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setProfile(prev => ({ ...prev, contacts: newContacts }));
  };

  const addContact = () => {
    setProfile(prev => ({
      ...prev,
      contacts: [...prev.contacts, { id: crypto.randomUUID(), name: '', relation: '', phone: '' }]
    }));
  };

  const removeContact = (index: number) => {
    const newContacts = profile.contacts.filter((_, i) => i !== index);
    setProfile(prev => ({ ...prev, contacts: newContacts }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveProfile(profile);
      navigate('/dashboard');
    } catch (e) {
      console.error("Error saving", e);
      alert("Error al guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeminiEnhance = async () => {
    if (!profile.notes) return;
    setAiLoading(true);
    const improved = await cleanMedicalNotes(profile.notes);
    setProfile(prev => ({ ...prev, notes: improved }));
    setAiLoading(false);
  };

  if (!user) return null;
  if (fetching) return <div className="p-8 text-center text-slate-500">Cargando editor...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Editar Ficha Médica</h1>
      </div>

      <div className="space-y-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Personal Info */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Información Básica</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
              <input name="fullName" value={profile.fullName} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
              <input type="date" name="birthDate" value={profile.birthDate} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Sangre</label>
              <select name="bloodType" value={profile.bloodType} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                {Object.values(BloodType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Medical Info */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Datos Médicos Críticos</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alergias</label>
            <input name="allergies" value={profile.allergies} onChange={handleChange} placeholder="Ej. Penicilina, Mani..." className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Condiciones Médicas</label>
            <textarea name="conditions" value={profile.conditions} onChange={handleChange} placeholder="Ej. Hipertensión, Diabetes..." className="w-full p-2 border rounded-lg h-20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Medicamentos Actuales</label>
            <textarea name="medications" value={profile.medications} onChange={handleChange} placeholder="Nombre y dosis..." className="w-full p-2 border rounded-lg h-20" />
          </div>
        </section>

        {/* AI Enhanced Notes */}
        <section className="space-y-4">
           <div className="flex justify-between items-end border-b pb-2">
             <h2 className="text-lg font-bold text-slate-800">Notas Adicionales</h2>
             {process.env.API_KEY && (
                <button 
                  onClick={handleGeminiEnhance} 
                  disabled={aiLoading || !profile.notes}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" /> {aiLoading ? 'Mejorando...' : 'Mejorar con IA'}
                </button>
             )}
           </div>
           <div>
              <p className="text-xs text-slate-500 mb-2">Escribe instrucciones para los paramédicos. Usa el botón de IA para formatearlo profesionalmente.</p>
              <textarea 
                name="notes" 
                value={profile.notes} 
                onChange={handleChange} 
                placeholder="Ej: El paciente tiene marcapasos. El paciente no escucha bien del oído izquierdo." 
                className="w-full p-2 border rounded-lg h-32" 
              />
           </div>
        </section>

        {/* Contacts */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Contactos de Emergencia</h2>
          {profile.contacts.map((contact, idx) => (
            <div key={contact.id} className="bg-slate-50 p-4 rounded-lg relative group">
              <button onClick={() => removeContact(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid md:grid-cols-3 gap-3">
                <input 
                   placeholder="Nombre" 
                   value={contact.name} 
                   onChange={(e) => handleContactChange(idx, 'name', e.target.value)} 
                   className="p-2 border rounded text-sm"
                />
                <input 
                   placeholder="Relación (Hijo, Doctor...)" 
                   value={contact.relation} 
                   onChange={(e) => handleContactChange(idx, 'relation', e.target.value)} 
                   className="p-2 border rounded text-sm"
                />
                <input 
                   placeholder="Teléfono" 
                   value={contact.phone} 
                   onChange={(e) => handleContactChange(idx, 'phone', e.target.value)} 
                   className="p-2 border rounded text-sm"
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addContact} className="w-full border-dashed">
            <Plus className="w-4 h-4" /> Agregar Contacto
          </Button>
        </section>

        <div className="pt-6">
          <Button fullWidth onClick={handleSave} isLoading={loading} className="gap-2">
            <Save className="w-5 h-5" /> Guardar Cambios
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Editor;