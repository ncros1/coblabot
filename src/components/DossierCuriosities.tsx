import React, { useState } from 'react';
import { coblaAudio } from '../utils/audioEngine';
import {
  BookOpen,
  Sparkles,
  Music,
  Compass,
  Footprints,
  Clock,
  HelpCircle,
  Volume2,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
} from 'lucide-react';

interface CuriosityCard {
  id: string;
  titol: string;
  subtitol: string;
  icona: string;
  color: string;
  resum: string;
  detall: string[];
  anecdotaDossier: string;
  audioAction?: { label: string; instrumentType: string };
}

const CURIOSITATS: CuriosityCard[] = [
  {
    id: 'tirades',
    titol: 'Com es balla una Sardana? Les 10 Tirades',
    subtitol: 'Del dossier "La Sardana - Cicle Superior"',
    icona: '💃🕺',
    color: 'from-amber-500 to-orange-500',
    resum: 'Una sardana completa no és només donar voltes: té exactament 10 tirades estructurades amb matemàtica musical!',
    detall: [
      '1. Introit de flabiol (preludi): el flabiolaire avisa tothom.',
      '2. Dues tirades de Curts (1a i 2a): es comença sempre amb el peu esquerre.',
      '3. Dues tirades de Llargs (3a i 4a): passos més amples i braços amunt.',
      '4. Dues tirades de Curts (5a i 6a): tornem a recollir el ball.',
      '5. Dues tirades de Llargs (7a i 8a): moviment enèrgic.',
      '6. Contrapunt (9a tirada): la dansa es para en sec i el flabiol refila tot sol!',
      '7. Contrapunt final (10a tirada): última tirada de llargs.',
      '8. Cop final: un acord sec i tots els balladors tiren els braços al centre en senyal de comiat!',
    ],
    anecdotaDossier:
      'Per acabar exactament amb la música, els sardanistes "compten i reparteixen" els compassos. El cap de colla fa un crit abans d’acabar: "Dosos!" o "Un tres i contrapunt!"',
    audioAction: { label: 'Sent el toc d’inici (Introit)', instrumentType: 'flabiol' },
  },
  {
    id: 'revesses',
    titol: 'Les Sardanes Revesses: L’Enigma Matemàtic',
    subtitol: 'Del dossier "Cobla 2.0" - Eduard Toldrà',
    icona: '🧩🔍',
    color: 'from-purple-500 to-indigo-600',
    resum: 'Sabies que existeixen concursos per resoldre sardanes enigmàtiques anomenades revesses?',
    detall: [
      'El compositor amaga expressament el nombre de compassos que tenen els curts i els llargs.',
      'Repeteix el mateix tema amb petites variacions perquè els balladors no sàpiguen on són!',
      'Si un músic de la cobla s’equivoca d’una sola nota, pot arruïnar la matemàtica dels competidors!',
      'Eduard Toldrà en va compondre 3: tan bon punt els sardanistes en desxifraven el tiratge, deixaven de ser un misteri!',
    ],
    anecdotaDossier:
      'Al Diccionari de l’IEC, "revessa" vol dir: "allò que és difícil de governar, de resoldre o d’aprendre". Tot un repte de detectius musicals!',
  },
  {
    id: 'toron-tenora',
    titol: 'L’Invent de la Tenora: De Perpinyà a Pep Ventura',
    subtitol: 'Del dossier "Cobla 2.0"',
    icona: '🎺👑',
    color: 'from-amber-600 to-yellow-600',
    resum: 'La tenora no és un instrument antic de fa mil anys: va néixer a Perpinyà l’any 1849!',
    detall: [
      'El lutier Andreu Toron (1815-1886) la va inventar inspirant-se en un oboè tenor per a bandes militars.',
      'Pep Ventura (1817-1875), músic empordanès, la va escoltar i va quedar fascinat pel seu so potent i càlid.',
      'Pep Ventura la va perfeccionar amb fusta de ginjoler i una campana metàl·lica, convertint-la en la veu solista reina de la cobla.',
    ],
    anecdotaDossier:
      'L’arbre del ginjoler (l’arbre que fa els gínjols) triga dècades a créixer. La seva fusta rogenca és tan dura i densa que resisteix perfectament la humitat de la saliva dels músics.',
    audioAction: { label: 'Escolta el solo de Tenora', instrumentType: 'tenora' },
  },
  {
    id: 'flabiol-dit',
    titol: 'El Secret del Dit Petit del Flabiolaire',
    subtitol: 'Del dossier "Cobla 2.0"',
    icona: '🪈☝️',
    color: 'from-emerald-500 to-teal-600',
    resum: 'El flabiol fa només un pam (20-25 cm), però té una tècnica única al món!',
    detall: [
      'Es toca amb els dits d’una sola mà (l’esquerra) mentre la dreta toca el tamborí.',
      'A diferència de totes les flautes del món, el forat de sota no es tapa amb el tou del dit.',
      'S’ha de tapar amb la part superior del dit petit pressionant cap amunt, just on s’ajunten les dues primeres falanges!',
      'A les partitures de sardanes gairebé mai s’escriu el tamborí: el músic improvisa el ritme!',
    ],
    anecdotaDossier:
      'Molts compositors utilitzen el flabiol per imitar el piular dels ocells (com a la sardana "Vora el niu" d’Enric Sans o a "Ocellets enjogassats").',
    audioAction: { label: 'Sent el refilat del Flabiol', instrumentType: 'flabiol' },
  },
  {
    id: 'gegants-pi',
    titol: 'El Gegant del Pi: Pel Terrat o pel Camí?',
    subtitol: 'Del dossier "Cobla 2.0" - Cançons populars',
    icona: '👑🏰',
    color: 'from-sky-500 to-blue-600',
    resum: 'Tots hem cantat "El gegant del Pi ara balla pel camí, el gegant de la Ciutat ara balla pel terrat". Però saps què vol dir?',
    detall: [
      'A Barcelona, per la festa de Corpus, els gegants feien una cercavila per la Rambla.',
      'La part del mig de la Rambla estava enrajolada: la gent l’anomenava "el terrat", i per allà ballava el gegant de la Ciutat!',
      'El lateral de la Rambla era de terra sense pavimentar: l’anomenaven "el camí", i per allà ballava el gegant del Pi!',
      'El gegant del Pi es diu Mustafà (soldat sarraí de 4,40 m) i la geganta Elisenda (donzella cristiana). Tenen més de 400 anys!',
    ],
    anecdotaDossier:
      'Els gegants del Pi van estar 90 anys tancats dins d’un armari (del 1870 al 1960) fins que els van tornar a fer sortir a ballar!',
    audioAction: { label: 'Escolta el Contrabaix al Gegant del Pi', instrumentType: 'contrabaix' },
  },
  {
    id: 'santa-espina',
    titol: 'La Santa Espina: Una Sardana Prohibida',
    subtitol: 'Del dossier "Cobla 2.0" - Enric Morera',
    icona: '🎶🛡️',
    color: 'from-rose-500 to-red-600',
    resum: 'La sardana més coneguda del món va ser perseguida i prohibida per dues dictadures!',
    detall: [
      'Va ser escrita el 1907 per Enric Morera amb lletra del gran dramaturg Àngel Guimerà.',
      'Diu: "Som i serem gent catalana, tant si es vol com si no es vol, que no hi ha terra més ufana sota la capa del sol".',
      'El general Losada la va prohibir l’any 1924 sota amenaça de càstig amb "tot el rigor", i Franco la va tornar a prohibir.',
      'Malgrat tot, la gent la cantava clandestinament i s’ha convertit en un himne d’amor a la terra.',
    ],
    anecdotaDossier:
      'Enric Morera admirava tant la música de Wagner que un dia a Sant Pol de Mar va sentir una banda tocant malament una obra seva... i va tombar els faristols dels músics enrabiat!',
  },
  {
    id: 'garreta',
    titol: 'Juli Garreta: El Rellotger que va Emocionar Pau Casals',
    subtitol: 'Del dossier "La Sardana - Cicle Superior"',
    icona: '🕰️🎻',
    color: 'from-teal-600 to-emerald-700',
    resum: 'Un dels millors compositors de la història de Catalunya no va anar mai al conservatori: era rellotger!',
    detall: [
      'Juli Garreta (1875-1925) va néixer a Sant Feliu de Guíxols. Treballava arreglant rellotges.',
      'Va aprendre música pràcticament sol (autodidacte) i va compondre obres mestres com la sardana "Juny".',
      'Va escriure "Juny" a Romanyà de la Selva inspirat pel treball cansat dels segadors als camps de blat sota el sol de juny.',
      'El gran violoncel·lista Pau Casals deia que Garreta era un dels compositors més genials de tot Europa!',
    ],
    anecdotaDossier:
      'Les sardanes de Garreta tenen un diàleg màgic entre tenora i tible, amb un cànon final on les veus s’entrellacen harmònicament!',
  },
  {
    id: 'estils-sardana',
    titol: 'Els Dos Estils: Empordanès vs Selvatà',
    subtitol: 'Del dossier "La Sardana - Cicle Superior"',
    icona: '⛰️🏖️',
    color: 'from-blue-600 to-indigo-700',
    resum: 'Segons la comarca, la sardana es balla d’una manera diferent!',
    detall: [
      'Estil Empordanès: es balla gairebé a tot Catalunya. Utilitza el "dos parat" en els doblatges.',
      'Estil Selvatà: es balla a La Selva, Gironès i part del Maresme. Utilitza els "dos tresos" i les tirades s’acaben sempre a la dreta!',
      'Hi ha una llegenda que diu que a l’edat mitjana un rei volia triar un sol estil i va convocar un aplec a l’ermita dels Metges (Gavarres)... però mai es van posar d’acord!',
    ],
    anecdotaDossier:
      'Cada colla manté amb orgull el seu estil tradicional, fent que la dansa sigui rica i viva a cada comarca!',
  },
];

export const DossierCuriosities: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('tirades');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-amber-200 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Extret dels Dossiers Educatius
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            📚 Secrets i Curiositats de la Cobla
          </h2>
          <p className="text-slate-600 font-medium text-sm mt-2 leading-relaxed">
            Descobreix les anècdotes històriques, els enigmes musicals i les històries reals contingudes als dossiers educatius del <strong>Palau de la Música Catalana (Cobla 2.0)</strong> i de <strong>La Sardana a l’Escola</strong>!
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CURIOSITATS.map((c) => {
          const isOpen = expandedId === c.id;

          return (
            <div
              key={c.id}
              className={`bg-white rounded-3xl border-3 transition-all overflow-hidden flex flex-col justify-between ${
                isOpen
                  ? 'border-amber-400 shadow-xl'
                  : 'border-slate-200 hover:border-amber-300 shadow-sm'
              }`}
            >
              {/* Card Banner */}
              <div
                onClick={() => toggleExpand(c.id)}
                className="p-6 cursor-pointer select-none bg-gradient-to-r from-slate-50 to-amber-50/40 hover:bg-amber-50/70 transition flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-md border-2 border-slate-100 flex items-center justify-center text-3xl shrink-0">
                    {c.icona}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                      {c.subtitol}
                    </span>
                    <h3 className="text-lg font-black text-slate-800 leading-snug mt-0.5">
                      {c.titol}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {c.resum}
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Collapsible Content */}
              {isOpen && (
                <div className="p-6 pt-2 space-y-4 border-t border-slate-100 animate-fade-in text-xs sm:text-sm">
                  {/* Key points */}
                  <div className="space-y-2">
                    <span className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                      Punts clau per saber-ne més:
                    </span>
                    <ul className="space-y-1.5 text-slate-700 font-medium pl-1">
                      {c.detall.map((punt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold shrink-0">•</span>
                          <span>{punt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Anecdote Box */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200/80 text-amber-950 font-medium leading-relaxed">
                    <strong className="flex items-center gap-1.5 text-amber-900 font-black mb-1">
                      <span>💡 Sabies que...?</span>
                    </strong>
                    {c.anecdotaDossier}
                  </div>

                  {/* Audio preview button if available */}
                  {c.audioAction && (
                    <button
                      onClick={() => coblaAudio.playInstrumentDemo(c.audioAction!.instrumentType)}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
                    >
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      <span>{c.audioAction.label} 🔊</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
