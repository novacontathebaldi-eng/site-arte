import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NewsletterSubscriber } from '@/types';

export const addNewsletterSubscriber = async (email: string): Promise<void> => {
  try {
    // Check if email already exists
    const subscriberDoc = await getDoc(doc(db, 'newsletter', email));
    
    if (subscriberDoc.exists()) {
      throw new Error('already-subscribed');
    }

    const subscriber: NewsletterSubscriber = {
      id: email,
      email,
      language: 'fr', // Default to French, could be detected from browser
      source: 'footer',
      confirmedAt: null,
      unsubscribedAt: null,
      subscribedAt: new Date()
    };

    await setDoc(doc(db, 'newsletter', email), subscriber);
  } catch (error) {
    console.error('Error adding newsletter subscriber:', error);
    throw error;
  }
};

export const removeNewsletterSubscriber = async (email: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'newsletter', email), {
      unsubscribedAt: new Date()
    });
  } catch (error) {
    console.error('Error removing newsletter subscriber:', error);
    throw error;
  }
};

export const confirmNewsletterSubscription = async (email: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'newsletter', email), {
      confirmedAt: new Date()
    });
  } catch (error) {
    console.error('Error confirming newsletter subscription:', error);
    throw error;
  }
};

export const getNewsletterSubscribers = async (): Promise<NewsletterSubscriber[]> => {
  try {
    // This would typically be an admin-only function
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error getting newsletter subscribers:', error);
    throw error;
  }
};