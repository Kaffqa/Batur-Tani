import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Cloud, ThermometerSnowflake, Droplets, Wind, Activity, AlertTriangle, Info, CloudRain, Sun, AlertCircle, CheckCircle2, MapPin, X } from 'lucide-react';
import WeatherSkeleton from '@/components/skeletons/WeatherSkeleton';
import { fetchCurrentWeather, fetchWeatherForecast, analyzeWeatherRisk } from '@/lib/weather';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function FarmerWeatherPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [risk, setRisk] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [currentWeather, setCurrentWeather] = useState<any>(null);

  const activeLat = profile?.latitude ?? -7.23;
  const activeLon = profile?.longitude ?? 109.9;

  // New states for location edit and data source
  const [locationName, setLocationName] = useState<string>('Memuat lokasi...');
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dataSource, setDataSource] = useState<'satellite'|'iot'>('satellite');

  useEffect(() => {
    if (user && profile) {
      loadData(activeLat, activeLon);
    }
  }, [user, profile, activeLat, activeLon]); 

  // Reverse Geocoding
  useEffect(() => {
    async function loadLocation() {
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${activeLat}&longitude=${activeLon}&localityLanguage=id&_t=${Date.now()}`);
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || 'Area Tidak Dikenali';
        setLocationName(city);
      } catch (err) {
        setLocationName('Area Tidak Dikenali');
      }
    }
    loadLocation();
  }, [activeLat, activeLon]);

  // Forward Geocoding (Search)
  useEffect(() => {
    if (!isEditingLoc || searchQuery.length < 3) {
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
  }, [searchQuery, isEditingLoc]);

  const handleUpdateLocation = async (newLat: number, newLon: number) => {
    if (!user) return;
    try {
      setIsEditingLoc(false);
      
      const { error } = await supabase
        .from('profiles')
        .update({ latitude: newLat, longitude: newLon })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshProfile(); 
      
      toast.success('Lokasi pantauan cuaca berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Gagal menyimpan lokasi.');
    }
  };

  const loadData = async (currentLat: number, currentLon: number) => {
    setLoading(true);
    try {
      // 1. Fetch Forecast & Risk (from Satellite)
      const current = await fetchCurrentWeather(currentLat, currentLon);
      const forecastData = await fetchWeatherForecast(currentLat, currentLon, 7);

      // 2. Fetch Telemetry History (from IoT)
      const { data: telemetryData } = await supabase
        .from('sensor_telemetry')
        .select('*')
        .eq('farmer_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(24);

      let isIoTActive = false;
      let finalCurrent = { ...current };

      // Format for Recharts
      if (telemetryData && telemetryData.length > 0) {
        setLastUpdate(new Date(telemetryData[0].created_at));
        // Reverse so that the chart plots from oldest to newest (left to right)
        const sortedData = [...telemetryData].reverse();
        const formatted = sortedData.map((d: any) => ({
          time: new Date(d.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          suhu: d.temperature,
          kelembapan: d.humidity,
          tanah: d.soil_moisture,
          cahaya: d.light_intensity
        }));
        setTelemetry(formatted);

        // Check if IoT is recently active (last 60 mins)
        const diffMs = new Date().getTime() - new Date(telemetryData[0].created_at).getTime();
        if (diffMs < 60 * 60 * 1000) {
           isIoTActive = true;
           finalCurrent.temperature = telemetryData[0].temperature;
           finalCurrent.humidity = telemetryData[0].humidity;
           finalCurrent.soilMoisture = telemetryData[0].soil_moisture;
        }
      } else {
        setTelemetry([]);
      }

      setDataSource(isIoTActive ? 'iot' : 'satellite');
      setCurrentWeather(finalCurrent);
      setForecast(forecastData);
      setRisk(analyzeWeatherRisk(finalCurrent, forecastData));

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <WeatherSkeleton />;

  const isFrostRisk = risk?.alertType === 'frost';

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
            <Cloud className="w-8 h-8 text-emerald-400" />
            Pusat Kendali Cuaca Pintar
          </h1>
          <p className="text-slate-400 mt-1">
            Pantau anomali cuaca, telemetri lahan, dan dapatkan rekomendasi cerdas.
          </p>
        </div>

        {/* Location & Data Source Control Bar */}
        <div className="glass rounded-2xl p-4 md:p-5 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-50">
          <div className="relative flex-1 max-w-md">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest font-bold">Titik Pantau Lokasi</span>
              {isEditingLoc ? (
                <div className="flex items-center gap-2 relative z-20">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Ketik nama kota/kecamatan..."
                    autoFocus
                  />
                  <button onClick={() => setIsEditingLoc(false)} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                  
                  {searchQuery.length >= 3 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                      {isSearching ? (
                        <div className="px-4 py-3 text-sm text-slate-400">Mencari lokasi...</div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 flex flex-col border-b border-slate-700/50 last:border-0"
                            onClick={() => handleUpdateLocation(s.latitude, s.longitude)}
                          >
                            <span className="font-semibold">{s.name}</span>
                            <span className="text-xs text-slate-400 mt-0.5">{s.admin1 ? `${s.admin1}, ` : ''}{s.country}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-400">Lokasi tidak ditemukan</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">{locationName}</h2>
                    <p className="text-xs text-slate-500 font-mono">{activeLat.toFixed(4)}°, {activeLon.toFixed(4)}°</p>
                  </div>
                  <button onClick={() => setIsEditingLoc(true)} className="ml-2 shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                    Ubah Koordinat
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end">
             <span className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest font-bold">Sumber Data Saat Ini</span>
             {dataSource === 'iot' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  Sensor IoT Lokal
                </div>
             ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-bold shadow-lg">
                  <Cloud className="w-4 h-4 text-slate-400" />
                  Satelit Open-Meteo
                </div>
             )}
          </div>
        </div>

        {/* Custom Weather Hero */}
        {currentWeather && (
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-8 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
              <CloudRain className="h-64 w-64" />
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Main Temp */}
              <div className="flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                  {currentWeather.rainfall > 0 ? (
                    <CloudRain className="h-12 w-12" />
                  ) : currentWeather.temperature > 30 ? (
                    <Sun className="h-12 w-12 text-amber-400" />
                  ) : (
                    <Cloud className="h-12 w-12" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-widest text-emerald-400/80 mb-1 line-clamp-1">
                    {locationName}
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black tracking-tighter text-white">
                      {currentWeather.temperature.toFixed(1)}
                    </span>
                    <span className="text-2xl font-bold text-slate-400">°C</span>
                  </div>
                  <p className="text-slate-400 mt-1 flex items-center gap-2">
                    <span>Hujan: {currentWeather.rainfall} mm</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span>Angin: {currentWeather.windSpeed} km/h</span>
                  </p>
                </div>
              </div>

              {/* Highlight Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                <div className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                  <span className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Droplets className="h-3 w-3"/> Kelembapan</span>
                  <span className="text-xl font-bold text-blue-400">{currentWeather.humidity}<span className="text-sm text-slate-500 font-normal">%</span></span>
                </div>
                <div className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                  <span className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Sun className="h-3 w-3"/> Radiasi</span>
                  <span className="text-xl font-bold text-amber-400">{currentWeather.solarRadiation}<span className="text-sm text-slate-500 font-normal"> W/m²</span></span>
                </div>
                <div className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                  <span className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Wind className="h-3 w-3"/> Angin</span>
                  <span className="text-xl font-bold text-slate-200">{currentWeather.windSpeed}<span className="text-sm text-slate-500 font-normal"> km/h</span></span>
                </div>
                <div className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                  <span className="text-xs text-slate-400 mb-1 flex items-center gap-1"><ThermometerSnowflake className="h-3 w-3"/> Tanah</span>
                  <span className="text-xl font-bold text-emerald-400">{currentWeather.soilMoisture}<span className="text-sm text-slate-500 font-normal">%</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frost Predictor Card */}
          <div className={`p-6 rounded-2xl border ${isFrostRisk ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${isFrostRisk ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                <ThermometerSnowflake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Mesin Deteksi Embun Upas</h3>
                <p className={`text-sm ${isFrostRisk ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                  {isFrostRisk ? 'Waspada Level Kritis / Tinggi' : 'Status Suhu Aman'}
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              {isFrostRisk ? risk.message : 'Suhu saat ini masih di atas ambang batas pembekuan ekstrim. Tidak ada indikasi pembentukan embun upas dalam waktu dekat.'}
            </p>
          </div>

          {/* Smart Assistant Card */}
          <div className={`p-6 rounded-2xl border ${risk?.hasRisk && !isFrostRisk ? 'bg-amber-900/20 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${risk?.hasRisk && !isFrostRisk ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {risk?.hasRisk && !isFrostRisk ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Asisten Agrikultur AI</h3>
                <p className="text-sm text-slate-400">Rekomendasi Tindakan</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-slate-300 text-sm font-medium">{risk?.message}</p>
              {risk?.recommendations?.length > 0 && (
                <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 mt-2">
                  {risk.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100">Telemetri IoT Lahan (24 Jam Terakhir)</h2>
            </div>
            
            {/* Online / Offline Status Badge */}
            {lastUpdate && (
              <div className="flex-shrink-0">
                {(() => {
                  const now = new Date();
                  const diffMs = now.getTime() - lastUpdate.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const isOffline = diffMins > 30; // Offline jika > 30 menit tidak kirim data
                  
                  let timeText = 'Baru saja';
                  if (diffMins >= 1 && diffMins < 60) timeText = `${diffMins} menit yang lalu`;
                  else if (diffMins >= 60 && diffMins < 1440) timeText = `${Math.floor(diffMins / 60)} jam yang lalu`;
                  else if (diffMins >= 1440) timeText = `${Math.floor(diffMins / 1440)} hari yang lalu`;

                  return isOffline ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-pulse">
                      <AlertCircle className="w-4 h-4" />
                      Offline (Mati sejak {timeText})
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Online (Update: {timeText})
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          {lastUpdate && (new Date().getTime() - lastUpdate.getTime()) / 60000 > 30 && (
            <div className="mb-6 p-3 rounded-xl bg-red-900/20 border border-red-500/20 text-sm text-red-300 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                <strong>Perhatian:</strong> Perangkat IoT Anda terputus. Grafik di bawah ini menampilkan rekaman data lama sebelum perangkat mati. Periksa koneksi listrik dan WiFi (hotspot) di lahan Anda.
              </p>
            </div>
          )}
          
          {telemetry.length > 0 ? (
            <div className="h-80 w-full text-sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="suhu" name="Suhu (°C)" stroke="#f87171" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="kelembapan" name="Udara (%)" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="tanah" name="Tanah (%)" stroke="#a3e635" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm bg-slate-800/30 rounded-xl border border-slate-700/30 border-dashed">
              Belum ada rekaman log data dari sensor IoT Anda.
            </div>
          )}
        </div>

        {/* 7-Day Forecast */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <Wind className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100">Radar Prakiraan Agrikultur (7-Hari)</h2>
          </div>
          
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-4 min-w-max">
              {forecast.map((day, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-colors rounded-xl p-5 w-40 flex flex-col items-center justify-center space-y-3">
                  <span className="text-sm text-slate-400 font-medium">
                    {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <div className="h-12 flex items-center justify-center">
                    {day.rainSum > 2 || day.precipitationProbability >= 50 ? (
                      <CloudRain className="w-8 h-8 text-blue-400" />
                    ) : day.temperatureMax > 30 && day.rainSum < 1 ? (
                      <Sun className="w-8 h-8 text-amber-400" />
                    ) : (
                      <Cloud className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="text-center w-full">
                    <p className="text-lg font-bold text-slate-100">{day.temperatureMax}°<span className="text-sm text-slate-500 font-normal">/{day.temperatureMin}°</span></p>
                    <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-slate-700/50 text-xs font-medium text-blue-400">
                      <Droplets className="w-3 h-3" /> {day.precipitationProbability}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
