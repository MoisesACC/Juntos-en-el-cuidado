import { supabase } from './supabaseClient';
import { User, MedicalProfile } from '../types';

// --- Auth Helpers ---

export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }
    }
  });

  if (error) throw error;
  
  // FIX: Handle Email Confirmation Flow
  // If email confirmation is enabled in Supabase, data.user is returned but data.session is null.
  // We cannot create the 'profiles' record yet because RLS requires an active session (auth.uid()).
  if (data.user && !data.session) {
    throw { message: 'CONFIRM_EMAIL_REQUIRED' };
  }

  if (!data.user || !data.session) throw new Error('No se pudo crear el usuario');

  // If we have a session (Auto-confirm is on), we can create the initial profile
  const newProfile: MedicalProfile = {
    id: data.user.id,
    fullName: name,
    birthDate: '',
    bloodType: 'Desconocido',
    allergies: '',
    conditions: '',
    medications: '',
    notes: '',
    contacts: [],
    lastUpdated: new Date().toISOString()
  };

  try {
    await saveProfile(newProfile);
  } catch (err) {
    console.error("Warning: Profile creation failed on signup (likely RLS or network). User can create it later.", err);
    // Do not fail the whole registration if profile creation fails, as the auth user is already created.
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    name: name
  };
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  if (!data.user) throw new Error('Error al iniciar sesión');

  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata.full_name || 'Usuario'
  };
};

export const logoutUser = async () => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  
  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.user_metadata.full_name || 'Usuario'
  };
};

// --- Data Helpers ---

export const getProfile = async (userId: string): Promise<MedicalProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('Profile fetch warning (User might be new):', error.message);
    return null;
  }

  // Map snake_case database fields to camelCase TS interface
  return {
    id: data.id,
    fullName: data.full_name, 
    birthDate: data.birth_date,
    bloodType: data.blood_type,
    allergies: data.allergies,
    conditions: data.conditions,
    medications: data.medications,
    notes: data.notes,
    contacts: data.contacts || [],
    lastUpdated: data.last_updated,
    photoUrl: data.photo_url
  };
};

export const saveProfile = async (profile: MedicalProfile): Promise<void> => {
  // Convert camelCase to snake_case for DB
  const dbProfile = {
    id: profile.id,
    full_name: profile.fullName,
    birth_date: profile.birthDate,
    blood_type: profile.bloodType,
    allergies: profile.allergies,
    conditions: profile.conditions,
    medications: profile.medications,
    notes: profile.notes,
    contacts: profile.contacts,
    last_updated: new Date().toISOString(),
    photo_url: profile.photoUrl
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(dbProfile);

  if (error) throw error;
};