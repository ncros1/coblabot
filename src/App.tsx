/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudentProfile, StudentActivityLog } from './types/cobla';
import { Navbar, ActiveTab } from './components/Navbar';
import { ExplorationHome } from './components/ExplorationHome';
import { InstrumentsGallery } from './components/InstrumentsGallery';
import { StageInteractive } from './components/StageInteractive';
import { SoundLab } from './components/SoundLab';
import { DossierCuriosities } from './components/DossierCuriosities';
import { ChallengeGames } from './components/ChallengeGames';
import { StudentRegistrationModal } from './components/StudentRegistrationModal';
import { TeacherPanelModal } from './components/TeacherPanelModal';
import { DiplomaModal } from './components/DiplomaModal';
import {
  fetchStudentsFromFirestore,
  subscribeToStudents,
  saveStudentToFirestore,
  setActiveStudentInFirestore,
  deleteStudentFromFirestore,
} from './services/firebase';

const STUDENTS_LIST_KEY = 'coblabot_students_list';
const ACTIVE_STUDENT_ID_KEY = 'coblabot_active_student_id';

// Permanent storage sync helper to save students to server disk
const syncStudentsToServer = async (studentsList: StudentProfile[], activeId?: string | null) => {
  try {
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: studentsList, lastActiveStudentId: activeId }),
    });
  } catch (err) {
    console.warn('Failed to sync students to server permanent file:', err);
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);
  const [isInitialRegistration, setIsInitialRegistration] = useState<boolean>(false);
  const [isTeacherPanelOpen, setIsTeacherPanelOpen] = useState<boolean>(false);
  const [isDiplomaOpen, setIsDiplomaOpen] = useState<boolean>(false);

  // Load students list on mount (Firestore cloud sync + real-time subscription + local fallback)
  useEffect(() => {
    let isMounted = true;
    let unsubscribeFirestore: (() => void) | null = null;

    const initStudents = async () => {
      // 1. Instant cache check from localStorage
      let localList: StudentProfile[] = [];
      const savedActiveId = localStorage.getItem(ACTIVE_STUDENT_ID_KEY);

      try {
        const savedList = localStorage.getItem(STUDENTS_LIST_KEY);
        localList = savedList ? JSON.parse(savedList) : [];
      } catch (e) {
        console.warn('Error reading local students:', e);
      }

      if (localList.length > 0) {
        setStudents(localList);
        if (savedActiveId && localList.some((s) => s.id === savedActiveId)) {
          setActiveStudentId(savedActiveId);
        } else {
          setActiveStudentId(localList[0].id);
        }
      }

      // 2. Fetch from Firebase Firestore (Shared across ALL browsers, accounts, devices)
      try {
        const { students: firestoreStudents, lastActiveStudentId: firestoreActiveId } =
          await fetchStudentsFromFirestore();

        let resolvedList: StudentProfile[] = firestoreStudents;

        // If Firestore is empty on first boot, check if server has legacy records (like NEus) to migrate
        if (firestoreStudents.length === 0) {
          try {
            const res = await fetch('/api/students');
            if (res.ok) {
              const data = await res.json();
              const serverStudents: StudentProfile[] = Array.isArray(data.students) ? data.students : [];
              if (serverStudents.length > 0) {
                // Seed Firestore with existing records
                for (const st of serverStudents) {
                  await saveStudentToFirestore(st, false);
                }
                if (data.lastActiveStudentId) {
                  await setActiveStudentInFirestore(data.lastActiveStudentId);
                }
                resolvedList = serverStudents;
              }
            }
          } catch (e) {
            console.warn('Legacy server migration check:', e);
          }
        }

        // Merge with any local list if needed
        const map = new Map<string, StudentProfile>();
        resolvedList.forEach((s) => map.set(s.id, s));
        localList.forEach((s) => {
          if (!map.has(s.id) || (s.punts > (map.get(s.id)?.punts || 0))) {
            map.set(s.id, s);
            saveStudentToFirestore(s, false);
          }
        });

        const merged = Array.from(map.values());

        if (isMounted) {
          if (merged.length > 0) {
            setStudents(merged);
            localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(merged));

            let resolvedActiveId: string = merged[0].id;
            if (savedActiveId && merged.some((s) => s.id === savedActiveId)) {
              resolvedActiveId = savedActiveId;
            } else if (firestoreActiveId && merged.some((s) => s.id === firestoreActiveId)) {
              resolvedActiveId = firestoreActiveId;
            }

            setActiveStudentId(resolvedActiveId);
            localStorage.setItem(ACTIVE_STUDENT_ID_KEY, resolvedActiveId);
            setIsInitialRegistration(false);
            setIsRegistrationOpen(false);
          } else {
            setIsInitialRegistration(true);
            setIsRegistrationOpen(true);
          }
        }

        // 3. Real-time Firestore subscription across all devices
        unsubscribeFirestore = subscribeToStudents((liveStudents) => {
          if (!isMounted) return;
          if (liveStudents.length > 0) {
            setStudents(liveStudents);
            localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(liveStudents));
            setActiveStudentId((prev) => {
              // Retain currently active student on this device if they still exist
              if (prev && liveStudents.some((s) => s.id === prev)) {
                return prev;
              }
              const localSaved = localStorage.getItem(ACTIVE_STUDENT_ID_KEY);
              if (localSaved && liveStudents.some((s) => s.id === localSaved)) {
                return localSaved;
              }
              const newActive = liveStudents[0].id;
              localStorage.setItem(ACTIVE_STUDENT_ID_KEY, newActive);
              return newActive;
            });
            setIsInitialRegistration(false);
            // Notice: do NOT call setIsRegistrationOpen(false) here to avoid closing open modals while a user is typing
          }
        });
      } catch (err) {
        console.warn('Firestore initialization error:', err);
        if (localList.length === 0 && isMounted) {
          setIsInitialRegistration(true);
          setIsRegistrationOpen(true);
        }
      }
    };

    initStudents();

    return () => {
      isMounted = false;
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const currentStudent = students.find((s) => s.id === activeStudentId) || null;

  // Persist updated student or add new student
  const handleSaveStudent = (updatedProfile: StudentProfile) => {
    // 1. Save to Firestore (instant cloud sync across all devices & accounts)
    saveStudentToFirestore(updatedProfile, true);

    setStudents((prevList) => {
      // Strictly match by ID only (never by name!) so new students never overwrite existing ones
      const index = prevList.findIndex((s) => s.id === updatedProfile.id);
      let nextList: StudentProfile[];

      if (index >= 0) {
        nextList = [...prevList];
        nextList[index] = { ...nextList[index], ...updatedProfile };
      } else {
        nextList = [updatedProfile, ...prevList];
      }

      try {
        localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(nextList));
        localStorage.setItem(ACTIVE_STUDENT_ID_KEY, updatedProfile.id);
        syncStudentsToServer(nextList, updatedProfile.id);
      } catch (e) {
        console.warn('Storage error:', e);
      }

      return nextList;
    });

    setActiveStudentId(updatedProfile.id);
    localStorage.setItem(ACTIVE_STUDENT_ID_KEY, updatedProfile.id);
    setIsRegistrationOpen(false);
    setIsInitialRegistration(false);
  };

  // Switch to an existing student
  const handleSelectExistingStudent = (selected: StudentProfile) => {
    setActiveStudentId(selected.id);
    localStorage.setItem(ACTIVE_STUDENT_ID_KEY, selected.id);
    setActiveStudentInFirestore(selected.id);
    syncStudentsToServer(students, selected.id);
    setIsRegistrationOpen(false);
    setIsInitialRegistration(false);
  };

  // Delete a student from the teacher panel
  const handleDeleteStudent = (studentId: string) => {
    deleteStudentFromFirestore(studentId);
    const nextList = students.filter((s) => s.id !== studentId);
    setStudents(nextList);
    localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(nextList));
    syncStudentsToServer(nextList);

    if (activeStudentId === studentId) {
      const nextActive = nextList.length > 0 ? nextList[0].id : null;
      setActiveStudentId(nextActive);
      if (nextActive) {
        localStorage.setItem(ACTIVE_STUDENT_ID_KEY, nextActive);
        setActiveStudentInFirestore(nextActive);
      } else {
        localStorage.removeItem(ACTIVE_STUDENT_ID_KEY);
      }
    }
  };

  // Reset all students from teacher panel (full wipe)
  const handleResetAllStudents = async () => {
    for (const s of students) {
      deleteStudentFromFirestore(s.id);
    }
    setStudents([]);
    setActiveStudentId(null);
    localStorage.removeItem(STUDENTS_LIST_KEY);
    localStorage.removeItem(ACTIVE_STUDENT_ID_KEY);
    localStorage.removeItem('coblabot_student_profile');
    syncStudentsToServer([]);
    setIsInitialRegistration(true);
    setIsRegistrationOpen(true);
  };

  // Reset points of a single student (KEEPS THE STUDENT PROFILE INTACT)
  const handleResetStudentPoints = (studentId: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowStr = new Date().toLocaleDateString('ca-ES') + ' ' + timeStr;

    setStudents((prevList) => {
      let updatedStudent: StudentProfile | null = null;
      const nextList = prevList.map((s) => {
        if (s.id !== studentId) return s;

        const prevActions = s.activitat?.accionsRecents || [];
        const next: StudentProfile = {
          ...s,
          punts: 0,
          estrelles: 1,
          puntuacioQuizMax: 0,
          diplomaObtingut: false,
          activitat: {
            ...s.activitat,
            totalEncerts: 0,
            totalErrors: 0,
            endevinallesEncertades: 0,
            endevinallesErrors: 0,
            intrusRondesEncertades: 0,
            intrusErrors: 0,
            soMisteriosEncertats: 0,
            soMisteriosErrors: 0,
            mitesEncertats: 0,
            mitesErrors: 0,
            quizPuntuacio: 0,
            quizErrors: 0,
            quizCompletat: false,
            puzleEscenariCompletat: false,
            puzleEscenariErrors: 0,
            diplomaObtingut: false,
            jocsCompletatsTimestamps: {},
            ultimaActivitat: nowStr,
            accionsRecents: [
              {
                data: timeStr,
                accio: 'Punts i marcadors posats a 0 per la mestra (alumne conservat)',
                tipus: 'info',
              },
              ...prevActions.slice(0, 20),
            ],
          },
        };

        updatedStudent = next;
        return next;
      });

      if (updatedStudent) {
        saveStudentToFirestore(updatedStudent, false);
      }

      try {
        localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(nextList));
        syncStudentsToServer(nextList);
      } catch (e) {
        console.warn('Storage error:', e);
      }

      return nextList;
    });
  };

  // Reset points for ALL students (KEEPS ALL STUDENTS INTACT)
  const handleResetAllPoints = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowStr = new Date().toLocaleDateString('ca-ES') + ' ' + timeStr;

    setStudents((prevList) => {
      const nextList = prevList.map((s) => {
        const prevActions = s.activitat?.accionsRecents || [];
        const updated: StudentProfile = {
          ...s,
          punts: 0,
          estrelles: 1,
          puntuacioQuizMax: 0,
          diplomaObtingut: false,
          activitat: {
            ...s.activitat,
            totalEncerts: 0,
            totalErrors: 0,
            endevinallesEncertades: 0,
            endevinallesErrors: 0,
            intrusRondesEncertades: 0,
            intrusErrors: 0,
            soMisteriosEncertats: 0,
            soMisteriosErrors: 0,
            mitesEncertats: 0,
            mitesErrors: 0,
            quizPuntuacio: 0,
            quizErrors: 0,
            quizCompletat: false,
            puzleEscenariCompletat: false,
            puzleEscenariErrors: 0,
            diplomaObtingut: false,
            jocsCompletatsTimestamps: {},
            ultimaActivitat: nowStr,
            accionsRecents: [
              {
                data: timeStr,
                accio: 'Punts i marcadors posats a 0 per la mestra (alumnat conservat)',
                tipus: 'info',
              },
              ...prevActions.slice(0, 15),
            ],
          },
        };
        saveStudentToFirestore(updated, false);
        return updated;
      });

      try {
        localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(nextList));
        syncStudentsToServer(nextList);
      } catch (e) {
        console.warn('Storage error:', e);
      }

      return nextList;
    });
  };

  // Update student activity with history log
  const logStudentActivity = (
    updater: (prev: StudentProfile) => Partial<StudentProfile>,
    actionDescription?: string,
    actionType: 'encert' | 'error' | 'info' = 'info'
  ) => {
    if (!currentStudent) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowStr = new Date().toLocaleDateString('ca-ES') + ' ' + timeStr;

    setStudents((prevList) => {
      let savedStudent: StudentProfile | null = null;
      const nextList = prevList.map((s) => {
        if (s.id !== currentStudent.id) return s;

        const partial = updater(s);
        const prevActions = s.activitat?.accionsRecents || [];
        const nextActions = actionDescription
          ? [{ data: timeStr, accio: actionDescription, tipus: actionType }, ...prevActions.slice(0, 39)]
          : prevActions;

        const updatedStudent: StudentProfile = {
          ...s,
          ...partial,
          activitat: {
            ...s.activitat,
            ...(partial.activitat || {}),
            ultimaActivitat: nowStr,
            accionsRecents: nextActions,
          },
        };

        savedStudent = updatedStudent;
        return updatedStudent;
      });

      if (savedStudent) {
        saveStudentToFirestore(savedStudent, false);
      }

      try {
        localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(nextList));
        syncStudentsToServer(nextList);
      } catch (e) {
        console.warn('Storage error:', e);
      }

      return nextList;
    });
  };

  // Add Points
  const handleAddPoints = (earnedPoints: number, actionDesc?: string, isPuzzleComplete?: boolean) => {
    logStudentActivity(
      (prev) => {
        const nextPoints = prev.punts + earnedPoints;
        const now = Date.now();
        const prevTimestamps = prev.activitat?.jocsCompletatsTimestamps || {};
        return {
          punts: nextPoints,
          estrelles: Math.floor(nextPoints / 50) + 1,
          activitat: {
            ...prev.activitat,
            puzleEscenariCompletat: isPuzzleComplete ? true : prev.activitat?.puzleEscenariCompletat,
            ...(isPuzzleComplete
              ? {
                  totalEncerts: (prev.activitat?.totalEncerts || 0) + 1,
                  jocsCompletatsTimestamps: {
                    ...prevTimestamps,
                    puzleEscenari: now,
                  },
                }
              : {}),
          },
        };
      },
      actionDesc || `Ha sumat +${earnedPoints} punts`,
      'encert'
    );
  };

  // Record an Encert
  const handleRecordEncert = (
    gameType: 'endevinalles' | 'intrus' | 'soMisterios' | 'mites' | 'quiz' | 'puzleEscenari',
    desc: string,
    pointsAwarded = 0
  ) => {
    logStudentActivity(
      (prev) => {
        const act = prev.activitat || ({} as any);
        const nextPoints = prev.punts + pointsAwarded;
        const updates: Partial<StudentActivityLog> = {
          totalEncerts: (act.totalEncerts || 0) + 1,
        };

        if (gameType === 'endevinalles') {
          updates.endevinallesEncertades = (act.endevinallesEncertades || 0) + 1;
        } else if (gameType === 'intrus') {
          updates.intrusRondesEncertades = (act.intrusRondesEncertades || 0) + 1;
        } else if (gameType === 'soMisterios') {
          updates.soMisteriosEncertats = (act.soMisteriosEncertats || 0) + 1;
        } else if (gameType === 'mites') {
          updates.mitesEncertats = (act.mitesEncertats || 0) + 1;
        }

        return {
          punts: nextPoints,
          estrelles: Math.floor(nextPoints / 50) + 1,
          activitat: {
            ...act,
            ...updates,
          },
        };
      },
      `✅ Encert: ${desc}${pointsAwarded > 0 ? ` (+${pointsAwarded} pts)` : ''}`,
      'encert'
    );
  };

  // Record an Error / Wrong Attempt
  const handleRecordError = (
    gameType: 'endevinalles' | 'intrus' | 'soMisterios' | 'mites' | 'quiz' | 'puzleEscenari',
    desc: string
  ) => {
    logStudentActivity(
      (prev) => {
        const act = prev.activitat || ({} as any);
        const updates: Partial<StudentActivityLog> = {
          totalErrors: (act.totalErrors || 0) + 1,
        };

        if (gameType === 'endevinalles') {
          updates.endevinallesErrors = (act.endevinallesErrors || 0) + 1;
        } else if (gameType === 'intrus') {
          updates.intrusErrors = (act.intrusErrors || 0) + 1;
        } else if (gameType === 'soMisterios') {
          updates.soMisteriosErrors = (act.soMisteriosErrors || 0) + 1;
        } else if (gameType === 'mites') {
          updates.mitesErrors = (act.mitesErrors || 0) + 1;
        } else if (gameType === 'quiz') {
          updates.quizErrors = (act.quizErrors || 0) + 1;
        } else if (gameType === 'puzleEscenari') {
          updates.puzleEscenariErrors = (act.puzleEscenariErrors || 0) + 1;
        }

        return {
          activitat: {
            ...act,
            ...updates,
          },
        };
      },
      `❌ Error: ${desc}`,
      'error'
    );
  };

  // Complete a game and lock it for 24 hours
  const handleCompleteGame = (
    gameKey: 'endevinalles' | 'intrus' | 'soMisterios' | 'mites' | 'quiz' | 'puzleEscenari',
    completionMessage?: string
  ) => {
    const now = Date.now();
    logStudentActivity(
      (prev) => {
        const act = prev.activitat || ({} as any);
        const prevTimestamps = act.jocsCompletatsTimestamps || {};
        return {
          activitat: {
            ...act,
            jocsCompletatsTimestamps: {
              ...prevTimestamps,
              [gameKey]: now,
            },
          },
        };
      },
      completionMessage || `🏆 Ha completat el joc de "${gameKey}"! Bloquejat durant 24 hores per consolidar els coneixements.`,
      'info'
    );
  };

  // Complete Quiz & Award Diploma
  const handleCompleteQuiz = (score: number) => {
    const earnedPts = score * 15;
    const now = Date.now();
    logStudentActivity(
      (prev) => {
        const act = prev.activitat || ({} as any);
        const prevTimestamps = act.jocsCompletatsTimestamps || {};
        const nextPoints = prev.punts + earnedPts;
        return {
          punts: nextPoints,
          estrelles: Math.floor(nextPoints / 50) + 1,
          puntuacioQuizMax: Math.max(prev.puntuacioQuizMax, score),
          diplomaObtingut: true,
          activitat: {
            ...act,
            totalEncerts: (act.totalEncerts || 0) + score,
            quizPuntuacio: Math.max(act.quizPuntuacio || 0, score),
            quizCompletat: true,
            diplomaObtingut: true,
            jocsCompletatsTimestamps: {
              ...prevTimestamps,
              quiz: now,
            },
          },
        };
      },
      `Ha completat el Gran Concurs amb ${score}/10 encerts! 📜 Diploma concedit! (Bloquejat 24h)`,
      'encert'
    );

    setIsDiplomaOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-slate-800 font-sans">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        student={currentStudent}
        onOpenProfile={() => {
          setIsInitialRegistration(false);
          setIsRegistrationOpen(true);
        }}
        onOpenTeacherPanel={() => setIsTeacherPanelOpen(true)}
      />

      {/* Main Content Area - Optimized responsive padding for phones, tablets & desktop */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-24 lg:pb-12">
        {activeTab === 'home' && (
          <ExplorationHome
            student={currentStudent}
            setActiveTab={setActiveTab}
            onOpenDiploma={() => setIsDiplomaOpen(true)}
          />
        )}

        {activeTab === 'instruments' && (
          <InstrumentsGallery />
        )}

        {activeTab === 'stage' && (
          <StageInteractive
            student={currentStudent}
            onAddPoints={handleAddPoints}
            onRecordError={handleRecordError}
            onCompleteGame={handleCompleteGame}
          />
        )}

        {activeTab === 'soundlab' && (
          <SoundLab />
        )}

        {activeTab === 'curiosities' && (
          <DossierCuriosities
            onAddPoints={handleAddPoints}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengeGames
            student={currentStudent}
            onAddPoints={handleAddPoints}
            onCompleteQuiz={handleCompleteQuiz}
            onRecordEncert={handleRecordEncert}
            onRecordError={handleRecordError}
            onCompleteGame={handleCompleteGame}
            onOpenDiploma={() => setIsDiplomaOpen(true)}
          />
        )}
      </main>

      {/* Mobile Ergonomic Bottom Nav Dock (Phones) */}
      <nav aria-label="Navegació per a mòbils" className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-amber-200/90 px-1 py-1 shadow-2xl flex items-center justify-around">
        {[
          { id: 'home', label: 'Inici', icon: '🧭' },
          { id: 'instruments', label: 'Instruments', icon: '🎷' },
          { id: 'stage', label: 'Escenari', icon: '📍' },
          { id: 'soundlab', label: 'Sons', icon: '🎧' },
          { id: 'curiosities', label: 'Peces', icon: '🎼' },
          { id: 'challenges', label: 'Reptes', icon: '🎮' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as ActiveTab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition min-h-[48px] active:scale-95 ${
                isActive
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              <span className="text-lg leading-none mb-0.5">{item.icon}</span>
              <span className="text-[10px] leading-tight truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-200/70 bg-white/70 py-6 text-center text-xs text-slate-500 mb-14 lg:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖🎷</span>
            <span className="font-extrabold text-amber-800">CoblaBot</span>
            <span>• Recursos d'Educació Musical per a Primària</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Registre Permanent Actiu (Mai caduca)
            </span>
            <button
              onClick={() => setIsTeacherPanelOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition min-h-[36px]"
              title="Panell d'Avaluació de la Mestra"
            >
              <span>🔐 Panell Mestra</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Student Registration & Switcher Modal (No grade asked!) */}
      <StudentRegistrationModal
        isOpen={isRegistrationOpen}
        onSave={handleSaveStudent}
        onSelectExistingStudent={handleSelectExistingStudent}
        allStudents={students}
        currentProfile={currentStudent}
        isInitial={isInitialRegistration}
        onClose={() => setIsRegistrationOpen(false)}
      />

      {/* Teacher Protected Registry Panel Modal */}
      <TeacherPanelModal
        isOpen={isTeacherPanelOpen}
        onClose={() => setIsTeacherPanelOpen(false)}
        students={students}
        onDeleteStudent={handleDeleteStudent}
        onResetAllStudents={handleResetAllStudents}
        onResetStudentPoints={handleResetStudentPoints}
        onResetAllPoints={handleResetAllPoints}
      />

      {/* Official Diploma Modal */}
      <DiplomaModal
        isOpen={isDiplomaOpen}
        onClose={() => setIsDiplomaOpen(false)}
        student={currentStudent}
      />

    </div>
  );
}
