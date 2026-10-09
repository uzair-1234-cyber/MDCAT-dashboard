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
    name: 'MDCAT PREP',
    tagline: 'MEDICAL EDUCATION',
    moodDescription: 'Official MDCAT Prep Medical Education Platform',
    accentColor: '#00A896',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-400',
    borderColor: 'border-teal-500/40',
  },
  relentless: {
    id: 'relentless',
    name: 'MDCAT PREP',
    tagline: 'TOP MERIT PREP',
    moodDescription: 'MDCAT Top Merit Preparation',
    accentColor: '#00A896',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-400',
    borderColor: 'border-teal-500/40',
  },
  neuro: {
    id: 'neuro',
    name: 'MDCAT PREP',
    tagline: 'MEDICAL SCIENCE',
    moodDescription: 'Analytical Medical Science',
    accentColor: '#00A896',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-400',
    borderColor: 'border-teal-500/40',
  },
  royalty: {
    id: 'royalty',
    name: 'MDCAT PREP',
    tagline: 'FUTURE DOCTOR',
    moodDescription: 'Medical Aspirant Command Center',
    accentColor: '#00A896',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-400',
    borderColor: 'border-teal-500/40',
  },
  midnight: {
    id: 'midnight',
    name: 'MDCAT PREP',
    tagline: 'MDCAT REVISION',
    moodDescription: 'Medical Revision Portal',
    accentColor: '#00A896',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-400',
    borderColor: 'border-teal-500/40',
  },
  minimal: {
    id: 'minimal',
    name: 'MDCAT PREP',
    tagline: 'CLINICAL STUDY',
    moodDescription: 'Clean Medical Portal',
    accentColor: '#00A896',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-400',
    borderColor: 'border-teal-500/40',
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

/** 
 * Pixel-perfect SVG Emblem matching the user's uploaded MDCAT Prep logo:
 * - Open Book with layered cyan/teal and navy pages
 * - Navy Blue Stethoscope with binaurals and angled chest piece
 * - Medical Cross with white Heartbeat / ECG pulse
 */
export const MdcatEmblemSvg: React.FC<IconProps> = ({ className = 'w-full h-full', size }) => (
  <svg
    viewBox="0 0 500 400"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="embCrossG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00C9A7" />
        <stop offset="100%" stopColor="#0081A7" />
      </linearGradient>
      <linearGradient id="embTopG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00BFA5" />
        <stop offset="100%" stopColor="#008F9B" />
      </linearGradient>
      <linearGradient id="embMidG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0096C7" />
        <stop offset="100%" stopColor="#0077B6" />
      </linearGradient>
    </defs>

    {/* Open Book Pages (Left & Right) */}
    <g id="open-book">
      {/* Left Pages */}
      <path d="M 245 285 C 195 240 145 200 135 195 L 180 220 C 205 242 230 265 245 285 Z" fill="#00B4D8" />
      <path d="M 245 282 C 185 220 145 190 132 188 L 175 195 C 205 222 232 255 245 282 Z" fill="url(#embTopG)" />
      <path d="M 246 295 C 190 260 145 235 115 225 L 170 235 C 205 258 232 280 246 295 Z" fill="url(#embMidG)" />
      <path d="M 248 308 C 185 275 135 258 100 252 C 120 268 180 295 245 320 Z" fill="#0B2545" />
      <path d="M 248 290 C 200 238 148 215 130 208 C 120 225 110 242 100 252 C 150 262 205 282 245 315 Z" fill="#0077B6" />

      {/* Right Pages */}
      <path d="M 255 285 C 305 240 355 200 365 195 L 320 220 C 295 242 270 265 255 285 Z" fill="#00B4D8" />
      <path d="M 255 282 C 315 220 355 190 368 188 L 325 195 C 295 222 268 255 255 282 Z" fill="url(#embTopG)" />
      <path d="M 254 295 C 310 260 355 235 385 225 L 330 235 C 295 258 268 280 254 295 Z" fill="url(#embMidG)" />
      <path d="M 252 308 C 315 275 365 258 400 252 C 380 268 320 295 255 320 Z" fill="#0B2545" />
      <path d="M 252 290 C 300 238 352 215 370 208 C 380 225 390 242 400 252 C 350 262 295 282 255 315 Z" fill="#0077B6" />

      {/* Center Spine */}
      <path d="M 250 286 L 244 316 L 250 324 L 256 316 Z" fill="#0B2545" />
    </g>

    {/* Stethoscope */}
    <g id="stethoscope">
      <path d="M 215 78 C 215 70 225 70 225 78 C 225 90 200 95 190 125 C 180 155 195 210 240 232 C 255 240 265 255 255 270 C 250 276 242 270 240 255 C 235 242 225 235 210 225 C 175 200 162 145 178 110 C 190 85 205 78 215 78 Z" fill="#0B2545" />
      <path d="M 285 78 C 285 70 275 70 275 78 C 275 90 300 95 310 125 C 318 150 310 190 285 218 C 272 232 260 245 255 268 C 265 255 278 240 295 220 C 325 188 335 145 322 110 C 310 85 295 78 285 78 Z" fill="#0B2545" />

      {/* Ear Tips */}
      <ellipse cx="218" cy="74" rx="14" ry="10" transform="rotate(-15 218 74)" fill="#0B2545" />
      <ellipse cx="282" cy="74" rx="14" ry="10" transform="rotate(15 282 74)" fill="#0B2545" />

      {/* Center Tubing Loop */}
      <path d="M 235 215 C 238 238 245 260 250 270 C 255 260 262 238 265 215" stroke="#0B2545" strokeWidth="15" strokeLinecap="round" fill="none" />

      {/* Chest Piece / Diaphragm */}
      <path d="M 268 255 L 328 178" stroke="#0B2545" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M 322 185 L 338 165" stroke="#0B2545" strokeWidth="16" strokeLinecap="round" fill="none" />
      <circle cx="344" cy="158" r="24" fill="#0B2545" />
      <circle cx="344" cy="158" r="19" fill="#FFFFFF" />
      <circle cx="344" cy="158" r="14" fill="url(#embTopG)" />
      <circle cx="344" cy="158" r="4" fill="#0B2545" />
    </g>

    {/* Medical Cross with ECG Pulse */}
    <g id="medical-cross" transform="translate(250, 142)">
      <path
        d="M -17 -42 L 17 -42 C 22 -42, 22 -42, 22 -37 L 22 -17 L 42 -17 C 47 -17, 47 -17, 47 -12 L 47 12 C 47 17, 47 17, 42 17 L 22 17 L 22 37 C 22 42, 22 42, 17 42 L -17 42 C -22 42, -22 42, -22 37 L -22 17 L -42 17 C -47 17, -47 17, -47 12 L -47 -12 C -47 -17, -47 -17, -42 -17 L -22 -17 L -22 -37 C -22 -42, -22 -42, -17 -42 Z"
        fill="url(#embCrossG)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      <path
        d="M -42 0 L -24 0 L -18 8 L -9 -24 L 2 28 L 11 -8 L 17 0 L 42 0"
        stroke="#FFFFFF"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  </svg>
);

/** 
 * Official MDCAT Prep Emblem component embedded in a clean white badge 
 * so it pops with high contrast on any background (dark green, dark navy, or light).
 */
export const SimpleMedicalEmblem: React.FC<IconProps> = ({ className = 'w-9 h-9', size }) => {
  return (
    <div
      className={`${className} rounded-xl bg-white p-1 shadow-sm border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform`}
      style={size ? { width: size, height: size } : undefined}
      title="MDCAT Prep Medical Emblem"
    >
      <MdcatEmblemSvg className="w-full h-full object-contain" />
    </div>
  );
};

// Backwards compatibility shims
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
  variant?: 'horizontal' | 'badge' | 'card';
  textTone?: 'auto' | 'light' | 'dark';
}

export const MedicalLogo: React.FC<MedicalLogoProps> = ({
  size = 'md',
  iconOnly = false,
  onClick,
  className = '',
  variant = 'horizontal',
  textTone = 'auto',
}) => {
  const sizeConfigs = {
    sm: {
      emblemClass: 'w-7 h-7 sm:w-8 sm:h-8',
      titleClass: 'text-sm font-black',
      tagClass: 'text-[9px] font-bold tracking-widest',
      containerGap: 'gap-2',
      lineWidth: 'w-3',
    },
    md: {
      emblemClass: 'w-9 h-9 sm:w-10 sm:h-10',
      titleClass: 'text-base sm:text-lg font-black',
      tagClass: 'text-[10px] font-bold tracking-widest',
      containerGap: 'gap-2.5',
      lineWidth: 'w-4',
    },
    lg: {
      emblemClass: 'w-11 h-11 sm:w-12 sm:h-12',
      titleClass: 'text-xl sm:text-2xl font-black',
      tagClass: 'text-[11px] font-bold tracking-widest',
      containerGap: 'gap-3',
      lineWidth: 'w-5',
    },
    xl: {
      emblemClass: 'w-16 h-16 sm:w-20 sm:h-20',
      titleClass: 'text-2xl sm:text-3xl font-black',
      tagClass: 'text-xs font-bold tracking-widest',
      containerGap: 'gap-4',
      lineWidth: 'w-6',
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
        title="MDCAT PREP"
      >
        <SimpleMedicalEmblem className={cfg.emblemClass} />
      </div>
    );
  }

  // Full square card variant matching the user's uploaded image exactly
  if (variant === 'card') {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md ${
          onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
        } ${className}`}
      >
        <div className="w-36 h-28 sm:w-44 sm:h-34 mb-2">
          <MdcatEmblemSvg className="w-full h-full object-contain" />
        </div>
        <div className="text-center">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2545] font-sans block leading-none">
            MDCAT
          </span>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-0.5 w-7 bg-[#00A896] rounded-full inline-block" />
            <span className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-[#00A896] uppercase">
              PREP
            </span>
            <span className="h-0.5 w-7 bg-[#00A896] rounded-full inline-block" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${cfg.containerGap} select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      title="MDCAT PREP - Medical Education Platform"
    >
      {/* Official Emblem Badge */}
      <div className="shrink-0 transition-transform duration-200 hover:scale-105">
        <SimpleMedicalEmblem className={cfg.emblemClass} />
      </div>

      {/* Typography: MDCAT — PREP — */}
      <div className="min-w-0 flex flex-col text-left">
        <div className="leading-none">
          <span
            className={`${cfg.titleClass} tracking-tight font-black font-sans ${
              textTone === 'light'
                ? 'text-white'
                : textTone === 'dark'
                ? 'text-slate-950'
                : 'text-slate-950 dark:text-white'
            }`}
          >
            MDCAT
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1 leading-none">
          <span
            className={`h-0.5 ${cfg.lineWidth} rounded-full inline-block ${
              textTone === 'light'
                ? 'bg-teal-400/80'
                : textTone === 'dark'
                ? 'bg-[#00A896]'
                : 'bg-[#00A896] dark:bg-teal-400/80'
            }`}
          />
          <span
            className={`${cfg.tagClass} font-extrabold uppercase tracking-[0.2em] ${
              textTone === 'light'
                ? 'text-teal-300'
                : textTone === 'dark'
                ? 'text-[#00A896]'
                : 'text-[#00A896] dark:text-teal-300'
            }`}
          >
            PREP
          </span>
          <span
            className={`h-0.5 ${cfg.lineWidth} rounded-full inline-block ${
              textTone === 'light'
                ? 'bg-teal-400/80'
                : textTone === 'dark'
                ? 'bg-[#00A896]'
                : 'bg-[#00A896] dark:bg-teal-400/80'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
