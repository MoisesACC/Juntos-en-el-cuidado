export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface MedicalProfile {
  id: string; // usually matches userId
  fullName: string;
  birthDate: string;
  bloodType: string;
  allergies: string;
  conditions: string;
  medications: string;
  notes: string;
  photoUrl?: string; // We will use placeholder if not set
  contacts: Contact[];
  lastUpdated: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export enum BloodType {
  A_POS = "A+",
  A_NEG = "A-",
  B_POS = "B+",
  B_NEG = "B-",
  AB_POS = "AB+",
  AB_NEG = "AB-",
  O_POS = "O+",
  O_NEG = "O-",
  UNKNOWN = "Desconocido"
}