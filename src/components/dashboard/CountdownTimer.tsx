import { useEffect, useState, useRef, useCallback } from 'react';

interface CountdownTimerProps {
  deadline: string; // ISO 8601 date string
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function calculateTimeLeft(deadline: string): TimeLeft {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    totalMs: diff,
  };
}

function getUrgency(deadline: string): 'safe' | 'warning' | 'critical' | 'expired' {
  const totalDuration = new Date(deadline).getTime() - Date.now();
  if (totalDuration <= 0) return 'expired';

  // Since we don't know the original start time, use absolute thresholds:
  // < 1 hour = critical, < 6 hours = warning, otherwise safe
  const hoursLeft = totalDuration / (1000 * 60 * 60);
  if (hoursLeft < 1) return 'critical';
  if (hoursLeft < 6) return 'warning';
  return 'safe';
}

const urgencyColors = {
  safe: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-rose-400',
  expired: 'text-rose-500',
};

const urgencyBgColors = {
  safe: 'bg-emerald-500/10 border-emerald-500/20',
  warning: 'bg-amber-500/10 border-amber-500/20',
  critical: 'bg-rose-500/10 border-rose-500/20',
  expired: 'bg-rose-500/10 border-rose-500/20',
};

interface TimeUnitProps {
  value: number;
  label: string;
  urgency: string;
}

function TimeUnit({ value, label, urgency }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-2xl font-bold tabular-nums ${urgency}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({
  deadline,
  className = '',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(deadline)
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setTimeLeft(calculateTimeLeft(deadline));
  }, [deadline]);

  useEffect(() => {
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  const urgency = getUrgency(deadline);
  const isExpired = timeLeft.totalMs <= 0;
  const colorClass = urgencyColors[urgency];

  if (isExpired) {
    return (
      <div
        className={`
          inline-flex items-center gap-2 px-4 py-3 rounded-xl
          ${urgencyBgColors.expired} border
          ${className}
        `.trim()}
      >
        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-sm font-semibold text-rose-400">
          Waktu Habis
        </span>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-3 px-5 py-3 rounded-xl border
        ${urgencyBgColors[urgency]}
        ${urgency === 'critical' ? 'animate-pulse' : ''}
        ${className}
      `.trim()}
    >
      <TimeUnit
        value={timeLeft.days}
        label="Hari"
        urgency={colorClass}
      />
      <span className={`text-lg font-light ${colorClass} opacity-50`}>:</span>
      <TimeUnit
        value={timeLeft.hours}
        label="Jam"
        urgency={colorClass}
      />
      <span className={`text-lg font-light ${colorClass} opacity-50`}>:</span>
      <TimeUnit
        value={timeLeft.minutes}
        label="Menit"
        urgency={colorClass}
      />
      <span className={`text-lg font-light ${colorClass} opacity-50`}>:</span>
      <TimeUnit
        value={timeLeft.seconds}
        label="Detik"
        urgency={colorClass}
      />
    </div>
  );
}
