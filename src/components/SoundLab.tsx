import React, { useState, useEffect } from 'react';
import { INSTRUMENTS_DATA, COBLA_YOUTUBE_PLAYLIST } from '../data/instrumentsData';
import { CoblaYouTubeTrack } from '../types/cobla';
import { coblaAudio } from '../utils/audioEngine';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Sliders, Music2, Film, ExternalLink } from 'lucide-react';
import { CoblaYouTubePlayer } from './CoblaYouTubePlayer';

export const SoundLab: React.FC = () => {
  // Official YouTube Tracks state
  const [selectedTrack, setSelectedTrack] = useState<CoblaYouTubeTrack>(COBLA_YOUTUBE_PLAYLIST.tracks[0]);

  // Web Audio Mixer State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(110);
  const [tracksState, setTracksState] = useState<{ [id: string]: boolean }>({
    'flabiol-tambori': true,
    'tible-1': true,
    'tible-2': true,
    'tenora-1': true,
    'tenora-2': true,
    'trompeta-1': true,
    'trompeta-2': true,
    'trombo': true,
    'fiscorn-1': true,
    'fiscorn-2': true,
    'contrabaix': true,
  });

  const [soloTrackId, setSoloTrackId] = useState<string | null>(null);

  // Play full ensemble with current track states
  const handlePlayEnsemble = () => {
    if (isPlaying) {
      coblaAudio.stopAll();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const activeTracks = soloTrackId
      ? { [soloTrackId]: true }
      : tracksState;

    coblaAudio.playFullCoblaEnsemble(activeTracks, tempo, () => {
      setIsPlaying(false);
    });
  };

  const handleStopEnsemble = () => {
    coblaAudio.stopAll();
    setIsPlaying(false);
  };

  // Toggle Mute on a track
  const toggleMute = (instId: string) => {
    setTracksState((prev) => {
      const next = { ...prev, [instId]: !prev[instId] };
      return next;
    });
  };

  // Toggle Solo on a track
  const toggleSolo = (instId: string) => {
    if (soloTrackId === instId) {
      setSoloTrackId(null);
    } else {
      setSoloTrackId(instId);
    }
    if (isPlaying) {
      handleStopEnsemble();
    }
  };

  // Presets
  const applyPreset = (preset: 'all' | 'wood' | 'brass-bass' | 'rhythm' | 'introit') => {
    handleStopEnsemble();
    setSoloTrackId(null);

    const newState: { [id: string]: boolean } = {};
    INSTRUMENTS_DATA.forEach((i) => {
      if (preset === 'all') {
        newState[i.id] = true;
      } else if (preset === 'wood') {
        newState[i.id] = i.familia === 'vent-fusta';
      } else if (preset === 'brass-bass') {
        newState[i.id] = i.familia === 'vent-metall' || i.familia === 'corda';
      } else if (preset === 'rhythm') {
        newState[i.id] = i.id === 'flabiol-tambori' || i.id === 'contrabaix';
      } else if (preset === 'introit') {
        newState[i.id] = i.id === 'flabiol-tambori';
      }
    });
    setTracksState(newState);
  };

  // Clean up audio when leaving component
  useEffect(() => {
    return () => {
      coblaAudio.stopAll();
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Sound Lab Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-sky-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Laboratori de Sons Oficial
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              🎧 El Laboratori de Sons de la Cobla
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base mt-2 leading-relaxed">
              Escolta les gravacions autèntiques de la cobla procedents de la llista oficial de YouTube de <strong>SomSardana</strong>. Selecciona qualsevol instrument o secció per veure com sona en directe!
            </p>
          </div>

          <a
            href={COBLA_YOUTUBE_PLAYLIST.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition self-start md:self-center shrink-0"
          >
            <Film className="w-4 h-4" />
            <span>Obre la Llista a YouTube</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* SECTION 1: OFFICIAL YOUTUBE PLAYLIST PLAYER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-red-200 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl shadow-sm">
              📺
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Llista Oficial de SomSardana: Els Instruments de la Cobla
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                10 vídeos curts per reconèixer el so i la posició exacta de cada instrument
              </p>
            </div>
          </div>
        </div>

        {/* Track selection chips */}
        <div className="space-y-2">
          <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Tria quin instrument o secció vols escoltar:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {COBLA_YOUTUBE_PLAYLIST.tracks.map((track) => {
              const isSelected = selectedTrack.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-red-500 border-red-600 text-white shadow-md scale-102 ring-2 ring-red-300'
                      : 'bg-slate-50 hover:bg-red-50 border-slate-200 hover:border-red-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{track.icona}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-black ${
                      isSelected ? 'bg-red-700 text-red-100' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {track.durada}
                    </span>
                  </div>
                  <div className="font-black text-xs leading-tight line-clamp-2">
                    {track.nom}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Player Card */}
        <div className="bg-slate-900 rounded-3xl p-4 md:p-6 text-white grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-xl border-2 border-red-500/40">
          <div className="lg:col-span-7">
            <CoblaYouTubePlayer
              key={selectedTrack.youtubeId}
              youtubeId={selectedTrack.youtubeId}
              title={selectedTrack.nom}
              durada={selectedTrack.durada}
              autoplay={true}
              showInfo={false}
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider">
              <Film className="w-3.5 h-3.5" />
              Vídeo Seleccionat
            </div>

            <div>
              <div className="text-3xl mb-1">{selectedTrack.icona}</div>
              <h4 className="text-2xl font-black text-white leading-tight">
                {selectedTrack.nom}
              </h4>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                {selectedTrack.descripcio}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consell didàctic:</span>
              </div>
              <p>
                Fixa't en com vibra l'instrument i en la posició de les mans del músic. La sardana combina la fusta i el metall amb una precisió rítmica única!
              </p>
            </div>

            <a
              href={`https://www.youtube.com/watch?v=${selectedTrack.youtubeId}&list=PLYrIVykkWT9JwPK8_NMxV6IdckZMvvDLo`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 hover:underline"
            >
              <span>Veure aquest clip directament a YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* SECTION 2: SYNTHESIZED MULTI-TRACK MIXER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-sky-200 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl shadow-sm">
              🎛️
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Taula de Mescles Virtual de la Cobla
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Activa o silencia pistes per escoltar com s’entrellacen les melodies d’una sardana
              </p>
            </div>
          </div>

          {/* Master Play / Stop Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayEnsemble}
              className={`px-6 py-3 rounded-2xl font-black text-base shadow-md transition flex items-center gap-2.5 active:scale-95 ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Aturar Música</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Tocar Tema Sardana</span>
                </>
              )}
            </button>

            <button
              onClick={handleStopEnsemble}
              disabled={!isPlaying}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition active:scale-90"
              title="Aturar tot"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-sky-600" />
            Presets d'escolta:
          </span>

          <button
            onClick={() => applyPreset('all')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Tota la Cobla
          </button>
          <button
            onClick={() => applyPreset('wood')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition"
          >
            Només Fustes (Davant)
          </button>
          <button
            onClick={() => applyPreset('brass-bass')}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition"
          >
            Només Metall i Contrabaix (Darrere)
          </button>
          <button
            onClick={() => applyPreset('rhythm')}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition"
          >
            Secció Rítmica (Tamborí + Contrabaix)
          </button>
          <button
            onClick={() => applyPreset('introit')}
            className="px-3 py-1.5 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-yellow-800 text-xs font-bold transition"
          >
            L’Introit (Flabiol sol)
          </button>
        </div>

        {/* Multi-track Channel Strips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {INSTRUMENTS_DATA.map((inst) => {
            const isMuted = !tracksState[inst.id];
            const isSolo = soloTrackId === inst.id;

            const familyBadge =
              inst.familia === 'vent-fusta'
                ? 'bg-emerald-100 text-emerald-800'
                : inst.familia === 'vent-metall'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-sky-100 text-sky-800';

            return (
              <div
                key={inst.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isSolo
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                    : isMuted
                    ? 'bg-slate-50/60 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl shrink-0">{inst.icona}</span>
                  <div className="min-w-0">
                    <div className="font-black text-sm text-slate-800 truncate">
                      {inst.nom}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${familyBadge}`}>
                        {inst.fila === 1 ? '1a Fila' : '2a Fila'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold truncate">
                        {inst.timbres.split(',')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleSolo(inst.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition ${
                      isSolo
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                    }`}
                    title="Solo: Escolta només aquest instrument"
                  >
                    SOLO
                  </button>

                  <button
                    onClick={() => toggleMute(inst.id)}
                    className={`p-2 rounded-xl text-xs font-black transition ${
                      isMuted
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                    title={isMuted ? 'Activar pista' : 'Silenciar pista (Mute)'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Speed / Tempo slider */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <span>Velocitat de la Sardana (Tempo):</span>
            <span className="font-mono text-sm font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {tempo} BPM
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <span className="text-[11px] text-slate-400">Tranquil·la</span>
            <input
              type="range"
              min="80"
              max="140"
              step="5"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">Vivaç</span>
          </div>
        </div>

      </div>

    </div>
  );
};
