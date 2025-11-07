import { supabase } from './supabase';
// FIX: Changed to Firebase v8 compat User type to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export const syncUserToSupabase = async (user: firebase.User) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.uid,
      email: user.email,
      email_verified: user.emailVerified,
      display_name: user.displayName || user.email?.split('@')[0] || 'Usuário',
      photo_url: user.photoURL,
      phone: user.phoneNumber,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select();

  if (error) {
    console.error('Erro ao sincronizar perfil:', error);
    throw error;
  }

  console.log('Perfil sincronizado com sucesso:', data);
  return data?.[0] || null;
};