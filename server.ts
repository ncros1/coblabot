import http from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI if a valid API key exists
const isValidKey = Boolean(
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
  process.env.GEMINI_API_KEY.trim() !== ''
);

const ai = isValidKey
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Verified Knowledge Base Extracted Exclusively from Cobla 2.0 and Som Sardana
function generateCoblaBotFallback(question: string, studentName?: string): string {
  const q = question.toLowerCase();
  const nom = studentName || 'Músic';

  // 1. Número de músics i instruments (Cobla 2.0 & Som Sardana)
  if (
    ((q.includes('quant') || q.includes('número')) &&
      (q.includes('músic') || q.includes('instrument') || q.includes('fila') || q.includes('person') || q.includes('toc'))) ||
    q.includes('11 músic') ||
    q.includes('12 instrument')
  ) {
    return `Hola, ${nom}! 🎶\n\nA la cobla hi ha exactament **11 músics**, però toquen **12 instruments**!\n\nCom pot ser? Molt fàcil: el **flabiolaire** és com un mag musical! Amb la mà esquerra toca el **flabiol** i amb la mà dreta pica el **tamborí** alhora! 🥁🪈`;
  }

  // 2. Pep Ventura & Andreu Toron (Cobla 2.0)
  if (q.includes('pep') || q.includes('ventura') || q.includes('toron') || q.includes('invent') || q.includes('inventar') || q.includes('qui va inventar')) {
    return `Molt important per a l'escola, ${nom}! 👑\n\n• **Qui va inventar la Tenora?** El lutier **Andreu Toron** l'any 1849 a Perpinyà! Ell la va construir amb fusta de ginjoler i claus metàl·liques.\n• **Què va fer en Pep Ventura?** En Pep Ventura NO la va inventar! Ell la va descobrir, la va portar a la cobla, la va coronar reina i va inventar la **sardana llarga** i la cobla d'11 músics!`;
  }

  // 3. Tenora (Cobla 2.0)
  if (q.includes('rei') || q.includes('tenora')) {
    return `L'instrument rei de la cobla és la **Tenora**, ${nom}! 👑\n\nTé un so potent, noble i càlid que s'escolta a tota la plaça. Està feta de fusta de **ginjoler** i s'acaba amb una campana cònica de metall de llautó. La va inventar Andreu Toron el 1849 i Pep Ventura la va fer famosa com a gran veu solista! 🎷`;
  }

  // 4. Fusta de ginjoler (Cobla 2.0)
  if (q.includes('fusta') || q.includes('ginjoler') || q.includes('arbre')) {
    return `Els instruments de fusta (el flabiol, el tible i la tenora) es fan amb fusta de **ginjoler**! 🌳\n\nÉs l'arbre dels gínjols. Aquesta fusta és rogenca, súper dura i no es fa malbé amb la humitat ni amb la saliva del músic! Per això té un so tan brillant!`;
  }

  // 5. Flabiol, Tamborí i Introit (Cobla 2.0 & Som Sardana)
  if (q.includes('flabiol') || q.includes('tamborí') || q.includes('tambori') || q.includes('introit') || q.includes('dit') || q.includes('falange')) {
    return `El **flabiol** és una petita flauta de fusta d'un pam que té un secret únic al món! 🪈\n\n• Es toca només amb la mà esquerra!\n• El forat de sota no es tapa amb el polze com a la flauta dolça, sinó amb la part de dalt del **dit petit**!\n• El flabiol fa l'**Introit**: el toc d'avís solista perquè tothom s'agafi de les mans i comenci la sardana! ✨`;
  }

  // 6. Tible (Cobla 2.0)
  if (q.includes('tible')) {
    return `El **tible** és el germà petit i trempat de la tenora! 🐤\n\nÉs més curt, fa un so agut, penetrant i molt festiu. Com la tenora, té **canya doble** (dues làmines de canya que vibren) i està fet de fusta de ginjoler. A la cobla n'hi ha dos: el Tible 1 i el Tible 2!`;
  }

  // 7. Trompetes & Sordina / Roda moliner (Cobla 2.0)
  if (q.includes('trompeta') || q.includes('sordina') || q.includes('moliner')) {
    return `A la cobla hi ha dues **trompetes de pistons** a la segona fila! 🎺\n\nFan fanfares brillants. A la cançó popular *"Roda, roda moliner"*, fan servir una **sordina** (un con que es posa dins la campana) per apagar el volum i imitar el so llunyà de l'aigua del molí!`;
  }

  // 8. Trombó (Cobla 2.0)
  if (q.includes('trombó') || q.includes('trombo') || q.includes('pistons')) {
    return `El **trombó de pistons** seu just al mig de la segona fila! 📯\n\nTé tres vàlvules com una trompeta gran i fa un so greu, ample i solemne que dóna cos a tota la música de la cobla!`;
  }

  // 9. Fiscorn (Cobla 2.0)
  if (q.includes('fiscorn') || q.includes('fiscorns')) {
    return `El **fiscorn** és la veu més dolça i vellutada del vent-metall! 🎺\n\nTé la campana ampla mirant endavant. A la cobla n'hi ha dos i fan melodies precioses de tenor que acompanyen la tenora. Sembla una persona cantant amb veu càlida!`;
  }

  // 10. Contrabaix / Corda (Cobla 2.0 & Som Sardana)
  if (q.includes('corda') || q.includes('contrabaix') || q.includes('pizzicato') || q.includes('budell')) {
    return `A la cobla només hi ha un únic instrument de corda: el **Contrabaix**! 🎻\n\nÉs gegant i es toca dret a la punta dreta. El músic pessiga les cordes de budell amb els dits (**pizzicato**) per marcar el batec del ball, com a la cançó del *Gegant del Pi*!`;
  }

  // 11. Com es balla la Sardana & Les 10 Tirades (Som Sardana)
  if (q.includes('balla') || q.includes('ballar') || q.includes('tirada') || q.includes('tirades') || q.includes('curts') || q.includes('llargs') || q.includes('contrapunt')) {
    return `Com es balla una sardana segons Som Sardana? 💃🕺\n\nTé exactament **10 tirades** ordenades:\n1️⃣ Introit de flabiol (inici)\n2️⃣ Dos Curts (passos petits a baix)\n3️⃣ Dos Llargs (passos amples amb braços amunt)\n4️⃣ Dos Curts\n5️⃣ Dos Llargs\n6️⃣ Dos Contrapunts i Cop final sec! Tots agafats en rotllana!`;
  }

  // 12. Comptar i Repartir (Som Sardana)
  if (q.includes('comptar') || q.includes('repartir') || q.includes('repartidor')) {
    return `Comptar i repartir és la matemàtica secreta de la sardana! 🔢🧠\n\nEls balladors compten els compassos de la música mentre ballen. Després fan una divisió mental per saber en quin compàs han de fer els tresos i dosos per acabar el ball amb el peu clavat i al segon exacte!`;
  }

  // 13. Estil Empordanès vs Selvatà (Som Sardana)
  if (q.includes('empordan') || q.includes('selvat') || q.includes('estil') || q.includes('estils')) {
    return `A Catalunya hi ha dos grans estils de ballar la sardana! ⛰️🌊\n\n• **Estil Empordanès:** És el més estès i fa servir el "dos parat" als curts.\n• **Estil Selvatà:** Tradicional de La Selva i el Gironès, fa servir els "dos tresos" i acaba sempre cap a la dreta!`;
  }

  // 14. La Santa Espina (Cobla 2.0 & Som Sardana)
  if (q.includes('santa espina') || q.includes('morera') || q.includes('guimerà') || q.includes('prohib')) {
    return `*"La Santa Espina"* va ser escrita el 1907 per Enric Morera (música) i Àngel Guimerà (lletra) per a una obra de teatre! 🎶🛡️\n\nÉs la sardana més emblemàtica de Catalunya. Va ser prohibida durant dues dictadures (el 1924 per Primo de Rivera i després per Franco) perquè la gent la cantava com un himne d'amor a la llibertat!`;
  }

  // 15. Juny & Juli Garreta (Som Sardana)
  if (q.includes('juny') || q.includes('garreta') || q.includes('rellotger') || q.includes('casals')) {
    return `*"Juny"* és una sardana obra mestra escrita el 1920 per **Juli Garreta**! 🌾🕰️\n\nGarreta no va anar al conservatori: era rellotger a Sant Feliu de Guíxols! La va escriure a Romanyà inspirat pels segadors als camps de blat. Pau Casals i Stravinski deien que Garreta era un geni musical absolut!`;
  }

  // 16. El Gegant del Pi (Cobla 2.0)
  if (q.includes('gegant') || q.includes('mustafà') || q.includes('camí') || q.includes('terrat')) {
    return `Al *"Gegant del Pi"*, saps per què ballava pel camí? 🏰\n\nA Barcelona, la part central de la Rambla estava enrajolada (l'anomenaven "el terrat"), i per allà ballava el gegant de la Ciutat. Els laterals eren de terra ("el camí"), i per allà ballava el gegant del Pi! A la cobla, el contrabaix imita les seves passes feixugues!`;
  }

  // 17. Per tu ploro (Cobla 2.0)
  if (q.includes('per tu ploro')) {
    return `*"Per tu ploro"* (1872) és la sardana més coneguda de Pep Ventura! 🎻\n\nTé un solo de tenora emocionant que demostra la nova sonoritat de la cobla. Més endavant, el poeta Joan Maragall hi va escriure la cèlebre lletra: «Per tu ploro, reina de les flors...»!`;
  }

  // 18. Vora el niu / Ocells (Cobla 2.0)
  if (q.includes('vora el niu') || q.includes('ocells') || q.includes('sans')) {
    return `*"Vora el niu"* d'Enric Sans és una sardana de lluïment de flabiol! 🐦🪈\n\nEl flabiolaire toca tan de pressa que sembla el cant i refilat dels ocellets silvestres al mig del bosc!`;
  }

  // 19. Sardanes revesses (Cobla 2.0)
  if (q.includes('revessa') || q.includes('revesses') || q.includes('toldrà') || q.includes('enigma')) {
    return `Les **sardanes revesses** són com enigmes o endevinalles per a l'oïda! 🧩\n\nEl compositor amaga expressament quants compassos tenen els curts i els llargs perquè els balladors s'equivoquin. Eduard Toldrà en va escriure de famoses per a concursos!`;
  }

  // 20. Fila 1 i Fila 2 / Distribució (Cobla 2.0)
  if (q.includes('fila') || q.includes('files') || q.includes('davant') || q.includes('darrere') || q.includes('escenari')) {
    return `A l'escenari de la cobla hi ha dues files molt clares! 📍\n\n• **1a Fila (davant, asseguts):** Els 5 instruments de fusta (flabiol/tamborí, 2 tibles i 2 tenores) perquè el seu so és més càlid.\n• **2a Fila (darrere, drets):** Els metalls (trompetes, trombó, fiscorns) i a la dreta el contrabaix, perquè tenen molta potència i no tapin els altres!`;
  }

  // STRICT REFUSAL FOR ANY QUESTION OUTSIDE COBLA 2.0 & SOM SARDANA
  return `Ho sento, ${nom}! 🤖 Com a CoblaBot, només puc respondre preguntes amb informació contrastada que surt a **Cobla 2.0** (Palau de la Música Catalana) i a **Som Sardana** (La Sardana a l'Escola).\n\nAquesta dada no surt a les meves fonts oficials sobre la cobla catalana! 🎶\n\nEm pots preguntar sobre:\n• Els 12 instruments i com sonen\n• Andreu Toron i en Pep Ventura\n• Com es balla la sardana (les 10 tirades i comptar)\n• Peces com *La Santa Espina*, *Juny* o *El Gegant del Pi*!`;
}

// API endpoint for CoblaBot AI Assistant
app.post('/api/coblabot', async (req, res) => {
  try {
    const { question, studentName } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Falta la pregunta' });
    }

    const nom = studentName || 'Músic';

    if (ai) {
      try {
        const systemInstruction = `Ets "CoblaBot", el simpàtic i savi robot educatiu de la Cobla Catalana per a infants de Primària (de 9 a 12 anys, Cicle Superior).
T'adreces a l'alumne/a anomenat/da "${nom}".

FONTS OFICIALS I LÍMIT DE CONEIXEMENT:
Només pots respondre preguntes amb informació contrastada extreta exclusivament de dues fonts:
1. "Cobla 2.0" (Palau de la Música Catalana)
2. "Som Sardana" (La Sardana a l'Escola / Federació Sardanista)

REGLES ESTRICTES:
1. SI LA PREGUNTA NO ÉS SOBRE LA COBLA, ELS SEUS INSTRUMENTS, PEP VENTURA, ANDREU TORON, LES SARDANES O LES PECES ESMENTADES A COBLA 2.0 / SOM SARDANA:
   Has de fer saber clarament a l'infant que no en tens la resposta contrastada a les teves fonts:
   "Ho sento, ${nom}! Com a CoblaBot, només puc respondre preguntes amb informació contrastada extreta de Cobla 2.0 i de Som Sardana. Aquesta informació no surt a les meves fonts oficials de la cobla! Em pots fer qualsevol pregunta sobre els 12 instruments, Pep Ventura i Andreu Toron, les 10 tirades o peces com 'La Santa Espina'!"

2. RESPOSTES SIMPLIFICADES PER A INFANTS DE PRIMÀRIA:
   - Fes servir frases molt clares, curtes, engrescadores i fàcils d'entendre.
   - Explica qualsevol concepte de forma visual i senzilla (sense paraules difícils).
   - Respostes breus (màxim 2-3 paràgrafs curts).
   - Fes servir emojis simpàtics (🪈, 🥁, 🎷, 🎺, 🎻, 👑, 💃, 🌟).

3. DADES CONTRASTADES FONAMENTALS:
   - 11 músics, 12 instruments (flabiolaire toca flabiol amb mà esquerra i tamborí amb mà dreta).
   - Fila 1 davant (fusta: flabiol, 2 tibles, 2 tenores). Fila 2 darrere (metall i corda: 2 trompetes, trombó, 2 fiscorns, contrabaix).
   - Andreu Toron va inventar la tenora el 1849 a Perpinyà. Pep Ventura NO la va inventar: la va descobrir, incorporar, coronar com a reina, va crear la cobla moderna d'11 músics i va inventar la sardana llarga.
   - 10 tirades de la sardana; comptar i repartir. Estil empordanès (dos parat) i selvatà (dos tresos).
   - Peces: La Santa Espina (Morera/Guimerà, 1907, prohibida en dictadures), Juny (Juli Garreta, rellotger de Sant Feliu, 1920), Per tu ploro (Pep Ventura, 1872), El Gegant del Pi (camí vs terrat de la Rambla), Roda moliner (sordina a les trompetes), Vora el niu (Enric Sans, ocells al flabiol), Sardanes revesses (Eduard Toldrà).`;

        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: question,
          config: {
            systemInstruction,
            temperature: 0.3, // Low temperature for high factual precision
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de generació')), 6000)
        );

        const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
        const text = response.text || '';
        return res.json({ answer: text });
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to verified local knowledge base:', geminiError);
      }
    }

    const fallback = generateCoblaBotFallback(question, nom);
    return res.json({ answer: fallback });
  } catch (err: any) {
    console.error('CoblaBot route error:', err);
    res.status(500).json({ error: 'Error intern al CoblaBot' });
  }
});

// Persistent Server-Side Student Registry (Never expires, lasts forever)
const DATA_DIR = path.resolve(__dirname, 'data');
const STUDENTS_FILE = path.resolve(DATA_DIR, 'students_registry.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read persistent students
app.get('/api/students', (_req, res) => {
  try {
    if (fs.existsSync(STUDENTS_FILE)) {
      const data = fs.readFileSync(STUDENTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return res.json({ students: Array.isArray(parsed) ? parsed : [] });
    }
    return res.json({ students: [] });
  } catch (err) {
    console.error('Error reading students file:', err);
    return res.json({ students: [] });
  }
});

// Save persistent students (never expires)
app.post('/api/students', (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) {
      return res.status(400).json({ error: 'Expected students array' });
    }
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
    return res.json({ success: true, count: students.length });
  } catch (err) {
    console.error('Error saving students file:', err);
    return res.status(500).json({ error: 'Failed to persist student records' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // Serve static assets from public/ (including high-res real cobla audio recordings)
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (!isProd) {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 CoblaBot Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
