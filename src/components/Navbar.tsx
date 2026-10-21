import React from 'react';
import { StudentProfile } from '../types/cobla';
import { Compass, Music, MapPin, Headphones, Gamepad2, MessageSquare, Star, Edit3, BookOpen } from 'lucide-react';

export type ActiveTab = 'home' | 'instruments' | 'stage' | 'soundlab' | 'challenges' | 'curiosities' | 'chat';

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
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Inici', icon: <Compass className="w-4 h-4" /> },
    { id: 'instruments', label: 'Els Instruments', icon: <Music className="w-4 h-4" />, badge: '12' },
    { id: 'stage', label: 'L’Escenari', icon: <MapPin className="w-4 h-4" /> },
    { id: 'soundlab', label: 'Laboratori Sons', icon: <Headphones className="w-4 h-4" /> },
    { id: 'curiosities', label: 'Secrets & Dossiers', icon: <BookOpen className="w-4 h-4" />, badge: 'Nou!' },
    { id: 'challenges', label: 'Reptes & Jocs', icon: <Gamepad2 className="w-4 h-4" />, badge: 'Mini-jocs' },
    { id: 'chat', label: 'Xat CoblaBot', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-2xl shadow-md shadow-amber-400/30 group-hover:scale-105 transition transform">
              🤖🎶
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                  CoblaBot
                </span>
                <span className="px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                  Primària
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Descobreix la Cobla Catalana
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-amber-50/70 p-1.5 rounded-2xl border border-amber-200/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all relative ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-700 hover:text-amber-800 hover:bg-amber-100/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
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
          <div className="flex items-center gap-2">
            {student ? (
              <button
                onClick={onOpenProfile}
                title="Clica per canviar d'alumne o editar el teu Carnet"
                className="flex items-center gap-2.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 px-3 py-1.5 rounded-2xl shadow-sm transition active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-lg flex items-center justify-center shadow-inner">
                  {student.avatar || '🤖'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
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
                className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm shadow hover:bg-amber-600 transition"
              >
                Entra amb el teu Nom
              </button>
            )}

            {/* Exclusive Teacher Access Button */}
            <button
              onClick={onOpenTeacherPanel}
              title="Accés exclusiu per a la mestra (requereix codi)"
              className="p-2 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <span>🔐</span>
              <span className="hidden sm:inline">Mestra</span>
            </button>
          </div>

        </div>

        {/* Mobile Submenu Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-amber-100 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50/80 text-slate-700 hover:bg-amber-100'
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
