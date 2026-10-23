import React, { useState } from 'react';
import {
  ENDEVINALLES_DATA,
  INTRUS_ROUNDS,
  QUIZ_QUESTIONS,
  MYSTERY_SOUND_QUESTIONS,
  MYTH_QUESTIONS,
} from '../data/challengesData';
import { INSTRUMENTS_DATA } from '../data/instrumentsData';
import { StudentProfile } from '../types/cobla';
import { coblaAudio } from '../utils/audioEngine';
import {
  Sparkles,
  CheckCircle2,
  Trophy,
  Volume2,
  Award,
  ChevronRight,
  RotateCcw,
  Film,
  Ear,
  Scale,
  Play,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoblaYouTubePlayer } from './CoblaYouTubePlayer';

export type GameMode = 'endevina' | 'intrus' | 'soMisterios' | 'mites' | 'quiz';

interface Props {
  student: StudentProfile | null;
  onAddPoints: (points: number, actionDesc?: string) => void;
  onCompleteQuiz: (score: number) => void;
  onRecordEndevinalla?: () => void;
  onRecordIntrus?: () => void;
  onRecordMysterySound?: () => void;
  onRecordMyth?: () => void;
  onOpenDiploma: () => void;
}

export const ChallengeGames: React.FC<Props> = ({
  student,
  onAddPoints,
  onCompleteQuiz,
  onRecordEndevinalla,
  onRecordIntrus,
  onRecordMysterySound,
  onRecordMyth,
  onOpenDiploma,
}) => {
  const [activeGame, setActiveGame] = useState<GameMode>('endevina');

  // --- Endevina state ---
  const [endevinaIndex, setEndevinaIndex] = useState(0);
  const [revealedClues, setRevealedClues] = useState<number>(1);
  const [selectedEndevinaAnswer, setSelectedEndevinaAnswer] = useState<string | null>(null);
  const [endevinaFeedback, setEndevinaFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);

  // --- Intrus state ---
  const [intrusIndex, setIntrusIndex] = useState(0);
  const [selectedIntrusOption, setSelectedIntrusOption] = useState<string | null>(null);
  const [intrusFeedback, setIntrusFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);

  // --- So Misteriós state ---
  const [soundMysteryIndex, setSoundMysteryIndex] = useState(0);
  const [isPlayingMystery, setIsPlayingMystery] = useState(false);
  const [selectedMysteryAnswer, setSelectedMysteryAnswer] = useState<string | null>(null);
  const [mysteryFeedback, setMysteryFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);

  // --- Mites state (True / False) ---
  const [mythIndex, setMythIndex] = useState(0);
  const [selectedMythAnswer, setSelectedMythAnswer] = useState<boolean | null>(null);
  const [mythFeedback, setMythFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);

  // --- Quiz state ---
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const nom = student?.nom || 'Músic';

  // --- Endevinalles Handlers ---
  const currentEndevina = ENDEVINALLES_DATA[endevinaIndex];
  const targetEndevinaInst = INSTRUMENTS_DATA.find(
    (i) =>
      i.id === currentEndevina.instrumentId ||
      i.synthType === currentEndevina.instrumentId ||
      i.nom.toLowerCase().includes(currentEndevina.respostaCorrecta.toLowerCase())
  );

  const handleRevealNextClue = () => {
    if (revealedClues < 3) {
      setRevealedClues((prev) => prev + 1);
    }
  };

  const handleAnswerEndevina = (opcio: string) => {
    if (endevinaFeedback) return;
    setSelectedEndevinaAnswer(opcio);

    if (opcio === currentEndevina.respostaCorrecta) {
      coblaAudio.playSuccessSound();
      const points = revealedClues === 1 ? 30 : revealedClues === 2 ? 20 : 10;
      onAddPoints(points, `Ha encertat l'endevinalla de: ${currentEndevina.respostaCorrecta}`);
      if (onRecordEndevinalla) onRecordEndevinalla();
      setEndevinaFeedback({
        msg: `🎉 Molt bé, ${nom}! Ets un expert/a! ${currentEndevina.explicacio} (+${points} pts)`,
        isCorrect: true,
      });
    } else {
      coblaAudio.playTryAgainSound();
      setEndevinaFeedback({
        msg: 'Gairebé! Prova de nou llegint bé totes les pistes!',
        isCorrect: false,
      });
    }
  };

  const handleNextEndevina = () => {
    setSelectedEndevinaAnswer(null);
    setEndevinaFeedback(null);
    setRevealedClues(1);
    if (endevinaIndex < ENDEVINALLES_DATA.length - 1) {
      setEndevinaIndex((prev) => prev + 1);
    } else {
      setEndevinaIndex(0);
    }
  };

  // --- Intrus Handlers ---
  const currentIntrus = INTRUS_ROUNDS[intrusIndex];

  const handleAnswerIntrus = (opcio: typeof currentIntrus.opcions[0]) => {
    if (intrusFeedback) return;
    setSelectedIntrusOption(opcio.nom);

    if (opcio.esIntrus) {
      coblaAudio.playSuccessSound();
      onAddPoints(25, `Ha caçat l'intrús: ${opcio.nom}`);
      if (onRecordIntrus) onRecordIntrus();
      setIntrusFeedback({
        msg: `🎯 Ben trobat, ${nom}! ${opcio.motiu} (+25 pts)`,
        isCorrect: true,
      });
    } else {
      coblaAudio.playTryAgainSound();
      setIntrusFeedback({
        msg: `Aquest instrument sí que forma part de la cobla! Fixa't bé en la pregunta.`,
        isCorrect: false,
      });
    }
  };

  const handleNextIntrus = () => {
    setSelectedIntrusOption(null);
    setIntrusFeedback(null);
    if (intrusIndex < INTRUS_ROUNDS.length - 1) {
      setIntrusIndex((prev) => prev + 1);
    } else {
      setIntrusIndex(0);
    }
  };

  // --- So Misteriós Handlers ---
  const currentMystery = MYSTERY_SOUND_QUESTIONS[soundMysteryIndex];

  const playMysterySound = () => {
    setIsPlayingMystery(true);
    coblaAudio.playInstrumentDemo(currentMystery.instrumentKey);
    setTimeout(() => setIsPlayingMystery(false), 5000);
  };

  const handleAnswerMystery = (opcio: string) => {
    if (mysteryFeedback) return;
    setSelectedMysteryAnswer(opcio);

    if (opcio === currentMystery.respostaCorrecta) {
      coblaAudio.playSuccessSound();
      onAddPoints(25, `Ha encertat el so misteriós: ${opcio}`);
      if (onRecordMysterySound) onRecordMysterySound();
      setMysteryFeedback({
        msg: `👂 Oïda d'or, ${nom}! ${currentMystery.explicacio} (+25 pts)`,
        isCorrect: true,
      });
    } else {
      coblaAudio.playTryAgainSound();
      setMysteryFeedback({
        msg: `No era aquest! Torna a clicar per escoltar el so amb atenció!`,
        isCorrect: false,
      });
    }
  };

  const handleNextMystery = () => {
    setSelectedMysteryAnswer(null);
    setMysteryFeedback(null);
    if (soundMysteryIndex < MYSTERY_SOUND_QUESTIONS.length - 1) {
      setSoundMysteryIndex((prev) => prev + 1);
    } else {
      setSoundMysteryIndex(0);
    }
  };

  // --- Mites Handlers (True / False) ---
  const currentMyth = MYTH_QUESTIONS[mythIndex];

  const handleAnswerMyth = (isTrueChosen: boolean) => {
    if (mythFeedback) return;
    setSelectedMythAnswer(isTrueChosen);

    const isCorrect = isTrueChosen === currentMyth.esVeritat;
    if (isCorrect) {
      coblaAudio.playSuccessSound();
      onAddPoints(20, `Ha resolt el mite: ${currentMyth.afirmacio.slice(0, 30)}...`);
      if (onRecordMyth) onRecordMyth();
      setMythFeedback({
        msg: `🌟 Molt ben deduït, ${nom}! ${currentMyth.explicacio} (+20 pts)`,
        isCorrect: true,
      });
    } else {
      coblaAudio.playTryAgainSound();
      setMythFeedback({
        msg: `Atenció a aquest detall clau! ${currentMyth.explicacio}`,
        isCorrect: false,
      });
    }
  };

  const handleNextMyth = () => {
    setSelectedMythAnswer(null);
    setMythFeedback(null);
    if (mythIndex < MYTH_QUESTIONS.length - 1) {
      setMythIndex((prev) => prev + 1);
    } else {
      setMythIndex(0);
    }
  };

  // --- Quiz Handlers ---
  const currentQuiz = QUIZ_QUESTIONS[quizIndex];

  const handleAnswerQuiz = (selectedIndex: number) => {
    if (quizFeedback !== null) return;
    setSelectedQuizAnswer(selectedIndex);

    const isCorrect = selectedIndex === currentQuiz.respostaIndex;
    if (isCorrect) {
      coblaAudio.playSuccessSound();
      setQuizScore((prev) => prev + 1);
      setQuizFeedback({
        msg: `Molt bé, ${nom}! Resposta correcta! ${currentQuiz.explicacio}`,
        isCorrect: true,
      });
    } else {
      coblaAudio.playTryAgainSound();
      setQuizFeedback({
        msg: `No és correcte. ${currentQuiz.explicacio}`,
        isCorrect: false,
      });
    }
  };

  const handleNextQuiz = () => {
    setSelectedQuizAnswer(null);
    setQuizFeedback(null);

    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setIsQuizFinished(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onCompleteQuiz(quizScore);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedQuizAnswer(null);
    setQuizFeedback(null);
    setIsQuizFinished(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header and Game Mode Selector */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-purple-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Zona de Jocs i Reptes Interactius
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              🎮 El Repte de la Cobla
            </h2>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Posa a prova els teus coneixements amb 5 jocs diferents: endevinalles, audicions, detector de mites i el Gran Concurs!
            </p>
          </div>
        </div>

        {/* 5 Game Mode Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-100">
          <button
            onClick={() => setActiveGame('endevina')}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-black transition flex items-center gap-2 ${
              activeGame === 'endevina'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
            }`}
          >
            <span>🧩 Endevinalles</span>
          </button>

          <button
            onClick={() => setActiveGame('intrus')}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-black transition flex items-center gap-2 ${
              activeGame === 'intrus'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
            }`}
          >
            <span>🚫 L’Intrús</span>
          </button>

          <button
            onClick={() => setActiveGame('soMisterios')}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-black transition flex items-center gap-2 ${
              activeGame === 'soMisterios'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
            }`}
          >
            <Ear className="w-4 h-4 text-amber-500" />
            <span>👂 Oïda d'Or (So Misteriós)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-extrabold">Nou!</span>
          </button>

          <button
            onClick={() => setActiveGame('mites')}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-black transition flex items-center gap-2 ${
              activeGame === 'mites'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>⚖️ Mites: Pep Ventura (V/F)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-400 text-emerald-950 font-extrabold">Nou!</span>
          </button>

          <button
            onClick={() => setActiveGame('quiz')}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-black transition flex items-center gap-2 ${
              activeGame === 'quiz'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-800" />
            <span>🏆 Gran Concurs & Diploma</span>
          </button>
        </div>
      </div>

      {/* GAME 1: ENDEVINA L'INSTRUMENT */}
      {activeGame === 'endevina' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-purple-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-purple-700 tracking-wider">
                Endevinalla {endevinaIndex + 1} de {ENDEVINALLES_DATA.length}
              </span>
              <h3 className="text-2xl font-black text-slate-800">
                Quin instrument s'amaga darrere les pistes?
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block">Pistes desbloquejades</span>
              <span className="text-lg font-black text-purple-600">{revealedClues} / 3</span>
            </div>
          </div>

          {/* Progressive Clues */}
          <div className="space-y-3">
            {currentEndevina.pistes.map((pista, idx) => {
              const isRevealed = idx < revealedClues;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isRevealed
                      ? 'bg-amber-50/70 border-amber-300 text-slate-800 shadow-sm animate-fade-in'
                      : 'bg-slate-50 border-dashed border-slate-300 text-slate-400'
                  }`}
                >
                  {isRevealed ? (
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0">💡</span>
                      <p className="font-bold text-sm md:text-base leading-relaxed">{pista}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>🔒 Pista {idx + 1} bloquejada</span>
                      {idx === revealedClues && (
                        <button
                          onClick={handleRevealNextClue}
                          className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold transition"
                        >
                          Desbloqueja la Pista {idx + 1}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sound Demo */}
          {targetEndevinaInst && (
            <div className="pt-2 flex items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                <Volume2 className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>Pista acústica: vols sentir com sona aquest instrument?</span>
              </div>
              <button
                onClick={() => coblaAudio.playInstrumentDemo(targetEndevinaInst.synthType)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow transition active:scale-95"
              >
                Fes sonar l'instrument 🔊
              </button>
            </div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {currentEndevina.opcions.map((opcio, idx) => {
              const isSelected = selectedEndevinaAnswer === opcio;
              const isCorrect = opcio === currentEndevina.respostaCorrecta;

              return (
                <button
                  key={idx}
                  disabled={endevinaFeedback?.isCorrect}
                  onClick={() => handleAnswerEndevina(opcio)}
                  className={`p-4 rounded-2xl font-black text-sm md:text-base border-2 transition-all ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                        : 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-slate-800'
                  }`}
                >
                  {opcio}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next */}
          {endevinaFeedback && (
            <div
              className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ${
                endevinaFeedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="font-bold text-sm leading-relaxed">{endevinaFeedback.msg}</div>

              {endevinaFeedback.isCorrect && (
                <button
                  onClick={handleNextEndevina}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition"
                >
                  <span>Següent Endevinalla</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* GAME 2: L'INSTRUMENT INTRÚS */}
      {activeGame === 'intrus' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-purple-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-purple-700 tracking-wider">
                Ronda {intrusIndex + 1} de {INTRUS_ROUNDS.length}
              </span>
              <h3 className="text-2xl font-black text-slate-800">
                Quin és l’instrument INTRÚS?
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
              🔍 Caça l'intrús
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 font-bold text-sm">
            {currentIntrus.pregunta}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {currentIntrus.opcions.map((opcio, idx) => {
              const isSelected = selectedIntrusOption === opcio.nom;

              return (
                <button
                  key={idx}
                  disabled={intrusFeedback?.isCorrect}
                  onClick={() => handleAnswerIntrus(opcio)}
                  className={`p-6 rounded-3xl border-3 flex flex-col items-center justify-center text-center transition-all ${
                    isSelected
                      ? opcio.esIntrus
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-xl scale-105'
                        : 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 hover:border-purple-400 hover:shadow-md text-slate-800'
                  }`}
                >
                  <div className="text-5xl mb-3">{opcio.icona}</div>
                  <span className="font-black text-base">{opcio.nom}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Next */}
          {intrusFeedback && (
            <div
              className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ${
                intrusFeedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="font-bold text-sm leading-relaxed">{intrusFeedback.msg}</div>

              {intrusFeedback.isCorrect && (
                <button
                  onClick={handleNextIntrus}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition"
                >
                  <span>Següent Ronda</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* GAME 3: OÏDA D'OR (EL SO MISTERIÓS) */}
      {activeGame === 'soMisterios' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-amber-300 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider mb-1">
                Audició a Cegues amb Sons Reals (Cobla 2.0) • Ronda {soundMysteryIndex + 1} de {MYSTERY_SOUND_QUESTIONS.length}
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                👂 Oïda d'Or: Endevina quin instrument està sonant!
              </h3>
            </div>
            <span className="text-2xl">🎧</span>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs uppercase font-extrabold text-yellow-200 tracking-wider">
                Pista Sonora
              </span>
              <h4 className="text-xl font-black">
                {currentMystery.titolPista}
              </h4>
              <p className="text-xs text-amber-100 font-medium max-w-md">
                {currentMystery.pistaText}
              </p>
            </div>

            <button
              onClick={playMysterySound}
              disabled={isPlayingMystery}
              className={`px-6 py-4 rounded-2xl bg-white text-amber-900 font-black text-base shadow-xl flex items-center gap-3 transition transform active:scale-95 shrink-0 ${
                isPlayingMystery ? 'animate-pulse bg-yellow-200' : 'hover:bg-yellow-50 hover:scale-105'
              }`}
            >
              <Volume2 className="w-6 h-6 text-amber-600 animate-bounce" />
              <span>{isPlayingMystery ? 'Reproduint so... 🎶' : 'Fes sonar el So Misteriós! 🔊'}</span>
            </button>
          </div>

          {/* 4 Instrument Guess Options */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {currentMystery.opcions.map((opcio, idx) => {
              const isSelected = selectedMysteryAnswer === opcio;
              const isCorrect = opcio === currentMystery.respostaCorrecta;

              return (
                <button
                  key={idx}
                  disabled={mysteryFeedback?.isCorrect}
                  onClick={() => handleAnswerMystery(opcio)}
                  className={`p-4 rounded-2xl font-black text-sm md:text-base border-2 transition-all ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                        : 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-800'
                  }`}
                >
                  {opcio}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next */}
          {mysteryFeedback && (
            <div
              className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ${
                mysteryFeedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="font-bold text-sm leading-relaxed">{mysteryFeedback.msg}</div>

              {mysteryFeedback.isCorrect && (
                <button
                  onClick={handleNextMystery}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition"
                >
                  <span>Següent So Misteriós</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* GAME 4: MITES I VERITATS: PEP VENTURA I COBLA 2.0 / SOM SARDANA (TRUE / FALSE) */}
      {activeGame === 'mites' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-amber-300 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wider mb-1">
                Detector de Mites • Afirmació {mythIndex + 1} de {MYTH_QUESTIONS.length}
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                ⚖️ Verdader o Fals: Pep Ventura i Secrets de Cobla 2.0 i Som Sardana
              </h3>
            </div>
            <span className="text-3xl">{currentMyth.icona}</span>
          </div>

          {/* Big Statement Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-amber-50/50 border-3 border-amber-200 text-center space-y-3">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-100/90 px-3 py-1 rounded-full">
              {currentMyth.dossierRef}
            </span>
            <p className="text-xl md:text-2xl font-black text-slate-800 leading-snug max-w-2xl mx-auto pt-2">
              «{currentMyth.afirmacio}»
            </p>
          </div>

          {/* True / False Choice Buttons - Neutral before click, NO ticks or crosses */}
          <div className="grid grid-cols-2 gap-4">
            <button
              disabled={mythFeedback !== null}
              onClick={() => handleAnswerMyth(true)}
              className={`py-5 px-6 rounded-2xl font-black text-base md:text-lg border-3 transition-all flex items-center justify-center gap-2 min-h-[52px] ${
                selectedMythAnswer === true
                  ? currentMyth.esVeritat
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg'
                    : 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-300 hover:border-amber-400 hover:bg-amber-50/60 text-slate-800 shadow-sm'
              }`}
            >
              <span>És Veritat</span>
            </button>

            <button
              disabled={mythFeedback !== null}
              onClick={() => handleAnswerMyth(false)}
              className={`py-5 px-6 rounded-2xl font-black text-base md:text-lg border-3 transition-all flex items-center justify-center gap-2 min-h-[52px] ${
                selectedMythAnswer === false
                  ? !currentMyth.esVeritat
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg'
                    : 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-300 hover:border-amber-400 hover:bg-amber-50/60 text-slate-800 shadow-sm'
              }`}
            >
              <span>És Fals</span>
            </button>
          </div>

          {/* Feedback & Next */}
          {mythFeedback && (
            <div
              className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ${
                mythFeedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="font-bold text-sm leading-relaxed">{mythFeedback.msg}</div>

              <button
                onClick={handleNextMyth}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition"
              >
                <span>Següent Mite</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 5: EL GRAN CONCURS & DIPLOMA */}
      {activeGame === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-amber-300 shadow-md space-y-6">
          {!isQuizFinished ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
                    Pregunta {quizIndex + 1} de {QUIZ_QUESTIONS.length}
                  </span>
                  <h3 className="text-2xl font-black text-slate-800">
                    El Gran Concurs Oficial de la Cobla
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Puntuació actual</span>
                  <span className="text-lg font-black text-amber-600">{quizScore} encerts</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-amber-950 font-black text-base md:text-lg">
                {currentQuiz.pregunta}
              </div>

              {/* 4 Multiple choices */}
              <div className="space-y-2.5">
                {currentQuiz.opcions.map((opcio, idx) => {
                  const isSelected = selectedQuizAnswer === idx;
                  const isCorrect = idx === currentQuiz.respostaIndex;

                  return (
                    <button
                      key={idx}
                      disabled={quizFeedback !== null}
                      onClick={() => handleAnswerQuiz(idx)}
                      className={`w-full p-4 rounded-2xl font-bold text-sm md:text-base border-2 transition-all flex items-center justify-between text-left ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                            : 'bg-amber-100 border-amber-400 text-amber-900'
                          : quizFeedback && isCorrect
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/50'
                      }`}
                    >
                      <span>{opcio}</span>
                      {isSelected && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next */}
              {quizFeedback && (
                <div
                  className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ${
                    quizFeedback.isCorrect
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <div className="font-bold text-sm leading-relaxed">{quizFeedback.msg}</div>

                  <button
                    onClick={handleNextQuiz}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5"
                  >
                    <span>{quizIndex < QUIZ_QUESTIONS.length - 1 ? 'Següent Pregunta' : 'Veure Resultats!'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="text-6xl animate-bounce">📜🎉</div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-3xl font-black text-slate-800">
                  Enhorabona, {nom}!
                </h3>
                <p className="text-slate-600 font-medium text-base">
                  Has encertat <strong>{quizScore} de 10</strong> preguntes del Gran Concurs!
                </p>
                <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  Ja ets oficialment un <strong>Expert/a de la Cobla Catalana</strong>!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={onOpenDiploma}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-lg shadow-xl shadow-amber-400/30 active:scale-95 transition flex items-center gap-2"
                >
                  <Award className="w-6 h-6" />
                  <span>Obre el teu Diploma Oficial! 📜</span>
                </button>

                <button
                  onClick={handleRestartQuiz}
                  className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Repetir el Concurs</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
