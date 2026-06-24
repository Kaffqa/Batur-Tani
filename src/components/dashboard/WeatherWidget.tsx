import { useEffect, useState } from 'react';
import { Thermometer, Droplets, CloudRain, Wind, Sprout, Cloud, MapPin, X, Sun } from 'lucide-react';
import { fetchCurrentWeather } from '@/lib/weather';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { supabase } from '@/lib/supabase';

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  farmerId?: string;
  onUpdateLocation?: (lat: number, lon: number) => void;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  soilMoisture: number;
  lightIntensity?: number; // Optional IoT only field
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
  farmerId,
  onUpdateLocation,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Memuat lokasi...');
  const [dataSource, setDataSource] = useState<'satellite'|'iot'>('satellite');

  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isEditing || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=id&format=json`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, isEditing]);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        setLoading(true);
        setError(null);

        let telemetry = null;

        if (farmerId) {
          // Check for recent IoT telemetry data (within last 1 hour)
          const oneHourAgo = new Date(Date.now() - 60 * 1000).toISOString();
          const { data } = await supabase
            .from('sensor_telemetry')
            .select('*')
            .eq('farmer_id', farmerId)
            .gte('created_at', oneHourAgo)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (data && !cancelled) {
            telemetry = data;
          }
        }

        if (!cancelled) {
          // ALWAYS fetch satellite data to fill the gaps (e.g., wind speed)
          const satData = await fetchCurrentWeather(latitude, longitude);
          
          if (!cancelled) {
            if (telemetry) {
              // TRUE HYBRID: Override satellite with local IoT where available
              setWeather({
                temperature: telemetry.temperature,
                humidity: telemetry.humidity,
                rainfall: telemetry.is_raining ? 15 : 0, // Mock rainfall value based on boolean
                windSpeed: satData.windSpeed, // Taken from Satellite (No IoT anemometer)
                soilMoisture: telemetry.soil_moisture,
                lightIntensity: telemetry.light_intensity,
                solarRadiation: satData.solarRadiation,
                evapotranspiration: satData.evapotranspiration,
                description: satData.description,
              });
              setDataSource('iot');
            } else {
              setWeather(satData);
              setDataSource('satellite');
            }
          }
        }
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

    async function loadLocation() {
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`);
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || 'Area Tidak Dikenali';
        if (!cancelled) setLocationName(city);
      } catch (err) {
        if (!cancelled) setLocationName('Area Tidak Dikenali');
      }
    }

    loadWeather();
    loadLocation();
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
      <div className="px-6 py-4 border-b border-white/5 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Cloud className="h-4 w-4 text-cyan-400" />
            Kondisi Cuaca Saat Ini
          </h3>
          {dataSource === 'iot' ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded bg-cyan-500/10 text-[10px] font-medium text-cyan-400 border border-cyan-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Sumber: Sensor IoT Lokal (Real-time)
            </span>
          ) : (
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-700/50 text-[10px] font-medium text-slate-400 border border-slate-600">
              Sumber: Satelit Open-Meteo
            </span>
          )}
          {isEditing ? (
            <div className="mt-2 space-y-2 relative">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-800 border border-slate-600 rounded text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="Ketik nama kota/kecamatan..."
                  autoFocus
                />
                <button onClick={() => setIsEditing(false)} className="p-1.5 bg-slate-700/50 text-slate-400 rounded hover:bg-slate-700 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {searchQuery.length >= 3 && (
                <div className="absolute z-10 w-full sm:w-64 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                  {isSearching ? (
                    <div className="px-3 py-2 text-xs text-slate-400">Mencari...</div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700/50 flex flex-col"
                        onClick={() => {
                          if (onUpdateLocation) {
                            onUpdateLocation(s.latitude, s.longitude);
                          }
                          setIsEditing(false);
                        }}
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="text-[10px] text-slate-400">{s.admin1 ? `${s.admin1}, ` : ''}{s.country}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-400">Tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {locationName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 ml-5">
                {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
              </p>
            </div>
          )}
        </div>
        {!isEditing && onUpdateLocation && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setSuggestions([]);
              setIsEditing(true);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors underline"
          >
            Ubah
          </button>
        )}
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
          label={dataSource === 'iot' ? 'Status Hujan' : 'Curah Hujan'}
          value={dataSource === 'iot' ? (weather.rainfall > 0 ? 'Ya' : 'Tidak') : weather.rainfall.toFixed(1)}
          unit={dataSource === 'iot' ? '' : 'mm'}
          severity={dataSource === 'iot' ? (weather.rainfall > 0 ? 'bad' : 'good') : getRainfallSeverity(weather.rainfall)}
        />
        <MetricCard
          icon={<Wind className="h-5 w-5" />}
          label="Kecepatan Angin"
          value={weather.windSpeed.toFixed(1)}
          unit="km/h"
          severity={getWindSeverity(weather.windSpeed)}
        />
        <MetricCard
          icon={<Sun className="h-5 w-5" />}
          label="Radiasi Matahari"
          value={dataSource === 'iot' && weather.lightIntensity !== undefined ? weather.lightIntensity.toFixed(0) : (weather.solarRadiation?.toFixed(0) || '0')}
          unit={dataSource === 'iot' ? '%' : 'W/m²'}
          severity={dataSource === 'iot' ? ((weather.lightIntensity || 0) > 20 ? 'good' : 'moderate') : ((weather.solarRadiation || 0) > 100 ? 'good' : 'moderate')}
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


