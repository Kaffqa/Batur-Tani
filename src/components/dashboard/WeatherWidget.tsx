import { useEffect, useState } from 'react';
import { Thermometer, Droplets, CloudRain, Wind, Sprout, Cloud } from 'lucide-react';
import { fetchCurrentWeather } from '@/lib/weather';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  soilMoisture: number;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  severity: 'good' | 'moderate' | 'bad';
}

const severityColors = {
  good: 'text-emerald-400',
  moderate: 'text-amber-400',
  bad: 'text-rose-400',
};

function MetricCard({ icon, label, value, unit, severity }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
      <div className={`shrink-0 ${severityColors[severity]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 truncate">{label}</p>
        <p className={`text-lg font-bold tabular-nums ${severityColors[severity]}`}>
          {value}
          <span className="text-xs font-normal text-slate-500 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}

function getTemperatureSeverity(t: number): 'good' | 'moderate' | 'bad' {
  if (t >= 20 && t <= 32) return 'good';
  if (t >= 15 && t <= 38) return 'moderate';
  return 'bad';
}

function getHumiditySeverity(h: number): 'good' | 'moderate' | 'bad' {
  if (h >= 40 && h <= 80) return 'good';
  if (h >= 25 && h <= 90) return 'moderate';
  return 'bad';
}

function getRainfallSeverity(r: number): 'good' | 'moderate' | 'bad' {
  if (r < 5) return 'good';
  if (r < 20) return 'moderate';
  return 'bad';
}

function getWindSeverity(w: number): 'good' | 'moderate' | 'bad' {
  if (w < 20) return 'good';
  if (w < 40) return 'moderate';
  return 'bad';
}

function getSoilMoistureSeverity(s: number): 'good' | 'moderate' | 'bad' {
  if (s >= 20 && s <= 60) return 'good';
  if (s >= 10 && s <= 80) return 'moderate';
  return 'bad';
}

export default function WeatherWidget({
  latitude,
  longitude,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCurrentWeather(latitude, longitude);
        if (!cancelled) setWeather(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Gagal memuat data cuaca'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-900/40 to-emerald-900/40 border border-slate-700/50 p-6">
        <LoadingSpinner size="md" text="Memuat data cuaca..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-900/40 to-emerald-900/40 border border-slate-700/50 p-6">
        <div className="text-center">
          <CloudRain className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-rose-400">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchCurrentWeather(latitude, longitude)
                .then(setWeather)
                .catch((e) =>
                  setError(
                    e instanceof Error ? e.message : 'Gagal memuat data cuaca'
                  )
                )
                .finally(() => setLoading(false));
            }}
            className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 underline"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-900/40 to-emerald-900/40 border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Cloud className="h-4 w-4 text-cyan-400" />
          Kondisi Cuaca Saat Ini
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
        </p>
      </div>

      {/* Metrics grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetricCard
          icon={<Thermometer className="h-5 w-5" />}
          label="Suhu"
          value={weather.temperature.toFixed(1)}
          unit="°C"
          severity={getTemperatureSeverity(weather.temperature)}
        />
        <MetricCard
          icon={<Droplets className="h-5 w-5" />}
          label="Kelembapan"
          value={weather.humidity.toFixed(0)}
          unit="%"
          severity={getHumiditySeverity(weather.humidity)}
        />
        <MetricCard
          icon={<CloudRain className="h-5 w-5" />}
          label="Curah Hujan"
          value={weather.rainfall.toFixed(1)}
          unit="mm"
          severity={getRainfallSeverity(weather.rainfall)}
        />
        <MetricCard
          icon={<Wind className="h-5 w-5" />}
          label="Kecepatan Angin"
          value={weather.windSpeed.toFixed(1)}
          unit="km/h"
          severity={getWindSeverity(weather.windSpeed)}
        />
        <MetricCard
          icon={<Sprout className="h-5 w-5" />}
          label="Kelembapan Tanah"
          value={weather.soilMoisture.toFixed(0)}
          unit="%"
          severity={getSoilMoistureSeverity(weather.soilMoisture)}
        />
      </div>
    </div>
  );
}


