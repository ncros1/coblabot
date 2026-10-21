import React, { useState } from 'react';
import { STAGE_SEATS, INSTRUMENTS_DATA } from '../data/instrumentsData';
import { StageSeat, StudentProfile } from '../types/cobla';
import { coblaAudio } from '../utils/audioEngine';
import { Sparkles, HelpCircle, CheckCircle2, RotateCcw, Volume2, Award, Film, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoblaYouTubePlayer } from './CoblaYouTubePlayer';

interface Props {
  student: StudentProfile | null;
  onAddPoints: (points: number, actionDesc?: string, isPuzzleComplete?: boolean) => void;
}

export const StageInteractive: React.FC<Props> = ({ student, onAddPoints }) => {
  const [activeTab, setActiveTab] = useState<'explora' | 'puzle'>('explora');
  const [selectedSeat, setSelectedSeat] = useState<StageSeat | null>(STAGE_SEATS[0]);

  // Puzzle State
  const [placedMusicians, setPlacedMusicians] = useState<{ [seatId: string]: string }>({});
  const [selectedMusicianToPlace, setSelectedMusicianToPlace] = useState<string | null>(null);
  const [puzzleFeedback, setPuzzleFeedback] = useState<{ msg: string; type: 'success' | 'try-again' | 'neutral' }>({
    msg: 'Fes clic a un músic de la banqueta i després clica a la cadira on creus que s’ha d’asseure!',
    type: 'neutral',
  });
  const [puzzleCompleted, setPuzzleCompleted] = useState<boolean>(false);
  const [rowVideoModal, setRowVideoModal] = useState<{ id: string; title: string; durada: string } | null>(null);

  // Seat click in Exploration Mode
  const handleSelectSeat = (seat: StageSeat) => {
    setSelectedSeat(seat);
    const inst = INSTRUMENTS_DATA.find((i) => i.id === seat.instrumentId);
    if (inst) {
      coblaAudio.playInstrumentDemo(inst.synthType);
    }
  };

  // Puzzle: Select musician from waiting bench
  const handleSelectWaitingMusician = (instId: string) => {
    setSelectedMusicianToPlace(instId);
    const inst = INSTRUMENTS_DATA.find((i) => i.id === instId);
    setPuzzleFeedback({
      msg: `Has triat: ${inst?.nom}. A quina fila i cadira de l’escenari s'ha d’asseure?`,
      type: 'neutral',
    });
  };

  // Puzzle: Click a seat to place selected musician
  const handlePlaceInSeat = (seat: StageSeat) => {
    if (!selectedMusicianToPlace) {
      setPuzzleFeedback({
        msg: 'Primer selecciona un dels músics de la banqueta d’espera de sota!',
        type: 'neutral',
      });
      return;
    }

    if (seat.instrumentId === selectedMusicianToPlace) {
      // Correct!
      const newPlaced = { ...placedMusicians, [seat.id]: selectedMusicianToPlace };
      setPlacedMusicians(newPlaced);
      setSelectedMusicianToPlace(null);
      coblaAudio.playSuccessSound();

      const inst = INSTRUMENTS_DATA.find((i) => i.id === selectedMusicianToPlace);
      setPuzzleFeedback({
        msg: `👏 Molt bé, ${student?.nom || 'músic'}! Has col·locat correctament ${inst?.nom}!`,
        type: 'success',
      });

      // Check if all 11 musicians are placed
      if (Object.keys(newPlaced).length === STAGE_SEATS.length) {
        setPuzzleCompleted(true);
        onAddPoints(100, "Ha completat amb èxit el Puzle de l'Escenari", true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } else {
      // Wrong placement
      coblaAudio.playTryAgainSound();
      const targetInst = INSTRUMENTS_DATA.find((i) => i.id === selectedMusicianToPlace);
      let hint = 'Gairebé! Prova una altra posició...';
      if (targetInst?.familia === 'vent-fusta' && seat.fila === 2) {
        hint = `Gairebé! ${targetInst.nom} és de vent-fusta i va a la 1a Fila (davant). Prova de nou!`;
      } else if (targetInst?.familia === 'vent-metall' && seat.fila === 1) {
        hint = `Gairebé! ${targetInst.nom} és de vent-metall i va a la 2a Fila (darrere). Prova de nou!`;
      }
      setPuzzleFeedback({
        msg: hint,
        type: 'try-again',
      });
    }
  };

  const handleResetPuzzle = () => {
    setPlacedMusicians({});
    setSelectedMusicianToPlace(null);
    setPuzzleCompleted(false);
    setPuzzleFeedback({
      msg: 'Puzle reiniciat! Col·loca els 11 músics a les seves cadires correctes.',
      type: 'neutral',
    });
  };

  // Remaining unplaced musicians
  const placedIds = Object.values(placedMusicians);
  const unplacedInstruments = INSTRUMENTS_DATA.filter((i) => !placedIds.includes(i.id));

  // Current selected instrument in exploration mode
  const currentInst = INSTRUMENTS_DATA.find((i) => i.id === selectedSeat?.instrumentId);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Stage Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Distribució a l’Escenari
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            📍 L’Escenari de la Cobla
          </h2>
          <p className="text-slate-600 font-medium text-sm mt-1">
            Els 11 músics es distribueixen estrictament en dues files: <strong>Fusta davant</strong> i <strong>Metall + Corda darrere</strong>!
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-amber-50 p-1.5 rounded-2xl border border-amber-200">
          <button
            onClick={() => setActiveTab('explora')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition ${
              activeTab === 'explora'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-700 hover:text-amber-800'
            }`}
          >
            🔍 Mode Exploració
          </button>
          <button
            onClick={() => setActiveTab('puzle')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition flex items-center gap-1.5 ${
              activeTab === 'puzle'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-purple-800'
            }`}
          >
            <span>🧩 Puzle de l’Escenari</span>
            <span className="text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded-full font-bold">
              Joc
            </span>
          </button>
        </div>
      </div>

      {/* THE VIRTUAL STAGE */}
      <div className="relative bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 rounded-3xl p-6 md:p-10 shadow-2xl border-4 border-amber-700 overflow-hidden">
        
        {/* Stage Lighting and Curtains Effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl pointer-events-none" />

        {/* Stage Title Ribbon */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 pb-3 border-b border-amber-800/80">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <span className="text-amber-200 font-black text-sm uppercase tracking-widest">
              FONS DE L'ESCENARI
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRowVideoModal({ id: 'X-L3xmVKpHc', title: 'Cobla Sencera (SomSardana)', durada: '41s' })}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow active:scale-95"
            >
              <Film className="w-3.5 h-3.5" />
              <span>🎬 Escolta Cobla Sencera</span>
            </button>

            <div className="text-xs font-bold text-amber-400/80 hidden md:block">
              {activeTab === 'explora'
                ? 'Clica a qualsevol cadira per veure i escoltar l’instrument!'
                : `Col·locats: ${Object.keys(placedMusicians).length} / 11 músics`}
            </div>
          </div>
        </div>

        {/* FILA 2: Metall i Corda (Darrere) */}
        <div className="relative z-10 mb-8 p-4 rounded-2xl bg-amber-900/30 border border-amber-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎺 SEGONA FILA (Darrere - Metall i Corda)</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-400/70 font-semibold hidden md:inline">
                6 Músics (Trompetes, Trombó, Fiscorns, Contrabaix)
              </span>
              <button
                onClick={() => setRowVideoModal({ id: 'Rf-2t5_iE9U', title: 'Segona Fila: Metall i Contrabaix (SomSardana)', durada: '40s' })}
                className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition"
              >
                <Film className="w-3 h-3" />
                <span>🎬 Vídeo 2a Fila</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {STAGE_SEATS.filter((s) => s.fila === 2).map((seat) => {
              const isSelected = selectedSeat?.id === seat.id && activeTab === 'explora';
              const placedInstId = placedMusicians[seat.id];
              const placedInst = INSTRUMENTS_DATA.find((i) => i.id === placedInstId);

              return (
                <button
                  key={seat.id}
                  onClick={() =>
                    activeTab === 'explora' ? handleSelectSeat(seat) : handlePlaceInSeat(seat)
                  }
                  className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 min-h-[110px] text-center ${
                    isSelected
                      ? 'bg-amber-500/90 border-yellow-300 ring-4 ring-yellow-400/50 scale-105'
                      : activeTab === 'puzle' && placedInst
                      ? 'bg-emerald-800/60 border-emerald-400 text-white'
                      : 'bg-stone-800/80 border-amber-600/60 hover:border-amber-400 hover:bg-stone-700/90'
                  }`}
                >
                  <div className="text-3xl mb-1 filter drop-shadow">
                    {activeTab === 'puzle'
                      ? placedInst
                        ? placedInst.icona
                        : '🪑'
                      : seat.icona}
                  </div>
                  <span className="text-xs font-black text-white leading-tight">
                    {activeTab === 'puzle'
                      ? placedInst
                        ? placedInst.nom
                        : `Posició ${seat.posicio}`
                      : seat.nom}
                  </span>
                  <span className="text-[10px] text-amber-200/80 font-medium">
                    {seat.posicio === 6 ? 'Dret (a la dreta)' : `Cadira ${seat.posicio}`}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-yellow-400 text-amber-950 text-[9px] font-black uppercase">
                      Actiu 🔊
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* FILA 1: Vent-Fusta (Davant) */}
        <div className="relative z-10 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-2">
            <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌳 PRIMERA FILA (Davant - Vent-Fusta, Asseguts)</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-400/70 font-semibold hidden md:inline">
                5 Músics (Flabiol/Tamborí, 2 Tibles, 2 Tenores)
              </span>
              <button
                onClick={() => setRowVideoModal({ id: 'XVBdJp9x0Pw', title: 'Primera Fila: Fusta i Tamborí (SomSardana)', durada: '40s' })}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition"
              >
                <Film className="w-3 h-3" />
                <span>🎬 Vídeo 1a Fila</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {STAGE_SEATS.filter((s) => s.fila === 1).map((seat) => {
              const isSelected = selectedSeat?.id === seat.id && activeTab === 'explora';
              const placedInstId = placedMusicians[seat.id];
              const placedInst = INSTRUMENTS_DATA.find((i) => i.id === placedInstId);

              return (
                <button
                  key={seat.id}
                  onClick={() =>
                    activeTab === 'explora' ? handleSelectSeat(seat) : handlePlaceInSeat(seat)
                  }
                  className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 min-h-[110px] text-center ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-300 ring-4 ring-emerald-400/50 scale-105'
                      : activeTab === 'puzle' && placedInst
                      ? 'bg-emerald-800/80 border-emerald-300 text-white'
                      : 'bg-stone-800/80 border-emerald-600/60 hover:border-emerald-400 hover:bg-stone-700/90'
                  }`}
                >
                  <div className="text-3xl mb-1 filter drop-shadow">
                    {activeTab === 'puzle'
                      ? placedInst
                        ? placedInst.icona
                        : '🪑'
                      : seat.icona}
                  </div>
                  <span className="text-xs font-black text-white leading-tight">
                    {activeTab === 'puzle'
                      ? placedInst
                        ? placedInst.nom
                        : `Posició ${seat.posicio}`
                      : seat.nom}
                  </span>
                  <span className="text-[10px] text-emerald-200/80 font-medium">
                    {seat.posicio === 1 ? 'Extrem Esquerre' : `Cadira ${seat.posicio}`}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-emerald-300 text-emerald-950 text-[9px] font-black uppercase">
                      Actiu 🔊
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Public / Audience front stage indicator */}
        <div className="mt-8 pt-4 border-t border-amber-800/60 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-amber-200 text-xs font-black uppercase tracking-widest">
            👥 DIRECCIÓ DEL PÚBLIC I BALLADORS DE SARDANA 👥
          </span>
        </div>
      </div>

      {/* MODE 1: DETAIL EXPLORATION CARD */}
      {activeTab === 'explora' && currentInst && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-amber-200 shadow-md animate-fade-in space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Instrument Info (Left) */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-4xl shrink-0 border-2 border-amber-300 shadow-sm">
                  {currentInst.icona}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-2xl font-black text-slate-800">{currentInst.nom}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                      {currentInst.fila === 1 ? '1a Fila (Davant)' : '2a Fila (Darrere)'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                      Posició {currentInst.posicio}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {currentInst.nomComplet}
                  </p>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {currentInst.descripcioCurta}
              </p>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong className="text-amber-950 font-bold">Per què va aquí a l'escenari?</strong>{' '}
                {currentInst.fila === 1
                  ? 'Els instruments de vent-fusta tenen una sonoritat més càlida i delicada. Si anessin darrere, la gran potència dels metalls els taparia completament!'
                  : currentInst.nom === 'Contrabaix'
                  ? 'El contrabaix és gegant i es toca dret. Va a l’extrem dret perquè tothom pugui veure el seu marcatge rítmic sense tapar cap company!'
                  : 'Els instruments de vent-metall es col·loquen a la segona fila perquè projecten el so amb molta potència cap endavant, omplint tota la plaça!'}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => coblaAudio.playInstrumentDemo(currentInst.synthType)}
                  className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-amber-700" />
                  <span>Toc ràpid sintètic</span>
                </button>
              </div>
            </div>

            {/* Embedded YouTube video for this seat (Right) */}
            <div className="md:col-span-5">
              <div className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-red-600" />
                <span>Vídeo oficial de SomSardana:</span>
              </div>
              <CoblaYouTubePlayer
                key={currentInst.youtubeId}
                youtubeId={currentInst.youtubeId}
                title={currentInst.youtubeTitle}
                durada="13-14s"
                compact={true}
              />
            </div>

          </div>
        </div>
      )}

      {/* MODAL FOR ROW / COBLA SENCERA VIDEOS */}
      {rowVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border-3 border-amber-400 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-black text-white">{rowVideoModal.title}</h3>
                <span className="text-xs font-mono bg-red-900/60 text-red-200 px-2 py-0.5 rounded">
                  {rowVideoModal.durada}
                </span>
              </div>
              <button
                onClick={() => setRowVideoModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CoblaYouTubePlayer
              youtubeId={rowVideoModal.id}
              title={rowVideoModal.title}
              durada={rowVideoModal.durada}
              autoplay={true}
              showInfo={false}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRowVideoModal(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-sm transition"
              >
                Tanca el vídeo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: PUZZLE WAITING BENCH */}
      {activeTab === 'puzle' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-purple-200 shadow-md space-y-6">
          
          {/* Feedback banner */}
          <div
            className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
              puzzleFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : puzzleFeedback.type === 'try-again'
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-purple-50 border-purple-200 text-purple-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {puzzleFeedback.type === 'success' ? '🌟' : puzzleFeedback.type === 'try-again' ? '💡' : '🤖'}
              </span>
              <span className="font-bold text-sm">{puzzleFeedback.msg}</span>
            </div>

            <button
              onClick={handleResetPuzzle}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-purple-700 transition"
              title="Reinicia el puzle"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Congratulations Card if complete */}
          {puzzleCompleted && (
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-center space-y-3 shadow-lg">
              <div className="text-4xl animate-bounce">🏆🎉</div>
              <h3 className="text-2xl font-black">
                Moltíssimes felicitats, {student?.nom || 'músic'}!
              </h3>
              <p className="text-emerald-100 font-medium max-w-xl mx-auto text-sm">
                Has col·locat els 11 músics de la cobla a la seva posició exacta! Has sumat +100 punts al teu Carnet de Músic!
              </p>
            </div>
          )}

          {/* Waiting Musicians Bench */}
          {!puzzleCompleted && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Músics a la banqueta d'espera ({unplacedInstruments.length} per col·locar):</span>
                </h4>
                <span className="text-xs font-semibold text-slate-500">
                  Clica a un músic per seleccionar-lo
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {unplacedInstruments.map((inst) => {
                  const isSelected = selectedMusicianToPlace === inst.id;
                  return (
                    <button
                      key={inst.id}
                      onClick={() => handleSelectWaitingMusician(inst.id)}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 text-center ${
                        isSelected
                          ? 'border-purple-600 bg-purple-100 ring-4 ring-purple-300 scale-105'
                          : 'border-slate-200 bg-slate-50 hover:border-purple-300 hover:bg-white'
                      }`}
                    >
                      <span className="text-3xl">{inst.icona}</span>
                      <span className="text-xs font-black text-slate-800 leading-tight">
                        {inst.nom}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {inst.familia}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
