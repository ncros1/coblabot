import React from 'react';
import { StudentProfile } from '../types/cobla';
import { ActiveTab } from './Navbar';
import { Music, MapPin, Headphones, Gamepad2, Sparkles, MessageSquare, Volume2, Trophy, BookOpen } from 'lucide-react';
import { coblaAudio } from '../utils/audioEngine';

interface Props {
  student: StudentProfile | null;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDiploma?: () => void;
}

export const ExplorationHome: React.FC<Props> = ({
  student,
  setActiveTab,
  onOpenDiploma,
}) => {
  const nom = student?.nom || 'Músic';

  const playWelcomeSound = () => {
    coblaAudio.playInstrumentDemo('flabiol-tambori');
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-8 md:p-12 shadow-xl border-4 border-amber-300/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-yellow-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-amber-100 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Guia interactiva per a Primària
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Hola, <span className="text-yellow-200 underline decoration-yellow-400/60">{nom}</span>! 🤖🎺
            </h1>

            <p className="text-lg md:text-xl text-amber-100 font-medium leading-relaxed">
              Sóc en <strong>CoblaBot</strong>, el teu copilot musical! T'ensenyaré tots els secrets de la formació instrumental més fascinant de Catalunya: els seus <strong className="text-white">12 instruments</strong>, els seus <strong className="text-white">11 músics</strong> i el so vibrant de la sardana!
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => setActiveTab('instruments')}
                className="px-6 py-3.5 rounded-2xl bg-white text-amber-800 font-black text-base shadow-lg hover:bg-yellow-50 active:scale-95 transition flex items-center gap-2"
              >
                <Music className="w-5 h-5 text-amber-600" />
                Explora els Instruments
              </button>

              <button
                onClick={playWelcomeSound}
                className="px-5 py-3.5 rounded-2xl bg-amber-700/50 hover:bg-amber-700/70 border border-amber-300/50 text-white font-bold text-sm backdrop-blur-md active:scale-95 transition flex items-center gap-2"
                title="Clica per sentir el toc d'inici (l'Introit)!"
              >
                <Volume2 className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>Toca l’Introit Real! (Cobla 2.0) 🪈🥁</span>
              </button>

              {student?.diplomaObtingut && onOpenDiploma && (
                <button
                  onClick={onOpenDiploma}
                  className="px-5 py-3.5 rounded-2xl bg-yellow-400 text-amber-950 font-black text-sm shadow-md hover:bg-yellow-300 transition flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-amber-900" />
                  Veure el teu Diploma 📜
                </button>
              )}
            </div>
          </div>

          {/* Friendly CoblaBot Avatar Card */}
          <div className="relative group">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-3xl bg-white/20 backdrop-blur-md border-4 border-white/30 shadow-2xl flex flex-col items-center justify-center p-6 text-center transform rotate-2 group-hover:rotate-0 transition duration-300">
              <div className="text-7xl mb-2 filter drop-shadow-md animate-bounce">
                🤖
              </div>
              <span className="font-black text-xl text-white">CoblaBot</span>
              <span className="text-xs font-semibold text-amber-200 mt-1">
                "Preparat/da per aprendre jugant?"
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary Pill Box */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm flex items-center gap-3">
          <div className="text-3xl">👥</div>
          <div>
            <div className="text-2xl font-black text-slate-800">11 Músics</div>
            <div className="text-xs font-bold text-slate-500">A l'escenari</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm flex items-center gap-3">
          <div className="text-3xl">🎷</div>
          <div>
            <div className="text-2xl font-black text-slate-800">12 Instruments</div>
            <div className="text-xs font-bold text-slate-500">Un músic en toca 2!</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm flex items-center gap-3">
          <div className="text-3xl">📍</div>
          <div>
            <div className="text-2xl font-black text-slate-800">2 Files</div>
            <div className="text-xs font-bold text-slate-500">Fusta davant, metall darrere</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm flex items-center gap-3">
          <div className="text-3xl">🌳</div>
          <div>
            <div className="text-2xl font-black text-slate-800">Ginjoler</div>
            <div className="text-xs font-bold text-slate-500">Fusta noble catalana</div>
          </div>
        </div>
      </div>

      {/* 🧭 Les 4 Grans Seccions de CoblaBot */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>🧭 Menú Principal d’Exploració</span>
            </h2>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Tria per on vols començar el teu viatge musical amb en CoblaBot!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Els Instruments */}
          <div
            onClick={() => setActiveTab('instruments')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border-3 border-amber-200 hover:border-amber-400 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-3xl flex items-center justify-center border border-amber-300 group-hover:scale-110 transition">
                🎷
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                Secció 1
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-800 mt-4 group-hover:text-amber-700 transition">
              1. Els Instruments de la Cobla
            </h3>
            <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
              Descobreix les 3 famílies: <strong>Vent-Fusta</strong> (Flabiol, Tibles, Tenores), <strong>Vent-Metall</strong> (Trompetes, Trombó, Fiscorns) i <strong>Corda</strong> (Contrabaix). Amb fitxes tècniques, dades curioses i àudios!
            </p>

            <div className="mt-5 flex items-center text-amber-600 font-extrabold text-sm gap-1 group-hover:gap-2 transition-all">
              <span>Descobreix els 12 instruments</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 2: L'Escenari */}
          <div
            onClick={() => setActiveTab('stage')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border-3 border-emerald-200 hover:border-emerald-400 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-3xl flex items-center justify-center border border-emerald-300 group-hover:scale-110 transition">
                📍
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Secció 2
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-800 mt-4 group-hover:text-emerald-700 transition">
              2. L’Escenari i la Disposició
            </h3>
            <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
              On s'asseu cada músic? Per què els instruments de fusta van a la 1a fila i els de metall al darrere? Aprèn la col·locació i juga a completar el puzle de l'escenari!
            </p>

            <div className="mt-5 flex items-center text-emerald-600 font-extrabold text-sm gap-1 group-hover:gap-2 transition-all">
              <span>Explora l’escenari interactiu</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: Laboratori de Sons */}
          <div
            onClick={() => setActiveTab('soundlab')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border-3 border-sky-200 hover:border-sky-400 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-3xl flex items-center justify-center border border-sky-300 group-hover:scale-110 transition">
                🎧
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
                Secció 3
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-800 mt-4 group-hover:text-sky-700 transition">
              3. El Laboratori de Sons
            </h3>
            <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
              Posa't els auriculars! Fes sonar la cobla sencera tocant una sardana clàssica, fes solos de Tenora o Flabiol, silencia instruments i ajusta la velocitat del tempo!
            </p>

            <div className="mt-5 flex items-center text-sky-600 font-extrabold text-sm gap-1 group-hover:gap-2 transition-all">
              <span>Entra a l’estudi de so</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 4: Els Reptes i Jocs */}
          <div
            onClick={() => setActiveTab('challenges')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border-3 border-purple-200 hover:border-purple-400 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-3xl flex items-center justify-center border border-purple-300 group-hover:scale-110 transition">
                🎮
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                Secció 4
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-800 mt-4 group-hover:text-purple-700 transition">
              4. El Repte de la Cobla (Jocs)
            </h3>
            <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
              Jocs d'endevinalles amb 3 pistes, el joc de "L'Intrús" i el Gran Quiz per aconseguir el teu <strong>Diploma Oficial d'Expert/a de la Cobla</strong>!
            </p>

            <div className="mt-5 flex items-center text-purple-600 font-extrabold text-sm gap-1 group-hover:gap-2 transition-all">
              <span>Supera els reptes i guanya estrelles</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 5: Peces Musicals & Secrets de Cobla 2.0 i Som Sardana */}
          <div
            onClick={() => setActiveTab('curiosities')}
            className="md:col-span-2 group cursor-pointer bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-3xl p-6 border-3 border-amber-300 hover:border-amber-400 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-3xl flex items-center justify-center border border-amber-500 shadow-sm group-hover:scale-110 transition shrink-0">
                  🎼
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                      extret de Cobla 2.0 i Som Sardana
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                      Peces Musicals Reals
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mt-1 group-hover:text-amber-800 transition">
                    5. Peces Musicals & Secrets: Cobla 2.0 i Som Sardana
                  </h3>
                  <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed max-w-2xl">
                    Escolta i descobreix les peces concretes: <em>La Santa Espina</em> (Morera), <em>Juny</em> (Garreta), <em>Per tu ploro</em> (Pep Ventura), <em>El Gegant del Pi</em>, <em>Roda moliner</em>, i la veritat històrica d’Andreu Toron i Pep Ventura!
                  </p>
                </div>
              </div>

              <div className="flex items-center text-amber-700 font-black text-sm gap-1 group-hover:gap-2 transition-all whitespace-nowrap shrink-0">
                <span>Explora les peces</span>
                <span>→</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CoblaBot Did You Know? Box */}
      <div className="bg-amber-100/60 rounded-3xl p-6 md:p-8 border-2 border-amber-300 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center text-4xl shrink-0 shadow-md">
          💡
        </div>
        <div className="space-y-2 text-center md:text-left flex-1">
          <h4 className="text-lg font-black text-amber-950">
            Sabies que...? La veritat de Pep Ventura i la Cobla!
          </h4>
          <p className="text-sm font-medium text-amber-900 leading-relaxed">
            Abans del segle XIX, les cobles tenien només 3 o 4 músics (les cobles de tres quartans: flabiol, sac de gemecs i tarota). Va ser el músic empordanès <strong>Pep Ventura</strong> qui va revolucionar la formació creant la cobla moderna d'<strong>11 músics i 12 instruments</strong>, va fer de la tenora (inventada per Andreu Toron el 1849) la reina solista indiscutible i va crear la <strong>sardana llarga</strong>!
          </p>
        </div>
        <button
          onClick={() => setActiveTab('chat')}
          className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow whitespace-nowrap flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Pregunta a CoblaBot
        </button>
      </div>

    </div>
  );
};
