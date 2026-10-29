import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Volume2,
  Award,
  Clock,
  Check,
  XCircle,
  ArrowRight,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { coblaAudio } from '../utils/audioEngine';
import {
  StudentProfile,
  CompletedGamesTimestamps,
  SavedGameProgress,
} from '../types/cobla';
import {
  ENDEVINALLES_DATA,
  INTRUS_ROUNDS,
  QUIZ_QUESTIONS,
  MYSTERY_SOUND_QUESTIONS,
  MYTH_QUESTIONS,
} from '../data/challengesData';
import { INSTRUMENTS_DATA } from '../data/instrumentsData';

export function shuffleArray<T>(items: readonly T[] | T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface Props {
  student: StudentProfile | null;
  onAddPoints: (pts: number, desc?: string) => void;
  onCompleteQuiz: (score: number) => void;
  onRecordEncert?: (
    gameType: 'endevinalles' | 'intrus' | 'soMisterios' | 'mites' | 'quiz' | 'puzleEscenari',
    desc: string,
    pointsAwarded?: number
  ) => void;
  onRecordError?: (
    gameType: 'endevinalles' | 'intrus' | 'soMisterios' | 'mites' | 'quiz' | 'puzleEscenari',
    desc: string
  ) => void;
  onCompleteGame?: (
    gameKey: 'endevinalles' | 'intrus' | 'soMisterios' | 'mites' | 'quiz' | 'puzleEscenari',
    completionMessage?: string
  ) => void;
  onSaveQuestionProgress?: (
    gameKey: 'endevinalles' | 'intrus' | 'soMisterios' | 'mites' | 'quiz',
    questionIndex: number
  ) => void;
  onOpenDiploma?: () => void;
  onOpenStudentProfile?: () => void;
}

export type GameMode = 'endevina' | 'intrus' | 'soMisterios' | 'mites' | 'quiz';

export const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000;

export const isGameLocked24h = (timestamp?: number): boolean => {
  if (!timestamp || typeof timestamp !== 'number' || timestamp <= 0) return false;
  return Date.now() - timestamp < COOLDOWN_24H_MS;
};

export const getRemainingTime24h = (timestamp?: number) => {
  if (!timestamp || typeof timestamp !== 'number' || timestamp <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isLocked: false };
  }
  const diff = COOLDOWN_24H_MS - (Date.now() - timestamp);
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isLocked: false };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, isLocked: true };
};

export const getStudentGameTimestamp = (
  student: StudentProfile | null,
  gameKey: keyof CompletedGamesTimestamps
): number | undefined => {
  if (!student) return undefined;

  // 1. Direct root property on student
  const rootTs = student.jocsCompletatsTimestamps?.[gameKey];
  if (typeof rootTs === 'number' && rootTs > 0) return rootTs;

  // 2. Inside activitat property
  const actTs = student.activitat?.jocsCompletatsTimestamps?.[gameKey];
  if (typeof actTs === 'number' && actTs > 0) return actTs;

  // 3. Fallback to localStorage keyed by student ID
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const byId = localStorage.getItem(`coblabot_24h_${student.id}_${gameKey}`);
      if (byId) {
        const parsed = parseInt(byId, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      // 4. Fallback to localStorage keyed by student Nom
      if (student.nom) {
        const cleanNom = student.nom.toLowerCase().trim();
        const byNom = localStorage.getItem(`coblabot_24h_${cleanNom}_${gameKey}`);
        if (byNom) {
          const parsed = parseInt(byNom, 10);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return undefined;
};

export const getStudentGameProgress = (
  student: StudentProfile | null,
  gameKey: keyof SavedGameProgress
): number[] => {
  if (!student) return [];

  // 1. Direct root property
  const rootProg = student.progresJocs?.[gameKey];
  if (Array.isArray(rootProg) && rootProg.length > 0) return rootProg;

  // 2. Inside activitat property
  const actProg = student.activitat?.progresJocs?.[gameKey];
  if (Array.isArray(actProg) && actProg.length > 0) return actProg;

  // 3. Fallback to localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const byId = localStorage.getItem(`coblabot_progress_${student.id}_${gameKey}`);
      if (byId) {
        const parsed = JSON.parse(byId);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      if (student.nom) {
        const cleanNom = student.nom.toLowerCase().trim();
        const byNom = localStorage.getItem(`coblabot_progress_${cleanNom}_${gameKey}`);
        if (byNom) {
          const parsed = JSON.parse(byNom);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return [];
};

// --- Cooldown Banner Component (Teacher-only stats; no encerts/errors shown to students) ---
interface CooldownBannerProps {
  title: string;
  icon: string;
  studentName: string;
  timestamp?: number;
  onSwitchMode: (mode: GameMode) => void;
  availableModes: { key: GameMode; label: string; icon: string }[];
}

const Game24hCooldownBanner: React.FC<CooldownBannerProps> = ({
  title,
  icon,
  studentName,
  timestamp,
  onSwitchMode,
  availableModes,
}) => {
  const { hours, minutes, seconds } = getRemainingTime24h(timestamp);

  return (
    <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50/70 rounded-3xl p-6 sm:p-10 border-4 border-amber-300 shadow-md text-center space-y-6 animate-fade-in">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-inner">
        ⏳
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-200/90 text-amber-950 text-xs font-black uppercase tracking-wider">
          <span>{icon}</span>
          <span>{title} • Finalitzat per avui</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Molt bona feina, {studentName}!
        </h3>
        <p className="text-slate-600 text-sm font-semibold leading-relaxed">
          Has completat amb èxit aquest repte! Les teves respostes han quedat guardades al registre de la mestra. Per consolidar els aprenentatges, aquest joc estarà bloquejat durant 24 hores:
        </p>
      </div>

      {/* Countdown Clock */}
      <div className="inline-flex items-center gap-3 sm:gap-4 bg-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl border-2 border-amber-300 shadow-sm">
        <div className="flex flex-col items-center">
          <span className="text-3xl sm:text-4xl font-black text-amber-800 font-mono">
            {String(hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Hores</span>
        </div>
        <span className="text-2xl font-black text-amber-400">:</span>
        <div className="flex flex-col items-center">
          <span className="text-3xl sm:text-4xl font-black text-amber-800 font-mono">
            {String(minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Minuts</span>
        </div>
        <span className="text-2xl font-black text-amber-400">:</span>
        <div className="flex flex-col items-center">
          <span className="text-3xl sm:text-4xl font-black text-amber-800 font-mono">
            {String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Segons</span>
        </div>
      </div>

      {/* Info Card: Results registered for teacher only */}
      <div className="p-4 rounded-2xl bg-amber-100/60 border-2 border-amber-300 max-w-md mx-auto flex items-center justify-center gap-3">
        <span className="text-2xl">🎓</span>
        <span className="text-xs sm:text-sm font-extrabold text-amber-950">
          Resultats i respostes registrats correctament al panell de la mestra!
        </span>
      </div>

      {/* Unlocked Alternative Games */}
      {availableModes.length > 0 ? (
        <div className="pt-4 border-t border-amber-200 max-w-lg mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase text-amber-900 tracking-wider block">
            Continua jugant! Prova un dels altres jocs disponibles:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {availableModes.map((m) => (
              <button
                key={m.key}
                onClick={() => onSwitchMode(m.key)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-amber-200 text-xs font-bold text-amber-900">
          🎉 Impressionant! Has completat tots els jocs de la Cobla per avui!
        </div>
      )}
    </div>
  );
};

export const ChallengeGames: React.FC<Props> = ({
  student,
  onAddPoints,
  onCompleteQuiz,
  onRecordEncert,
  onRecordError,
  onCompleteGame,
  onSaveQuestionProgress,
  onOpenDiploma,
  onOpenStudentProfile,
}) => {
  const [activeGame, setActiveGame] = useState<GameMode>('endevina');

  // Live timer tick every 1000ms for live 24h countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Memorized question progress lists for this student
  const solvedEndevinalles = getStudentGameProgress(student, 'endevinalles');
  const solvedIntrus = getStudentGameProgress(student, 'intrus');
  const solvedSoMisterios = getStudentGameProgress(student, 'soMisterios');
  const solvedMites = getStudentGameProgress(student, 'mites');
  const solvedQuiz = getStudentGameProgress(student, 'quiz');

  // Helper: Find first unsolved index
  const findFirstUnsolved = (solvedList: number[], totalCount: number): number => {
    for (let i = 0; i < totalCount; i++) {
      if (!solvedList.includes(i)) return i;
    }
    return totalCount - 1;
  };

  // --- Endevinalles state ---
  const [endevinaIndex, setEndevinaIndex] = useState(() =>
    findFirstUnsolved(solvedEndevinalles, ENDEVINALLES_DATA.length)
  );
  const [revealedClues, setRevealedClues] = useState<number>(1);
  const [selectedEndevinaAnswer, setSelectedEndevinaAnswer] = useState<string | null>(null);
  const [endevinaFeedback, setEndevinaFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);
  const [endevinaIncorrectPicks, setEndevinaIncorrectPicks] = useState<string[]>([]);

  // --- Intrus state ---
  const [intrusIndex, setIntrusIndex] = useState(() =>
    findFirstUnsolved(solvedIntrus, INTRUS_ROUNDS.length)
  );
  const [selectedIntrusOption, setSelectedIntrusOption] = useState<string | null>(null);
  const [intrusFeedback, setIntrusFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);
  const [intrusIncorrectPicks, setIntrusIncorrectPicks] = useState<string[]>([]);

  // --- So Misteriós state ---
  const [soundMysteryIndex, setSoundMysteryIndex] = useState(() =>
    findFirstUnsolved(solvedSoMisterios, MYSTERY_SOUND_QUESTIONS.length)
  );
  const [isPlayingMystery, setIsPlayingMystery] = useState(false);
  const [selectedMysteryAnswer, setSelectedMysteryAnswer] = useState<string | null>(null);
  const [mysteryFeedback, setMysteryFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);
  const [mysteryIncorrectPicks, setMysteryIncorrectPicks] = useState<string[]>([]);

  // --- Mites state (True / False) ---
  const [mythIndex, setMythIndex] = useState(() =>
    findFirstUnsolved(solvedMites, MYTH_QUESTIONS.length)
  );
  const [selectedMythAnswer, setSelectedMythAnswer] = useState<boolean | null>(null);
  const [mythFeedback, setMythFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);

  // --- Quiz state ---
  const [quizIndex, setQuizIndex] = useState(() =>
    findFirstUnsolved(solvedQuiz, QUIZ_QUESTIONS.length)
  );
  const [quizScore, setQuizScore] = useState(() => solvedQuiz.length);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);
  const [quizIncorrectPicks, setQuizIncorrectPicks] = useState<number[]>([]);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Adjust indices if student changes
  useEffect(() => {
    if (student) {
      setEndevinaIndex(findFirstUnsolved(solvedEndevinalles, ENDEVINALLES_DATA.length));
      setIntrusIndex(findFirstUnsolved(solvedIntrus, INTRUS_ROUNDS.length));
      setSoundMysteryIndex(findFirstUnsolved(solvedSoMisterios, MYSTERY_SOUND_QUESTIONS.length));
      setMythIndex(findFirstUnsolved(solvedMites, MYTH_QUESTIONS.length));
      setQuizIndex(findFirstUnsolved(solvedQuiz, QUIZ_QUESTIONS.length));
      setQuizScore(solvedQuiz.length);
    }
  }, [student?.id]);

  const nom = student?.nom || 'Músic';

  // Read 24h timestamps per user
  const endevinaTs = getStudentGameTimestamp(student, 'endevinalles');
  const intrusTs = getStudentGameTimestamp(student, 'intrus');
  const soMisteriosTs = getStudentGameTimestamp(student, 'soMisterios');
  const mitesTs = getStudentGameTimestamp(student, 'mites');
  const quizTs = getStudentGameTimestamp(student, 'quiz');

  const isEndevinaLocked = isGameLocked24h(endevinaTs);
  const isIntrusLocked = isGameLocked24h(intrusTs);
  const isSoMisteriosLocked = isGameLocked24h(soMisteriosTs);
  const isMitesLocked = isGameLocked24h(mitesTs);
  const isQuizLocked = isGameLocked24h(quizTs);

  const allGameModes: { key: GameMode; label: string; icon: string; isLocked: boolean; timestamp?: number }[] = [
    { key: 'endevina', label: 'Endevinalles', icon: '🧩', isLocked: isEndevinaLocked, timestamp: endevinaTs },
    { key: 'intrus', label: 'L’Intrús', icon: '🚫', isLocked: isIntrusLocked, timestamp: intrusTs },
    { key: 'soMisterios', label: 'So Misteriós', icon: '👂', isLocked: isSoMisteriosLocked, timestamp: soMisteriosTs },
    { key: 'mites', label: 'Mites Pep Ventura', icon: '⚖️', isLocked: isMitesLocked, timestamp: mitesTs },
    { key: 'quiz', label: 'El Gran Concurs', icon: '📜', isLocked: isQuizLocked, timestamp: quizTs },
  ];
  const unlockedModes = allGameModes.filter((m) => !m.isLocked && m.key !== activeGame);

  // Check if current questions are already answered and memorized
  const isCurrentEndevinaMemorized = solvedEndevinalles.includes(endevinaIndex);
  const isCurrentIntrusMemorized = solvedIntrus.includes(intrusIndex);
  const isCurrentMysteryMemorized = solvedSoMisterios.includes(soundMysteryIndex);
  const isCurrentMythMemorized = solvedMites.includes(mythIndex);
  const isCurrentQuizMemorized = solvedQuiz.includes(quizIndex);

  // --- 1. ENDEVINALLES HANDLERS ---
  const currentEndevina = ENDEVINALLES_DATA[endevinaIndex];
  const shuffledEndevinaOptions = useMemo(() => {
    if (!currentEndevina?.opcions) return [];
    return shuffleArray(currentEndevina.opcions);
  }, [endevinaIndex, currentEndevina?.id]);

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
    // If question is already memorized or solved, cannot re-answer!
    if (isCurrentEndevinaMemorized || endevinaFeedback?.isCorrect) return;

    setSelectedEndevinaAnswer(opcio);

    if (opcio === currentEndevina.respostaCorrecta) {
      coblaAudio.playSuccessSound();
      const points = revealedClues === 1 ? 30 : revealedClues === 2 ? 20 : 10;
      onAddPoints(points, `Ha encertat l'endevinalla de: ${currentEndevina.respostaCorrecta}`);
      if (onRecordEncert) {
        onRecordEncert('endevinalles', currentEndevina.respostaCorrecta, points);
      }
      setEndevinaFeedback({
        msg: `🎉 Molt bé, ${nom}! Ets un expert/a! ${currentEndevina.explicacio} (+${points} pts)`,
        isCorrect: true,
      });

      // Memorize this answered question permanently!
      if (onSaveQuestionProgress) {
        onSaveQuestionProgress('endevinalles', endevinaIndex);
      }

      // If this was the final endevinalla, lock game for 24h
      if (endevinaIndex === ENDEVINALLES_DATA.length - 1 || solvedEndevinalles.length + 1 >= ENDEVINALLES_DATA.length) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        if (onCompleteGame) {
          onCompleteGame('endevinalles', 'Ha resolt amb èxit totes les Endevinalles de la Cobla!');
        }
      }
    } else {
      coblaAudio.playTryAgainSound();
      setEndevinaIncorrectPicks((prev) => (prev.includes(opcio) ? prev : [...prev, opcio]));
      if (onRecordError) {
        onRecordError('endevinalles', `Ha fallat a l'endevinalla triant "${opcio}"`);
      }
      setEndevinaFeedback({
        msg: `❌ "${opcio}" no és correcte. Pots tornar a respondre triant una altra opció o desbloquejar més pistes!`,
        isCorrect: false,
      });
    }
  };

  const handleRetryEndevina = () => {
    if (isCurrentEndevinaMemorized) return;
    setSelectedEndevinaAnswer(null);
    setEndevinaFeedback(null);
  };

  const handleNextEndevina = () => {
    setSelectedEndevinaAnswer(null);
    setEndevinaFeedback(null);
    setEndevinaIncorrectPicks([]);
    setRevealedClues(1);

    if (endevinaIndex < ENDEVINALLES_DATA.length - 1) {
      setEndevinaIndex((prev) => prev + 1);
    } else {
      if (onCompleteGame) {
        onCompleteGame('endevinalles', 'Ha resolt amb èxit totes les Endevinalles de la Cobla!');
      }
      setEndevinaIndex(0);
    }
  };

  // --- 2. INTRÚS HANDLERS ---
  const currentIntrus = INTRUS_ROUNDS[intrusIndex];
  const shuffledIntrusOptions = useMemo(() => {
    if (!currentIntrus?.opcions) return [];
    return shuffleArray(currentIntrus.opcions);
  }, [intrusIndex, currentIntrus?.id]);

  const handleAnswerIntrus = (opcio: (typeof currentIntrus.opcions)[0]) => {
    if (isCurrentIntrusMemorized || intrusFeedback?.isCorrect) return;

    setSelectedIntrusOption(opcio.nom);

    if (opcio.esIntrus) {
      coblaAudio.playSuccessSound();
      onAddPoints(25, `Ha caçat l'intrús: ${opcio.nom}`);
      if (onRecordEncert) {
        onRecordEncert('intrus', `Intrús detectat: ${opcio.nom}`, 25);
      }
      setIntrusFeedback({
        msg: `🎯 Ben trobat, ${nom}! ${opcio.motiu} (+25 pts)`,
        isCorrect: true,
      });

      // Memorize progress!
      if (onSaveQuestionProgress) {
        onSaveQuestionProgress('intrus', intrusIndex);
      }

      if (intrusIndex === INTRUS_ROUNDS.length - 1 || solvedIntrus.length + 1 >= INTRUS_ROUNDS.length) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        if (onCompleteGame) {
          onCompleteGame('intrus', 'Ha caçat tots els Intrusos de la Cobla!');
        }
      }
    } else {
      coblaAudio.playTryAgainSound();
      setIntrusIncorrectPicks((prev) => (prev.includes(opcio.nom) ? prev : [...prev, opcio.nom]));
      if (onRecordError) {
        onRecordError('intrus', `Ha fallat en triar ${opcio.nom} (sí que és de la cobla)`);
      }
      setIntrusFeedback({
        msg: `❌ ${opcio.nom} sí que forma part de la cobla! Tria l'instrument que no hi encaixa.`,
        isCorrect: false,
      });
    }
  };

  const handleRetryIntrus = () => {
    if (isCurrentIntrusMemorized) return;
    setSelectedIntrusOption(null);
    setIntrusFeedback(null);
  };

  const handleNextIntrus = () => {
    setSelectedIntrusOption(null);
    setIntrusFeedback(null);
    setIntrusIncorrectPicks([]);

    if (intrusIndex < INTRUS_ROUNDS.length - 1) {
      setIntrusIndex((prev) => prev + 1);
    } else {
      if (onCompleteGame) {
        onCompleteGame('intrus', 'Ha caçat tots els Intrusos de la Cobla!');
      }
      setIntrusIndex(0);
    }
  };

  // --- 3. SO MISTERIÓS HANDLERS ---
  const currentMystery = MYSTERY_SOUND_QUESTIONS[soundMysteryIndex];
  const shuffledMysteryOptions = useMemo(() => {
    if (!currentMystery?.opcions) return [];
    return shuffleArray(currentMystery.opcions);
  }, [soundMysteryIndex, currentMystery?.id]);

  const playMysterySound = () => {
    setIsPlayingMystery(true);
    coblaAudio.playInstrumentDemo(currentMystery.instrumentKey);
    setTimeout(() => setIsPlayingMystery(false), 5000);
  };

  const handleAnswerMystery = (opcio: string) => {
    if (isCurrentMysteryMemorized || mysteryFeedback?.isCorrect) return;

    setSelectedMysteryAnswer(opcio);

    if (opcio === currentMystery.respostaCorrecta) {
      coblaAudio.playSuccessSound();
      onAddPoints(25, `Ha encertat el so misteriós: ${opcio}`);
      if (onRecordEncert) {
        onRecordEncert('soMisterios', currentMystery.respostaCorrecta, 25);
      }
      setMysteryFeedback({
        msg: `👂 Oïda d'or, ${nom}! ${currentMystery.explicacio} (+25 pts)`,
        isCorrect: true,
      });

      // Memorize progress!
      if (onSaveQuestionProgress) {
        onSaveQuestionProgress('soMisterios', soundMysteryIndex);
      }

      if (soundMysteryIndex === MYSTERY_SOUND_QUESTIONS.length - 1 || solvedSoMisterios.length + 1 >= MYSTERY_SOUND_QUESTIONS.length) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        if (onCompleteGame) {
          onCompleteGame('soMisterios', 'Ha encertat tots els Sons Misteriosos de la Cobla!');
        }
      }
    } else {
      coblaAudio.playTryAgainSound();
      setMysteryIncorrectPicks((prev) => (prev.includes(opcio) ? prev : [...prev, opcio]));
      if (onRecordError) {
        onRecordError('soMisterios', `Ha fallat el so de ${currentMystery.respostaCorrecta} triant "${opcio}"`);
      }
      setMysteryFeedback({
        msg: `❌ "${opcio}" no és aquest so. Torna a reproduir la pista acústica i tria una altra opció!`,
        isCorrect: false,
      });
    }
  };

  const handleRetryMystery = () => {
    if (isCurrentMysteryMemorized) return;
    setSelectedMysteryAnswer(null);
    setMysteryFeedback(null);
  };

  const handleNextMystery = () => {
    setSelectedMysteryAnswer(null);
    setMysteryFeedback(null);
    setMysteryIncorrectPicks([]);

    if (soundMysteryIndex < MYSTERY_SOUND_QUESTIONS.length - 1) {
      setSoundMysteryIndex((prev) => prev + 1);
    } else {
      if (onCompleteGame) {
        onCompleteGame('soMisterios', 'Ha encertat tots els Sons Misteriosos de la Cobla!');
      }
      setSoundMysteryIndex(0);
    }
  };

  // --- 4. MITES HANDLERS (TRUE / FALSE) ---
  const currentMyth = MYTH_QUESTIONS[mythIndex];
  const shuffledMythButtons = useMemo(() => {
    return shuffleArray([
      { value: true, label: 'És Veritat' },
      { value: false, label: 'És Fals' },
    ]);
  }, [mythIndex, currentMyth?.id]);

  const handleAnswerMyth = (isTrueChosen: boolean) => {
    if (isCurrentMythMemorized || mythFeedback?.isCorrect) return;

    setSelectedMythAnswer(isTrueChosen);
    const isCorrect = isTrueChosen === currentMyth.esVeritat;

    if (isCorrect) {
      coblaAudio.playSuccessSound();
      onAddPoints(20, `Ha resolt el mite: ${currentMyth.afirmacio.slice(0, 30)}...`);
      if (onRecordEncert) {
        onRecordEncert('mites', currentMyth.afirmacio.slice(0, 30), 20);
      }
      setMythFeedback({
        msg: `🌟 Molt ben deduït, ${nom}! ${currentMyth.explicacio} (+20 pts)`,
        isCorrect: true,
      });

      // Memorize progress!
      if (onSaveQuestionProgress) {
        onSaveQuestionProgress('mites', mythIndex);
      }

      if (mythIndex === MYTH_QUESTIONS.length - 1 || solvedMites.length + 1 >= MYTH_QUESTIONS.length) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        if (onCompleteGame) {
          onCompleteGame('mites', 'Ha completat tots els Mites de Pep Ventura!');
        }
      }
    } else {
      coblaAudio.playTryAgainSound();
      if (onRecordError) {
        onRecordError('mites', `Ha fallat el mite: "${currentMyth.afirmacio.slice(0, 30)}..."`);
      }
      setMythFeedback({
        msg: `❌ No és correcte! Torna a pensar en la història de Pep Ventura i la cobla i clica l'altra opció!`,
        isCorrect: false,
      });
    }
  };

  const handleRetryMyth = () => {
    if (isCurrentMythMemorized) return;
    setSelectedMythAnswer(null);
    setMythFeedback(null);
  };

  const handleNextMyth = () => {
    setSelectedMythAnswer(null);
    setMythFeedback(null);

    if (mythIndex < MYTH_QUESTIONS.length - 1) {
      setMythIndex((prev) => prev + 1);
    } else {
      if (onCompleteGame) {
        onCompleteGame('mites', 'Ha completat tots els Mites de Pep Ventura!');
      }
      setMythIndex(0);
    }
  };

  // --- 5. QUIZ HANDLERS ---
  const currentQuiz = QUIZ_QUESTIONS[quizIndex];
  interface QuizOptionItem {
    text: string;
    originalIndex: number;
    isCorrect: boolean;
  }
  const shuffledQuizOptions = useMemo<QuizOptionItem[]>(() => {
    if (!currentQuiz?.opcions) return [];
    const items: QuizOptionItem[] = currentQuiz.opcions.map((text, idx) => ({
      text,
      originalIndex: idx,
      isCorrect: idx === currentQuiz.respostaIndex,
    }));
    return shuffleArray(items);
  }, [quizIndex, currentQuiz?.id]);

  const handleAnswerQuiz = (opt: QuizOptionItem) => {
    if (isCurrentQuizMemorized || quizFeedback?.isCorrect) return;

    setSelectedQuizAnswer(opt.originalIndex);
    const isCorrect = opt.isCorrect;

    if (isCorrect) {
      coblaAudio.playSuccessSound();
      let updatedScore = quizScore;
      if (quizIncorrectPicks.length === 0 && !solvedQuiz.includes(quizIndex)) {
        updatedScore = quizScore + 1;
        setQuizScore(updatedScore);
      }
      if (onRecordEncert) {
        onRecordEncert('quiz', currentQuiz.pregunta.slice(0, 30), 15);
      }
      setQuizFeedback({
        msg: `✅ Molt bé, ${nom}! Resposta correcta! ${currentQuiz.explicacio}`,
        isCorrect: true,
      });

      // Memorize progress!
      if (onSaveQuestionProgress) {
        onSaveQuestionProgress('quiz', quizIndex);
      }

      if (quizIndex === QUIZ_QUESTIONS.length - 1 || solvedQuiz.length + 1 >= QUIZ_QUESTIONS.length) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        onCompleteQuiz(updatedScore);
        if (onCompleteGame) {
          onCompleteGame('quiz', 'Ha completat el Gran Concurs Oficial de la Cobla!');
        }
      }
    } else {
      coblaAudio.playTryAgainSound();
      setQuizIncorrectPicks((prev) => (prev.includes(opt.originalIndex) ? prev : [...prev, opt.originalIndex]));
      if (onRecordError) {
        onRecordError('quiz', `Ha fallat a la pregunta: "${currentQuiz.pregunta.slice(0, 30)}..."`);
      }
      setQuizFeedback({
        msg: `❌ Aquesta opció no és correcta. Revisa les altres alternatives i torna a respondre!`,
        isCorrect: false,
      });
    }
  };

  const handleRetryQuiz = () => {
    if (isCurrentQuizMemorized) return;
    setSelectedQuizAnswer(null);
    setQuizFeedback(null);
  };

  const handleNextQuiz = () => {
    setSelectedQuizAnswer(null);
    setQuizFeedback(null);
    setQuizIncorrectPicks([]);

    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setIsQuizFinished(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onCompleteQuiz(quizScore);
      if (onCompleteGame) {
        onCompleteGame('quiz', 'Ha completat el Gran Concurs Oficial de la Cobla!');
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      
      {/* Student Banner Bar: ONLY shows Level, Points, and Profile Switch (Encerts & Errors hidden from students) */}
      {student && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-purple-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl border border-white/30 shrink-0">
              {student.avatar || '👤'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-purple-300">
                  Alumne/a actiu
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase">
                  Sessió connectada
                </span>
              </div>
              <h3 className="text-xl font-black text-white">{student.nom}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold flex items-center gap-2">
              <span className="text-amber-300 font-extrabold">⭐ Nivell {student.estrelles || 1}</span>
              <span className="text-purple-300">•</span>
              <span className="text-yellow-300 font-black">{student.punts || 0} punts</span>
              {student.instrumentPreferit && (
                <>
                  <span className="text-purple-300">•</span>
                  <span className="text-purple-200 font-semibold">{student.instrumentPreferit}</span>
                </>
              )}
            </div>
            {onOpenStudentProfile && (
              <button
                onClick={onOpenStudentProfile}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs transition active:scale-95 shadow"
              >
                Canviar d'Alumne
              </button>
            )}
          </div>
        </div>
      )}

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
              Posa a prova els teus coneixements amb 5 jocs diferents: endevinalles, audicions, detector de mites i el Gran Concurs! Les teves respostes encertades queden memoritzades per sempre.
            </p>
          </div>
        </div>

        {/* 5 Game Mode Tabs with live 24h badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-100">
          {allGameModes.map((m) => {
            const isActive = activeGame === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActiveGame(m.key)}
                className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-black transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : m.isLocked
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
                {m.isLocked && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-950 font-extrabold flex items-center gap-1">
                    <Clock className="w-3 h-3 inline" />
                    <span>24h</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* GAME 1: ENDEVINALLES */}
      {activeGame === 'endevina' &&
        (isEndevinaLocked ? (
          <Game24hCooldownBanner
            title="Endevinalles de la Cobla"
            icon="🧩"
            studentName={nom}
            timestamp={endevinaTs}
            onSwitchMode={(mode) => setActiveGame(mode)}
            availableModes={unlockedModes}
          />
        ) : (
          <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-purple-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase text-purple-700 tracking-wider">
                    Endevinalla {endevinaIndex + 1} de {ENDEVINALLES_DATA.length}
                  </span>
                  {isCurrentEndevinaMemorized && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Encertada i memoritzada
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  Quin instrument s'amaga darrere les pistes?
                </h3>
              </div>

              {/* Progress dots for questions */}
              <div className="flex items-center gap-1.5 self-start sm:self-center">
                {ENDEVINALLES_DATA.map((_, qIdx) => {
                  const isDone = solvedEndevinalles.includes(qIdx);
                  const isCurrent = endevinaIndex === qIdx;
                  return (
                    <button
                      key={qIdx}
                      onClick={() => {
                        setEndevinaIndex(qIdx);
                        setSelectedEndevinaAnswer(null);
                        setEndevinaFeedback(null);
                      }}
                      className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition ${
                        isCurrent
                          ? 'ring-2 ring-purple-600 bg-purple-600 text-white'
                          : isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-purple-100'
                      }`}
                      title={`Endevinalla ${qIdx + 1}${isDone ? ' (Memoritzada)' : ''}`}
                    >
                      {isDone ? '✓' : qIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progressive Clues */}
            <div className="space-y-3">
              {currentEndevina.pistes.map((pista, idx) => {
                const isRevealed = isCurrentEndevinaMemorized || idx < revealedClues;
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

            {/* Answer Options: Once solved/memorized, permanently locked! If wrong, freely retry! */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {shuffledEndevinaOptions.map((opcio, idx) => {
                const isSelected = selectedEndevinaAnswer === opcio;
                const isCorrect = opcio === currentEndevina.respostaCorrecta;
                const isTriedAndWrong = endevinaIncorrectPicks.includes(opcio);
                const isSolved = isCurrentEndevinaMemorized || endevinaFeedback?.isCorrect;

                return (
                  <button
                    key={idx}
                    disabled={Boolean(isSolved)}
                    onClick={() => handleAnswerEndevina(opcio)}
                    className={`p-4 rounded-2xl font-black text-sm md:text-base border-2 transition-all flex items-center justify-center gap-2 ${
                      isSolved && isCorrect
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                        : isSolved && !isCorrect
                        ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                        : isTriedAndWrong
                        ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                        : isSelected && !isCorrect
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-slate-800 active:scale-98'
                    }`}
                  >
                    <span>{opcio}</span>
                    {isSolved && isCorrect && <Check className="w-4 h-4 text-white" />}
                    {isTriedAndWrong && !isSolved && <XCircle className="w-4 h-4 text-rose-500" />}
                  </button>
                );
              })}
            </div>

            {/* Memorized Banner if already solved */}
            {isCurrentEndevinaMemorized && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div className="text-sm">
                      Ja has encertat aquesta endevinalla: <strong>{currentEndevina.respostaCorrecta}</strong>!
                    </div>
                    <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                      La resposta està memoritzada i protegida.
                    </div>
                  </div>
                </div>

                {endevinaIndex < ENDEVINALLES_DATA.length - 1 ? (
                  <button
                    onClick={handleNextEndevina}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
                  >
                    <span>Següent Endevinalla</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs font-black text-emerald-800 px-3 py-1.5 bg-emerald-200/70 rounded-xl">
                    Has completat totes les endevinalles! 🏆
                  </span>
                )}
              </div>
            )}

            {/* Fresh Feedback & Action Buttons when answering */}
            {!isCurrentEndevinaMemorized && endevinaFeedback && (
              <div
                className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ${
                  endevinaFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <div className="font-bold text-sm leading-relaxed">{endevinaFeedback.msg}</div>

                <div className="flex items-center gap-2 shrink-0">
                  {!endevinaFeedback.isCorrect && (
                    <button
                      onClick={handleRetryEndevina}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow flex items-center gap-1.5 transition active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Torna a respondre</span>
                    </button>
                  )}

                  {endevinaFeedback.isCorrect && (
                    <button
                      onClick={handleNextEndevina}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <span>
                        {endevinaIndex < ENDEVINALLES_DATA.length - 1
                          ? 'Següent Endevinalla'
                          : 'Finalitzar Joc 🏆'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

      {/* GAME 2: L'INSTRUMENT INTRÚS */}
      {activeGame === 'intrus' &&
        (isIntrusLocked ? (
          <Game24hCooldownBanner
            title="L'Instrument Intrús"
            icon="🚫"
            studentName={nom}
            timestamp={intrusTs}
            onSwitchMode={(mode) => setActiveGame(mode)}
            availableModes={unlockedModes}
          />
        ) : (
          <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-purple-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase text-purple-700 tracking-wider">
                    Ronda {intrusIndex + 1} de {INTRUS_ROUNDS.length}
                  </span>
                  {isCurrentIntrusMemorized && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Encertada i memoritzada
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  Quin és l’instrument INTRÚS?
                </h3>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 self-start sm:self-center">
                {INTRUS_ROUNDS.map((_, rIdx) => {
                  const isDone = solvedIntrus.includes(rIdx);
                  const isCurrent = intrusIndex === rIdx;
                  return (
                    <button
                      key={rIdx}
                      onClick={() => {
                        setIntrusIndex(rIdx);
                        setSelectedIntrusOption(null);
                        setIntrusFeedback(null);
                      }}
                      className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition ${
                        isCurrent
                          ? 'ring-2 ring-purple-600 bg-purple-600 text-white'
                          : isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-purple-100'
                      }`}
                      title={`Ronda ${rIdx + 1}${isDone ? ' (Memoritzada)' : ''}`}
                    >
                      {isDone ? '✓' : rIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 font-bold text-sm">
              {currentIntrus.pregunta}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {shuffledIntrusOptions.map((opcio, idx) => {
                const isSelected = selectedIntrusOption === opcio.nom;
                const isTriedAndWrong = intrusIncorrectPicks.includes(opcio.nom);
                const isSolved = isCurrentIntrusMemorized || intrusFeedback?.isCorrect;

                return (
                  <button
                    key={idx}
                    disabled={Boolean(isSolved)}
                    onClick={() => handleAnswerIntrus(opcio)}
                    className={`p-6 rounded-3xl border-3 flex flex-col items-center justify-center text-center transition-all ${
                      isSolved && opcio.esIntrus
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-xl scale-105'
                        : isSolved && !opcio.esIntrus
                        ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                        : isTriedAndWrong
                        ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                        : isSelected && !opcio.esIntrus
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 hover:border-purple-400 hover:shadow-md text-slate-800 active:scale-98'
                    }`}
                  >
                    <div className="text-5xl mb-3">{opcio.icona}</div>
                    <span className="font-black text-base">{opcio.nom}</span>
                    {isTriedAndWrong && !isSolved && (
                      <span className="text-[10px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Sí és de la cobla
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Memorized Banner if already solved */}
            {isCurrentIntrusMemorized && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div className="text-sm">
                      Ja has caçat l'intrús d'aquesta ronda correctament!
                    </div>
                    <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                      La resposta està memoritzada i protegida.
                    </div>
                  </div>
                </div>

                {intrusIndex < INTRUS_ROUNDS.length - 1 ? (
                  <button
                    onClick={handleNextIntrus}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
                  >
                    <span>Següent Ronda</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs font-black text-emerald-800 px-3 py-1.5 bg-emerald-200/70 rounded-xl">
                    Has caçat tots els intrusos! 🏆
                  </span>
                )}
              </div>
            )}

            {/* Fresh Feedback & Action Buttons */}
            {!isCurrentIntrusMemorized && intrusFeedback && (
              <div
                className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ${
                  intrusFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <div className="font-bold text-sm leading-relaxed">{intrusFeedback.msg}</div>

                <div className="flex items-center gap-2 shrink-0">
                  {!intrusFeedback.isCorrect && (
                    <button
                      onClick={handleRetryIntrus}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow flex items-center gap-1.5 transition active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Torna a respondre</span>
                    </button>
                  )}

                  {intrusFeedback.isCorrect && (
                    <button
                      onClick={handleNextIntrus}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <span>
                        {intrusIndex < INTRUS_ROUNDS.length - 1
                          ? 'Següent Ronda'
                          : 'Finalitzar Intrús 🏆'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

      {/* GAME 3: OÏDA D'OR (EL SO MISTERIÓS) */}
      {activeGame === 'soMisterios' &&
        (isSoMisteriosLocked ? (
          <Game24hCooldownBanner
            title="Oïda d'Or (So Misteriós)"
            icon="👂"
            studentName={nom}
            timestamp={soMisteriosTs}
            onSwitchMode={(mode) => setActiveGame(mode)}
            availableModes={unlockedModes}
          />
        ) : (
          <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-amber-300 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
                    Ronda {soundMysteryIndex + 1} de {MYSTERY_SOUND_QUESTIONS.length}
                  </span>
                  {isCurrentMysteryMemorized && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Encertada i memoritzada
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  👂 Oïda d'Or: Endevina quin instrument està sonant!
                </h3>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 self-start sm:self-center">
                {MYSTERY_SOUND_QUESTIONS.map((_, sIdx) => {
                  const isDone = solvedSoMisterios.includes(sIdx);
                  const isCurrent = soundMysteryIndex === sIdx;
                  return (
                    <button
                      key={sIdx}
                      onClick={() => {
                        setSoundMysteryIndex(sIdx);
                        setSelectedMysteryAnswer(null);
                        setMysteryFeedback(null);
                      }}
                      className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition ${
                        isCurrent
                          ? 'ring-2 ring-amber-500 bg-amber-500 text-white'
                          : isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-amber-100'
                      }`}
                      title={`So ${sIdx + 1}${isDone ? ' (Memoritzat)' : ''}`}
                    >
                      {isDone ? '✓' : sIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs uppercase font-extrabold text-yellow-200 tracking-wider">
                  Pista Sonora
                </span>
                <h4 className="text-xl font-black">{currentMystery.titolPista}</h4>
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
              {shuffledMysteryOptions.map((opcio, idx) => {
                const isSelected = selectedMysteryAnswer === opcio;
                const isCorrect = opcio === currentMystery.respostaCorrecta;
                const isTriedAndWrong = mysteryIncorrectPicks.includes(opcio);
                const isSolved = isCurrentMysteryMemorized || mysteryFeedback?.isCorrect;

                return (
                  <button
                    key={idx}
                    disabled={Boolean(isSolved)}
                    onClick={() => handleAnswerMystery(opcio)}
                    className={`p-4 rounded-2xl font-black text-sm md:text-base border-2 transition-all flex items-center justify-center gap-2 ${
                      isSolved && isCorrect
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                        : isSolved && !isCorrect
                        ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                        : isTriedAndWrong
                        ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                        : isSelected && !isCorrect
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-800 active:scale-98'
                    }`}
                  >
                    <span>{opcio}</span>
                    {isSolved && isCorrect && <Check className="w-4 h-4 text-white" />}
                    {isTriedAndWrong && !isSolved && <XCircle className="w-4 h-4 text-rose-500" />}
                  </button>
                );
              })}
            </div>

            {/* Memorized Banner if already solved */}
            {isCurrentMysteryMemorized && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div className="text-sm">
                      Ja has encertat aquest so misteriós: <strong>{currentMystery.respostaCorrecta}</strong>!
                    </div>
                    <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                      La resposta està memoritzada i protegida.
                    </div>
                  </div>
                </div>

                {soundMysteryIndex < MYSTERY_SOUND_QUESTIONS.length - 1 ? (
                  <button
                    onClick={handleNextMystery}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
                  >
                    <span>Següent So Misteriós</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs font-black text-emerald-800 px-3 py-1.5 bg-emerald-200/70 rounded-xl">
                    Has encertat tots els sons! 🏆
                  </span>
                )}
              </div>
            )}

            {/* Fresh Feedback & Action Buttons */}
            {!isCurrentMysteryMemorized && mysteryFeedback && (
              <div
                className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ${
                  mysteryFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <div className="font-bold text-sm leading-relaxed">{mysteryFeedback.msg}</div>

                <div className="flex items-center gap-2 shrink-0">
                  {!mysteryFeedback.isCorrect && (
                    <button
                      onClick={handleRetryMystery}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow flex items-center gap-1.5 transition active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Torna a respondre</span>
                    </button>
                  )}

                  {mysteryFeedback.isCorrect && (
                    <button
                      onClick={handleNextMystery}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <span>
                        {soundMysteryIndex < MYSTERY_SOUND_QUESTIONS.length - 1
                          ? 'Següent So Misteriós'
                          : 'Finalitzar Sons 🏆'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

      {/* GAME 4: MITES I VERITATS (TRUE / FALSE) */}
      {activeGame === 'mites' &&
        (isMitesLocked ? (
          <Game24hCooldownBanner
            title="Mites de Pep Ventura"
            icon="⚖️"
            studentName={nom}
            timestamp={mitesTs}
            onSwitchMode={(mode) => setActiveGame(mode)}
            availableModes={unlockedModes}
          />
        ) : (
          <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-amber-300 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                    Afirmació {mythIndex + 1} de {MYTH_QUESTIONS.length}
                  </span>
                  {isCurrentMythMemorized && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Resolta i memoritzada
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  ⚖️ Verdader o Fals: Pep Ventura i Secrets de Cobla
                </h3>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 self-start sm:self-center">
                {MYTH_QUESTIONS.map((_, mIdx) => {
                  const isDone = solvedMites.includes(mIdx);
                  const isCurrent = mythIndex === mIdx;
                  return (
                    <button
                      key={mIdx}
                      onClick={() => {
                        setMythIndex(mIdx);
                        setSelectedMythAnswer(null);
                        setMythFeedback(null);
                      }}
                      className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition ${
                        isCurrent
                          ? 'ring-2 ring-emerald-600 bg-emerald-600 text-white'
                          : isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-emerald-100'
                      }`}
                      title={`Mite ${mIdx + 1}${isDone ? ' (Memoritzat)' : ''}`}
                    >
                      {isDone ? '✓' : mIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Statement Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-amber-50/50 border-3 border-amber-200 text-center space-y-3">
              <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-100/90 px-3 py-1 rounded-full">
                {currentMyth.dossierRef}
              </span>
              <p className="text-xl md:text-2xl font-black text-slate-800 leading-snug max-w-2xl mx-auto pt-2">
                «{currentMyth.afirmacio}»
              </p>
            </div>

            {/* True / False Choice Buttons - Randomized side order per question */}
            <div className="grid grid-cols-2 gap-4">
              {shuffledMythButtons.map((btn) => {
                const isSelected = selectedMythAnswer === btn.value;
                const isCorrect = btn.value === currentMyth.esVeritat;
                const isSolved = isCurrentMythMemorized || mythFeedback?.isCorrect;
                const isWrongPick = isSelected && !isCorrect && mythFeedback && !mythFeedback.isCorrect;

                return (
                  <button
                    key={String(btn.value)}
                    disabled={Boolean(isSolved)}
                    onClick={() => handleAnswerMyth(btn.value)}
                    className={`py-5 px-6 rounded-2xl font-black text-base md:text-lg border-3 transition-all flex items-center justify-center gap-2 min-h-[52px] ${
                      isSolved && isCorrect
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg'
                        : isSolved && !isCorrect
                        ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                        : isWrongPick
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-white border-slate-300 hover:border-amber-400 hover:bg-amber-50/60 text-slate-800 shadow-sm active:scale-98'
                    }`}
                  >
                    <span>{btn.label}</span>
                    {isSolved && isCorrect && <Check className="w-5 h-5 text-white" />}
                    {isWrongPick && <XCircle className="w-5 h-5 text-rose-600" />}
                  </button>
                );
              })}
            </div>

            {/* Memorized Banner if already solved */}
            {isCurrentMythMemorized && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div className="text-sm">
                      Ja has resolt aquest mite: <strong>{currentMyth.esVeritat ? 'És Veritat' : 'És Fals'}</strong>!
                    </div>
                    <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                      {currentMyth.explicacio}
                    </div>
                  </div>
                </div>

                {mythIndex < MYTH_QUESTIONS.length - 1 ? (
                  <button
                    onClick={handleNextMyth}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
                  >
                    <span>Següent Mite</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs font-black text-emerald-800 px-3 py-1.5 bg-emerald-200/70 rounded-xl">
                    Has completat tots els mites! 🏆
                  </span>
                )}
              </div>
            )}

            {/* Fresh Feedback & Action Buttons */}
            {!isCurrentMythMemorized && mythFeedback && (
              <div
                className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ${
                  mythFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="font-bold text-sm leading-relaxed">{mythFeedback.msg}</div>

                <div className="flex items-center gap-2 shrink-0">
                  {!mythFeedback.isCorrect && (
                    <button
                      onClick={handleRetryMyth}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow flex items-center gap-1.5 transition active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Torna a respondre</span>
                    </button>
                  )}

                  {mythFeedback.isCorrect && (
                    <button
                      onClick={handleNextMyth}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <span>
                        {mythIndex < MYTH_QUESTIONS.length - 1 ? 'Següent Mite' : 'Finalitzar Mites 🏆'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

      {/* GAME 5: EL GRAN CONCURS & DIPLOMA */}
      {activeGame === 'quiz' &&
        (isQuizLocked ? (
          <Game24hCooldownBanner
            title="El Gran Concurs Oficial"
            icon="📜"
            studentName={nom}
            timestamp={quizTs}
            onSwitchMode={(mode) => setActiveGame(mode)}
            availableModes={unlockedModes}
          />
        ) : (
          <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-amber-300 shadow-md space-y-6">
            {!isQuizFinished ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
                        Pregunta {quizIndex + 1} de {QUIZ_QUESTIONS.length}
                      </span>
                      {isCurrentQuizMemorized && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Encertada i memoritzada
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">
                      El Gran Concurs Oficial de la Cobla
                    </h3>
                  </div>

                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5 self-start sm:self-center">
                    {QUIZ_QUESTIONS.map((_, qIdx) => {
                      const isDone = solvedQuiz.includes(qIdx);
                      const isCurrent = quizIndex === qIdx;
                      return (
                        <button
                          key={qIdx}
                          onClick={() => {
                            setQuizIndex(qIdx);
                            setSelectedQuizAnswer(null);
                            setQuizFeedback(null);
                          }}
                          className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition ${
                            isCurrent
                              ? 'ring-2 ring-amber-500 bg-amber-500 text-white'
                              : isDone
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 hover:bg-amber-100'
                          }`}
                          title={`Pregunta ${qIdx + 1}${isDone ? ' (Memoritzada)' : ''}`}
                        >
                          {isDone ? '✓' : qIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Text */}
                <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-amber-950 font-black text-base md:text-lg">
                  {currentQuiz.pregunta}
                </div>

                {/* 4 Multiple choices - Dynamically shuffled order */}
                <div className="space-y-2.5">
                  {shuffledQuizOptions.map((opt, displayIdx) => {
                    const isSelected = selectedQuizAnswer === opt.originalIndex;
                    const isCorrect = opt.isCorrect;
                    const isTriedAndWrong = quizIncorrectPicks.includes(opt.originalIndex);
                    const isSolved = isCurrentQuizMemorized || quizFeedback?.isCorrect;

                    return (
                      <button
                        key={displayIdx}
                        disabled={Boolean(isSolved)}
                        onClick={() => handleAnswerQuiz(opt)}
                        className={`w-full p-4 rounded-2xl font-bold text-sm md:text-base border-2 transition-all flex items-center justify-between text-left ${
                          isSolved && isCorrect
                            ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                            : isSolved && !isCorrect
                            ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                            : isTriedAndWrong
                            ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                            : isSelected && !isCorrect
                            ? 'bg-amber-100 border-amber-400 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/50 active:scale-98'
                        }`}
                      >
                        <span>{opt.text}</span>
                        {isSolved && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                        {isTriedAndWrong && !isSolved && <XCircle className="w-5 h-5 text-rose-500" />}
                      </button>
                    );
                  })}
                </div>

                {/* Memorized Banner if already solved */}
                {isCurrentQuizMemorized && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔒</span>
                      <div>
                        <div className="text-sm">
                          Pregunta contestada correctament i memoritzada!
                        </div>
                        <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                          {currentQuiz.explicacio}
                        </div>
                      </div>
                    </div>

                    {quizIndex < QUIZ_QUESTIONS.length - 1 ? (
                      <button
                        onClick={handleNextQuiz}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
                      >
                        <span>Següent Pregunta</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsQuizFinished(true)}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
                      >
                        <span>Veure Resultats i Diploma! 📜</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Fresh Feedback and Action Buttons */}
                {!isCurrentQuizMemorized && quizFeedback && (
                  <div
                    className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ${
                      quizFeedback.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <div className="font-bold text-sm leading-relaxed">{quizFeedback.msg}</div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!quizFeedback.isCorrect && (
                        <button
                          onClick={handleRetryQuiz}
                          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow flex items-center gap-1.5 transition active:scale-95"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Torna a respondre</span>
                        </button>
                      )}

                      {quizFeedback.isCorrect && (
                        <button
                          onClick={handleNextQuiz}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition"
                        >
                          <span>
                            {quizIndex < QUIZ_QUESTIONS.length - 1 ? 'Següent Pregunta' : 'Veure Resultats i Diploma!'}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
                    Has completat el Gran Concurs Oficial de la Cobla!
                  </p>
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    Ja ets oficialment un <strong>Expert/a de la Cobla Catalana</strong>! El teu progrés ha quedat registrat al panell de la mestra.
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
                </div>
              </div>
            )}
          </div>
        ))}

    </div>
  );
};
