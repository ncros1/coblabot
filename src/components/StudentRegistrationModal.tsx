import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types/cobla';
import { User, Sparkles, Music, Users, PlusCircle, Check, Edit2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onSave: (profile: StudentProfile) => void;
  onSelectExistingStudent?: (student: StudentProfile) => void;
  allStudents?: StudentProfile[];
  currentProfile: StudentProfile | null;
  onClose?: () => void;
  isInitial?: boolean;
}

const AVATARS = [
  { id: 'robot-bot', icon: '🤖', name: 'CoblaBot Amic' },
  { id: 'tenora-king', icon: '🎺👑', name: 'Mestre Tenora' },
  { id: 'flabiol-master', icon: '🪈🥁', name: 'Flabiolaire Trempat' },
  { id: 'tible-star', icon: '🎷⭐', name: 'Tiblístic Enèrgic' },
  { id: 'fiscorn-artist', icon: '📯✨', name: 'Fiscornista Càlid' },
  { id: 'bass-giant', icon: '🎻🎩', name: 'Contrabaxista d’Elit' },
  { id: 'sardana-dancer', icon: '💃🎶', name: 'Ballador/a Alegre' },
  { id: 'music-notes', icon: '🎵🌟', name: 'Solfeig Brillant' },
];

export const StudentRegistrationModal: React.FC<Props> = ({
  isOpen,
  onSave,
  onSelectExistingStudent,
  allStudents = [],
  currentProfile,
  onClose,
  isInitial = false,
}) => {
  const [mode, setMode] = useState<'pick' | 'new' | 'edit'>(
    allStudents.length > 0 && !isInitial ? 'pick' : 'new'
  );
  const [nom, setNom] = useState('');
  const [avatar, setAvatar] = useState('🤖');
  const [instrumentPreferit, setInstrumentPreferit] = useState('Tenora');
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<StudentProfile | null>(null);

  // Initialize or reset form values when modal opens or student list arrives
  useEffect(() => {
    if (isOpen) {
      setError('');
      setDuplicateWarning(null);
      if (allStudents.length > 0 && !isInitial) {
        setMode('pick');
      } else {
        setMode('new');
        setNom('');
        setAvatar('🤖');
        setInstrumentPreferit('Tenora');
      }
    }
  }, [isOpen, isInitial]);

  // Handle mode switches
  const handleSwitchToNew = () => {
    setMode('new');
    setNom('');
    setAvatar('🤖');
    setInstrumentPreferit('Tenora');
    setError('');
    setDuplicateWarning(null);
  };

  const handleSwitchToEdit = () => {
    if (!currentProfile) return;
    setMode('edit');
    setNom(currentProfile.nom || '');
    setAvatar(currentProfile.avatar || '🤖');
    setInstrumentPreferit(currentProfile.instrumentPreferit || 'Tenora');
    setError('');
    setDuplicateWarning(null);
  };

  const handleSwitchToPick = () => {
    setMode('pick');
    setError('');
    setDuplicateWarning(null);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNom = nom.trim();

    if (!cleanNom) {
      setError('Si us plau, escriu el teu nom per poder continuar!');
      return;
    }

    if (mode === 'new') {
      // Check if another student has the exact same name
      const duplicate = allStudents.find(
        (s) => s.nom.trim().toLowerCase() === cleanNom.toLowerCase()
      );

      if (duplicate && !duplicateWarning) {
        setDuplicateWarning(duplicate);
        setError(
          `Ja hi ha un alumne registrat anomenat "${duplicate.nom}". Si ets tu, clica "Entrar com a ${duplicate.nom}". Si sou dos companys amb el mateix nom, afegeix la inicial del cognom (per exemple: ${cleanNom} P.)!`
        );
        return;
      }

      // Generate a GUARANTEED unique ID for this new student (never overwrites existing students)
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const safeSlug = cleanNom.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const uniqueId = `student_${Date.now()}_${randomSuffix}_${safeSlug}`;

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const nowDate = new Date().toLocaleDateString('ca-ES');

      const newStudent: StudentProfile = {
        id: uniqueId,
        nom: cleanNom,
        avatar,
        instrumentPreferit,
        punts: 50,
        estrelles: 1,
        activitat: {
          puzleEscenariCompletat: false,
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
          puzleEscenariErrors: 0,
          diplomaObtingut: false,
          preguntesXatFetes: 0,
          ultimaActivitat: `${nowDate} ${nowTime}`,
          accionsRecents: [
            {
              data: nowTime,
              accio: 'Nou registre d’alumne a la CoblaBot',
              tipus: 'info',
            },
          ],
        },
        puntuacioQuizMax: 0,
        diplomaObtingut: false,
        dataRegistre: nowDate,
      };

      onSave(newStudent);
    } else if (mode === 'edit' && currentProfile) {
      // Editing current profile: update details while keeping ID and achievements
      const updatedProfile: StudentProfile = {
        ...currentProfile,
        nom: cleanNom,
        avatar,
        instrumentPreferit,
      };
      onSave(updatedProfile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden transform transition-all">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-6 py-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-4xl mb-2">
            {mode === 'pick' ? '👥' : avatar}
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {mode === 'pick'
              ? '👋 Qui ets? Tria el teu perfil'
              : mode === 'new'
              ? '✨ Nou Registre d’Alumne/a'
              : '✏️ El teu Carnet de Músic'}
          </h2>
          <p className="text-amber-100 text-sm font-medium mt-1">
            {mode === 'pick'
              ? 'Fes clic sobre el teu nom per continuar jugant!'
              : mode === 'new'
              ? 'Posa el teu nom per crear el teu carnet personal!'
              : 'Modifica el teu personatge o instrument preferit'}
          </p>

          {/* Navigation tabs between modes */}
          {allStudents.length > 0 && !isInitial && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleSwitchToPick}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  mode === 'pick'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                👥 Alumnes ({allStudents.length})
              </button>
              <button
                type="button"
                onClick={handleSwitchToNew}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  mode === 'new'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                ✨ + Sóc nou alumne
              </button>
              {currentProfile && (
                <button
                  type="button"
                  onClick={handleSwitchToEdit}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                    mode === 'edit'
                      ? 'bg-white text-amber-900 shadow-sm'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  ✏️ Editar carnet
                </button>
              )}
            </div>
          )}
        </div>

        {/* MODE 1: Pick from existing registered students */}
        {mode === 'pick' && allStudents.length > 0 ? (
          <div className="p-6 space-y-4">
            <div className="text-sm font-bold text-slate-700 flex items-center justify-between">
              <span>Tria el teu nom per continuar:</span>
              <span className="text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                {allStudents.length} alumnes a la classe
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border rounded-2xl border-slate-100">
              {allStudents.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (onSelectExistingStudent) {
                      onSelectExistingStudent(s);
                    } else {
                      onSave(s);
                    }
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 text-left hover:scale-[1.02] ${
                    currentProfile?.id === s.id
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-black ring-2 ring-amber-300'
                      : 'border-slate-200 bg-white hover:border-amber-300 text-slate-800 font-bold'
                  }`}
                >
                  <span className="text-2xl">{s.avatar || '👤'}</span>
                  <div className="truncate flex-1">
                    <div className="truncate text-sm flex items-center gap-1">
                      <span>{s.nom}</span>
                      {currentProfile?.id === s.id && (
                        <Check className="w-3.5 h-3.5 text-amber-600 inline" />
                      )}
                    </div>
                    <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1.5 flex-wrap">
                      <span>{s.punts} pts</span>
                      <span>•</span>
                      <span>⭐ Nivell {s.estrelles}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSwitchToNew}
                className="text-xs font-black text-amber-700 hover:text-amber-900 flex items-center gap-1.5 p-1"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>No surto a la llista? Registra el teu nom</span>
              </button>

              {!isInitial && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  Tancar
                </button>
              )}
            </div>
          </div>
        ) : (
          /* MODE 2 & 3: New Student or Edit Profile */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm rounded-2xl font-medium space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-base">ℹ️</span>
                  <span>{error}</span>
                </div>
                {duplicateWarning && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectExistingStudent) {
                          onSelectExistingStudent(duplicateWarning);
                        } else {
                          onSave(duplicateWarning);
                        }
                      }}
                      className="px-3 py-1 bg-amber-600 text-white rounded-xl text-xs font-black hover:bg-amber-700 transition"
                    >
                      Entrar com a {duplicateWarning.nom} ({duplicateWarning.punts} pts)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Nom de l'alumne */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-500" />
                  {mode === 'new' ? "Com et dius? (Nom de l'alumne/a) *" : "Nom de l'alumne/a"}
                </span>
                {mode === 'new' && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Nou perfil independent
                  </span>
                )}
              </label>
              <input
                type="text"
                required
                autoFocus
                value={nom}
                onChange={(e) => {
                  setNom(e.target.value);
                  if (error) {
                    setError('');
                    setDuplicateWarning(null);
                  }
                }}
                placeholder="Escriu aquí el teu nom..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none text-lg font-bold text-slate-800 placeholder:text-slate-400 transition"
              />
            </div>

            {/* Tria d'Avatar */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Tria el teu personatge:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setAvatar(av.icon)}
                    className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition ${
                      avatar === av.icon
                        ? 'border-amber-500 bg-amber-100 ring-2 ring-amber-400 scale-105'
                        : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{av.icon}</span>
                    <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight truncate w-full">
                      {av.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Instrument preferit */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-amber-500" />
                Quin instrument t'agrada més?
              </label>
              <select
                value={instrumentPreferit}
                onChange={(e) => setInstrumentPreferit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-amber-500 font-medium text-slate-700 outline-none"
              >
                <option value="Tenora">Tenora (L'instrument rei)</option>
                <option value="Flabiol i Tamborí">Flabiol i Tamborí (2 en 1!)</option>
                <option value="Tible">Tible (L'oboè agut i vivaç)</option>
                <option value="Trompeta">Trompeta (Brillantor metàl·lica)</option>
                <option value="Trombó">Trombó (Potència greu de metall)</option>
                <option value="Fiscorn">Fiscorn (So càlid i dolç)</option>
                <option value="Contrabaix">Contrabaix (L'únic de corda!)</option>
              </select>
            </div>

            {/* Submit button */}
            <div className="pt-2 flex items-center gap-3">
              {allStudents.length > 0 && !isInitial && (
                <button
                  type="button"
                  onClick={handleSwitchToPick}
                  className="px-4 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition text-sm"
                >
                  ← Tornar a la llista
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-base shadow-lg shadow-amber-500/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <span>
                  {mode === 'new'
                    ? isInitial
                      ? 'Entra a la Cobla! 🚀'
                      : 'Registra el nou alumne ✅'
                    : 'Desa els canvis ✅'}
                </span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
