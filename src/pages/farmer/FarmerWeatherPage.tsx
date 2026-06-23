import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Cloud, ThermometerSnowflake, Droplets, Wind, Activity, AlertTriangle, Info, CloudRain, Sun } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fetchCurrentWeather, fetchWeatherForecast, analyzeWeatherRisk } from '@/lib/weather';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FarmerWeatherPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [risk, setRisk] = useState<any>(null);

  useEffect(() => {
    if (user && profile) {
      loadData();
    }
  }, [user, profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      const lat = profile?.latitude || -7.2036;
      const lon = profile?.longitude || 109.9048;

      // 1. Fetch Forecast & Risk
      const current = await fetchCurrentWeather(lat, lon);
      const forecastData = await fetchWeatherForecast(lat, lon, 7);
      setForecast(forecastData);
      setRisk(analyzeWeatherRisk(current, forecastData));

      // 2. Fetch Telemetry History
      const { data: telemetryData } = await supabase
        .from('sensor_telemetry')
        .select('*')
        .eq('farmer_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(24);

      // Format for Recharts
      if (telemetryData) {
        // Reverse so that the chart plots from oldest to newest (left to right)
        const sortedData = telemetryData.reverse();
        const formatted = sortedData.map((d: any) => ({
          time: new Date(d.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          suhu: d.temperature,
          kelembapan: d.humidity,
          tanah: d.soil_moisture,
          cahaya: d.light_intensity
        }));
        setTelemetry(formatted);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Menganalisis data cuaca dan IoT..." />;

  const isFrostRisk = risk?.alertType === 'frost';

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
            <Cloud className="w-8 h-8 text-emerald-400" />
            Pusat Kendali Cuaca Pintar
          </h1>
          <p className="text-slate-400 mt-1">
            Pantau anomali cuaca, telemetri lahan, dan dapatkan rekomendasi cerdas.
          </p>
        </div>

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
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100">Telemetri IoT Lahan (24 Jam Terakhir)</h2>
          </div>
          
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
