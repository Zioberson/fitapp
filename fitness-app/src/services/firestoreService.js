import { db, storage } from '../firebaseConfig'; // Import storage
import { collection, doc, setDoc, getDoc, addDoc, query, where, getDocs, writeBatch, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

/**
 * Updates a user's profile data in Firestore.
 * @param {string} uid - The user's UID.
 * @param {object} data - The data to update (e.g., { height: 180 }).
 */
export const updateUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
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

/**
 * Finds the active plan assigned to a client for a specific type.
 * @param {string} clientId - The client's UID.
 * @param {string} type - The type of plan ('workout' or 'nutrition').
 * @returns {object|null} The assignment document or null if not found.
 */
export const getActiveClientPlanAssignment = async (clientId, type) => {
    const q = query(
        collection(db, 'assignedPlans'),
        where('clientId', '==', clientId),
        where('isActive', '==', true),
        where('type', '==', type)
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

export const getTrainerPlans = async (trainerId) => {
    const q = query(collection(db, 'trainingPlans'), where('trainerId', '==', trainerId));
    const querySnapshot = await getDocs(q);
    const plans = [];
    querySnapshot.forEach((doc) => {
        plans.push({ id: doc.id, ...doc.data() });
    });
    return plans;
};

/**
 * Assigns a plan to a client, deactivating any previously active plans of the same type.
 * @param {string} trainerId - The trainer's UID.
 * @param {string} clientId - The client's UID.
 * @param {string} planId - The ID of the plan to assign.
 * @param {string} type - The type of plan ('workout' or 'nutrition').
 */
export const assignPlanToClient = async (trainerId, clientId, planId, type) => {
  const batch = writeBatch(db);

  const activePlansQuery = query(
    collection(db, 'assignedPlans'),
    where('clientId', '==', clientId),
    where('isActive', '==', true),
    where('type', '==', type)
  );
  const activePlansSnapshot = await getDocs(activePlansQuery);
  activePlansSnapshot.forEach((document) => {
    const docRef = doc(db, 'assignedPlans', document.id);
    batch.update(docRef, { isActive: false });
  });

  const newAssignmentRef = doc(collection(db, 'assignedPlans'));
  batch.set(newAssignmentRef, {
    trainerId,
    clientId,
    planId,
    type,
    isActive: true,
    startDate: new Date(),
  });

  await batch.commit();
};

// --- Meal Plan Management ---

export const createMealPlan = async (planData) => {
  const plansCollection = collection(db, 'mealPlans');
  return await addDoc(plansCollection, {
    ...planData,
    createdAt: new Date(),
  });
};

export const getTrainerMealPlans = async (trainerId) => {
    const q = query(collection(db, 'mealPlans'), where('trainerId', '==', trainerId));
    const querySnapshot = await getDocs(q);
    const plans = [];
    querySnapshot.forEach((doc) => {
        plans.push({ id: doc.id, ...doc.data() });
    });
    return plans;
};

export const getMealPlanDetails = async (planId) => {
    const planRef = doc(db, 'mealPlans', planId);
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

/**
 * Retrieves all measurements for a specific client, ordered by date.
 * @param {string} clientId - The client's UID.
 * @returns {Array} A list of measurement objects.
 */
export const getClientMeasurements = async (clientId) => {
    const q = query(
        collection(db, 'measurements'),
        where('clientId', '==', clientId),
        orderBy('date', 'desc') // Get the newest first
    );
    const querySnapshot = await getDocs(q);
    const measurements = [];
    querySnapshot.forEach((doc) => {
        measurements.push({ id: doc.id, ...doc.data() });
    });
    return measurements;
};

/**
 * Uploads an image to Firebase Storage and returns its URL.
 * @param {string} uri - The local URI of the image file.
 * @param {string} userId - The user's UID to create a unique path.
 * @returns {string} The public download URL of the uploaded image.
 */
export const uploadImageAndGetURL = async (uri, userId) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `progress_photos/${userId}/${new Date().toISOString()}`);

    await uploadBytes(fileRef, blob);
    const downloadURL = await getDownloadURL(fileRef);

    return downloadURL;
};