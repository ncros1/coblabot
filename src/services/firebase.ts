import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import { StudentProfile } from '../types/cobla';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Connect to Firestore using specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test Connection as required by Firebase skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is restricted.');
    }
  }
}

testFirestoreConnection();

const STUDENTS_COLLECTION = 'students';
const META_COLLECTION = 'meta';
const APP_STATE_DOC = 'appState';

/**
 * Fetch all students and last active ID from Firestore
 */
export async function fetchStudentsFromFirestore(): Promise<{
  students: StudentProfile[];
  lastActiveStudentId: string | null;
}> {
  try {
    const colRef = collection(db, STUDENTS_COLLECTION);
    const snap = await getDocs(colRef);
    const students: StudentProfile[] = [];

    snap.forEach((d) => {
      const data = d.data() as StudentProfile;
      students.push({
        ...data,
        id: d.id,
      });
    });

    let lastActiveStudentId: string | null = null;
    try {
      const metaSnap = await getDoc(doc(db, META_COLLECTION, APP_STATE_DOC));
      if (metaSnap.exists()) {
        lastActiveStudentId = metaSnap.data()?.lastActiveStudentId || null;
      }
    } catch (err) {
      console.warn('Could not read appState meta from Firestore:', err);
    }

    if (!lastActiveStudentId && students.length > 0) {
      lastActiveStudentId = students[0].id;
    }

    return { students, lastActiveStudentId };
  } catch (err) {
    console.error('Error fetching students from Firestore:', err);
    return { students: [], lastActiveStudentId: null };
  }
}

/**
 * Subscribe to real-time updates for students across all browsers and devices
 */
export function subscribeToStudents(
  onStudentsChange: (students: StudentProfile[]) => void,
  onActiveIdChange?: (activeId: string | null) => void
): () => void {
  try {
    const colRef = collection(db, STUDENTS_COLLECTION);
    const unsubscribeStudents = onSnapshot(
      colRef,
      (snapshot) => {
        const students: StudentProfile[] = [];
        snapshot.forEach((d) => {
          students.push({ ...(d.data() as StudentProfile), id: d.id });
        });
        onStudentsChange(students);
      },
      (error) => {
        console.warn('Firestore onSnapshot students error:', error);
      }
    );

    let unsubscribeMeta: (() => void) | null = null;
    if (onActiveIdChange) {
      const metaDocRef = doc(db, META_COLLECTION, APP_STATE_DOC);
      unsubscribeMeta = onSnapshot(
        metaDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const activeId = docSnap.data()?.lastActiveStudentId || null;
            if (activeId) {
              onActiveIdChange(activeId);
            }
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot meta error:', error);
        }
      );
    }

    return () => {
      unsubscribeStudents();
      if (unsubscribeMeta) {
        unsubscribeMeta();
      }
    };
  } catch (err) {
    console.error('Failed to subscribe to Firestore:', err);
    return () => {};
  }
}

/**
 * Save or update a student record in Firestore
 */
export async function saveStudentToFirestore(
  student: StudentProfile,
  setActive = true
): Promise<void> {
  try {
    const studentDocRef = doc(db, STUDENTS_COLLECTION, student.id);
    const cleanStudent = JSON.parse(JSON.stringify(student));
    await setDoc(studentDocRef, cleanStudent, { merge: true });

    if (setActive) {
      const metaDocRef = doc(db, META_COLLECTION, APP_STATE_DOC);
      await setDoc(
        metaDocRef,
        {
          lastActiveStudentId: student.id,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error('Error saving student to Firestore:', err);
  }
}

/**
 * Set the last active student in Firestore
 */
export async function setActiveStudentInFirestore(studentId: string): Promise<void> {
  try {
    const metaDocRef = doc(db, META_COLLECTION, APP_STATE_DOC);
    await setDoc(
      metaDocRef,
      {
        lastActiveStudentId: studentId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error setting active student in Firestore:', err);
  }
}

/**
 * Delete a student from Firestore
 */
export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  try {
    const studentDocRef = doc(db, STUDENTS_COLLECTION, studentId);
    await deleteDoc(studentDocRef);
  } catch (err) {
    console.error('Error deleting student from Firestore:', err);
  }
}
