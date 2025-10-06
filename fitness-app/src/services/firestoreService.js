import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, addDoc, query, where, getDocs } from 'firebase/firestore';

// --- User Management ---

// Helper to generate a random alphanumeric code
const generateAccessCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createUserDocument = async (uid, email, role, trainerId = null) => {
  const userRef = doc(db, 'users', uid);
  const userData = {
    uid,
    email,
    role,
    createdAt: new Date(),
  };
  if (role === 'client' && trainerId) {
    userData.trainerId = trainerId;
  }
  if (role === 'trainer') {
    userData.accessCode = generateAccessCode();
  }
  await setDoc(userRef, userData);
  return userData;
};

export const findTrainerByAccessCode = async (accessCode) => {
  const q = query(collection(db, 'users'), where('role', '==', 'trainer'), where('accessCode', '==', accessCode));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  return null;
};

export const getUserDocument = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const getTrainerClients = async (trainerId) => {
  const q = query(collection(db, 'users'), where('role', '==', 'client'), where('trainerId', '==', trainerId));
  const querySnapshot = await getDocs(q);
  const clients = [];
  querySnapshot.forEach((doc) => {
    clients.push({ id: doc.id, ...doc.data() });
  });
  return clients;
};

// --- Training Plan Management ---

export const createWorkoutPlan = async (planData) => {
  // CORRECTED: Using 'trainingPlans' to match the defined schema.
  const plansCollection = collection(db, 'trainingPlans');
  return await addDoc(plansCollection, {
    ...planData,
    createdAt: new Date(),
  });
};

export const getActiveClientPlanAssignment = async (clientId) => {
    const q = query(
        collection(db, 'assignedPlans'),
        where('clientId', '==', clientId),
        where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    return null;
};

export const getPlanDetails = async (planId) => {
    const planRef = doc(db, 'trainingPlans', planId);
    const docSnap = await getDoc(planRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// --- Measurement Management ---

export const addMeasurement = async (clientId, measurementData) => {
  // CORRECTED: Using a top-level 'measurements' collection as per the schema.
  const measurementsCollection = collection(db, 'measurements');
  return await addDoc(measurementsCollection, {
    clientId, // Storing clientId with the measurement data
    ...measurementData,
    date: new Date(),
  });
};