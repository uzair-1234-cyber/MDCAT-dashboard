import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Flame, Stethoscope, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogMinutes: (minutes: number) => Promise<void>;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  onLogMinutes,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [initialSeconds, setInitialSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionSubject, setSessionSubject] = useState<'Biology' | 'Chemistry' | 'Physics' | 'English'>('Biology');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      handleCompleteSession();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  if (!isOpen) return null;

  const handleCompleteSession = async () => {
    try {
      setIsSaving(true);
      const studiedSeconds = initialSeconds - secondsLeft;
      const minutes = Math.max(Math.round(studiedSeconds / 60), 1);
      await onLogMinutes(minutes);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const handlePreset = (minutes: number) => {
    setIsActive(false);
    setInitialSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200 mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
            Medical Deep Study Session
          </span>
          <h3 className="text-xl font-bold text-slate-900">Focused Study Session</h3>
          <p className="text-xs text-slate-500 mt-1">
            "Your parents' dream needs your consistency. One chapter closer."
          </p>
        </div>

        {/* Subject Picker */}
        <div className="flex justify-center gap-2 mb-6">
          {(['Biology', 'Chemistry', 'Physics', 'English'] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setSessionSubject(sub)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                sessionSubject === sub
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Circular Timer Display */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative w-48 h-48 rounded-full border-8 border-slate-100 flex items-center justify-center shadow-inner">
            <div
              className="absolute inset-0 rounded-full border-8 border-cyan-500 transition-all duration-1000"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${progress > 25 ? '100% 0%,' : ''} ${
                  progress > 50 ? '100% 100%,' : ''
                } ${progress > 75 ? '0% 100%,' : ''} ${progress >= 100 ? '0% 0%,' : ''} ${
                  progress < 25
                    ? `${50 + 50 * Math.tan((progress / 100) * 2 * Math.PI)}% 0%`
                    : '100% 100%'
                })`,
              }}
            />
            <div className="text-center z-10">
              <span className="text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
                {formatTime(secondsLeft)}
              </span>
              <span className="block text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                {sessionSubject} Focus
              </span>
            </div>
          </div>
        </div>

        {/* Preset Duration Buttons */}
        <div className="flex items-center justify-center gap-2 mb-6 text-xs font-medium">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => handlePreset(mins)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                initialSeconds === mins * 60
                  ? 'bg-cyan-50 text-cyan-700 border-cyan-300 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={() => handlePreset(initialSeconds / 60)}
            className="p-3 text-slate-500 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCompleteSession}
            disabled={isSaving || initialSeconds - secondsLeft < 30}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50 transition-all"
            title="Finish and log time"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Finish & Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};
