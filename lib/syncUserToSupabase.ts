import { supabase } from './supabase';
// FIX: Changed to Firebase v8 compat User type to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export async function syncUserToSupabase(firebaseUser: firebase.User) {
    const { uid, email, displayName, photoURL, emailVerified, phoneNumber } = firebaseUser;

    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: uid,
            email: email,
            email_verified: emailVerified,
            display_name: displayName || email?.split('@')[0] || 'User',
            photo_url: photoURL,
            phone: phoneNumber,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select();

    if (error) {
        console.error('Error syncing user to Supabase:', error);
        throw error;
    }
    
    console.log('Profile synced successfully:', data);
    return data?.[0] || null;
}