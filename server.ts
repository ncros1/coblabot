import http from 'http';
import express from 'express';
import path from 'path';
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

// Fallback intelligent responses for Cobla questions
function generateCoblaBotFallback(question: string, studentName?: string): string {
  const q = question.toLowerCase();
  const nom = studentName || 'Músic';

  if (q.includes('quant') || q.includes('número') || q.includes('11') || q.includes('12')) {
    return `Hola ${nom}! 🎶 Sabies que una cobla està formada per **11 músics**, però toquen **12 instruments**? 😮\n\nEl secret és el **flabiolaire**: toca el **flabiol** amb la mà esquerra i el **tamborí** amb la mà dreta al mateix temps! Quin crack, oi? 🥁🎷\n\nT'agradaria provar de tocar dos instruments a l'hora?`;
  }
  if (q.includes('rei') || q.includes('tenora')) {
    return `Molt bona pregunta, ${nom}! 👑 L'instrument rei de la cobla és la **Tenora**!\n\nTé un so potent, càlid i profund que es reconeix a l'instant. Està feta de fusta de **ginjoler** i té una campana metàl·lica al final. Va ser perfeccionada pel famós músic **Pep Ventura** al segle XIX! 🌟\n\nL'has escoltada ja al Laboratori de Sons?`;
  }
  if (q.includes('fusta') || q.includes('ginjoler')) {
    return `Els instruments de vent-fusta de la cobla (el tible, la tenora i el flabiol) es construeixen tradicionalment amb fusta de **ginjoler** (l'arbre dels gínjols). 🌳\n\nÉs una fusta molt dura, densa i rogenca que suporta molt bé la humitat i dóna una ressonància acústica brillant i única! Sabies que el ginjoler triga molts anys a créixer?`;
  }
  if (q.includes('corda') || q.includes('contrabaix')) {
    return `Sí, ${nom}! A la cobla només hi ha **un únic instrument de corda**: el **Contrabaix**! 🎻\n\nNormalment es toca dret i fent servir el *pizzicato* (pinçant les cordes amb els dits) per marcar el pols i els greus que aguanten tota la cobla. És l'instrument més alt de tots!`;
  }
  if (q.includes('introit') || q.includes('comença') || q.includes('començar')) {
    return `L'**introit** és el solo inicial amb què comença sempre una sardana! 🎺✨\n\nEl toca el flabiol acompanyat dels tocs de tamborí per cridar l'atenció dels balladors i avisar a tothom que la festa comença! Després, tots els músics s'hi afegeixen! Has escoltat com xiula d'agut?`;
  }
  if (q.includes('sardana') || q.includes('balla') || q.includes('ballar')) {
    return `La **sardana** és la dansa tradicional catalana que s'acompanya amb la cobla! 💃🕺\n\nEs balla en rotllana agafats de les mans. Té dues parts principals:\n1️⃣ Els **Curts**: passos curts i tranquils.\n2️⃣ Els **Llargs**: passos més amples i moguts, amb els braços amunt!\nI tothom ha de comptar i repartir els compassos per acabar exactament al mateix temps!`;
  }
  if (q.includes('tible')) {
    return `El **tible** és un instrument de canya doble molt espavilat! 🐤\n\nÉs més petit que la tenora i té un so més agut, penetrant i festiu. A la cobla n'hi ha dos: el Tible 1 i el Tible 2, i sovint fan diàlegs meravellosos amb les tenores!`;
  }
  if (q.includes('fiscorn')) {
    return `El **fiscorn** és un instrument de vent-metall amb una campana molt gran que apunta endavant! 🎺\n\nTé un so rodó, vellutat i molt expressiu (com la veu d'un tenor cantant). A la sardana fa uns contracants i melodies secundàries que posen la pell de gallina! A la cobla n'hi ha dos!`;
  }

  return `Hola ${nom}! 🤖 Quina curiositat més interessant! La cobla és una formació instrumental única al món, nascuda a Catalunya, amb 11 músics i 12 instruments distribuïts en dues files: davant la fusta i darrere el metall i el contrabaix.\n\n👉 Prova d'anar a l'**Escenari Interactiu** o al **Laboratori de Sons** per descobrir els secrets de cada instrument! O pregunta'm per la Tenora, el Flabiol o com es balla la sardana! 🎶✨`;
}

// API endpoint for CoblaBot AI Assistant
app.post('/api/coblabot', async (req, res) => {
  try {
    const { question, studentName } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Falta la pregunta' });
    }

    if (ai) {
      try {
        const systemInstruction = `Ets "CoblaBot", el simpàtic i savi robot guia de la Cobla Catalana per a nens i nenes de Primària (de 9 a 12 anys, cicle superior).
T'adreces a l'alumne/a anomenat/da "${studentName || 'Músic'}".
Regles:
- Llenguatge: Català clar, proper, motivador, alegre i amb emojis (🎷, 🎺, 🥁, 🎶, 👏, 🌟).
- Format visual: Respostes curtes (màxim 3 paràgrafs breus), llistes clares, destacats en negreta.
- Coneixements clau de la cobla:
  * 11 músics i 12 instruments (el flabiolaire toca flabiol amb la mà esquerra i tamborí amb la dreta).
  * Instruments: Flabiol i tamborí, 2 Tibles, 2 Tenores (instrument rei, ginjoler i metall, Pep Ventura), 2 Trompetes, 1 Trombó (de pistons), 2 Fiscorns, 1 Contrabaix (únic de corda, a la dreta dret).
  * 1a fila (fustes davant): Flabiol/tamborí, Tible 1, Tible 2, Tenora 1, Tenora 2.
  * 2a fila (metalls i corda darrere): Trompeta 1, Trompeta 2, Trombó, Fiscorn 1, Fiscorn 2, Contrabaix.
  * Sardana: Curts i Llargs, comença amb l'Introit.
- Sempre acaba amb una pregunta motivadora, endevinalla o repte per a l'infant!`;

        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: question,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de generació')), 6000)
        );

        const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
        const text = response.text || '';
        return res.json({ answer: text });
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local knowledge base:', geminiError);
      }
    }

    const fallback = generateCoblaBotFallback(question, studentName);
    return res.json({ answer: fallback });
  } catch (err: any) {
    console.error('CoblaBot route error:', err);
    res.status(500).json({ error: 'Error intern al CoblaBot' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

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
