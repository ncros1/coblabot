import React, { useState } from 'react';
import { StudentProfile } from '../types/cobla';
import { User, Sparkles, Music, Users, ArrowRight, PlusCircle, Check } from 'lucide-react';

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
  const [mode, setMode] = useState<'pick' | 'new'>(
    allStudents.length > 0 ? 'pick' : 'new'
  );
  const [nom, setNom] = useState(currentProfile?.nom || '');
  const [avatar, setAvatar] = useState(currentProfile?.avatar || '🤖');
  const [instrumentPreferit, setInstrumentPreferit] = useState(
    currentProfile?.instrumentPreferit || 'Tenora'
  );
  const [error, setError] = useState('');

  // Automatically update mode and form values when modal opens or student list arrives
  React.useEffect(() => {
    if (isOpen) {
      if (allStudents.length > 0) {
        setMode('pick');
      } else {
        setMode('new');
      }
      if (currentProfile) {
        setNom(currentProfile.nom || '');
        setAvatar(currentProfile.avatar || '🤖');
        setInstrumentPreferit(currentProfile.instrumentPreferit || 'Tenora');
      }
      setError('');
    }
  }, [isOpen, allStudents.length, currentProfile]);

  if (!isOpen) return null;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      setError('Si us plau, escriu el teu nom per poder començar!');
      return;
    }

    const cleanNom = nom.trim();
    // Check if an existing student with this name already exists
    const existing = allStudents.find(
      (s) => s.nom.toLowerCase() === cleanNom.toLowerCase()
    );

    if (existing && onSelectExistingStudent) {
      onSelectExistingStudent(existing);
      return;
    }

    const studentId = currentProfile?.id || `student_${Date.now()}_${cleanNom.toLowerCase().replace(/\s+/g, '_')}`;

    const newProfile: StudentProfile = {
      id: studentId,
      nom: cleanNom,
      avatar,
      instrumentPreferit,
      punts: currentProfile?.punts || 50,
      estrelles: currentProfile?.estrelles || 1,
      activitat: currentProfile?.activitat || {
        puzleEscenariCompletat: false,
        endevinallesEncertades: 0,
        intrusRondesEncertades: 0,
        quizPuntuacio: 0,
        quizCompletat: false,
        diplomaObtingut: false,
        preguntesXatFetes: 0,
        ultimaActivitat: new Date().toLocaleDateString('ca-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        accionsRecents: [{
          data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          accio: 'Entrada inicial a la CoblaBot',
        }],
      },
      puntuacioQuizMax: currentProfile?.puntuacioQuizMax || 0,
      diplomaObtingut: currentProfile?.diplomaObtingut || false,
      dataRegistre: currentProfile?.dataRegistre || new Date().toLocaleDateString('ca-ES'),
    };

    onSave(newProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden transform transition-all">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-6 py-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-4xl mb-2">
            {avatar}
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {isInitial ? '👋 Benvingut/da a CoblaBot!' : '✏️ El teu Carnet de Músic'}
          </h2>
          <p className="text-amber-100 text-sm font-medium mt-1">
            {isInitial
              ? 'Posa el teu nom per poder explorar la Cobla!'
              : 'Canvia d’alumne o actualitza les teves dades'}
          </p>

          {/* Toggle between picking existing student or creating a new one */}
          {allStudents.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setMode('pick')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  mode === 'pick'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                👥 Ja m'he registrat abans
              </button>
              <button
                type="button"
                onClick={() => setMode('new')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  mode === 'new'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                ✨ Sóc un alumne nou
              </button>
            </div>
          )}
        </div>

        {/* MODE 1: Pick from existing registered students */}
        {mode === 'pick' && allStudents.length > 0 ? (
          <div className="p-6 space-y-4">
            <div className="text-sm font-bold text-slate-700 flex items-center justify-between">
              <span>Tria el teu nom per continuar:</span>
              <span className="text-xs text-slate-400 font-semibold">{allStudents.length} alumnes</span>
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
                    <div className="truncate text-sm">{s.nom}</div>
                    <div className="text-[10px] text-amber-700 font-bold">{s.punts} pts</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setNom('');
                  setMode('new');
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>No surto a la llista? Registra un nom nou</span>
              </button>

              {!isInitial && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Tancar
                </button>
              )}
            </div>
          </div>
        ) : (
          /* MODE 2: Enter Student Name */
          <form onSubmit={handleSubmitNew} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Nom de l'alumne (Sense curs!) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                Com et dius? (Nom de l'alumne/a) *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={nom}
                onChange={(e) => {
                  setNom(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Escriu aquí el teu nom..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none text-lg font-bold text-slate-800 placeholder:text-slate-400 transition"
              />
            </div>

            {/* Tria d'Avatar */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
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
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
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

            {/* Permanent storage note */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold">
              <span className="text-base">💾</span>
              <span>El teu progrés, punts i diplomes es guarden de forma permanent (no caduquen mai).</span>
            </div>

            {/* Submit button */}
            <div className="pt-2 flex items-center gap-3">
              {!isInitial && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel·lar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-base shadow-lg shadow-amber-500/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <span>{isInitial ? "Entra a la Cobla! 🚀" : 'Desa i Comença ✅'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
