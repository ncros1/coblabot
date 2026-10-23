import React, { useState } from 'react';
import { InstrumentFamily, InstrumentInfo } from '../types/cobla';
import { INSTRUMENTS_DATA, COBLA_YOUTUBE_PLAYLIST } from '../data/instrumentsData';
import { Volume2, Sparkles, Film, ExternalLink, Music2 } from 'lucide-react';
import { coblaAudio } from '../utils/audioEngine';
import { CoblaYouTubePlayer } from './CoblaYouTubePlayer';

interface Props {
  onLearnInstrument?: (instrumentId: string) => void;
}

export const InstrumentsGallery: React.FC<Props> = () => {
  const [selectedFamily, setSelectedFamily] = useState<InstrumentFamily | 'all'>('all');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  const filteredInstruments = selectedFamily === 'all'
    ? INSTRUMENTS_DATA
    : INSTRUMENTS_DATA.filter((inst) => inst.familia === selectedFamily);

  const handlePlayRealAudio = (inst: InstrumentInfo) => {
    if (activePlayingId === inst.id) {
      coblaAudio.stopAll();
      setActivePlayingId(null);
      return;
    }
    setActivePlayingId(inst.id);
    coblaAudio.playRealSample(inst.realAudioPreviewUrl || inst.synthType, {
      previewOnly: true,
      title: `${inst.nom} - ${inst.pieceFeatured || 'Cobla 2.0'}`,
      onEnd: () => setActivePlayingId((cur) => (cur === inst.id ? null : cur)),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header and Filter */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-amber-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Fitxes d'Instruments i Àudios
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              🎷 Els 12 Instruments de la Cobla
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base mt-2 leading-relaxed">
              Descobreix com sona cadascun dels instruments amb els vídeos i gravacions oficials de <strong>SomSardana</strong>. Clica a cada reproductor per sentir el timbre i veure la tècnica real dels músics!
            </p>
          </div>

          {/* YouTube Playlist direct badge */}
          <a
            href={COBLA_YOUTUBE_PLAYLIST.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-700 transition self-start md:self-center shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow">
              <Film className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black group-hover:underline flex items-center gap-1">
                <span>Llista a YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </div>
              <div className="text-[11px] text-red-600/80 font-medium">@somsardana (10 vídeos)</div>
            </div>
          </a>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFamily('all')}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition ${
              selectedFamily === 'all'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
            }`}
          >
            Tots els Instruments (12)
          </button>

          <button
            onClick={() => setSelectedFamily('vent-fusta')}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition flex items-center gap-1.5 ${
              selectedFamily === 'vent-fusta'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>🌳 Vent-Fusta (5)</span>
          </button>

          <button
            onClick={() => setSelectedFamily('vent-metall')}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition flex items-center gap-1.5 ${
              selectedFamily === 'vent-metall'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>🎺 Vent-Metall (5)</span>
          </button>

          <button
            onClick={() => setSelectedFamily('corda')}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition flex items-center gap-1.5 ${
              selectedFamily === 'corda'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
            }`}
          >
            <span>🎻 Corda (1)</span>
          </button>
        </div>
      </div>

      {/* Instruments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredInstruments.map((inst) => {
          const isPlaying = activePlayingId === inst.id;
          const familyColor =
            inst.familia === 'vent-fusta'
              ? 'border-emerald-300 bg-emerald-50/20'
              : inst.familia === 'vent-metall'
              ? 'border-amber-300 bg-amber-50/20'
              : 'border-sky-300 bg-sky-50/20';

          const badgeBg =
            inst.familia === 'vent-fusta'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : inst.familia === 'vent-metall'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-sky-100 text-sky-800 border-sky-300';

          return (
            <div
              key={inst.id}
              className={`bg-white rounded-3xl p-6 border-3 shadow-md hover:shadow-xl transition-all flex flex-col justify-between ${familyColor}`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md border-2 border-slate-100 flex items-center justify-center text-3xl">
                      {inst.icona}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 leading-tight">
                        {inst.nom}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {inst.nomComplet}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${badgeBg}`}>
                      {inst.familia}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {inst.fila === 1 ? '1a Fila (Davant)' : '2a Fila (Darrere)'}
                    </span>
                  </div>
                </div>

                {/* Short description */}
                <p className="text-sm font-medium text-slate-700 mt-4 leading-relaxed">
                  {inst.descripcioCurta}
                </p>

                {/* Details list */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    <strong className="text-slate-900">Com es toca:</strong> {inst.comEsToca}
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <strong className="text-amber-950 flex items-center gap-1 mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Dada curiosa:
                    </strong>
                    {inst.dadaCuriosa}
                  </div>

                  <div className="flex items-center justify-between text-slate-500 px-1 pt-1">
                    <span><strong>Material:</strong> {inst.material}</span>
                    <span className="font-bold text-amber-700">Registre: {inst.soAgutOGreu}</span>
                  </div>
                </div>
              </div>

              {/* YouTube Video & Sound from Playlist */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-red-600" />
                      <span>Vídeo i so real (Llista de reproducció oficial):</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">SomSardana</span>
                  </div>
                  
                  {/* Embedded YouTube Player with exact track */}
                  <CoblaYouTubePlayer
                    youtubeId={inst.youtubeId}
                    title={inst.youtubeTitle}
                    durada="13-14s"
                    compact={true}
                  />
                </div>

                {/* Real Recording Audio Button (Palau de la Música - Cobla 2.0) */}
                <div className="pt-2">
                  <button
                    onClick={() => handlePlayRealAudio(inst)}
                    className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-between gap-2 shadow-sm border active:scale-98 min-h-[44px] ${
                      isPlaying
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                        : 'bg-gradient-to-r from-sky-50 to-amber-50 hover:from-sky-100 hover:to-amber-100 text-slate-800 border-sky-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-white animate-bounce' : 'text-sky-600'}`} />
                      <span>{isPlaying ? '⏹️ Aturar enregistrament' : '🎧 Escolta el so real (Cobla 2.0)'}</span>
                    </span>
                    {inst.pieceFeatured && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${
                          isPlaying
                            ? 'bg-rose-600 text-rose-100'
                            : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                        }`}
                      >
                        {inst.pieceFeatured}
                      </span>
                    )}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
