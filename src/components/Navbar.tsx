import React from 'react';
import { StudentProfile } from '../types/cobla';
import { Compass, Music, MapPin, Headphones, Gamepad2, Star, Edit3, BookOpen } from 'lucide-react';

export type ActiveTab = 'home' | 'instruments' | 'stage' | 'soundlab' | 'challenges' | 'curiosities';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  student: StudentProfile | null;
  onOpenProfile: () => void;
  onOpenTeacherPanel: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  student,
  onOpenProfile,
  onOpenTeacherPanel,
}) => {
  const navItems: { id: ActiveTab; label: string; mobileLabel: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Inici', mobileLabel: 'Inici', icon: <Compass className="w-4 h-4 shrink-0" /> },
    { id: 'instruments', label: 'Els Instruments', mobileLabel: 'Instruments', icon: <Music className="w-4 h-4 shrink-0" />, badge: '12' },
    { id: 'stage', label: 'L’Escenari', mobileLabel: 'Escenari', icon: <MapPin className="w-4 h-4 shrink-0" /> },
    { id: 'soundlab', label: 'Laboratori Sons', mobileLabel: 'Sons', icon: <Headphones className="w-4 h-4 shrink-0" /> },
    { id: 'curiosities', label: 'Peces & Secrets', mobileLabel: 'Peces', icon: <BookOpen className="w-4 h-4 shrink-0" />, badge: 'Cobla 2.0' },
    { id: 'challenges', label: 'Reptes & Jocs', mobileLabel: 'Reptes', icon: <Gamepad2 className="w-4 h-4 shrink-0" />, badge: 'Mini-jocs' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo Brand */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-xl sm:text-2xl shadow-md shadow-amber-400/30 group-hover:scale-105 transition transform">
              🤖🎶
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                  CoblaBot
                </span>
                <span className="hidden xs:inline-block px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                  Primària
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">
                Descobreix la Cobla Catalana
              </p>
            </div>
          </button>

          {/* Desktop & Tablet Navigation Bar */}
          <nav className="hidden lg:flex items-center gap-1 bg-amber-50/70 p-1.5 rounded-2xl border border-amber-200/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all relative min-h-[40px] ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-700 hover:text-amber-800 hover:bg-amber-100/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Student Profile Card Chip & Teacher Access */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {student ? (
              <button
                onClick={onOpenProfile}
                title="Clica per canviar d'alumne o editar el teu Carnet"
                className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 px-2.5 sm:px-3 py-1.5 rounded-2xl shadow-sm transition active:scale-95 group min-h-[44px]"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-lg flex items-center justify-center shadow-inner shrink-0">
                  {student.avatar || '🤖'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[85px] sm:max-w-[100px]">
                      {student.nom}
                    </span>
                    <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-amber-600 transition" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {student.punts} pts
                    </span>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenProfile}
                className="px-3 sm:px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs sm:text-sm shadow hover:bg-amber-600 transition min-h-[44px] flex items-center justify-center"
              >
                Entra
              </button>
            )}

            {/* Exclusive Teacher Access Button */}
            <button
              onClick={onOpenTeacherPanel}
              title="Accés exclusiu per a la mestra (requereix codi)"
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 min-h-[44px]"
            >
              <span>🔐</span>
              <span className="hidden sm:inline">Mestra</span>
            </button>
          </div>

        </div>

        {/* Tablet & Mobile Submenu Navigation - Touch-friendly scrolling bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 sm:gap-2 border-t border-amber-100 no-scrollbar touch-pan-x">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition min-h-[44px] active:scale-95 ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50/80 text-slate-700 hover:bg-amber-100 border border-amber-200/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
