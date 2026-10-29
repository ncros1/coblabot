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
  realAudioSampleUrl?: string; // Ruta al fitxer real MP3 Cobla 2.0 (Cobla Sant Jordi)
  realAudioPreviewUrl?: string; // Ruta al fragment solo de 12s per a previsualització ràpida
  pieceFeatured?: string; // Cançó didàctica que interpreta (ex: "Ton pare no té nas", "El gegant del Pi")
  youtubeId: string;
  youtubeTitle: string;
  youtubeUrl: string;
  youtubeEmbedUrl: string;
}

export interface PalauCoblaRecording {
  id: string;
  titol: string;
  peçaOriginal: string;
  subtitol: string;
  autor?: string;
  instrumentsDestacats: string;
  familia?: InstrumentFamily | 'tots';
  audioUrl: string;
  previewUrl?: string;
  durada: string;
  descripcio: string;
  icona: string;
  cançóInfantilAssociada?: string;
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

export interface CompletedGamesTimestamps {
  endevinalles?: number;
  intrus?: number;
  soMisterios?: number;
  mites?: number;
  quiz?: number;
  puzleEscenari?: number;
}

export interface StudentActivityLog {
  puzleEscenariCompletat: boolean;
  totalEncerts?: number;
  totalErrors?: number;
  endevinallesEncertades: number;
  endevinallesErrors?: number;
  intrusRondesEncertades: number;
  intrusErrors?: number;
  soMisteriosEncertats?: number;
  soMisteriosErrors?: number;
  mitesEncertats?: number;
  mitesErrors?: number;
  quizPuntuacio: number;
  quizErrors?: number;
  quizCompletat: boolean;
  puzleEscenariErrors?: number;
  jocsCompletatsTimestamps?: CompletedGamesTimestamps;
  diplomaObtingut: boolean;
  preguntesXatFetes: number;
  ultimaActivitat: string;
  accionsRecents: { data: string; accio: string; tipus?: 'encert' | 'error' | 'info' }[];
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

export interface MysterySoundQuestion {
  id: number;
  instrumentKey: string;
  titolPista: string;
  pistaText: string;
  opcions: string[];
  respostaCorrecta: string;
  explicacio: string;
}

export interface MythQuestion {
  id: number;
  afirmacio: string;
  esVeritat: boolean;
  explicacio: string;
  dossierRef: string;
  icona: string;
}

