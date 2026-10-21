import React, { useState } from 'react';
import { ExternalLink, Play, Film, Sparkles, Volume2 } from 'lucide-react';

interface Props {
  youtubeId: string;
  title: string;
  durada?: string;
  autoplay?: boolean;
  compact?: boolean;
  showInfo?: boolean;
}

export const CoblaYouTubePlayer: React.FC<Props> = ({
  youtubeId,
  title,
  durada,
  autoplay = false,
  compact = false,
  showInfo = true,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(autoplay);

  const playlistParam = '&list=PLYrIVykkWT9JwPK8_NMxV6IdckZMvvDLo';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${isLoaded ? 1 : 0}&rel=0&modestbranding=1${playlistParam}`;
  const directWatchUrl = `https://www.youtube.com/watch?v=${youtubeId}&list=PLYrIVykkWT9JwPK8_NMxV6IdckZMvvDLo`;

  return (
    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border-2 border-amber-300/60 shadow-md">
      {/* Optional Top Bar */}
      {showInfo && (
        <div className="bg-slate-800/90 px-3.5 py-2 flex items-center justify-between text-xs text-slate-200 border-b border-slate-700/60">
          <div className="flex items-center gap-1.5 min-w-0">
            <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold truncate text-white">{title}</span>
            {durada && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black shrink-0">
                {durada}
              </span>
            )}
          </div>
          <a
            href={directWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold ml-2 shrink-0 hover:underline"
            title="Obre a YouTube"
          >
            <span>YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Video Container */}
      <div className={`relative w-full ${compact ? 'aspect-video max-h-52' : 'aspect-video'}`}>
        {!isLoaded ? (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 flex flex-col items-center justify-center p-4 text-center cursor-pointer group"
               onClick={() => setIsLoaded(true)}>
            {/* Thumbnail background if available */}
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity"
              onError={(e) => {
                // hide thumbnail if not available
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

            <div className="relative z-10 flex flex-col items-center gap-2">
              <button
                type="button"
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-all"
                aria-label={`Reproduir ${title}`}
              >
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              </button>
              <div className="bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Clica per escoltar i veure el so real!</span>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* Footer attribution */}
      <div className="bg-slate-950/80 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Canal oficial <strong>@somsardana</strong></span>
        </span>
        <span className="text-[10px] text-slate-500">Gravació didàctica de cobla</span>
      </div>
    </div>
  );
};
