import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  onSnapshot,
  getDocsFromCache,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './config';

// Genérico para buscar coleção (Promise)
export const getCollection = async (collectionName: string, ...constraints: QueryConstraint[]) => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
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
    await updateDoc(docRef, {
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
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    throw error;
  }
};

// --- REAL-TIME LISTENERS (Para Pix, Pedidos e Admin) ---

/**
 * Ouve alterações em uma coleção em tempo real.
 * Retorna uma função unsubscribe para parar de ouvir.
 */
export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void, 
  ...constraints: QueryConstraint[]
) => {
  const colRef = collection(db, collectionName);
  const q = query(colRef, ...constraints);

  // onSnapshot mantém uma conexão aberta
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
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
 * Ideal para mudança de status de pedido (Pendente -> Pago).
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
 * Útil quando offline ou para economizar leituras.
 */
export const getCollectionFromCache = async (collectionName: string, ...constraints: QueryConstraint[]) => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);
    // getDocsFromCache falha se não tiver cache, então o try/catch é importante
    const snapshot = await getDocsFromCache(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.warn(`Cache miss for ${collectionName}, falling back to network...`);
    // Fallback para rede se cache falhar
    return getCollection(collectionName, ...constraints);
  }
};