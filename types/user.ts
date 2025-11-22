export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  preferences?: {
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
  createdAt?: string;
}

export interface User extends UserProfile {}
