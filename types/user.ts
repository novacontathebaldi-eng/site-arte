export interface Address {
  id: string;
  name: string; // Label (e.g., "Home", "Office") or Recipient Name
  recipientName: string;
  country: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  preferences?: {
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
  createdAt?: string;
  lastLogin?: string;
}

export interface User extends UserProfile {}