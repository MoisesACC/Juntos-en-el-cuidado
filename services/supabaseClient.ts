import { createClient } from '@supabase/supabase-js';

// NOTA: En un entorno real, estas deben ser variables de entorno.
// Usamos un placeholder con formato de URL válido para evitar que la aplicación falle al inicio si no hay configuración.
const supabaseUrl = process.env.SUPABASE_URL || 'https://tbbusvvomwzrtvfhbklw.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_FF2eap0nkXcO-75Bn1JRTQ_1j-B_eiR';

export const supabase = createClient(supabaseUrl, supabaseKey);

/*
  --- REQUERIMIENTOS SQL PARA SUPABASE ---
  Ejecuta esto en el SQL Editor de tu dashboard de Supabase:

  create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    full_name text,
    birth_date date,
    blood_type text,
    allergies text,
    conditions text,
    medications text,
    notes text,
    contacts jsonb default '[]'::jsonb,
    photo_url text,
    last_updated timestamptz default now()
  );

  -- Habilitar Row Level Security (RLS)
  alter table public.profiles enable row level security;

  -- Política: Cualquiera puede ver perfiles (para emergencias públicas)
  create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

  -- Política: Los usuarios solo pueden insertar/actualizar su propio perfil
  create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

  create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );
*/