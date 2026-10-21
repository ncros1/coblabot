export type InstrumentFamily = 'vent-fusta' | 'vent-metall' | 'corda' | 'percussio';

export interface InstrumentInfo {
  id: string;
  nom: string;
  nomComplet: string;
  familia: InstrumentFamily;
  quantitat: number; // Quantitat habitual a la cobla
  fila: 1 | 2; // 1 = Davant (fusta), 2 = Darrere (metall/corda)
  posicio: number; // 1 to 5 (or 6) d'esquerra a dreta
  icona: string;
  descripcioCurta: string;
  comEsToca: string;
  dadaCuriosa: string;
  material: string;
  timbres: string; // Adjectius del so
  soAgutOGreu: 'Molt agut' | 'Agut' | 'Mig' | 'Greu' | 'Molt greu';
  audioUrl: string; // URL per a l'element <audio controls src="...">
  freqBase: number; // Per al sintetitzador Web Audio
  synthType: 'flabiol' | 'tambori' | 'tible' | 'tenora' | 'trompeta' | 'trombo' | 'fiscorn' | 'contrabaix';
  youtubeId: string;
  youtubeTitle: string;
  youtubeUrl: string;
  youtubeEmbedUrl: string;
}

export interface CoblaYouTubeTrack {
  id: string;
  nom: string;
  youtubeId: string;
  durada: string;
  descripcio: string;
  icona: string;
  familia?: InstrumentFamily;
}

export interface StageSeat {
  id: string;
  instrumentId: string;
  nom: string;
  fila: 1 | 2;
  posicio: number;
  label: string;
  icona: string;
  color: string;
  familia: InstrumentFamily;
}

export interface StudentActivityLog {
  puzleEscenariCompletat: boolean;
  endevinallesEncertades: number;
  intrusRondesEncertades: number;
  quizPuntuacio: number;
  quizCompletat: boolean;
  diplomaObtingut: boolean;
  preguntesXatFetes: number;
  ultimaActivitat: string;
  accionsRecents: { data: string; accio: string }[];
}

export interface StudentProfile {
  id: string;
  nom: string;
  avatar: string;
  instrumentPreferit?: string;
  punts: number;
  estrelles: number;
  activitat: StudentActivityLog;
  diplomaObtingut: boolean;
  puntuacioQuizMax: number;
  dataRegistre: string;
}

export interface Endevinalla {
  id: number;
  instrumentId: string;
  pistes: [string, string, string];
  opcions: string[];
  respostaCorrecta: string;
  explicacio: string;
}

export interface IntrusGameRound {
  id: number;
  pregunta: string;
  opcions: {
    nom: string;
    icona: string;
    esIntrus: boolean;
    motiu: string;
  }[];
}

export interface QuizQuestion {
  id: number;
  pregunta: string;
  opcions: string[];
  respostaIndex: number;
  explicacio: string;
}
