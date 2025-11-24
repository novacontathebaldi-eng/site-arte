import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc as firestoreUpdateDoc, 
  deleteDoc as firestoreDeleteDoc,
  query,
  where,
  onSnapshot,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './config';

// Genérico para buscar coleção (Promise)
export const getCollection = async (collectionName: string, ...constraints: any[]) => {
  try {
    const colRef = collection(db, collectionName);
    
    // Adapt constraints if necessary, currently handling V9 QueryConstraints passed directly
    // or transforming simple objects if that was the old pattern (though previous file implied simple where support)
    const validConstraints: QueryConstraint[] = constraints.filter(c => c && typeof c === 'object'); 
    
    const q = query(colRef, ...validConstraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    throw error;
  }
};

// Buscar documento único (Promise)
export const getDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching document ${id} from ${collectionName}:`, error);
    throw error;
  }
};

// Criar documento
export const createDocument = async (collectionName: string, data: DocumentData) => {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

// Atualizar documento
export const updateDocument = async (collectionName: string, id: string, data: Partial<DocumentData>) => {
  try {
    const docRef = doc(db, collectionName, id);
    await firestoreUpdateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating document ${id}:`, error);
    throw error;
  }
};

// Deletar documento
export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await firestoreDeleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    throw error;
  }
};

// --- REAL-TIME LISTENERS ---

/**
 * Ouve alterações em uma coleção em tempo real.
 */
export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void
) => {
  const colRef = collection(db, collectionName);

  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  }, (error) => {
    console.error(`Error subscribing to collection ${collectionName}:`, error);
  });

  return unsubscribe;
};

/**
 * Ouve alterações em um documento específico em tempo real.
 */
export const subscribeToDocument = (
  collectionName: string, 
  id: string, 
  callback: (data: any) => void
) => {
  const docRef = doc(db, collectionName, id);

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to document ${id}:`, error);
  });

  return unsubscribe;
};

// --- OFFLINE / CACHE ---

/**
 * Força a busca de dados do cache local do dispositivo.
 * Note: Modular SDK handles cache automatically. Explicit cache retrieval 
 * requires different pattern (getDocsFromCache), simplified here to standard fetch
 * as fallback logic is built-in.
 */
export const getCollectionFromCache = async (collectionName: string) => {
  // Simplification for Modular SDK transition: just use getCollection
  // Advanced offline control would require `getDocsFromCache`
  return getCollection(collectionName);
};