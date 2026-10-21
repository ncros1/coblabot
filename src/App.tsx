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
import { ChallengeGames } from './components/ChallengeGames';
import { CoblaBotChat } from './components/CoblaBotChat';
import { StudentRegistrationModal } from './components/StudentRegistrationModal';
import { TeacherPanelModal } from './components/TeacherPanelModal';
import { DiplomaModal } from './components/DiplomaModal';

const STUDENTS_LIST_KEY = 'coblabot_students_list';
const ACTIVE_STUDENT_ID_KEY = 'coblabot_active_student_id';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);
  const [isInitialRegistration, setIsInitialRegistration] = useState<boolean>(false);
  const [isTeacherPanelOpen, setIsTeacherPanelOpen] = useState<boolean>(false);
  const [isDiplomaOpen, setIsDiplomaOpen] = useState<boolean>(false);

  // Load students list on mount
  useEffect(() => {
    try {
      const savedList = localStorage.getItem(STUDENTS_LIST_KEY);
      let parsedList: StudentProfile[] = savedList ? JSON.parse(savedList) : [];

      // Migration check from older single-student storage if present
      if (parsedList.length === 0) {
        const legacy = localStorage.getItem('coblabot_student_profile');
        if (legacy) {
          const legObj = JSON.parse(legacy);
          const migratedStudent: StudentProfile = {
            id: legObj.id || `student_${Date.now()}_${legObj.nom?.toLowerCase() || 'alumne'}`,
            nom: legObj.nom || 'Alumne',
            avatar: legObj.avatar || '🤖',
            instrumentPreferit: legObj.instrumentPreferit || 'Tenora',
            punts: legObj.punts || 50,
            estrelles: legObj.estrelles || 1,
            activitat: {
              puzleEscenariCompletat: legObj.jocsCompletats?.puzle || false,
              endevinallesEncertades: legObj.jocsCompletats?.endevina ? 5 : 0,
              intrusRondesEncertades: legObj.jocsCompletats?.intrus ? 4 : 0,
              quizPuntuacio: legObj.puntuacioQuizMax || 0,
              quizCompletat: legObj.jocsCompletats?.quiz || false,
              diplomaObtingut: legObj.diplomaObtingut || false,
              preguntesXatFetes: 0,
              ultimaActivitat: new Date().toLocaleDateString('ca-ES'),
              accionsRecents: [{
                data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                accio: 'Inici de sessió a la CoblaBot',
              }],
            },
            puntuacioQuizMax: legObj.puntuacioQuizMax || 0,
            diplomaObtingut: legObj.diplomaObtingut || false,
            dataRegistre: legObj.dataRegistre || new Date().toLocaleDateString('ca-ES'),
          };
          parsedList = [migratedStudent];
          localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(parsedList));
        }
      }

      setStudents(parsedList);

      const savedActiveId = localStorage.getItem(ACTIVE_STUDENT_ID_KEY);
      if (savedActiveId && parsedList.some((s) => s.id === savedActiveId)) {
        setActiveStudentId(savedActiveId);
      } else if (parsedList.length > 0) {
        setActiveStudentId(parsedList[0].id);
      } else {
        // No students registered yet -> Open modal to enter name
        setIsInitialRegistration(true);
        setIsRegistrationOpen(true);
      }
    } catch (e) {
      console.warn('Failed to load students:', e);
      setIsInitialRegistration(true);
      setIsRegistrationOpen(true);
    }
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
  };

  // Delete a student from the teacher panel
  const handleDeleteStudent = (studentId: string) => {
    const nextList = students.filter((s) => s.id !== studentId);
    setStudents(nextList);
    localStorage.setItem(STUDENTS_LIST_KEY, JSON.stringify(nextList));

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

  // Record Chat Question
  const handleAskQuestion = (question: string) => {
    logStudentActivity(
      (prev) => ({
        activitat: {
          ...prev.activitat,
          preguntesXatFetes: (prev.activitat?.preguntesXatFetes || 0) + 1,
        },
      }),
      `Ha preguntat a CoblaBot: "${question.slice(0, 35)}..."`
    );
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
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

        {activeTab === 'challenges' && (
          <ChallengeGames
            student={currentStudent}
            onAddPoints={handleAddPoints}
            onCompleteQuiz={handleCompleteQuiz}
            onRecordEndevinalla={handleRecordEndevinalla}
            onRecordIntrus={handleRecordIntrus}
            onOpenDiploma={() => setIsDiplomaOpen(true)}
          />
        )}

        {activeTab === 'chat' && (
          <CoblaBotChat
            student={currentStudent}
            onAskQuestion={handleAskQuestion}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-200/70 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖🎷</span>
            <span className="font-extrabold text-amber-800">CoblaBot</span>
            <span>• Recursos d'Educació Musical per a Primària</span>
          </div>

          <div className="flex items-center gap-3">
            <span>11 músics, 12 instruments i tradició viva 🎶</span>
            <button
              onClick={() => setIsTeacherPanelOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition"
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
