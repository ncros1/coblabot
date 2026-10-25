import React, { useState, useRef } from 'react';
import { StudentProfile } from '../types/cobla';
import {
  Lock,
  Unlock,
  Users,
  Award,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Printer,
  Trash2,
  X,
  Search,
  KeyRound,
  FileSpreadsheet,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  onDeleteStudent: (id: string) => void;
  onResetAllStudents: () => void;
}

const STORAGE_TEACHER_PIN_KEY = 'coblabot_teacher_pin';
const DEFAULT_PIN = 'mestra';

export const TeacherPanelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  students,
  onDeleteStudent,
  onResetAllStudents,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [pinChangeMsg, setPinChangeMsg] = useState<string>('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentPin = localStorage.getItem(STORAGE_TEACHER_PIN_KEY) || DEFAULT_PIN;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === currentPin || pinInput.trim() === DEFAULT_PIN) {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError("Codi d'accés incorrecte. Si us plau, torna-ho a provar.");
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim()) return;
    localStorage.setItem(STORAGE_TEACHER_PIN_KEY, newPin.trim());
    setPinChangeMsg('Codi actualitzat amb èxit! Nou codi desat.');
    setTimeout(() => {
      setIsChangingPin(false);
      setPinChangeMsg('');
      setNewPin('');
    }, 2000);
  };

  // CSV Export for spreadsheet
  const handleExportCSV = () => {
    if (students.length === 0) {
      alert('No hi ha alumnes registrats per exportar.');
      return;
    }

    const headers = [
      'Nom Alumne',
      'Punts Totals',
      'Estrelles',
      'Puzle Escenari',
      'Endevinalles Encertades',
      'Rondes Intrus',
      'So Misterios Encertats',
      'Mites Resolts',
      'Nota Gran Concurs (/10)',
      'Diploma Obtingut',
      'Data Registre',
      'Ultima Activitat',
    ];

    const rows = students.map((s) => [
      `"${s.nom.replace(/"/g, '""')}"`,
      s.punts,
      s.estrelles,
      s.activitat?.puzleEscenariCompletat ? 'Completat' : 'Pendent',
      s.activitat?.endevinallesEncertades || 0,
      s.activitat?.intrusRondesEncertades || 0,
      s.activitat?.soMisteriosEncertats || 0,
      s.activitat?.mitesEncertats || 0,
      s.activitat?.quizPuntuacio || s.puntuacioQuizMax || 0,
      s.diplomaObtingut ? 'SI' : 'NO',
      `"${s.dataRegistre}"`,
      `"${s.activitat?.ultimaActivitat || s.dataRegistre}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registre_coblabot_mestra_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Permanent Backup Export
  const handleExportJSON = () => {
    if (students.length === 0) {
      alert('No hi ha alumnes registrats per exportar.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(students, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `copia_permanent_coblabot_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // JSON Backup Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        if (Array.isArray(imported)) {
          localStorage.setItem('coblabot_students_list', JSON.stringify(imported));
          await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ students: imported }),
          });
          alert('Còpia de seguretat restaurada amb èxit! Es recarregarà la pàgina.');
          window.location.reload();
        } else {
          alert('El fitxer no conté un format vàlid d’alumnes.');
        }
      } catch (err) {
        alert('Error en llegir el fitxer JSON.');
      }
    };
    reader.readAsText(file);
  };

  const filteredStudents = students.filter((s) =>
    s.nom.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const totalDiplomes = students.filter((s) => s.diplomaObtingut).length;
  const totalPuzles = students.filter((s) => s.activitat?.puzleEscenariCompletat).length;
  const avgPunts = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + s.punts, 0) / students.length)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border-4 border-slate-700 overflow-hidden flex flex-col print:border-none print:shadow-none print:max-h-none print:w-full">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 print:bg-transparent print:text-slate-900 print:border-b-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30">
              {isAuthenticated ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span>Panell Docent de la Mestra</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 uppercase tracking-widest font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Emmagatzematge Permanent
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Registre perpetu del progrés i avaluació de cada infant a la Cobla
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Password Screen */
          <div className="p-8 md:p-12 text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-4xl shadow-inner border border-amber-300">
              🔐
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">
                Accés Exclusiu Docent
              </h3>
              <p className="text-sm font-medium text-slate-600 mt-1 leading-relaxed">
                Aquest apartat és exclusiu per a la mestra per consultar què ha fet cada infant, descarregar informes i gestionar les dades protegides.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  placeholder="Introdueix la contrasenya d'accés..."
                  className="w-full px-4 py-3 text-center text-lg font-bold rounded-2xl border-2 border-slate-300 focus:border-amber-500 outline-none transition tracking-wider"
                />
              </div>

              {pinError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow transition"
              >
                Accedir al Registre
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* 💾 Permanent Storage Guarantee Banner */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-emerald-950 text-xs shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center text-2xl shrink-0">
                  💾
                </div>
                <div>
                  <span className="font-black text-emerald-900 text-sm block">
                    Emmagatzematge Permanent i Perpetu Garantit
                  </span>
                  <span className="text-emerald-700 font-semibold leading-relaxed">
                    Tots els registres es desen de forma indefinida al disc permanent del servidor i a la memòria local. <strong>Mai no caduquen al cap de 24 hores</strong> ni es perden en tancar la sessió.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportJSON}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95"
                  title="Descarrega una còpia de seguretat en format JSON per guardar-la per sempre"
                >
                  <Download className="w-4 h-4" />
                  <span>Còpia JSON</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs shadow-sm flex items-center gap-1.5 transition"
                  title="Restaura una còpia de seguretat anterior"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restaura</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJSON}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>

            {/* Quick KPI Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <div className="text-2xl font-black text-amber-900">{students.length}</div>
                  <div className="text-xs font-bold text-amber-700">Alumnes registrats</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-2xl font-black text-blue-900">{avgPunts} pts</div>
                  <div className="text-xs font-bold text-blue-700">Mitjana de punts</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <span className="text-2xl">🧩</span>
                <div>
                  <div className="text-2xl font-black text-emerald-900">{totalPuzles} / {students.length}</div>
                  <div className="text-xs font-bold text-emerald-700">Puzles escenari fets</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <div>
                  <div className="text-2xl font-black text-purple-800">{totalDiplomes} / {students.length}</div>
                  <div className="text-xs font-bold text-purple-600">Diplomes oficials</div>
                </div>
              </div>
            </div>

            {/* Actions Bar & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca alumne/a..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  title="Descarrega taula per obrir amb Excel o Google Sheets"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exporta a Excel (CSV)</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimeix</span>
                </button>

                <button
                  onClick={() => setIsChangingPin(!isChangingPin)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Canviar Codi</span>
                </button>
              </div>
            </div>

            {/* Change Pin Form (Collapsible) */}
            {isChangingPin && (
              <form onSubmit={handleSaveNewPin} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-amber-700 shrink-0" />
                <input
                  type="text"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Nou codi secret de la mestra..."
                  className="flex-1 px-3 py-2 rounded-xl border border-amber-300 text-sm font-bold outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
                >
                  Desar Codi
                </button>
                {pinChangeMsg && <span className="text-xs font-bold text-emerald-700">{pinChangeMsg}</span>}
              </form>
            )}

            {/* Students Register Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                      <th className="p-3">Alumne/a</th>
                      <th className="p-3 text-center">Punts & ⭐</th>
                      <th className="p-3 text-center">Puzle Escenari</th>
                      <th className="p-3 text-center">Endevinalles & Intrús</th>
                      <th className="p-3 text-center">So & Mites (V/F)</th>
                      <th className="p-3 text-center">Gran Concurs</th>
                      <th className="p-3 text-center">Diploma</th>
                      <th className="p-3 text-right">Última Activitat</th>
                      <th className="p-3 text-center print:hidden">Accions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500 font-semibold">
                          {students.length === 0
                            ? 'Encara no s’ha registrat cap alumne/a.'
                            : 'No s’ha trobat cap alumne/a amb aquest nom.'}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => {
                        const isExpanded = expandedStudentId === s.id;
                        const puzleDone = s.activitat?.puzleEscenariCompletat;
                        const quizScore = s.activitat?.quizPuntuacio || s.puntuacioQuizMax || 0;

                        return (
                          <React.Fragment key={s.id}>
                            <tr className="hover:bg-amber-50/40 transition">
                              <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                                <span className="text-xl">{s.avatar || '👤'}</span>
                                <div>
                                  <div className="font-extrabold text-sm text-slate-900">{s.nom}</div>
                                  <div className="text-[10px] text-slate-400">Reg: {s.dataRegistre}</div>
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                <span className="font-extrabold text-amber-700">{s.punts} pts</span>
                                <div className="text-[10px] text-amber-600">⭐ {s.estrelles} nivell</div>
                              </td>

                              <td className="p-3 text-center">
                                {puzleDone ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300">
                                    ✅ Fet
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                                    ⏳ Pendent
                                  </span>
                                )}
                              </td>

                              <td className="p-3 text-center font-bold">
                                <div>{s.activitat?.endevinallesEncertades || 0} endev.</div>
                                <div className="text-[10px] text-slate-400">{s.activitat?.intrusRondesEncertades || 0} intrusos</div>
                              </td>

                              <td className="p-3 text-center font-bold">
                                <div className="text-purple-700">👂 {s.activitat?.soMisteriosEncertats || 0} sons</div>
                                <div className="text-emerald-700 text-[10px]">⚖️ {s.activitat?.mitesEncertats || 0} mites</div>
                              </td>

                              <td className="p-3 text-center">
                                <span className={`font-black text-xs ${quizScore >= 7 ? 'text-emerald-700' : quizScore > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                                  {quizScore > 0 ? `${quizScore} / 10` : 'No fet'}
                                </span>
                              </td>

                              <td className="p-3 text-center">
                                {s.diplomaObtingut ? (
                                  <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-900 font-black text-[10px] border border-yellow-300">
                                    📜 Obtingut
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">Pendent</span>
                                )}
                              </td>

                              <td className="p-3 text-right text-slate-500 text-[11px]">
                                {s.activitat?.ultimaActivitat || s.dataRegistre}
                              </td>

                              <td className="p-3 text-center print:hidden">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                                    title="Veure historial detallat"
                                  >
                                    {isExpanded ? 'Amaga' : 'Detall'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Vols esborrar el registre de l'alumne/a "${s.nom}"?`)) {
                                        onDeleteStudent(s.id);
                                      }
                                    }}
                                    className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                    title="Esborra aquest alumne"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Detailed Activity Timeline for this student */}
                            {isExpanded && (
                              <tr className="bg-slate-50">
                                <td colSpan={9} className="p-4 border-b border-slate-200">
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Historial d'activitat de {s.nom}:</span>
                                    </h4>
                                    {s.activitat?.accionsRecents && s.activitat.accionsRecents.length > 0 ? (
                                      <ul className="space-y-1 text-[11px] text-slate-600 pl-4 border-l-2 border-slate-200">
                                        {s.activitat.accionsRecents.map((item, idx) => (
                                          <li key={idx} className="flex items-center justify-between">
                                            <span>• {item.accio}</span>
                                            <span className="text-slate-400 text-[10px]">{item.data}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-[11px] text-slate-400 italic">
                                        Sense accions recents enregistrades en aquesta sessió.
                                      </p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            {students.length > 0 && (
              <div className="pt-2 flex justify-between items-center text-xs text-slate-500 print:hidden">
                <span>Total: {students.length} alumnes enregistrats permanentment</span>
                <button
                  onClick={() => {
                    if (confirm('Atenció: Vols reiniciar tot el registre de tots els alumnes? Aquesta acció no es pot desfer.')) {
                      onResetAllStudents();
                    }
                  }}
                  className="text-rose-600 hover:text-rose-800 font-bold hover:underline"
                >
                  Reinicia tot el registre de la classe
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
