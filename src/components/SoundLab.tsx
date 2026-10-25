import React, { useState, useEffect } from 'react';
import { COBLA_YOUTUBE_PLAYLIST, PALAU_COBLA_RECORDINGS } from '../data/instrumentsData';
import { CoblaYouTubeTrack, PalauCoblaRecording } from '../types/cobla';
import { coblaAudio, RealAudioState } from '../utils/audioEngine';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Film,
  ExternalLink,
  Disc3,
  Radio,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { CoblaYouTubePlayer } from './CoblaYouTubePlayer';

export const SoundLab: React.FC = () => {
  // Real Audio Player State (Cobla 2.0 - Palau de la Música / Cobla Sant Jordi)
  const [selectedRealTrack, setSelectedRealTrack] = useState<PalauCoblaRecording>(PALAU_COBLA_RECORDINGS[0]);
  const [realAudioFilter, setRealAudioFilter] = useState<'all' | 'solos' | 'peces'>('all');
  const [realAudioState, setRealAudioState] = useState<RealAudioState>(coblaAudio.getRealAudioState());

  // Official YouTube Tracks state
  const [selectedYouTubeTrack, setSelectedYouTubeTrack] = useState<CoblaYouTubeTrack>(COBLA_YOUTUBE_PLAYLIST.tracks[0]);

  // Subscribe to real audio playback updates
  useEffect(() => {
    const unsubscribe = coblaAudio.subscribeRealAudioState((state) => {
      setRealAudioState(state);
    });
    return () => {
      unsubscribe();
      coblaAudio.stopAll();
    };
  }, []);

  const handleToggleRealTrack = (track: PalauCoblaRecording) => {
    if (
      realAudioState.isPlaying &&
      (realAudioState.trackKey === track.id || realAudioState.audioUrl === track.audioUrl)
    ) {
      coblaAudio.stopRealAudio();
      return;
    }
    setSelectedRealTrack(track);
    coblaAudio.playRealSample(track.audioUrl, {
      previewOnly: false,
      title: `${track.titol} - ${track.peçaOriginal}`,
    });
  };

  // Filtered real recordings
  const filteredRecordings = PALAU_COBLA_RECORDINGS.filter((rec) => {
    if (realAudioFilter === 'solos') {
      return rec.familia !== 'tots';
    }
    if (realAudioFilter === 'peces') {
      return rec.familia === 'tots';
    }
    return true;
  });

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Sound Lab Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-sky-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Sons 100% Reals i Contrastats
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              🎧 L'Auditori de Sons Reals de la Cobla
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base mt-2 leading-relaxed">
              Tots els sons d'aquest laboratori són <strong>enregistraments autèntics d'estudi</strong> de la prestigiosa{' '}
              <strong>Cobla Sant Jordi - Ciutat de Barcelona</strong> (extrets de <em>Cobla 2.0</em> del Palau de la Música
              Catalana) i gravacions en directe de <strong>SomSardana</strong>. Cap so és sintètic!
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 text-xs font-black shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sons 100% Autèntics de Cobla</span>
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Palau de la Música Catalana & SomSardana
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: REAL AUDIO RECORDINGS FROM PALAU DE LA MÚSICA (COBLA 2.0) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-sky-300 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-2xl shadow-md">
              <Disc3 className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md mb-0.5">
                <span>Extret de Cobla 2.0 (Palau de la Música Catalana)</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 leading-tight">
                Enregistraments d'Estudi de la Cobla Sant Jordi
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Peces i solos reals per gaudir del so autèntic de cada instrument i de tota la cobla
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setRealAudioFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                realAudioFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Totes ({PALAU_COBLA_RECORDINGS.length})
            </button>
            <button
              onClick={() => setRealAudioFilter('solos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                realAudioFilter === 'solos'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Instruments Solistes (7)
            </button>
            <button
              onClick={() => setRealAudioFilter('peces')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                realAudioFilter === 'peces'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grans Sardanes ({PALAU_COBLA_RECORDINGS.filter((r) => r.familia === 'tots').length})
            </button>
          </div>
        </div>

        {/* Selected Real Track Player Card */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-5 md:p-7 text-white shadow-xl border-2 border-sky-400/40 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{selectedRealTrack.icona}</span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-500/40">
                  {selectedRealTrack.instrumentsDestacats}
                </span>
                <h4 className="text-2xl md:text-3xl font-black text-white mt-1 leading-tight">
                  {selectedRealTrack.titol}
                </h4>
                <div className="text-sm font-semibold text-sky-200/90 mt-0.5">
                  Peça: <span className="text-amber-300 font-bold">"{selectedRealTrack.peçaOriginal}"</span> •{' '}
                  {selectedRealTrack.autor || 'Cobla Sant Jordi'}
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{selectedRealTrack.descripcio}</p>

            {/* Live Playback Progress Bar */}
            {realAudioState.isPlaying && (
              <div className="space-y-1.5 pt-2 max-w-xl">
                <div className="flex justify-between text-[11px] font-mono text-sky-300">
                  <span>{formatSeconds(realAudioState.currentTime)}</span>
                  <span>{formatSeconds(realAudioState.duration)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-amber-400 rounded-full transition-all duration-150"
                    style={{
                      width: `${
                        realAudioState.duration > 0
                          ? Math.min(100, (realAudioState.currentTime / realAudioState.duration) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-3">
            <button
              onClick={() => handleToggleRealTrack(selectedRealTrack)}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                realAudioState.isPlaying &&
                (realAudioState.trackKey === selectedRealTrack.id ||
                  realAudioState.audioUrl === selectedRealTrack.audioUrl)
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-amber-500/20'
              }`}
            >
              {realAudioState.isPlaying &&
              (realAudioState.trackKey === selectedRealTrack.id ||
                realAudioState.audioUrl === selectedRealTrack.audioUrl) ? (
                <>
                  <Pause className="w-6 h-6 fill-current" />
                  <span>Aturar Enregistrament</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  <span>Escolta la Gravació Real</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-[11px] font-bold text-sky-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Qualitat Màster Estudi • Cobla Sant Jordi</span>
            </div>
          </div>
        </div>

        {/* Tracks Grid Selector */}
        <div className="space-y-2">
          <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Tria una cançó o instrument per escoltar el seu so real:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredRecordings.map((rec) => {
              const isSelected = selectedRealTrack.id === rec.id;
              const isCurrentlyPlaying =
                realAudioState.isPlaying &&
                (realAudioState.trackKey === rec.id || realAudioState.audioUrl === rec.audioUrl);

              return (
                <button
                  key={rec.id}
                  onClick={() => {
                    setSelectedRealTrack(rec);
                    if (!isCurrentlyPlaying) {
                      coblaAudio.playRealSample(rec.audioUrl, {
                        previewOnly: false,
                        title: `${rec.titol} - ${rec.peçaOriginal}`,
                      });
                    }
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-2 group ${
                    isCurrentlyPlaying
                      ? 'bg-sky-500 border-sky-600 text-white shadow-lg ring-2 ring-sky-300 scale-102'
                      : isSelected
                      ? 'bg-sky-50 border-sky-300 text-slate-800 shadow-sm'
                      : 'bg-slate-50 hover:bg-sky-50/60 border-slate-200 hover:border-sky-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{rec.icona}</span>
                    <div className="flex items-center gap-1.5">
                      {isCurrentlyPlaying ? (
                        <span className="px-2 py-0.5 rounded-md bg-white text-sky-700 text-[10px] font-black uppercase animate-pulse flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-spin-slow" />
                          Sonant
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-black ${
                            isSelected ? 'bg-sky-200 text-sky-900' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {rec.durada}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-black text-xs leading-snug line-clamp-1">{rec.titol}</div>
                    <div
                      className={`text-[11px] font-semibold mt-0.5 line-clamp-1 ${
                        isCurrentlyPlaying ? 'text-sky-100' : 'text-slate-500'
                      }`}
                    >
                      {rec.peçaOriginal}
                    </div>
                  </div>

                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider pt-1 border-t ${
                      isCurrentlyPlaying ? 'border-sky-400 text-sky-100' : 'border-slate-200/60 text-sky-700'
                    }`}
                  >
                    {rec.instrumentsDestacats}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: OFFICIAL YOUTUBE PLAYLIST PLAYER (SomSardana) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-red-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl shadow-sm">
              📺
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-md mb-0.5">
                <span>Extret de Som Sardana</span>
              </div>
              <h3 className="text-xl font-black text-slate-800">
                Llista Oficial de Vídeos Didàctics dels Instruments
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                10 clips curts per reconèixer la tècnica i la posició exacta de cada músic a l'escenari
              </p>
            </div>
          </div>

          <a
            href={COBLA_YOUTUBE_PLAYLIST.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition self-start sm:self-auto shrink-0"
          >
            <Film className="w-4 h-4" />
            <span>Obre llista a YouTube</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </a>
        </div>

        {/* Track selection chips */}
        <div className="space-y-2">
          <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Tria quin instrument o secció vols veure en vídeo:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {COBLA_YOUTUBE_PLAYLIST.tracks.map((track) => {
              const isSelected = selectedYouTubeTrack.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedYouTubeTrack(track)}
                  className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-red-500 border-red-600 text-white shadow-md scale-102 ring-2 ring-red-300'
                      : 'bg-slate-50 hover:bg-red-50 border-slate-200 hover:border-red-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{track.icona}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-black ${
                        isSelected ? 'bg-red-700 text-red-100' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {track.durada}
                    </span>
                  </div>
                  <div className="font-black text-xs leading-tight line-clamp-2">{track.nom}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Player Card */}
        <div className="bg-slate-900 rounded-3xl p-4 md:p-6 text-white grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-xl border-2 border-red-500/40">
          <div className="lg:col-span-7">
            <CoblaYouTubePlayer
              key={selectedYouTubeTrack.youtubeId}
              youtubeId={selectedYouTubeTrack.youtubeId}
              title={selectedYouTubeTrack.nom}
              durada={selectedYouTubeTrack.durada}
              autoplay={false}
              showInfo={false}
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider">
              <Film className="w-3.5 h-3.5" />
              Vídeo Didàctic
            </div>

            <div>
              <div className="text-3xl mb-1">{selectedYouTubeTrack.icona}</div>
              <h4 className="text-2xl font-black text-white leading-tight">{selectedYouTubeTrack.nom}</h4>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">{selectedYouTubeTrack.descripcio}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consell didàctic:</span>
              </div>
              <p>
                Fixa't en com es bufa o es pessiga cada instrument i en com dialoguen les dues files de músics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
