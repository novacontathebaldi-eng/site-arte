import { supabase } from './supabase';
import { User } from 'firebase/auth';

export const syncUserToSupabase = async (user: User) => {
  try {
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
      });

    if (error) {
      console.error('Erro ao sincronizar perfil:', error);
      throw error;
    }

    console.log('Perfil sincronizado com sucesso:', data);
    return data;
  } catch (err) {
    console.error('Erro na sincronização:', err);
    throw err;
  }
};
