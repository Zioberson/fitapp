import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, addDoc, query, where, getDocs } from 'firebase/firestore';

// --- User Management ---

/**
 * Creates a user document in the 'users' collection after registration.
 * @param {string} uid - User ID from Firebase Auth.
 * @param {string} email - User's email.
 * @param {string} role - 'trainer' or 'client'.
 * @param {string} [trainerId=null] - The trainer's UID if the user is a client.
 */
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
  await setDoc(userRef, userData);
  return userData;
};

/**
 * Finds a trainer by their unique access code.
 * @param {string} accessCode - The access code to look for.
 * @returns {string|null} The trainer's UID or null if not found.
 */
export const findTrainerByAccessCode = async (accessCode) => {
  const q = query(collection(db, 'users'), where('role', '==', 'trainer'), where('accessCode', '==', accessCode));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    // Assuming access codes are unique, return the first match
    return querySnapshot.docs[0].id;
  }
  return null;
};

/**
 * Retrieves a user's document from Firestore.
 * @param {string} uid - User ID.
 * @returns {object|null} User data or null if not found.
 */
export const getUserDocument = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// --- Workout Plan Management ---

/**
 * Creates a new workout plan.
 * @param {object} planData - The workout plan details.
 * { trainerId, name, description, weeks: [...] }
 */
export const createWorkoutPlan = async (planData) => {
  const plansCollection = collection(db, 'workoutPlans');
  return await addDoc(plansCollection, {
    ...planData,
    createdAt: new Date(),
  });
};

// --- Measurement Management ---

/**
 * Adds a new measurement document for a client.
 * @param {string} clientId - The client's UID.
 * @param {object} measurementData - The measurement data.
 * { weight, chest, waist, biceps, thighs, photoUrl (optional) }
 */
export const addMeasurement = async (clientId, measurementData) => {
  // Measurements will be a subcollection of the client's user document
  const measurementsCollection = collection(db, 'users', clientId, 'measurements');
  return await addDoc(measurementsCollection, {
    ...measurementData,
    date: new Date(),
  });
};