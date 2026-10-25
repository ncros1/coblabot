/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudentProfile } from './types/cobla';
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

  // Load students list on mount (both localStorage and persistent server)
  useEffect(() => {
    let isMounted = true;

    const initStudents = async () => {
      // 1. Check local storage first
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

      // 2. Fetch server persistent storage (which persists across all browsers, incognito, windows)
      try {
        const res = await fetch('/api/students');
        if (res.ok && isMounted) {
          const data = await res.json();
          const serverStudents: StudentProfile[] = Array.isArray(data.students) ? data.students : [];
          const serverActiveId: string | null = data.lastActiveStudentId || null;

          // Merge server students and local students
          const map = new Map<string, StudentProfile>();
          serverStudents.forEach((s) => map.set(s.id, s));
          localList.forEach((s) => {
            if (!map.has(s.id) || (s.punts > (map.get(s.id)?.punts || 0))) {
              map.set(s.id, s);
            }
          });

          const merged = Array.from(map.values());

          if (merged.length > 0) {
            setStudents(merged);
            localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(merged));

            // Determine active student:
            // 1. local savedActiveId if valid in merged list
            // 2. serverActiveId if valid in merged list
            // 3. first student in the list
            let resolvedActiveId: string = merged[0].id;
            if (savedActiveId && merged.some((s) => s.id === savedActiveId)) {
              resolvedActiveId = savedActiveId;
            } else if (serverActiveId && merged.some((s) => s.id === serverActiveId)) {
              resolvedActiveId = serverActiveId;
            }

            setActiveStudentId(resolvedActiveId);
            localStorage.setItem(ACTIVE_STUDENT_ID_KEY, resolvedActiveId);
            setIsInitialRegistration(false);
            setIsRegistrationOpen(false);

            // Sync merged state back to server if needed
            if (merged.length !== serverStudents.length) {
              syncStudentsToServer(merged, resolvedActiveId);
            }
          } else {
            // Truly 0 students anywhere (first time EVER running the app)
            setIsInitialRegistration(true);
            setIsRegistrationOpen(true);
          }
        }
      } catch (err) {
        console.warn('Server storage sync check error:', err);
        if (localList.length === 0) {
          setIsInitialRegistration(true);
          setIsRegistrationOpen(true);
        }
      }
    };

    initStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentStudent = students.find((s) => s.id === activeStudentId) || null;

  // Persist updated student or add new student
  const handleSaveStudent = (updatedProfile: StudentProfile) => {
    setStudents((prevList) => {
      const index = prevList.findIndex((s) => s.id === updatedProfile.id || s.nom.toLowerCase() === updatedProfile.nom.toLowerCase());
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
    setIsRegistrationOpen(false);
    setIsInitialRegistration(false);
  };

  // Switch to an existing student
  const handleSelectExistingStudent = (selected: StudentProfile) => {
    setActiveStudentId(selected.id);
    localStorage.setItem(ACTIVE_STUDENT_ID_KEY, selected.id);
    setIsRegistrationOpen(false);
    setIsInitialRegistration(false);
    syncStudentsToServer(students, selected.id);
  };

  // Delete a student from the teacher panel
  const handleDeleteStudent = (studentId: string) => {
    const nextList = students.filter((s) => s.id !== studentId);
    setStudents(nextList);
    localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(nextList));
    syncStudentsToServer(nextList);

    if (activeStudentId === studentId) {
      const nextActive = nextList.length > 0 ? nextList[0].id : null;
      setActiveStudentId(nextActive);
      if (nextActive) {
        localStorage.setItem(ACTIVE_STUDENT_ID_KEY, nextActive);
      } else {
        localStorage.removeItem(ACTIVE_STUDENT_ID_KEY);
      }
    }
  };

  // Reset all students from teacher panel
  const handleResetAllStudents = () => {
    setStudents([]);
    setActiveStudentId(null);
    localStorage.removeItem(STUDENTS_LIST_KEY);
    localStorage.removeItem(ACTIVE_STUDENT_ID_KEY);
    localStorage.removeItem('coblabot_student_profile');
    syncStudentsToServer([]);
    setIsInitialRegistration(true);
    setIsRegistrationOpen(true);
  };

  // Update student activity with history log
  const logStudentActivity = (
    updater: (prev: StudentProfile) => Partial<StudentProfile>,
    actionDescription?: string
  ) => {
    if (!currentStudent) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowStr = new Date().toLocaleDateString('ca-ES') + ' ' + timeStr;

    setStudents((prevList) => {
      const nextList = prevList.map((s) => {
        if (s.id !== currentStudent.id) return s;

        const partial = updater(s);
        const prevActions = s.activitat?.accionsRecents || [];
        const nextActions = actionDescription
          ? [{ data: timeStr, accio: actionDescription }, ...prevActions.slice(0, 24)]
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

        return updatedStudent;
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

  // Add Points
  const handleAddPoints = (earnedPoints: number, actionDesc?: string, isPuzzleComplete?: boolean) => {
    logStudentActivity(
      (prev) => {
        const nextPoints = prev.punts + earnedPoints;
        return {
          punts: nextPoints,
          estrelles: Math.floor(nextPoints / 50) + 1,
          activitat: {
            ...prev.activitat,
            puzleEscenariCompletat: isPuzzleComplete ? true : prev.activitat?.puzleEscenariCompletat,
          },
        };
      },
      actionDesc || `Ha sumat +${earnedPoints} punts`
    );
  };

  // Record Endevinalla
  const handleRecordEndevinalla = () => {
    logStudentActivity((prev) => ({
      activitat: {
        ...prev.activitat,
        endevinallesEncertades: (prev.activitat?.endevinallesEncertades || 0) + 1,
      },
    }));
  };

  // Record Intrus
  const handleRecordIntrus = () => {
    logStudentActivity((prev) => ({
      activitat: {
        ...prev.activitat,
        intrusRondesEncertades: (prev.activitat?.intrusRondesEncertades || 0) + 1,
      },
    }));
  };

  // Record Mystery Sound
  const handleRecordMysterySound = () => {
    logStudentActivity((prev) => ({
      activitat: {
        ...prev.activitat,
        soMisteriosEncertats: (prev.activitat?.soMisteriosEncertats || 0) + 1,
      },
    }));
  };

  // Record Myth
  const handleRecordMyth = () => {
    logStudentActivity((prev) => ({
      activitat: {
        ...prev.activitat,
        mitesEncertats: (prev.activitat?.mitesEncertats || 0) + 1,
      },
    }));
  };

  // Complete Quiz & Award Diploma
  const handleCompleteQuiz = (score: number) => {
    const earnedPts = score * 15;
    logStudentActivity(
      (prev) => {
        const nextPoints = prev.punts + earnedPts;
        return {
          punts: nextPoints,
          estrelles: Math.floor(nextPoints / 50) + 1,
          puntuacioQuizMax: Math.max(prev.puntuacioQuizMax, score),
          diplomaObtingut: true,
          activitat: {
            ...prev.activitat,
            quizPuntuacio: Math.max(prev.activitat?.quizPuntuacio || 0, score),
            quizCompletat: true,
            diplomaObtingut: true,
          },
        };
      },
      `Ha completat el Gran Concurs amb ${score}/10 encerts! 📜 Diploma concedit!`
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
            onRecordEndevinalla={handleRecordEndevinalla}
            onRecordIntrus={handleRecordIntrus}
            onRecordMysterySound={handleRecordMysterySound}
            onRecordMyth={handleRecordMyth}
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
