import React, { createContext, useContext, useState } from 'react';

export type LogoMood = 'healer' | 'relentless' | 'neuro' | 'royalty' | 'midnight' | 'minimal';

export interface LogoMoodInfo {
  id: LogoMood;
  name: string;
  tagline: string;
  moodDescription: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const LOGO_MOODS: Record<LogoMood, LogoMoodInfo> = {
  healer: {
    id: 'healer',
    name: 'MediPrep',
    tagline: 'MDCAT & MEDICAL STUDY',
    moodDescription: 'Official Medical Study Command Center',
    accentColor: '#10B981',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
  },
  relentless: {
    id: 'relentless',
    name: 'MediPrep',
    tagline: 'MDCAT TOP MERIT',
    moodDescription: 'MDCAT Top Merit Preparation',
    accentColor: '#10B981',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
  },
  neuro: {
    id: 'neuro',
    name: 'MediPrep',
    tagline: 'MDCAT & MEDICAL STUDY',
    moodDescription: 'Analytical Medical Science',
    accentColor: '#10B981',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
  },
  royalty: {
    id: 'royalty',
    name: 'MediPrep',
    tagline: 'FUTURE DOCTOR',
    moodDescription: 'Medical Aspirant Command Center',
    accentColor: '#10B981',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
  },
  midnight: {
    id: 'midnight',
    name: 'MediPrep',
    tagline: 'MDCAT REVISION',
    moodDescription: 'Medical Revision Portal',
    accentColor: '#10B981',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
  },
  minimal: {
    id: 'minimal',
    name: 'MediPrep',
    tagline: 'CLINICAL STUDY',
    moodDescription: 'Clean Medical Portal',
    accentColor: '#10B981',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
  },
};

interface LogoMoodContextType {
  mood: LogoMood;
  setMood: (mood: LogoMood) => void;
  moodInfo: LogoMoodInfo;
}

const LogoMoodContext = createContext<LogoMoodContextType>({
  mood: 'healer',
  setMood: () => {},
  moodInfo: LOGO_MOODS.healer,
});

export const LogoMoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mood, setMood] = useState<LogoMood>('healer');
  return (
    <LogoMoodContext.Provider value={{ mood, setMood, moodInfo: LOGO_MOODS.healer }}>
      {children}
    </LogoMoodContext.Provider>
  );
};

export const useLogoMood = () => useContext(LogoMoodContext);

interface IconProps {
  className?: string;
  size?: number;
}

/** Simple, pristine medical emblem with fallback to clean SVG */
export const SimpleMedicalEmblem: React.FC<IconProps> = ({ className = 'w-9 h-9', size }) => {
  const [imageError, setImageError] = useState(false);

  if (!imageError) {
    return (
      <img
        src="/logo.jpg"
        alt="MediPrep Logo"
        onError={() => setImageError(true)}
        className={`${className} object-contain rounded-xl shadow-xs border border-emerald-500/30 bg-white/90 dark:bg-slate-900 shrink-0`}
        style={size ? { width: size, height: size } : undefined}
      />
    );
  }

  // Graceful fallback: Clean medical cross & stethoscope SVG
  return (
    <div
      className={`${className} rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs border border-emerald-400/40 shrink-0`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
        <path d="M12 4v16m-8-8h16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// Shims for backwards compatibility
export const EmblemHealer = SimpleMedicalEmblem;
export const EmblemRelentless = SimpleMedicalEmblem;
export const EmblemNeuro = SimpleMedicalEmblem;
export const EmblemRoyalty = SimpleMedicalEmblem;
export const EmblemMidnight = SimpleMedicalEmblem;
export const EmblemMinimal = SimpleMedicalEmblem;

export const EMBLEM_COMPONENTS: Record<LogoMood, React.FC<IconProps>> = {
  healer: SimpleMedicalEmblem,
  relentless: SimpleMedicalEmblem,
  neuro: SimpleMedicalEmblem,
  royalty: SimpleMedicalEmblem,
  midnight: SimpleMedicalEmblem,
  minimal: SimpleMedicalEmblem,
};

export interface MedicalLogoProps {
  mood?: LogoMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  onClick?: () => void;
  showMoodPill?: boolean;
  className?: string;
}

export const MedicalLogo: React.FC<MedicalLogoProps> = ({
  size = 'md',
  iconOnly = false,
  onClick,
  className = '',
}) => {
  const sizeConfigs = {
    sm: {
      emblemClass: 'w-7 h-7 sm:w-8 sm:h-8',
      titleClass: 'text-sm font-black',
      tagClass: 'text-[9px] font-bold tracking-wider',
      containerGap: 'gap-2.5',
    },
    md: {
      emblemClass: 'w-9 h-9 sm:w-10 sm:h-10',
      titleClass: 'text-base font-black',
      tagClass: 'text-[10px] font-bold tracking-wider',
      containerGap: 'gap-3',
    },
    lg: {
      emblemClass: 'w-11 h-11 sm:w-12 sm:h-12',
      titleClass: 'text-lg sm:text-xl font-black',
      tagClass: 'text-[11px] font-bold tracking-wider',
      containerGap: 'gap-3.5',
    },
    xl: {
      emblemClass: 'w-14 h-14 sm:w-16 sm:h-16',
      titleClass: 'text-2xl sm:text-3xl font-black',
      tagClass: 'text-xs font-bold tracking-wider',
      containerGap: 'gap-4',
    },
  };

  const cfg = sizeConfigs[size];

  if (iconOnly) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex shrink-0 items-center justify-center transition-transform active:scale-95 ${
          onClick ? 'cursor-pointer hover:opacity-90' : ''
        } ${className}`}
        title="MediPrep - Medical Study Command Center"
      >
        <SimpleMedicalEmblem className={cfg.emblemClass} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${cfg.containerGap} select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      title="MediPrep - Medical Study Portal"
    >
      {/* Official Simple Logo Emblem */}
      <div className="shrink-0 transition-transform duration-200 hover:scale-105">
        <SimpleMedicalEmblem className={cfg.emblemClass} />
      </div>

      {/* Clean Wordmark Typography */}
      <div className="min-w-0 flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${cfg.titleClass} tracking-tight font-black flex items-center`}>
            <span className="text-white dark:text-white">MEDI</span>
            <span className="text-emerald-400 font-extrabold ml-0.5">PREP</span>
          </span>

          {/* Simple Medical Plus Cross */}
          <span className="text-[10px] font-black px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
            +
          </span>
        </div>

        {/* Simple Clean Medical Tagline */}
        <div className="flex items-center gap-1 mt-1 leading-none">
          <span className={`${cfg.tagClass} uppercase font-sans text-emerald-400/90 tracking-widest font-semibold truncate`}>
            MDCAT PREPARATION
          </span>
        </div>
      </div>
    </div>
  );
};
