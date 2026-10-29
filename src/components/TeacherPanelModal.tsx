import React, { useState, useRef } from 'react';
import { StudentProfile, CompletedGamesTimestamps } from '../types/cobla';
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
  Check,
  XCircle,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  onDeleteStudent: (id: string) => void;
  onResetAllStudents: () => void;
  onResetStudentPoints: (id: string) => void;
  onResetAllPoints: () => void;
}

const STORAGE_TEACHER_PIN_KEY = 'coblabot_teacher_pin';
const DEFAULT_PIN = 'mestra';
const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000;

export const TeacherPanelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  students,
  onDeleteStudent,
  onResetAllStudents,
  onResetStudentPoints,
  onResetAllPoints,
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

  // Helper: check remaining time for 24h cooldown
  const getCooldownStatus = (timestamp?: number) => {
    if (!timestamp) return null;
    const diff = COOLDOWN_24H_MS - (Date.now() - timestamp);
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Helper: count how many games are locked for 24h
  const countLockedGames = (timestamps?: CompletedGamesTimestamps) => {
    if (!timestamps) return 0;
    const now = Date.now();
    let count = 0;
    if (timestamps.endevinalles && now - timestamps.endevinalles < COOLDOWN_24H_MS) count++;
    if (timestamps.intrus && now - timestamps.intrus < COOLDOWN_24H_MS) count++;
    if (timestamps.soMisterios && now - timestamps.soMisterios < COOLDOWN_24H_MS) count++;
    if (timestamps.mites && now - timestamps.mites < COOLDOWN_24H_MS) count++;
    if (timestamps.quiz && now - timestamps.quiz < COOLDOWN_24H_MS) count++;
    if (timestamps.puzleEscenari && now - timestamps.puzleEscenari < COOLDOWN_24H_MS) count++;
    return count;
  };

  // CSV Export for spreadsheet with detailed ENCERTS and ERRORS
  const handleExportCSV = () => {
    if (students.length === 0) {
      alert('No hi ha alumnes registrats per exportar.');
      return;
    }

    const headers = [
      'Nom Alumne',
      'Punts Totals',
      'Estrelles',
      'Encerts Totals',
      'Errors Totals',
      'Percentatge Exit',
      'Puzle Escenari Estat',
      'Puzle Escenari Errors',
      'Endevinalles Encerts',
      'Endevinalles Errors',
      'Intrus Encerts',
      'Intrus Errors',
      'So Misterios Encerts',
      'So Misterios Errors',
      'Mites Encerts',
      'Mites Errors',
      'Gran Concurs Nota (/10)',
      'Gran Concurs Errors',
      'Jocs Bloquejats 24h',
      'Diploma Obtingut',
      'Data Registre',
      'Ultima Activitat',
    ];

    const rows = students.map((s) => {
      const act = s.activitat || ({} as any);
      const encerts =
        act.totalEncerts ??
        (act.endevinallesEncertades || 0) +
          (act.intrusRondesEncertades || 0) +
          (act.soMisteriosEncertats || 0) +
          (act.mitesEncertats || 0) +
          (act.quizPuntuacio || 0);
      const errors = act.totalErrors || 0;
      const total = encerts + errors;
      const perc = total > 0 ? Math.round((encerts / total) * 100) : 100;
      const lockedCount = countLockedGames(act.jocsCompletatsTimestamps);

      return [
        `"${s.nom.replace(/"/g, '""')}"`,
        s.punts,
        s.estrelles,
        encerts,
        errors,
        `${perc}%`,
        act.puzleEscenariCompletat ? 'Completat' : 'Pendent',
        act.puzleEscenariErrors || 0,
        act.endevinallesEncertades || 0,
        act.endevinallesErrors || 0,
        act.intrusRondesEncertades || 0,
        act.intrusErrors || 0,
        act.soMisteriosEncertats || 0,
        act.soMisteriosErrors || 0,
        act.mitesEncertats || 0,
        act.mitesErrors || 0,
        act.quizPuntuacio || s.puntuacioQuizMax || 0,
        act.quizErrors || 0,
        lockedCount,
        s.diplomaObtingut ? 'SI' : 'NO',
        `"${s.dataRegistre}"`,
        `"${act.ultimaActivitat || s.dataRegistre}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `registre_coblabot_encerts_errors_${new Date().toISOString().slice(0, 10)}.csv`
    );
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
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(students, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute(
      'download',
      `copia_permanent_coblabot_${new Date().toISOString().slice(0, 10)}.json`
    );
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

  const totalEncertsClasse = students.reduce((acc, s) => {
    const act = s.activitat || ({} as any);
    const encerts =
      act.totalEncerts ??
      (act.endevinallesEncertades || 0) +
        (act.intrusRondesEncertades || 0) +
        (act.soMisteriosEncertats || 0) +
        (act.mitesEncertats || 0) +
        (act.quizPuntuacio || 0);
    return acc + encerts;
  }, 0);

  const totalErrorsClasse = students.reduce((acc, s) => {
    return acc + (s.activitat?.totalErrors || 0);
  }, 0);

  const totalIntentsClasse = totalEncertsClasse + totalErrorsClasse;
  const percExitGlobal =
    totalIntentsClasse > 0 ? Math.round((totalEncertsClasse / totalIntentsClasse) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border-4 border-slate-700 overflow-hidden flex flex-col print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 print:bg-transparent print:text-slate-900 print:border-b-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30">
              {isAuthenticated ? (
                <Unlock className="w-5 h-5 text-emerald-400" />
              ) : (
                <Lock className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span>Panell Docent de la Mestra</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 uppercase tracking-widest font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Registre d'Encerts i Errors
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Avaluació formativa, comptabilitat d'encerts/errors i control de bloqueig de 24h per alumne
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
              <h3 className="text-2xl font-black text-slate-800">Accés Exclusiu Docent</h3>
              <p className="text-sm font-medium text-slate-600 mt-1 leading-relaxed">
                Aquest apartat és exclusiu per a la mestra per consultar els encerts, errors comesos per cada infant, el bloqueig de 24h i descarregar les notes.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Introdueix el codi secret..."
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none text-center text-lg font-bold transition tracking-widest"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 animate-shake">
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
            {/* Top KPI Stats Summary: Encerts, Errors, % Exit */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <div className="text-2xl font-black text-amber-900">{students.length}</div>
                  <div className="text-xs font-bold text-amber-700">Alumnes registrats</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="text-2xl font-black text-emerald-800">{totalEncertsClasse}</div>
                  <div className="text-xs font-bold text-emerald-700">Encerts totals</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <div className="text-2xl font-black text-rose-800">{totalErrorsClasse}</div>
                  <div className="text-xs font-bold text-rose-700">Errors comesos</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="text-2xl font-black text-blue-900">{percExitGlobal}%</div>
                  <div className="text-xs font-bold text-blue-700">% d'Èxit de la classe</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <div>
                  <div className="text-2xl font-black text-purple-800">
                    {totalDiplomes} / {students.length}
                  </div>
                  <div className="text-xs font-bold text-purple-600">Diplomes obtinguts</div>
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

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        'Atenció: Vols posar a 0 els punts de TOTS els alumnes de la classe?\n\nEls perfils i noms dels alumnes NO s’esborraran.'
                      )
                    ) {
                      onResetAllPoints();
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                  title="Posa a 0 els punts i marcadors de tots els alumnes sense eliminar cap alumne"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Borrar punts (tots)</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  title="Descarrega taula completa amb Encerts i Errors per obrir amb Excel o Google Sheets"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exporta a Excel (CSV)</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                  title="Còpia de seguretat JSON"
                >
                  <Download className="w-4 h-4" />
                  <span>Còpia JSON</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                  title="Restaura dades"
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
              <form
                onSubmit={handleSaveNewPin}
                className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3"
              >
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
                {pinChangeMsg && (
                  <span className="text-xs font-bold text-emerald-700">{pinChangeMsg}</span>
                )}
              </form>
            )}

            {/* Students Register Table with ENCERTS and ERRORS columns */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                      <th className="p-3">Alumne/a</th>
                      <th className="p-3 text-center">Punts & ⭐</th>
                      <th className="p-3 text-center bg-emerald-50/60 text-emerald-950">
                        Balanç: Encerts / Errors
                      </th>
                      <th className="p-3 text-center">Puzle Escenari</th>
                      <th className="p-3 text-center">Endevinalles & Intrús</th>
                      <th className="p-3 text-center">So & Mites</th>
                      <th className="p-3 text-center">Gran Concurs</th>
                      <th className="p-3 text-center">Bloqueig 24h</th>
                      <th className="p-3 text-center">Diploma</th>
                      <th className="p-3 text-right">Última Activitat</th>
                      <th className="p-3 text-center print:hidden">Accions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-slate-500 font-semibold">
                          {students.length === 0
                            ? 'Encara no s’ha registrat cap alumne/a.'
                            : 'No s’ha trobat cap alumne/a amb aquest nom.'}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => {
                        const isExpanded = expandedStudentId === s.id;
                        const act = s.activitat || ({} as any);

                        const encerts =
                          act.totalEncerts ??
                          (act.endevinallesEncertades || 0) +
                            (act.intrusRondesEncertades || 0) +
                            (act.soMisteriosEncertats || 0) +
                            (act.mitesEncertats || 0) +
                            (act.quizPuntuacio || 0);
                        const errors = act.totalErrors || 0;
                        const total = encerts + errors;
                        const perc = total > 0 ? Math.round((encerts / total) * 100) : 100;

                        const puzleDone = act.puzleEscenariCompletat;
                        const puzleErrors = act.puzleEscenariErrors || 0;
                        const quizScore = act.quizPuntuacio || s.puntuacioQuizMax || 0;
                        const quizErrors = act.quizErrors || 0;
                        const lockedCount = countLockedGames(act.jocsCompletatsTimestamps);

                        return (
                          <React.Fragment key={s.id}>
                            <tr className="hover:bg-amber-50/40 transition">
                              <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                                <span className="text-xl">{s.avatar || '👤'}</span>
                                <div>
                                  <div className="font-extrabold text-sm text-slate-900">{s.nom}</div>
                                  <div className="text-[10px] text-slate-400">
                                    Reg: {s.dataRegistre}
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                <span className="font-extrabold text-amber-700">{s.punts} pts</span>
                                <div className="text-[10px] text-amber-600">⭐ {s.estrelles} nivell</div>
                              </td>

                              {/* Dedicated Balanç Encerts & Errors Column */}
                              <td className="p-3 text-center bg-emerald-50/30">
                                <div className="flex items-center justify-center gap-1.5 font-black text-xs">
                                  <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                    {encerts} ✅
                                  </span>
                                  <span className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md">
                                    {errors} ❌
                                  </span>
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                                  {perc}% encert
                                </div>
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
                                {puzleErrors > 0 && (
                                  <div className="text-[10px] text-rose-600 font-semibold">
                                    ({puzleErrors} err)
                                  </div>
                                )}
                              </td>

                              <td className="p-3 text-center font-bold">
                                <div>
                                  {act.endevinallesEncertades || 0} ✅ / {act.endevinallesErrors || 0} ❌
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Intrús: {act.intrusRondesEncertades || 0} ✅ / {act.intrusErrors || 0} ❌
                                </div>
                              </td>

                              <td className="p-3 text-center font-bold">
                                <div className="text-purple-700">
                                  👂 {act.soMisteriosEncertats || 0} ✅ / {act.soMisteriosErrors || 0} ❌
                                </div>
                                <div className="text-emerald-700 text-[10px]">
                                  ⚖️ {act.mitesEncertats || 0} ✅ / {act.mitesErrors || 0} ❌
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                <span
                                  className={`font-black text-xs ${
                                    quizScore >= 7
                                      ? 'text-emerald-700'
                                      : quizScore > 0
                                      ? 'text-amber-700'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {quizScore > 0 ? `${quizScore} / 10` : 'No fet'}
                                </span>
                                {quizErrors > 0 && (
                                  <div className="text-[10px] text-rose-600 font-semibold">
                                    ({quizErrors} errors)
                                  </div>
                                )}
                              </td>

                              {/* 24h Cooldown Status */}
                              <td className="p-3 text-center">
                                {lockedCount > 0 ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300 flex items-center justify-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>{lockedCount} jocs ⏳</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">Cap</span>
                                )}
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
                                {act.ultimaActivitat || s.dataRegistre}
                              </td>

                              <td className="p-3 text-center print:hidden">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                                    title="Veure historial detallat d'encerts i errors"
                                  >
                                    {isExpanded ? 'Amaga' : 'Detall'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `Vols posar a 0 els punts de l'alumne/a "${s.nom}"?\n\nEl seu perfil i registre NO s'eliminaran.`
                                        )
                                      ) {
                                        onResetStudentPoints(s.id);
                                      }
                                    }}
                                    className="p-1 hover:bg-amber-100 text-slate-400 hover:text-amber-700 rounded-lg transition"
                                    title="Borrar només els punts d'aquest alumne (sense eliminar l'alumne)"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `Vols esborrar el registre de l'alumne/a "${s.nom}"?`
                                        )
                                      ) {
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
                                <td colSpan={11} className="p-5 border-b border-slate-200">
                                  <div className="space-y-4">
                                    {/* Game-by-Game Detail Breakdown */}
                                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                          🧩 Endevinalles
                                        </span>
                                        <div className="font-black text-xs text-slate-800 mt-0.5">
                                          {act.endevinallesEncertades || 0} ✅ / {act.endevinallesErrors || 0} ❌
                                        </div>
                                        {getCooldownStatus(act.jocsCompletatsTimestamps?.endevinalles) && (
                                          <div className="text-[9px] font-bold text-amber-700 mt-1">
                                            ⏳ {getCooldownStatus(act.jocsCompletatsTimestamps?.endevinalles)}
                                          </div>
                                        )}
                                      </div>

                                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                          🚫 L'Intrús
                                        </span>
                                        <div className="font-black text-xs text-slate-800 mt-0.5">
                                          {act.intrusRondesEncertades || 0} ✅ / {act.intrusErrors || 0} ❌
                                        </div>
                                        {getCooldownStatus(act.jocsCompletatsTimestamps?.intrus) && (
                                          <div className="text-[9px] font-bold text-amber-700 mt-1">
                                            ⏳ {getCooldownStatus(act.jocsCompletatsTimestamps?.intrus)}
                                          </div>
                                        )}
                                      </div>

                                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                          👂 So Misteriós
                                        </span>
                                        <div className="font-black text-xs text-slate-800 mt-0.5">
                                          {act.soMisteriosEncertats || 0} ✅ / {act.soMisteriosErrors || 0} ❌
                                        </div>
                                        {getCooldownStatus(act.jocsCompletatsTimestamps?.soMisterios) && (
                                          <div className="text-[9px] font-bold text-amber-700 mt-1">
                                            ⏳ {getCooldownStatus(act.jocsCompletatsTimestamps?.soMisterios)}
                                          </div>
                                        )}
                                      </div>

                                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                          ⚖️ Mites Pep Ventura
                                        </span>
                                        <div className="font-black text-xs text-slate-800 mt-0.5">
                                          {act.mitesEncertats || 0} ✅ / {act.mitesErrors || 0} ❌
                                        </div>
                                        {getCooldownStatus(act.jocsCompletatsTimestamps?.mites) && (
                                          <div className="text-[9px] font-bold text-amber-700 mt-1">
                                            ⏳ {getCooldownStatus(act.jocsCompletatsTimestamps?.mites)}
                                          </div>
                                        )}
                                      </div>

                                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                          📜 Gran Concurs
                                        </span>
                                        <div className="font-black text-xs text-slate-800 mt-0.5">
                                          {act.quizPuntuacio || 0}/10 ✅ / {act.quizErrors || 0} ❌
                                        </div>
                                        {getCooldownStatus(act.jocsCompletatsTimestamps?.quiz) && (
                                          <div className="text-[9px] font-bold text-amber-700 mt-1">
                                            ⏳ {getCooldownStatus(act.jocsCompletatsTimestamps?.quiz)}
                                          </div>
                                        )}
                                      </div>

                                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                          📍 Puzle Escenari
                                        </span>
                                        <div className="font-black text-xs text-slate-800 mt-0.5">
                                          {act.puzleEscenariCompletat ? 'Fet ✅' : 'Pendent ⏳'}
                                          {act.puzleEscenariErrors ? ` (${act.puzleEscenariErrors} ❌)` : ''}
                                        </div>
                                        {getCooldownStatus(act.jocsCompletatsTimestamps?.puzleEscenari) && (
                                          <div className="text-[9px] font-bold text-amber-700 mt-1">
                                            ⏳ {getCooldownStatus(act.jocsCompletatsTimestamps?.puzleEscenari)}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action History with colored badges */}
                                    <div>
                                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Historial cronològic d'accions de {s.nom}:</span>
                                      </h4>
                                      {act.accionsRecents && act.accionsRecents.length > 0 ? (
                                        <ul className="space-y-1.5 text-[11px] text-slate-600 pl-2 max-h-48 overflow-y-auto">
                                          {act.accionsRecents.map((item, idx) => {
                                            const isEncert =
                                              item.tipus === 'encert' ||
                                              item.accio.includes('✅') ||
                                              item.accio.includes('encertat') ||
                                              item.accio.includes('resolt') ||
                                              item.accio.includes('completat');
                                            const isError =
                                              item.tipus === 'error' ||
                                              item.accio.includes('❌') ||
                                              item.accio.includes('fallat') ||
                                              item.accio.includes('Error');

                                            return (
                                              <li
                                                key={idx}
                                                className={`flex items-center justify-between p-2 rounded-xl border ${
                                                  isEncert
                                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                                    : isError
                                                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                                                    : 'bg-white border-slate-200 text-slate-700'
                                                }`}
                                              >
                                                <span className="font-medium flex items-center gap-1.5">
                                                  <span>{isEncert ? '✅' : isError ? '❌' : '•'}</span>
                                                  <span>{item.accio}</span>
                                                </span>
                                                <span className="text-slate-400 text-[10px] font-bold shrink-0 ml-2">
                                                  {item.data}
                                                </span>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      ) : (
                                        <p className="text-[11px] text-slate-400 italic">
                                          Sense accions recents enregistrades en aquesta sessió.
                                        </p>
                                      )}
                                    </div>
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
              <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 print:hidden border-t border-slate-100">
                <span>Total: {students.length} alumnes enregistrats permanentment</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Atenció: Vols posar a 0 els punts de tots els alumnes?\n\nEls perfils i noms dels alumnes NO s’esborraran.'
                        )
                      ) {
                        onResetAllPoints();
                      }
                    }}
                    className="text-amber-700 hover:text-amber-900 font-bold hover:underline flex items-center gap-1"
                    title="Posa a 0 els punts de tothom sense esborrar cap alumne"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Borrar punts de tota la classe (mantenir alumnat)</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Atenció: Vols reiniciar tot el registre de tots els alumnes? Aquesta acció esborra tots els comptes i no es pot desfer.'
                        )
                      ) {
                        onResetAllStudents();
                      }
                    }}
                    className="text-rose-600 hover:text-rose-800 font-bold hover:underline"
                  >
                    Eliminar tot l'alumnat
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
