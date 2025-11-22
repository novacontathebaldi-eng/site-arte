
import { db } from './config';
import { DocumentData } from 'firebase/firestore';

// Genérico para buscar coleção (Promise)
// Note: constraints are passed as raw objects or we need to adapt query logic.
// For V8 compat, we usually chain .where(). Since we use simple queries, we adapt simply.
export const getCollection = async (collectionName: string, ...constraints: any[]) => {
  try {
    let query: any = db.collection(collectionName);
    
    // Basic constraint handling for compat mode (simple where support)
    if (constraints && constraints.length > 0) {
        constraints.forEach(c => {
            // Assuming constraint is a where object or similar. 
            // Since we used v9 `where('field', 'op', 'val')`, we might need to adjust calls or assume constraints are handled.
            // For this fix, we'll assume the caller might pass v9 constraints which won't work directly in v8 chain without parsing.
            // However, keeping it simple: most calls are empty or simple.
            if (c && c.type === 'where') {
               query = query.where(c._field, c._op, c._value);
            }
        });
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
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
    const docRef = db.collection(collectionName).doc(id);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
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
    const docRef = await db.collection(collectionName).add({
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
    const docRef = db.collection(collectionName).doc(id);
    await docRef.update({
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
    const docRef = db.collection(collectionName).doc(id);
    await docRef.delete();
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
  callback: (data: any[]) => void
) => {
  const colRef = db.collection(collectionName);

  const unsubscribe = colRef.onSnapshot((snapshot: any) => {
    const data = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  }, (error: any) => {
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
  const docRef = db.collection(collectionName).doc(id);

  const unsubscribe = docRef.onSnapshot((docSnap: any) => {
    if (docSnap.exists) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error: any) => {
    console.error(`Error subscribing to document ${id}:`, error);
  });

  return unsubscribe;
};

// --- OFFLINE / CACHE ---

/**
 * Força a busca de dados do cache local do dispositivo.
 */
export const getCollectionFromCache = async (collectionName: string) => {
  try {
    const colRef = db.collection(collectionName);
    const snapshot = await colRef.get({ source: 'cache' });
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.warn(`Cache miss for ${collectionName}, falling back to network...`);
    return getCollection(collectionName);
  }
};
