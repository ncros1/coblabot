import React, { useState } from 'react';
import { ENDEVINALLES_DATA, INTRUS_ROUNDS, QUIZ_QUESTIONS } from '../data/challengesData';
import { INSTRUMENTS_DATA } from '../data/instrumentsData';
import { StudentProfile } from '../types/cobla';
import { coblaAudio } from '../utils/audioEngine';
import { Sparkles, CheckCircle2, Trophy, Volume2, Award, ChevronRight, RotateCcw, Film } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoblaYouTubePlayer } from './CoblaYouTubePlayer';

interface Props {
  student: StudentProfile | null;
  onAddPoints: (points: number, actionDesc?: string) => void;
  onCompleteQuiz: (score: number) => void;
  onRecordEndevinalla?: () => void;
  onRecordIntrus?: () => void;
  onOpenDiploma: () => void;
}

export const ChallengeGames: React.FC<Props> = ({
  student,
  onAddPoints,
  onCompleteQuiz,
  onRecordEndevinalla,
  onRecordIntrus,
  onOpenDiploma,
}) => {
  const [activeGame, setActiveGame] = useState<'endevina' | 'intrus' | 'quiz'>('endevina');

  // Endevina state
  const [endevinaIndex, setEndevinaIndex] = useState(0);
  const [revealedClues, setRevealedClues] = useState<number>(1);
  const [selectedEndevinaAnswer, setSelectedEndevinaAnswer] = useState<string | null>(null);
  const [endevinaFeedback, setEndevinaFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);

  // Intrus state
  const [intrusIndex, setIntrusIndex] = useState(0);
  const [selectedIntrusOption, setSelectedIntrusOption] = useState<string | null>(null);
  const [intrusFeedback, setIntrusFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);

  // Quiz state
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
        msg: `🎯 Encertat, ${nom}! ${opcio.motiu} (+25 pts)`,
        isCorrect: true,
      });
    } else {
      coblaAudio.playTryAgainSound();
      setIntrusFeedback({
        msg: `Gairebé! ${opcio.nom} sí que forma part de la cobla! ${opcio.motiu} Prova una altra vegada!`,
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

  // --- Quiz Handlers ---
  const currentQuiz = QUIZ_QUESTIONS[quizIndex];

  const handleAnswerQuiz = (idx: number) => {
    if (quizFeedback) return;
    setSelectedQuizAnswer(idx);

    if (idx === currentQuiz.respostaIndex) {
      coblaAudio.playSuccessSound();
      setQuizScore((prev) => prev + 1);
      onAddPoints(10);
      setQuizFeedback({
        msg: `✨ Molt bé, ${nom}! ${currentQuiz.explicacio}`,
        isCorrect: true,
      });
    } else {
      coblaAudio.playTryAgainSound();
      setQuizFeedback({
        msg: `Gairebé! ${currentQuiz.explicacio}`,
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
      onCompleteQuiz(quizScore);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
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
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header and Game Selector */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-purple-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Zona de Jocs i Reptes
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            🎮 El Repte de la Cobla
          </h2>
          <p className="text-slate-600 font-medium text-sm mt-1">
            Demostra tot el que has après amb jocs d’endevinalles, caça d’intrusos i el Gran Concurs!
          </p>
        </div>

        {/* Game Mode Tabs */}
        <div className="flex flex-wrap gap-2 bg-purple-50 p-1.5 rounded-2xl border border-purple-200">
          <button
            onClick={() => setActiveGame('endevina')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition ${
              activeGame === 'endevina'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-purple-800'
            }`}
          >
            🧩 Endevina l’Instrument
          </button>

          <button
            onClick={() => setActiveGame('intrus')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition ${
              activeGame === 'intrus'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-purple-800'
            }`}
          >
            🕵️ L’Intrús
          </button>

          <button
            onClick={() => setActiveGame('quiz')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition flex items-center gap-1.5 ${
              activeGame === 'quiz'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-700 hover:text-amber-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Gran Concurs & Diploma</span>
          </button>
        </div>
      </div>

      {/* GAME 1: ENDEVINA L'INSTRUMENT */}
      {activeGame === 'endevina' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-purple-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-black text-purple-600 uppercase tracking-wider">
                Endevinalla {endevinaIndex + 1} de {ENDEVINALLES_DATA.length}
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-1">
                🤔 Endevina quin instrument és!
              </h3>
            </div>

            <button
              onClick={() => coblaAudio.playInstrumentDemo(currentEndevina.instrumentId)}
              className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span>Pista de So 🔊</span>
            </button>
          </div>

          {/* Clues Box */}
          <div className="space-y-3">
            {currentEndevina.pistes.slice(0, revealedClues).map((pista, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-purple-50/70 border-2 border-purple-200 text-slate-800 font-bold text-sm md:text-base animate-fade-in flex items-start gap-3"
              >
                <span className="text-2xl shrink-0">🔍</span>
                <span>{pista}</span>
              </div>
            ))}

            {revealedClues < 3 && !endevinaFeedback?.isCorrect && (
              <button
                onClick={handleRevealNextClue}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <span>Demana una altra pista ({3 - revealedClues} disponibles)</span>
                <span>💡</span>
              </button>
            )}
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentEndevina.opcions.map((opcio) => {
              const isSelected = selectedEndevinaAnswer === opcio;
              const isCorrect = opcio === currentEndevina.respostaCorrecta;

              return (
                <button
                  key={opcio}
                  disabled={endevinaFeedback?.isCorrect}
                  onClick={() => handleAnswerEndevina(opcio)}
                  className={`p-4 rounded-2xl font-black text-base border-2 transition-all flex items-center justify-between text-left ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                        : 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <span>{opcio}</span>
                  {isSelected && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                  {isSelected && !isCorrect && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                      Gairebé!
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {endevinaFeedback && (
            <div className="space-y-4 animate-fade-in">
              <div
                className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  endevinaFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <div className="font-bold text-sm leading-relaxed">{endevinaFeedback.msg}</div>

                {endevinaFeedback.isCorrect && (
                  <button
                    onClick={handleNextEndevina}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <span>Següent Endevinalla</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Reveal official video from SomSardana when correct */}
              {endevinaFeedback.isCorrect && targetEndevinaInst && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border-2 border-amber-400 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider">
                    <Film className="w-4 h-4 text-red-500" />
                    <span>Vídeo oficial de SomSardana: {targetEndevinaInst.nom}</span>
                  </div>
                  <CoblaYouTubePlayer
                    youtubeId={targetEndevinaInst.youtubeId}
                    title={targetEndevinaInst.youtubeTitle}
                    durada="13-14s"
                    autoplay={true}
                    compact={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* GAME 2: L'INTRÚS */}
      {activeGame === 'intrus' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-purple-200 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-black text-purple-600 uppercase tracking-wider">
              Ronda {intrusIndex + 1} de {INTRUS_ROUNDS.length}
            </span>
            <h3 className="text-xl font-black text-slate-800 mt-1">
              🕵️ Caça l’Instrument Intrús!
            </h3>
            <p className="text-sm font-medium text-slate-600 mt-1">
              {currentIntrus.pregunta}
            </p>
          </div>

          {/* 4 Instruments to choose from */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {currentIntrus.opcions.map((opcio) => {
              const isSelected = selectedIntrusOption === opcio.nom;

              return (
                <button
                  key={opcio.nom}
                  disabled={intrusFeedback?.isCorrect}
                  onClick={() => handleAnswerIntrus(opcio)}
                  className={`p-5 rounded-3xl border-3 flex flex-col items-center justify-center gap-2 text-center transition-all ${
                    isSelected
                      ? opcio.esIntrus
                        ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-300 scale-105'
                        : 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 bg-slate-50 hover:border-purple-300 hover:bg-white'
                  }`}
                >
                  <span className="text-5xl">{opcio.icona}</span>
                  <span className="font-black text-sm text-slate-800 leading-tight">
                    {opcio.nom}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>Següent Intrús</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* GAME 3: GRAN CONCURS & DIPLOMA */}
      {activeGame === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-amber-300 shadow-md space-y-6">
          {!isQuizFinished ? (
            <>
              {/* Quiz progress */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                    Pregunta {quizIndex + 1} de {QUIZ_QUESTIONS.length}
                  </span>
                  <h3 className="text-xl font-black text-slate-800 mt-1">
                    🏆 El Gran Concurs de la Cobla
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500">Punts encertats:</span>
                  <div className="text-lg font-black text-amber-600">{quizScore} / {quizIndex + (quizFeedback ? 1 : 0)}</div>
                </div>
              </div>

              {/* Question */}
              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-200">
                <p className="text-base md:text-lg font-black text-amber-950">
                  {currentQuiz.pregunta}
                </p>
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
                            : 'bg-rose-50 border-rose-400 text-rose-800'
                          : quizFeedback && isCorrect
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/50'
                      }`}
                    >
                      <span>{opcio}</span>
                      {isSelected && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                      {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
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
