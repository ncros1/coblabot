import { Endevinalla, IntrusGameRound, QuizQuestion } from '../types/cobla';

export const ENDEVINALLES_DATA: Endevinalla[] = [
  {
    id: 1,
    instrumentId: 'tenora-1',
    pistes: [
      'Pista 1: El meu cos és de fusta de ginjoler i al final tinc una campana cònica de metall.',
      'Pista 2: Em va inventar Andreu Toron a Perpinyà el 1849 i Pep Ventura em va portar a la cobla.',
      'Pista 3: Tinc canya doble i tothom em reconeix com "L’instrument rei i solista de la cobla"!',
    ],
    opcions: ['Trompeta', 'Tenora', 'Flabiol', 'Contrabaix'],
    respostaCorrecta: 'Tenora',
    explicacio: 'Molt bé! La Tenora va ser inventada per Andreu Toron el 1849 i Pep Ventura la va fer reina de la cobla!',
  },
  {
    id: 2,
    instrumentId: 'flabiol-tambori',
    pistes: [
      'Pista 1: Mesuro només un pam (uns 20-25 cm) i el meu músic em toca amb una sola mà (l’esquerra).',
      'Pista 2: El meu forat inferior no es tapa amb el tou del dit, sinó amb la part superior del dit petit!',
      'Pista 3: Toco l’Introit inicial i el meu company de coll fa el ritme picant amb una baqueta.',
    ],
    opcions: ['Tible', 'Fiscorn', 'Flabiol i Tamborí', 'Trombó'],
    respostaCorrecta: 'Flabiol i Tamborí',
    explicacio: 'Fantàstic! El flabiol i el tamborí els toca un sol músic: el flabiolaire!',
  },
  {
    id: 3,
    instrumentId: 'contrabaix',
    pistes: [
      'Pista 1: Sóc l’únic instrument de corda de la cobla i toco dret a l’extrem dret de l’escenari.',
      'Pista 2: A la cobla tradicional molts portem només 3 cordes de budell (de tripa) en lloc de 4!',
      'Pista 3: A "Cobla 2.0" toco la melodia del Gegant del Pi (en Mustafà i n’Elisenda)!',
    ],
    opcions: ['Contrabaix', 'Violoncel', 'Fiscorn', 'Trombó'],
    respostaCorrecta: 'Contrabaix',
    explicacio: 'Genial! El Contrabaix o verra és l’únic de corda i marca el ritme greu amb pizzicato!',
  },
  {
    id: 4,
    instrumentId: 'tible-1',
    pistes: [
      'Pista 1: Sóc de la família de les xeremies (oboè, gralla), amb llengüeta doble.',
      'Pista 2: Faig notes molt curtes, picades i agudes que s’han de controlar perquè no sonin estridents.',
      'Pista 3: A "Cobla 2.0" porto la veu principal de la cançó "Tres, sis, nou, tira de la cua de l’esquirol"!',
    ],
    opcions: ['Trompeta', 'Tible', 'Fiscorn', 'Clarinet'],
    respostaCorrecta: 'Tible',
    explicacio: 'Molt bona oïda! El tible té una veu aguda i viva que fa cantar la cançó de l’esquirol!',
  },
  {
    id: 5,
    instrumentId: 'fiscorn-1',
    pistes: [
      'Pista 1: Sóc de vent-metall, però el meu so no és agut sinó rodó, vellutat i càlid.',
      'Pista 2: La meva campana és ampla i mira cap endavant: sóc la "tenora de la fila del darrere"!',
      'Pista 3: A "Cobla 2.0" toco la melodia de "Ploreu, ploreu ninetes, que el ruc està malalt"!',
    ],
    opcions: ['Trombó', 'Fiscorn', 'Flabiol', 'Tenora'],
    respostaCorrecta: 'Fiscorn',
    explicacio: 'Exacte! El fiscorn és un instrument gairebé exclusiu de la cobla amb so molt dolç i expressiu!',
  },
  {
    id: 6,
    instrumentId: 'trombo',
    pistes: [
      'Pista 1: Sóc de vent-metall i m’assec just al centre de la segona fila de la cobla.',
      'Pista 2: Tradicionalment a la cobla sóc de pistons (com una trompeta gran), encara que modernament també de vares.',
      'Pista 3: A "Cobla 2.0" començo tocant suau (piano) la cançó "Plou i fa sol, les bruixes es pentinen"!',
    ],
    opcions: ['Trombó', 'Trompeta', 'Contrabaix', 'Fiscorn'],
    respostaCorrecta: 'Trombó',
    explicacio: 'Bravo! El trombó de pistons fa de pont entre trompetes i fiscorns a la 2a fila!',
  },
];

export const INTRUS_ROUNDS: IntrusGameRound[] = [
  {
    id: 1,
    pregunta: 'Quin d’aquests 4 instruments NO forma part de la cobla tradicional?',
    opcions: [
      { nom: 'Tenora', icona: '🎺', esIntrus: false, motiu: 'La tenora és l’instrument solista rei de la cobla!' },
      { nom: 'Flabiol', icona: '🪈', esIntrus: false, motiu: 'El flabiol toca l’introit a la 1a fila!' },
      { nom: 'Saxòfon', icona: '🎷', esIntrus: true, motiu: 'El saxòfon és típic del jazz o big bands, però no forma part de la plantilla clàssica de la cobla!' },
      { nom: 'Fiscorn', icona: '📯', esIntrus: false, motiu: 'El fiscorn és de vent-metall a la 2a fila!' },
    ],
  },
  {
    id: 2,
    pregunta: 'Atenció! Busca l’instrument intrús entre aquests quatre:',
    opcions: [
      { nom: 'Violí', icona: '🎻', esIntrus: true, motiu: 'El violí no toca a la cobla! L’únic instrument de corda de la cobla és el Contrabaix!' },
      { nom: 'Contrabaix', icona: '🎻', esIntrus: false, motiu: 'El contrabaix és l’únic de corda de la cobla.' },
      { nom: 'Trompeta', icona: '🎺', esIntrus: false, motiu: 'A la cobla hi ha dues trompetes a la 2a fila.' },
      { nom: 'Tible', icona: '🎷', esIntrus: false, motiu: 'El tible és de vent-fusta a la 1a fila.' },
    ],
  },
  {
    id: 3,
    pregunta: 'Quin instrument s’ha colat aquí i no pertany a la cobla tradicional?',
    opcions: [
      { nom: 'Trombó', icona: '📯', esIntrus: false, motiu: 'El trombó se situa al mig de la 2a fila.' },
      { nom: 'Bateria acústica', icona: '🥁', esIntrus: true, motiu: 'A la cobla clàssica no hi ha bateria! L’única percussió és el petit tamborí del flabiolaire.' },
      { nom: 'Tamborí', icona: '🥁', esIntrus: false, motiu: 'El tamborí penja del braç del flabiolaire.' },
      { nom: 'Tenora', icona: '🎺', esIntrus: false, motiu: 'La tenora és imprescindible a la cobla.' },
    ],
  },
  {
    id: 4,
    pregunta: 'Tria l’intrús que no trobaries en una cobla clàssica de sardanes:',
    opcions: [
      { nom: 'Flabiol', icona: '🪈', esIntrus: false, motiu: 'El flabiol és un instrument genuí de cobla.' },
      { nom: 'Flauta travessera', icona: '🪈', esIntrus: true, motiu: 'La flauta travessera s’utilitza a l’orquestra simfònica, no a la cobla!' },
      { nom: 'Tible', icona: '🎷', esIntrus: false, motiu: 'El tible té canya doble i forma part de la fusta.' },
      { nom: 'Fiscorn', icona: '📯', esIntrus: false, motiu: 'El fiscorn és de la família del vent-metall.' },
    ],
  },
  {
    id: 5,
    pregunta: 'Un d’aquests instruments és un convidat modern (Cobla 2.0), no pas de la cobla clàssica:',
    opcions: [
      { nom: 'Piano', icona: '🎹', esIntrus: true, motiu: 'El piano és un instrument afegit en obres modernes com les d’Albert Guinovart, però no pertany a la cobla clàssica d’11 músics!' },
      { nom: 'Tenora', icona: '🎺', esIntrus: false, motiu: 'La tenora és la base solista.' },
      { nom: 'Trompeta', icona: '🎺', esIntrus: false, motiu: 'La trompeta és de vent-metall de la cobla.' },
      { nom: 'Contrabaix', icona: '🎻', esIntrus: false, motiu: 'El contrabaix és l’únic de corda clàssic.' },
    ],
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    pregunta: 'Quants instruments van PER PARELLES a la cobla catalana?',
    opcions: [
      '4 instruments (tibles, tenores, trompetes i fiscorns = 8 músics)',
      'Tots els 12 instruments van per parelles',
      'Només 2 instruments (les tenores i els tibles)',
      'Cap instrument, tots toquen sols',
    ],
    respostaIndex: 0,
    explicacio: 'Segons el dossier del Palau, 4 van per parelles (tible, tenora, trompeta, fiscorn) i 4 van sols (trombó, contrabaix, flabiol i tamborí)!',
  },
  {
    id: 2,
    pregunta: 'Qui va inventar la TENORA l’any 1849 a Perpinyà?',
    opcions: ['Andreu Toron', 'Pep Ventura', 'Eduard Toldrà', 'Enric Morera'],
    respostaIndex: 0,
    explicacio: 'La va inventar Andreu Toron a Perpinyà el 1849 com a oboè tenor, i Pep Ventura la va perfeccionar i incorporar a la cobla!',
  },
  {
    id: 3,
    pregunta: 'Quina particularitat té el forat inferior del flabiol segons el dossier?',
    opcions: [
      'Es tapa amb el colze esquerre',
      'Es tapa amb la part superior del dit petit pressionant cap amunt',
      'No es tapa mai amb cap dit',
      'Es tapa amb una clau de pedal',
    ],
    respostaIndex: 1,
    explicacio: 'És una característica única: s’ha de tapar amb la part superior del dit petit pressionant cap amunt, allà on s’ajunten les dues primeres falanges!',
  },
  {
    id: 4,
    pregunta: 'Quantes tirades té una sardana completa segons el dossier "La Sardana"?',
    opcions: ['10 tirades (curts, llargs, contrapunts i toc final)', '4 tirades', '12 tirades', 'Només 2 tirades'],
    respostaIndex: 0,
    explicacio: 'Una sardana sencera té 10 tirades: dues de curts, dues de llargs, dues de curts, dues de llargs, dos contrapunts de llargs i el toc final!',
  },
  {
    id: 5,
    pregunta: 'Quina famosa sardana d’Enric Morera amb text d’Àngel Guimerà va ser prohibida durant dues dictadures?',
    opcions: ['La Santa Espina', 'El gegant del Pi', 'Tres, sis, nou', 'Paquito el Chocolatero'],
    respostaIndex: 0,
    explicacio: 'La Santa Espina (1907) és la sardana més emblemàtica de Morera, considerada un himne patriòtic i prohibida per Primo de Rivera i Franco.',
  },
  {
    id: 6,
    pregunta: 'Què són les sardanes revesses (o enigmàtiques)?',
    opcions: [
      'Sardanes que es ballen d’esquena a la cobla',
      'Sardanes que amaguen el nombre de compassos per posar a prova els balladors',
      'Sardanes que duren més de dues hores',
      'Sardanes sense instruments',
    ],
    respostaIndex: 1,
    explicacio: 'Les revesses són obres enigmàtiques que repeteixen motius per enganyar els sardanistes i que els costi descobrir el tiratge!',
  },
  {
    id: 7,
    pregunta: 'Què és la "sordina" que utilitzen les trompetes a la cançó "Roda, roda moliner"?',
    opcions: [
      'Una baqueta per picar la campana',
      'Una peça que s’introdueix a la campana per apagar i modificar el so',
      'Una partitura secreta de la cobla',
      'Una cadira especial per al trompetista',
    ],
    respostaIndex: 1,
    explicacio: 'La sordina s’introdueix a la campana dels instruments de metall per fer el so més apagat i misteriós!',
  },
  {
    id: 8,
    pregunta: 'A la cançó del "Gegant del Pi", per on ballava el gegant del Pi i per on el de la Ciutat?',
    opcions: [
      'El del Pi pel camí (lateral sense pavimentar) i el de la Ciutat pel terrat (part enrajolada de la Rambla)',
      'Tots dos ballaven damunt d’un camió',
      'El del Pi pel terrat de la catedral i el de la Ciutat pel mar',
      'Ballaven dins d’un armari',
    ],
    respostaIndex: 0,
    explicacio: 'Per la processó de Corpus, el gegant de la Ciutat ballava pel mig de la Rambla (el terrat enrajolat) i el del Pi pel camí lateral no pavimentat!',
  },
  {
    id: 9,
    pregunta: 'Quin compositor cèlebre era rellotger a Sant Feliu de Guíxols i va escriure la sardana "Juny"?',
    opcions: ['Juli Garreta', 'Pep Ventura', 'Pau Casals', 'Lluís Domènech i Montaner'],
    respostaIndex: 0,
    explicacio: 'Juli Garreta era rellotger d’ofici i músic autodidacte genial de Sant Feliu de Guíxols, gran amic de Pau Casals!',
  },
  {
    id: 10,
    pregunta: 'Quins dos grans estils de ballar sardanes s’expliquen al dossier segons les comarques?',
    opcions: [
      'Estil empordanès i estil selvatà',
      'Estil clàssic i estil modernista',
      'Estil pirinenc i estil mariner',
      'Estil ràpid i estil lent',
    ],
    respostaIndex: 0,
    explicacio: 'Els dos estils més coneguts són l’empordanès (amb el dos parat) i el selvatà (amb els dos tresos)!',
  },
];
