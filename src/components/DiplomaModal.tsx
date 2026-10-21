import React from 'react';
import { StudentProfile } from '../types/cobla';
import { Award, Printer, X, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
}

export const DiplomaModal: React.FC<Props> = ({ isOpen, onClose, student }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const nom = student?.nom || 'Alumne/a de Música';
  const data = student?.dataRegistre || new Date().toLocaleDateString('ca-ES');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-amber-50 rounded-3xl shadow-2xl border-8 border-yellow-400 p-6 md:p-10 text-center text-slate-800 print:border-4 print:shadow-none print:w-full print:max-w-none">
        
        {/* Close button (hidden in print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-amber-200/60 hover:bg-amber-300 text-slate-700 transition print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border & Header */}
        <div className="border-4 border-dashed border-amber-300 rounded-2xl p-6 md:p-8 space-y-4 bg-white/70">
          
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Sparkles className="w-6 h-6 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest">
              Educació Musical de Catalunya
            </span>
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>

          <div className="text-5xl my-2">📜👑</div>

          <h1 className="text-2xl md:text-4xl font-black text-amber-950 tracking-tight uppercase">
            Diploma Oficial d’Honor
          </h1>
          <p className="text-xs md:text-sm font-bold text-amber-800 uppercase tracking-widest">
            Mestre/a Expert/a en la Cobla Catalana
          </p>

          <div className="py-4">
            <p className="text-xs md:text-sm font-semibold text-slate-600">
              Es certifica solemnement que l'alumne/a
            </p>
            <div className="text-3xl md:text-4xl font-black text-amber-600 my-2 font-serif border-b-2 border-amber-300 inline-block px-6 pb-1">
              {nom}
            </div>
            <p className="text-xs md:text-sm font-bold text-amber-800">
              Gran intèrpret i coneixedor/a de la música tradicional
            </p>
          </div>

          <p className="text-xs md:text-sm text-slate-700 max-w-lg mx-auto font-medium leading-relaxed">
            Ha superat amb excel·lència tots els coneixements sobre els <strong>12 instruments</strong>, la seva distribució en <strong>dues files a l'escenari</strong>, els timbres al Laboratori de Sons i els reptes de la música tradicional catalana.
          </p>

          {/* Seals and Date */}
          <div className="pt-6 flex items-center justify-between border-t border-amber-200 text-left">
            <div>
              <div className="text-[11px] font-bold text-slate-500">Data d'expedició:</div>
              <div className="text-xs font-black text-slate-800">{data}</div>
            </div>

            {/* Official CoblaBot Stamp */}
            <div className="flex items-center gap-2 bg-amber-100 border-2 border-amber-400 px-3 py-1.5 rounded-2xl shadow-inner">
              <span className="text-2xl">🤖🎺</span>
              <div className="text-[10px] font-black text-amber-900 leading-tight">
                SEGELL OFICIAL<br />COBLABOT
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-bold text-slate-500">Signatura digital:</div>
              <div className="text-xs font-black text-amber-800 italic font-serif">
                Pep Ventura & CoblaBot
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons (hidden in print) */}
        <div className="mt-6 flex items-center justify-center gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow flex items-center gap-2 active:scale-95 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimeix o Desa en PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 transition"
          >
            Tanca
          </button>
        </div>

      </div>
    </div>
  );
};
