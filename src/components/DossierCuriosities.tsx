import React, { useState, useEffect } from 'react';
import { coblaAudio } from '../utils/audioEngine';
import {
  Sparkles,
  Music,
  Volume2,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Info,
  Disc3,
  Calendar,
  User,
  Radio,
} from 'lucide-react';

export type DossierFilter = 'tots' | 'peces' | 'pep-ventura' | 'cobla2' | 'somsardana';

export interface CuriosityCard {
  id: string;
  categoria: 'pep-ventura' | 'cobla2' | 'somsardana';
  esPecaMusical?: boolean;
  pecaNom?: string;
  compositor?: string;
  any?: string;
  fontOficial: 'extret de Cobla 2.0' | 'extret de Som Sardana' | 'extret de Cobla 2.0 i Som Sardana';
  titol: string;
  subtitol: string;
  icona: string;
  badge: string;
  color: string;
  resum: string;
  detall: string[];
  anecdotaClau: string;
  pieceKey?: 'santa-espina' | 'juny' | 'per-tu-ploro' | 'gegant-pi' | 'roda-moliner' | 'vora-niu' | 'comte-arnau';
  audioAction?: { label: string; instrumentType?: string; pieceKey?: string };
}

const CURIOSITATS: CuriosityCard[] = [
  // --- PECES MUSICALS CONCRETES ---
  {
    id: 'santa-espina-peca',
    categoria: 'cobla2',
    esPecaMusical: true,
    pecaNom: 'La Santa Espina',
    compositor: 'Enric Morera (música) i Àngel Guimerà (lletra)',
    any: '1907',
    fontOficial: 'extret de Cobla 2.0 i Som Sardana',
    titol: 'La Santa Espina: L’Himne Prohibit per Dues Dictadures',
    subtitol: 'extret de Cobla 2.0 i Som Sardana • Enric Morera (1907)',
    icona: '🎶🛡️',
    badge: 'Peça Musical Històrica',
    color: 'from-rose-500 to-red-600',
    resum: 'La sardana més famosa del món prové d’una obra de teatre i va ser perseguida per dues dictadures!',
    detall: [
      'ORIGEN TEATRAL: Va ser composta com a part de l’obra dramàtica "La Santa Espina", estrenada al Teatre Principal de Barcelona el 1907.',
      'SARDANA DEL TERCER ACTE: La peça musical és la sardana que clou el tercer acte, amb la famosa tornada «Som i serem gent catalana...».',
      'PROHIBICIÓ DE 1924: El general Losada la va prohibir expressament durant la dictadura de Primo de Rivera, amenaçant de castigar qui la toqués amb "tot el rigor".',
      'PROHIBICIÓ FRANQUISTA: Durant la dictadura del general Franco va tornar a ser vetada als aplecs i concerts públics.',
      'HIMNE DE LLIBERTAT: Malgrat les prohibicions, el poble la cantava clandestinament i avui és considerada un veritable himne d’amor a la llibertat.',
    ],
    anecdotaClau:
      'Enric Morera admirava tant la música de Wagner que un dia a Sant Pol de Mar va sentir una banda tocant malament la seva obra... i va tombar tots els faristols dels músics enrabiat!',
    pieceKey: 'santa-espina',
    audioAction: { label: '▶ Escolta el tema principal de "La Santa Espina"', pieceKey: 'santa-espina' },
  },
  {
    id: 'juny-peca',
    categoria: 'somsardana',
    esPecaMusical: true,
    pecaNom: 'Juny',
    compositor: 'Juli Garreta',
    any: '1920',
    fontOficial: 'extret de Som Sardana',
    titol: 'Juny: La Sardana Obra Mestra d’un Rellotger Genial',
    subtitol: 'extret de Som Sardana • Juli Garreta (1920)',
    icona: '🌾🕰️',
    badge: 'Peça Musical Emblemàtica',
    color: 'from-amber-500 to-yellow-600',
    resum: 'Juli Garreta no va anar al conservatori, però la seva sardana "Juny" va fascinar els millors músics europeus!',
    detall: [
      'EL RELLOTGER DE SANT FELIU: Juli Garreta (1875-1925) tenia com a ofici reparar rellotges a Sant Feliu de Guíxols. Va aprendre música de manera autodidacte!',
      'INSPIRACIÓ ALS CAMPS DE BLAT: Va compondre "Juny" a Romanyà de la Selva després de veure el treball feixuc i cansat dels segadors als camps de blat sota el sol de juny.',
      'FASCINACIÓ INTERNACIONAL: El 1924, quan el gran compositor rus Ígor Stravinski i Pau Casals la van escoltar a l’Ateneu Barcelonès, van quedar meravellats per la seva riquesa harmònica.',
      'DIÀLEG TIBLE-TENORA: La peça destaca pel virtuós i poètic contrapunt entre el tible i la tenora, que s’entrellacen com dues veus humanes.',
    ],
    anecdotaClau:
      'Pau Casals deia sovint: «Juli Garreta és un dels compositors més genials de tot Europa. Si hagués nascut a Alemanya o a França, el seu nom figuraria al costat de Beethoven i Brahms».',
    pieceKey: 'juny',
    audioAction: { label: '▶ Escolta el diàleg tible-tenora de "Juny"', pieceKey: 'juny' },
  },
  {
    id: 'per-tu-ploro-peca',
    categoria: 'pep-ventura',
    esPecaMusical: true,
    pecaNom: 'Per tu ploro',
    compositor: 'Pep Ventura',
    any: '1872',
    fontOficial: 'extret de Cobla 2.0',
    titol: 'Per tu ploro: La Sardana Més Cèlebre de Pep Ventura',
    subtitol: 'extret de Cobla 2.0 • Pep Ventura (1872)',
    icona: '👑🎻',
    badge: 'Clàssic de Pep Ventura',
    color: 'from-amber-600 to-orange-700',
    resum: 'Composta per Pep Ventura poc abans de morir, és l’exemple sublim de la sardana llarga amb la tenora solista.',
    detall: [
      'LA NOVA SONORITAT: "Per tu ploro" va ser creada per a la nova formació d’11 músics que el mateix Pep Ventura havia consolidat.',
      'LA TENORA COM A VEU PRINCIPAL: Ventura va escriure un solo de tenora de gran expressivitat i sentiment que va emocionar Catalunya sencera.',
      'ADAPTACIÓ LITERÀRIA: Més endavant, el gran poeta català Joan Maragall va escriure el text que s’adaptaria a la seva melodia («Per tu ploro, per tu ploro, reina de les flors...»).',
      'MÉS DE 400 OBRES: Pep Ventura va compondre més de 400 sardanes i peces per a cobla, consolidant el gènere com a art noble.',
    ],
    anecdotaClau:
      'Pep Ventura dirigia la seva cobla tocant ell mateix el flabiol i marcant el compàs. Quan s’acostava el solo de tenora, feia silenci a tota la cobla per deixar cantar la fusta de ginjoler!',
    pieceKey: 'per-tu-ploro',
    audioAction: { label: '▶ Escolta el solo de tenora de "Per tu ploro"', pieceKey: 'per-tu-ploro' },
  },
  {
    id: 'gegant-pi-peca',
    categoria: 'cobla2',
    esPecaMusical: true,
    pecaNom: 'El Gegant del Pi',
    compositor: 'Cançó popular catalana tradicional',
    fontOficial: 'extret de Cobla 2.0',
    titol: 'El Gegant del Pi: Pel Terrat o pel Camí?',
    subtitol: 'extret de Cobla 2.0 • Cançó popular arranjada per a cobla',
    icona: '🏰🚶‍♂️',
    badge: 'Cançó Tradicional & Contrabaix',
    color: 'from-sky-500 to-blue-600',
    resum: 'Tots hem cantat «El gegant del Pi balla pel camí, el gegant de la Ciutat balla pel terrat», però saps què significa?',
    detall: [
      'EL TERRAT I EL CAMÍ: Per la festivitat de Corpus a Barcelona, la part central de la Rambla estava enrajolada i la gent l’anomenava "el terrat" (per on ballava el gegant de la Ciutat).',
      'EL CAMÍ SENSE PAVIMENTAR: Els laterals de la Rambla eren de terra i s’anomenaven "el camí": per allà feien passar el gegant del Pi!',
      'EL SOLO DE CONTRABAIX: En l’arranjament per a cobla de Cobla 2.0, el contrabaix fa un solo amb passes feixugues i greus que imiten les trepitjades del gegant Mustafà (4,40 metres d’alçada)!',
      'FIGURA CENTENÀRIA: Els gegants del Pi (Mustafà i Elisenda) tenen més de 400 anys d’història documentada.',
    ],
    anecdotaClau:
      'Els gegants del Pi van estar 90 anys tancats dins d’un armari de la parròquia (del 1870 al 1960) fins que els van recuperar per tornar a omplir els carrers de festa!',
    pieceKey: 'gegant-pi',
    audioAction: { label: '▶ Escolta el contrabaix i cobla d’"El Gegant del Pi"', pieceKey: 'gegant-pi' },
  },
  {
    id: 'roda-moliner-peca',
    categoria: 'cobla2',
    esPecaMusical: true,
    pecaNom: 'Roda, roda moliner',
    compositor: 'Cançó tradicional popular catalana',
    fontOficial: 'extret de Cobla 2.0',
    titol: 'Roda, roda moliner: El Truc de la Sordina a les Trompetes',
    subtitol: 'extret de Cobla 2.0 • Cançó tradicional',
    icona: '🔇🎺',
    badge: 'Efecte Acústic',
    color: 'from-amber-600 to-yellow-700',
    resum: 'Com aconsegueixen les trompetes i fiscorns un so apagat i misteriós com d’aigua llunyana?',
    detall: [
      'L’ACCESSORI DE LA SORDINA: Els músics de vent-metall col·loquen un con anomenat sordina a la campana del seu instrument.',
      'IMITAR EL MOLÍ D’AIGUA: A "Roda, roda moliner", la sordina s’empra per recrear acústicament el murmuri de l’aigua remota d’un molí.',
      'CANVI DE VOLUM SORPRENENT: Quan els trompetistes retiren la sordina de cop, el so s’obre amb tota la brillantor i produeix una gran sorpresa a l’oient!',
      'PENJADES AL FARISTOL: Els músics porten les sordines lligades al faristol per canviar de timbre en menys d’un segon.',
    ],
    anecdotaClau:
      'Els compositors moderns de cobla fan servir sordines rectes, de copa o fins i tot sordines "wah-wah" per aconseguir efectes cinematogràfics únics!',
    pieceKey: 'roda-moliner',
    audioAction: { label: '▶ Escolta les trompetes amb sordina de "Roda moliner"', pieceKey: 'roda-moliner' },
  },
  {
    id: 'vora-niu-peca',
    categoria: 'cobla2',
    esPecaMusical: true,
    pecaNom: 'Vora el niu',
    compositor: 'Enric Sans',
    fontOficial: 'extret de Cobla 2.0',
    titol: 'Vora el niu: El Refilat d’Ocells al Flabiol',
    subtitol: 'extret de Cobla 2.0 • Enric Sans',
    icona: '🪈🐦',
    badge: 'Lluïment de Flabiol',
    color: 'from-emerald-600 to-teal-700',
    resum: 'Una peça de gran virtuosisme on el flabiolaire imita el cant dels ocells silvestres del bosc!',
    detall: [
      'IMITACIÓ DE LA NATURA: "Vora el niu" d’Enric Sans és una de les sardanes de lluïment de flabiol més celebrades del repertori.',
      'REFILATS D’ALTA VELOCITAT: El músic toca amb la mà esquerra a una velocitat prodigiosa, fent refilades agudes que semblen cants de caderneres i rossinyols.',
      'ACOMPANYAMENT DE TAMBORÍ: Amb la mà dreta manté el compàs ferm amb la baqueta sobre la pell del tamborí.',
    ],
    anecdotaClau:
      'En molts aplecs de muntanya, els ocells reals dels arbres responen als refilats del flabiolaire quan toca sardanes com "Vora el niu"!',
    pieceKey: 'vora-niu',
    audioAction: { label: '▶ Escolta el refilat d’ocells de "Vora el niu"', pieceKey: 'vora-niu' },
  },
  {
    id: 'revesses-peca',
    categoria: 'cobla2',
    esPecaMusical: true,
    pecaNom: 'Sardanes Revesses (Ex: Eduard Toldrà)',
    compositor: 'Eduard Toldrà i altres mestres',
    fontOficial: 'extret de Cobla 2.0',
    titol: 'Les Sardanes Revesses: L’Enigma Matemàtic dels Concursos',
    subtitol: 'extret de Cobla 2.0 • Eduard Toldrà',
    icona: '🧩🔍',
    badge: 'Enigma i Matemàtica',
    color: 'from-purple-500 to-indigo-600',
    resum: 'Sardanes amb tiratges secrets creades com a repte per posar a prova l’oïda dels millors balladors!',
    detall: [
      'ENGANY MUSICAL CONSCIENT: El compositor amaga expressament el nombre de compassos dels curts i dels llargs, repetint motius melòdics per despistar.',
      'CONCURSOS DE REVESSES: Els sardanistes participen en concursos on han de desxifrar el tiratge escoltant atentament la cobla a la primera tirada.',
      'EDUARD TOLDRÀ: El cèlebre compositor Eduard Toldrà en va escriure tres de famoses; un cop desxifrades, perdien el misteri de concurs!',
    ],
    anecdotaClau:
      'Al Diccionari de l’Institut d’Estudis Catalans, "revessa" significa «allò que és difícil de governar, de resoldre o d’aprendre». Un enigma de detectius!',
    pieceKey: 'comte-arnau',
    audioAction: { label: '▶ Escolta el caràcter dramàtic d’Eduard Toldrà', pieceKey: 'comte-arnau' },
  },

  // --- ANÈCDOTES I FONAMENTS HISTÒRICS OFICIALS ---
  {
    id: 'pep-ventura-veritat',
    categoria: 'pep-ventura',
    fontOficial: 'extret de Cobla 2.0 i Som Sardana',
    titol: 'Pep Ventura: La Veritat Històrica Sense Errors',
    subtitol: 'Josep Maria Ventura i Casas (1817-1875)',
    icona: '👑',
    badge: 'Història & Rigor Escolar',
    color: 'from-amber-600 to-yellow-600',
    resum: 'Atenció a l’error típic dels exàmens: Pep Ventura NO va inventar la tenora! Descobreix què va fer realment!',
    detall: [
      'QUI VA INVENTAR LA TENORA?: El lutier Andreu Toron a Perpinyà l’any 1849, adaptant un oboè tenor amb claus metàl·liques, fusta de ginjoler i pavelló de llautó.',
      'QUÈ VA FER PEP VENTURA?: En sentir la tenora a Figueres, va quedar meravellat pel seu so noble i potent. La va incorporar a la seva cobla i la va coronar com a instrument rei i solista indiscutible!',
      'LA COBLA D’11 MÚSICS: Abans de Pep Ventura només hi havia la "cobla de tres quartans" (flabiol, sac de gemecs i tarota). Pep Ventura va estructurar la cobla moderna d’11 músics i 12 instruments dividits en dues files.',
      'LA SARDANA LLARGA: Les sardanes antigues eren curtes i monòtones. Pep Ventura va crear la "sardana llarga", ampliant el nombre de compassos per donar llibertat creativa.',
      'QUIN INSTRUMENT TOCAVA ELL?: Tocava el flabiol i dirigia la cobla de Figueres. Va escriure més de 400 peces, inclosa "Per tu ploro".',
    ],
    anecdotaClau:
      'Pep Ventura va néixer a Alcalá la Real (Jaén) perquè el seu pare, un militar empordanès de Roses, estava destinat allà. Als dos anys la família va retornar a Figueres, on va viure i crear el gran so català!',
    pieceKey: 'per-tu-ploro',
    audioAction: { label: '▶ Escolta el so de tenora de Pep Ventura', instrumentType: 'tenora' },
  },
  {
    id: 'andreu-toron',
    categoria: 'pep-ventura',
    fontOficial: 'extret de Cobla 2.0',
    titol: 'Andreu Toron: El Lutier de Perpinyà que va Crear la Tenora',
    subtitol: 'extret de Cobla 2.0 • Palau de la Música Catalana',
    icona: '🛠️🎷',
    badge: 'El Lutier Creador',
    color: 'from-orange-500 to-amber-600',
    resum: 'La tenora és un invent del segle XIX (1849) construït per un mestre artesà de la Catalunya Nord.',
    detall: [
      'Andreu Toron (1815-1886) era un fabricant d’instruments de vent establert a Perpinyà.',
      'Buscava un instrument potent de fusta que sonés a l’aire lliure com els metalls militars, però amb la dolçor expressiva de la canya doble.',
      'Va perfeccionar la vella tarota afegint-hi un mecanisme complet de claus metàl·liques i un pavelló cònic de llautó.',
      'Va triar la fusta de ginjoler per la seva extraordinària densitat, duresa i resistència als canvis de temperatura i humitat.',
    ],
    anecdotaClau:
      'L’any 1849, Andreu Toron va presentar la seva nova tenora a Perpinyà. Quan Pep Ventura va travessar la frontera i la va provar, va exclamar que era la veu que sempre havia somiat!',
    audioAction: { label: '▶ Sent el timbre de canya doble de la Tenora', instrumentType: 'tenora' },
  },
  {
    id: 'tirades-10',
    categoria: 'somsardana',
    fontOficial: 'extret de Som Sardana',
    titol: 'Com es balla una Sardana? L’Estructura de les 10 Tirades',
    subtitol: 'extret de Som Sardana • La Sardana a l’Escola',
    icona: '💃🕺',
    badge: 'Dansa & Matemàtica',
    color: 'from-amber-500 to-orange-500',
    resum: 'Una sardana completa té exactament 10 tirades estructurades amb rigor matemàtic!',
    detall: [
      '1. Introit de flabiol: preludi solista per avisar els balladors que comença la dansa.',
      '2. Dues tirades de Curts (1a i 2a): passos suaus mirant al centre, començant sempre amb el peu esquerre.',
      '3. Dues tirades de Llargs (3a i 4a): passos amples, moguts i amb els braços enlaire!',
      '4. Dues tirades de Curts (5a i 6a): tornem a recollir el ball i a agafar aire.',
      '5. Dues tirades de Llargs (7a i 8a): moviment enèrgic i expressiu.',
      '6. Contrapunt (9a tirada): la cobla para en sec i el flabiol refila tot sol!',
      '7. Contrapunt final (10a tirada): última tirada de llargs per preparar el comiat.',
      '8. Cop final: un acord sec i tots els balladors llancen els braços al centre!',
    ],
    anecdotaClau:
      'Per acabar al compàs exacte de la música, els sardanistes "compten i reparteixen". El cap de colla avisa abans d’acabar: «Dosos!» o «Un tres i contrapunt!».',
    audioAction: { label: '▶ Sent el toc d’inici (Introit de flabiol)', instrumentType: 'flabiol' },
  },
  {
    id: 'comptar-repartir',
    categoria: 'somsardana',
    fontOficial: 'extret de Som Sardana',
    titol: 'Comptar i Repartir: L’Aritmètica Secreta dels Sardanistes',
    subtitol: 'extret de Som Sardana • Educació Musical',
    icona: '🔢🧠',
    badge: 'Aritmètica al Ball',
    color: 'from-emerald-600 to-teal-700',
    resum: 'Com saben els balladors quan s’acaba la sardana per no quedar amb el peu canviat?',
    detall: [
      'Cada compositor decideix lliurement quants compassos tenen els seus curts i llargs (ex: 24 curts i 68 llargs).',
      'Mentre ballen la primera tirada, els sardanistes compten mentalment els compassos sense fallar.',
      'Després fan una operació matemàtica ("repartir"): divideixen els compassos per saber quan fer els passos de canvi (tresos i dosos).',
      'Si compten malament, faran el cop sec amb el peu canviat o a destemps!',
    ],
    anecdotaClau:
      'A les colles sardanistes de competició, el "repartidor" és el membre més respectat: és el calculador matemàtic que guia tota la rotllana!',
  },
  {
    id: 'dos-estils',
    categoria: 'somsardana',
    fontOficial: 'extret de Som Sardana',
    titol: 'Els Dos Estils Tradicionals: Empordanès vs Selvatà',
    subtitol: 'extret de Som Sardana • Tradició Comarcal',
    icona: '⛰️🌊',
    badge: 'Tradició Comarcal',
    color: 'from-blue-600 to-indigo-700',
    resum: 'Segons la comarca de Catalunya, la sardana es balla amb passos diferents!',
    detall: [
      'Estil Empordanès: el més estès arreu de Catalunya. Empra el "dos parat" en els doblatges dels curts.',
      'Estil Selvatà: tradicional a La Selva, el Gironès i part del Maresme. Empra els "dos tresos" i les tirades acaben cap a la dreta!',
      'Convivència armònica: a les places i festes majors, tothom balla junts respectant la variant de cada poble.',
    ],
    anecdotaClau:
      'Diu una llegenda que a l’edat mitjana es va convocar un aplec a l’ermita dels Metges per triar un sol estil... però ningú va voler renunciar al seu i es van mantenir tots dos!',
  },
  {
    id: 'flabiol-dit',
    categoria: 'cobla2',
    fontOficial: 'extret de Cobla 2.0',
    titol: 'El Secret del Dit Petit del Flabiolaire',
    subtitol: 'extret de Cobla 2.0 • Palau de la Música Catalana',
    icona: '🪈☝️',
    badge: 'Tècnica Instrumental Única',
    color: 'from-emerald-500 to-teal-600',
    resum: 'El flabiol fa només uns 20 cm, però té una tècnica digital única al món!',
    detall: [
      'Es toca amb els dits d’una sola mà (l’esquerra) mentre la mà dreta pica el tamborí amb la baqueta.',
      'A diferència de totes les flautes dolces, el forat inferior NO es tapa amb el tou del polze.',
      'Es tapa amb la part superior del dit petit pressionant cap amunt, just on s’ajunten les dues primeres falanges!',
      'El ritme del tamborí no se sol escriure a la partitura: el flabiolaire l’improvisa seguint la dansa!',
    ],
    anecdotaClau:
      'Els flabiolaires tradicionals començaven a tocar de molt petits per estirar la flexibilitat del dit petit de la mà esquerra!',
    audioAction: { label: '▶ Sent el refilat del Flabiol', instrumentType: 'flabiol' },
  },
];

interface Props {
  onAddPoints?: (points: number, actionDesc?: string) => void;
}

export const DossierCuriosities: React.FC<Props> = ({ onAddPoints }) => {
  const [selectedFilter, setSelectedFilter] = useState<DossierFilter>('tots');
  const [expandedId, setExpandedId] = useState<string | null>('santa-espina-peca');
  const [quizAnswered, setQuizAnswered] = useState<{ [key: string]: boolean }>({});
  const [currentlyPlayingPiece, setCurrentlyPlayingPiece] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const unsub = coblaAudio.subscribeRealAudioState((state) => {
      if (!state.isPlaying) {
        setCurrentlyPlayingPiece(null);
      }
    });
    return () => {
      unsub();
      coblaAudio.stopAll();
    };
  }, []);

  const handlePlayAudio = (action: CuriosityCard['audioAction']) => {
    if (!action) return;
    const targetKey = action.pieceKey || action.instrumentType;
    if (!targetKey) return;

    if (currentlyPlayingPiece === targetKey) {
      coblaAudio.stopAll();
      setCurrentlyPlayingPiece(null);
      return;
    }

    setCurrentlyPlayingPiece(targetKey);
    if (action.pieceKey) {
      coblaAudio.playSpecificPiece(action.pieceKey);
    } else if (action.instrumentType) {
      coblaAudio.playInstrumentDemo(action.instrumentType);
    }
  };

  const filteredCuriositats = CURIOSITATS.filter((c) => {
    if (selectedFilter === 'tots') return true;
    if (selectedFilter === 'peces') return c.esPecaMusical === true;
    if (selectedFilter === 'pep-ventura') return c.categoria === 'pep-ventura';
    if (selectedFilter === 'cobla2') return c.fontOficial.includes('Cobla 2.0');
    if (selectedFilter === 'somsardana') return c.fontOficial.includes('Som Sardana');
    return true;
  });

  const handleMiniQuiz = (key: string, isCorrect: boolean) => {
    if (quizAnswered[key] !== undefined) return;
    setQuizAnswered((prev) => ({ ...prev, [key]: isCorrect }));

    if (isCorrect) {
      coblaAudio.playSuccessSound();
      if (onAddPoints) {
        onAddPoints(15, 'Ha encertat la pregunta oficial de Cobla 2.0 / Som Sardana!');
      }
    } else {
      coblaAudio.playTryAgainSound();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16 px-1 sm:px-0">
      
      {/* Header Banner - Responsive for Mobiles, Tablets & Desktop */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border-3 border-amber-200 shadow-md">
        <div className="max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              extret de Cobla 2.0
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              extret de Som Sardana
            </span>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-400">
              Palau de la Música Catalana & Federació Sardanista
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
            🎼 Peces Musicals Concretes & Secrets Culturals
          </h2>
          <p className="text-slate-600 font-medium text-xs sm:text-sm md:text-base leading-relaxed">
            Aquí trobaràs tota la informació de les peces musicals de la cobla (<em>La Santa Espina</em>, <em>Juny</em>, <em>Per tu ploro</em>, <em>El Gegant del Pi</em>, <em>Roda moliner</em>, <em>Vora el niu</em>) i la veritat històrica sobre Pep Ventura i Andreu Toron, <strong>extret directament de Cobla 2.0 i de Som Sardana</strong> per a primària, tauletes i mòbils.
          </p>
        </div>
      </div>

      {/* 👑 SPECIAL SPOTLIGHT BANNER: PEP VENTURA SENSE ERRORS */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl p-5 sm:p-7 md:p-8 shadow-xl border-3 border-amber-300/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-amber-400/40">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0">
              👑
            </div>
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-yellow-400 text-amber-950 font-black text-[10px] sm:text-[11px] uppercase tracking-wider mb-1">
                Aclariment Clau • extret de Cobla 2.0
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Pep Ventura i la Tenora: Evita l'Error Històric!
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedFilter('pep-ventura');
              setExpandedId('pep-ventura-veritat');
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white text-amber-900 font-black text-xs shadow-md hover:bg-yellow-50 active:scale-95 transition text-center shrink-0 min-h-[44px] flex items-center justify-center"
          >
            Veure Comparativa Detallada 🔍
          </button>
        </div>

        {/* Side-by-side Truth vs Myth Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-5">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 space-y-2">
            <div className="flex items-center gap-2 text-rose-200 font-black text-xs sm:text-sm">
              <span className="px-2 py-0.5 rounded-lg bg-rose-500/80 text-white font-black text-[11px]">MITE COMÚ</span>
              <span>L’ERROR HABITUAL:</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed">
              «Pep Ventura va inventar la Tenora al seu taller de Figueres amb fusta de ginjoler.»
            </p>
            <div className="p-2 rounded-xl bg-black/25 text-[11px] text-amber-200 font-semibold">
              ⚠️ Molts exàmens fallen aquí! Pep Ventura la va fer reina, però no la va inventar ell.
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border-2 border-yellow-300/60 space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-yellow-300 font-black text-xs sm:text-sm">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-white font-black text-[11px]">VERITAT</span>
              <span>LA REALITAT HISTÒRICA:</span>
            </div>
            <p className="text-xs sm:text-sm text-white font-bold leading-relaxed">
              La tenora la va inventar el lutier <strong>Andreu Toron a Perpinyà (1849)</strong>. Pep Ventura la va descobrir, la va portar a la cobla, la va coronar reina solista, <strong>va crear la cobla moderna d’11 músics</strong> i <strong>va inventar la sardana llarga</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Responsive Touch-Friendly Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar touch-pan-x">
        <button
          onClick={() => setSelectedFilter('tots')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 shrink-0 min-h-[44px] ${
            selectedFilter === 'tots'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
          }`}
        >
          <span>🌟 Tot ({CURIOSITATS.length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('peces')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 shrink-0 min-h-[44px] ${
            selectedFilter === 'peces'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <span>🎵 Peces Musicals Concretes</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-900 font-extrabold">
            7
          </span>
        </button>

        <button
          onClick={() => setSelectedFilter('pep-ventura')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 shrink-0 min-h-[44px] ${
            selectedFilter === 'pep-ventura'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
          }`}
        >
          <span>👑 Pep Ventura & Toron</span>
        </button>

        <button
          onClick={() => setSelectedFilter('cobla2')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 shrink-0 min-h-[44px] ${
            selectedFilter === 'cobla2'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
          }`}
        >
          <span>🎼 Extret de Cobla 2.0</span>
        </button>

        <button
          onClick={() => setSelectedFilter('somsardana')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 shrink-0 min-h-[44px] ${
            selectedFilter === 'somsardana'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
          }`}
        >
          <span>💃 Extret de Som Sardana</span>
        </button>
      </div>

      {/* Cards Grid - Responsive 1 col on mobile, 2 cols on tablet & desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredCuriositats.map((c) => {
          const isOpen = expandedId === c.id;
          const isPlayingThis = currentlyPlayingPiece === c.pieceKey;

          return (
            <div
              key={c.id}
              className={`bg-white rounded-3xl border-3 transition-all overflow-hidden flex flex-col justify-between ${
                isOpen
                  ? 'border-amber-400 shadow-lg'
                  : 'border-slate-200 hover:border-amber-300 shadow-sm'
              }`}
            >
              {/* Card Banner / Tap Area */}
              <div
                onClick={() => toggleExpand(c.id)}
                className="p-4 sm:p-6 cursor-pointer select-none bg-gradient-to-r from-slate-50 to-amber-50/40 hover:bg-amber-50/70 transition flex items-start justify-between gap-3 min-h-[70px]"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-md border-2 border-slate-100 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
                    {c.icona}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 uppercase tracking-wider">
                        {c.badge}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {c.fontOficial}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-800 leading-snug">
                      {c.titol}
                    </h3>

                    {c.esPecaMusical && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-rose-700 font-extrabold">
                        <Music className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{c.compositor} {c.any ? `(${c.any})` : ''}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
                      {c.resum}
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Collapsible Content */}
              {isOpen && (
                <div className="p-4 sm:p-6 pt-2 space-y-4 border-t border-slate-100 animate-fade-in text-xs sm:text-sm">
                  
                  {/* Detailed points */}
                  <div className="space-y-2">
                    <span className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-600" />
                      Coneixements clau ({c.fontOficial}):
                    </span>
                    <ul className="space-y-2 text-slate-700 font-medium pl-1">
                      {c.detall.map((punt, idx) => {
                        const parts = punt.split(':');
                        const hasPrefix = parts.length > 1;
                        return (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                            <div>
                              {hasPrefix ? (
                                <>
                                  <strong className="text-slate-900 font-extrabold">{parts[0]}:</strong>
                                  <span>{parts.slice(1).join(':')}</span>
                                </>
                              ) : (
                                <span>{punt}</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Anecdote Box */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-amber-950 font-medium leading-relaxed">
                    <strong className="flex items-center gap-1.5 text-amber-900 font-black mb-1 text-xs sm:text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>💡 Sabies que...? ({c.fontOficial})</span>
                    </strong>
                    <p className="text-xs sm:text-sm">{c.anecdotaClau}</p>
                  </div>

                  {/* Audio preview button if available */}
                  {c.audioAction && (
                    <button
                      onClick={() => handlePlayAudio(c.audioAction)}
                      className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition min-h-[44px] ${
                        isPlayingThis
                          ? 'bg-rose-500 text-white ring-4 ring-rose-200 animate-pulse'
                          : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-sky-200'
                      }`}
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingThis ? 'animate-bounce' : ''}`} />
                      <span>{isPlayingThis ? '⏹️ Aturar reproducció real' : `🎧 ${c.audioAction.label} (Cobla 2.0)`}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Interactive Mini-Quiz (Optimized for Mobile/Tablet) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border-3 border-amber-300 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl sm:text-3xl">📝</span>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800">
              Comprova el que has après de Cobla 2.0 i Som Sardana!
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Respon tocant les opcions per sumar punts al teu Carnet de Músic:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Question 1 */}
          <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/60 space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-800 block">
              1. Qui va ser el lutier i creador de la tenora l'any 1849 segons Cobla 2.0?
            </span>
            <div className="flex gap-2">
              <button
                disabled={quizAnswered['q1'] !== undefined}
                onClick={() => handleMiniQuiz('q1', true)}
                className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition min-h-[44px] flex items-center justify-center ${
                  quizAnswered['q1'] === true
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white hover:bg-amber-100 border border-slate-300 text-slate-700'
                }`}
              >
                Andreu Toron
              </button>
              <button
                disabled={quizAnswered['q1'] !== undefined}
                onClick={() => handleMiniQuiz('q1', false)}
                className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition min-h-[44px] flex items-center justify-center ${
                  quizAnswered['q1'] === false
                    ? 'bg-rose-500 text-white'
                    : 'bg-white hover:bg-amber-100 border border-slate-300 text-slate-700'
                }`}
              >
                Pep Ventura
              </button>
            </div>
            {quizAnswered['q1'] === true && (
              <p className="text-xs text-emerald-700 font-extrabold animate-fade-in">
                🎉 Correcte! Pep Ventura la va incorporar i coronar reina de la cobla, però el lutier creador va ser Andreu Toron a Perpinyà! (+15 pts)
              </p>
            )}
            {quizAnswered['q1'] === false && (
              <p className="text-xs text-rose-700 font-extrabold animate-fade-in">
                Atenció! Pep Ventura va estructurar la cobla d’11 músics, però qui va construir i inventar la tenora va ser el lutier Andreu Toron a Perpinyà!
              </p>
            )}
          </div>

          {/* Question 2 */}
          <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/60 space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-800 block">
              2. Quantes tirades té una sardana completa segons Som Sardana?
            </span>
            <div className="flex gap-2">
              <button
                disabled={quizAnswered['q2'] !== undefined}
                onClick={() => handleMiniQuiz('q2', true)}
                className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition min-h-[44px] flex items-center justify-center ${
                  quizAnswered['q2'] === true
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white hover:bg-amber-100 border border-slate-300 text-slate-700'
                }`}
              >
                10 tirades
              </button>
              <button
                disabled={quizAnswered['q2'] !== undefined}
                onClick={() => handleMiniQuiz('q2', false)}
                className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition min-h-[44px] flex items-center justify-center ${
                  quizAnswered['q2'] === false
                    ? 'bg-rose-500 text-white'
                    : 'bg-white hover:bg-amber-100 border border-slate-300 text-slate-700'
                }`}
              >
                4 tirades
              </button>
            </div>
            {quizAnswered['q2'] === true && (
              <p className="text-xs text-emerald-700 font-extrabold animate-fade-in">
                🎉 Exacte! Té 10 tirades (curts, llargs, curts, llargs, contrapunts i cop final)! (+15 pts)
              </p>
            )}
            {quizAnswered['q2'] === false && (
              <p className="text-xs text-rose-700 font-extrabold animate-fade-in">
                Gairebé! Una sardana completa té exactament 10 tirades estructurades amb rigor matemàtic.
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
