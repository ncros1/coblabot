import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile } from '../types/cobla';
import { Send, Volume2, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { coblaAudio } from '../utils/audioEngine';

interface Props {
  student: StudentProfile | null;
  onAskQuestion?: (question: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Qui va inventar la tenora: Toron o Pep Ventura? 👑',
  'Per què hi ha 11 músics i 12 instruments? 🥁',
  'Com es balla la sardana i les 10 tirades? 💃',
  'Què és l’introit i el secret del dit petit? 🪈',
  'Per què es va prohibir "La Santa Espina"? 🛡️',
  'Qui era en Juli Garreta i com va compondre "Juny"? 🌾',
  'Per on ballava el Gegant del Pi i per què? 🏰',
  'Quin instrument fa servir sordina a "Roda moliner"? 🔇',
];

export const CoblaBotChat: React.FC<Props> = ({ student, onAskQuestion }) => {
  const nom = student?.nom || 'Músic';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hola, ${nom}! 👋 Sóc en **CoblaBot**, el teu robot guia de la Cobla Catalana! 🤖🎶\n\nResponc a les teves preguntes amb **informació 100% contrastada** extreta exclusivament de **Cobla 2.0** i de **Som Sardana**, amb explicacions molt senzilles i fàcils d'entendre per a tu!\n\nSi em preguntes alguna cosa que no surti a aquests dossiers oficials, t'avisaré que no en tinc la resposta. Què t'agradaria descobrir avui?`,
      timestamp: 'Ara mateix',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Text to Speech in Catalan
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean markdown stars for TTS
      const cleanText = text.replace(/[*_#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ca-ES';
      utterance.rate = 1.0;
      utterance.pitch = 1.1;

      // Try finding a Catalan voice
      const voices = window.speechSynthesis.getVoices();
      const catVoice = voices.find((v) => v.lang.startsWith('ca'));
      if (catVoice) {
        utterance.voice = catVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const question = textToSend.trim();
    if (!question || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    if (onAskQuestion) {
      onAskQuestion(question);
    }

    try {
      const response = await fetch('/api/coblabot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          studentName: nom,
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.answer || 'Molt bona pregunta! Prova de demanar-me sobre la Tenora o l’Introit!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      coblaAudio.playTamboriHit(undefined, 0.4);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Hola ${nom}! 🎶 La cobla és una agrupació tradicional única formada per 11 músics i 12 instruments: davant les fustes (flabiol, tibles, tenores) i darrere els metalls i el contrabaix! Prova de tocar-los al Laboratori de Sons! 🎺🎷`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-amber-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-4xl shadow-md">
            🤖
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] sm:text-[11px] font-black uppercase">
                <Sparkles className="w-3 h-3 text-amber-600" />
                extret de Cobla 2.0 i Som Sardana
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold">
                100% Contrastat per a Primària
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              Xat amb en CoblaBot
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              Respostes clares i simplificades per a infants, basades exclusivament en els coneixements oficials de la cobla!
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area Container */}
      <div className="bg-white rounded-3xl border-3 border-amber-200 shadow-md overflow-hidden flex flex-col h-[580px]">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m) => {
            const isBot = m.sender === 'bot';

            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-xl flex items-center justify-center shrink-0 shadow-sm">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 shadow-sm relative group ${
                    isBot
                      ? 'bg-amber-50/80 border-2 border-amber-200 text-slate-800 rounded-tl-sm'
                      : 'bg-amber-500 text-white rounded-tr-sm font-semibold'
                  }`}
                >
                  <div className="text-xs md:text-sm whitespace-pre-line leading-relaxed">
                    {m.text}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-4 text-[10px] opacity-75">
                    <span>{m.timestamp}</span>

                    {isBot && (
                      <button
                        onClick={() => handleSpeak(m.text)}
                        title="Escolta com ho llegeix en CoblaBot en veu alta"
                        className="px-2 py-0.5 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-amber-900 font-bold flex items-center gap-1 transition"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Escolta</span>
                      </button>
                    )}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-lg flex items-center justify-center shrink-0 shadow-sm">
                    {student?.avatar || '👤'}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-9 h-9 rounded-xl bg-amber-200 flex items-center justify-center text-xl animate-spin">
                ⚙️
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>CoblaBot està pensant la resposta per a tu...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-amber-50/60 border-t border-amber-100 overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[11px] font-black text-amber-800 whitespace-nowrap">
            💡 Preguntes ràpides:
          </span>
          {QUICK_PROMPTS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-xl bg-white hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs font-bold whitespace-nowrap active:scale-95 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Pregunta qualsevol cosa a en CoblaBot, ${nom}...`}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 transition"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold shadow-md active:scale-95 transition flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
