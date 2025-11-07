import { supabase } from './supabase';
import { User } from 'firebase/auth';

export async function syncUserToSupabase(firebaseUser: User) {
const { uid, email, displayName, photoURL, emailVerified } = firebaseUser;

const { error } = await supabase
.from('profiles')
.upsert({
id: uid,
email: email || '',
display_name: displayName || '',
photo_url: photoURL || '',
email_verified: emailVerified,
updated_at: new Date().toISOString()
}, { onConflict: 'id' });

if (error) {
console.error('Error syncing user to Supabase:', error);
throw error;
}
}
