import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Generic Get One
export const getDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
};

// Generic Get All (with optional queries)
export const getCollection = async <T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> => {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

// Generic Create (Auto ID)
export const createDocument = async <T extends WithFieldValue<DocumentData>>(collectionName: string, data: T) => {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// Generic Set (Specific ID)
export const setDocument = async <T extends WithFieldValue<DocumentData>>(collectionName: string, id: string, data: T, merge = true) => {
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge });
};

// Generic Update
export const updateDocument = async (collectionName: string, id: string, data: Partial<DocumentData>) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Generic Delete
export const removeDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Real-time Listener
export const subscribeToCollection = <T>(
  collectionName: string, 
  constraints: QueryConstraint[], 
  callback: (data: T[]) => void
) => {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    callback(data);
  });
};