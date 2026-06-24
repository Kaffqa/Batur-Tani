// ============================================================
// Batur Tani — Weather Intelligence (Open-Meteo API)
// Free, open-source weather API — no API key required
// Docs: https://open-meteo.com/en/docs
// ============================================================

import type { WeatherData, AlertType, Severity } from '@/types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// ------------------------------------------------------------
// Current Weather
// ------------------------------------------------------------

/**
 * Fetch current weather conditions for a given coordinate.
 *
 * Returns temperature, humidity, rainfall, wind speed, soil moisture,
 * and a human-readable description.
 */
export async function fetchCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'rain',
      'wind_speed_10m',
      'soil_moisture_0_to_7cm',
      'shortwave_radiation',
    ].join(','),
    timezone: 'auto',
  });

  const response = await fetch(`${BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const current = data.current;

  const temperature = current.temperature_2m ?? 0;
  const humidity = current.relative_humidity_2m ?? 0;
  const rainfall = current.rain ?? 0;
  const windSpeed = current.wind_speed_10m ?? 0;
  const soilMoisture = current.soil_moisture_0_to_7cm ?? 0;
  const solarRadiation = current.shortwave_radiation ?? 0;

  return {
    temperature,
    humidity,
    rainfall,
    windSpeed,
    soilMoisture,
    solarRadiation,
    // ET₀ is not available in current data — default to 0, use forecast for daily ET₀
    evapotranspiration: 0,
    description: generateWeatherDescription(temperature, humidity, rainfall),
  };
}

// ------------------------------------------------------------
// Weather Forecast
// ------------------------------------------------------------

/** Daily forecast entry returned by `fetchWeatherForecast` */
export interface ForecastDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  rainSum: number;
  precipitationProbability: number;
  evapotranspiration: number;
}

/**
 * Fetch multi-day weather forecast for a given coordinate.
 *
 * @param lat  — Latitude
 * @param lon  — Longitude
 * @param days — Number of forecast days (1–16, default 7)
 */
export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  days: number = 7
): Promise<ForecastDay[]> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'rain_sum',
      'precipitation_probability_max',
      'et0_fao_evapotranspiration',
    ].join(','),
    timezone: 'auto',
    forecast_days: Math.min(Math.max(days, 1), 16).toString(),
  });

  const response = await fetch(`${BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const daily = data.daily;

  // Map the parallel arrays into an array of ForecastDay objects
  const forecastDays: ForecastDay[] = (daily.time as string[]).map(
    (date: string, i: number) => ({
      date,
      temperatureMax: daily.temperature_2m_max[i] ?? 0,
      temperatureMin: daily.temperature_2m_min[i] ?? 0,
      rainSum: daily.rain_sum[i] ?? 0,
      precipitationProbability: daily.precipitation_probability_max[i] ?? 0,
      evapotranspiration: daily.et0_fao_evapotranspiration[i] ?? 0,
    })
  );

  return forecastDays;
}

// ------------------------------------------------------------
// Weather Risk Analysis
// ------------------------------------------------------------

/** Result of the weather risk analysis */
export interface WeatherRiskAssessment {
  hasRisk: boolean;
  alertType: AlertType | null;
  severity: Severity;
  message: string;
  recommendations: string[];
}

/**
 * Analyze current weather and forecast data to determine agricultural risks.
 *
 * Checks for:
 * - Heavy rain (>50mm/day or high probability + high cumulative rain)
 * - Frost (temperature below 2°C)
 * - Drought (low soil moisture + low rainfall forecast + high ET₀)
 * - Early harvest advisory (based on upcoming adverse conditions)
 */
export function analyzeWeatherRisk(
  current: WeatherData,
  forecast: ForecastDay[]
) : WeatherRiskAssessment {

  // --- Frost Check ---
  if (current.temperature <= 2) {
    return {
      hasRisk: true,
      alertType: 'frost',
      severity: current.temperature <= 0 ? 'critical' : 'high',
      message: `Suhu sangat rendah terdeteksi: ${current.temperature}°C. Risiko embun beku tinggi.`,
      recommendations: [
        'Pasang pelindung tanaman atau mulsa tebal segera',
        'Siram tanaman di sore hari untuk menghangatkan tanah',
        'Pindahkan tanaman pot ke area terlindung',
      ],
    };
  }

  // Check forecast for upcoming frost
  const frostDays = forecast.filter((d) => d.temperatureMin <= 2);
  if (frostDays.length > 0) {
    return {
      hasRisk: true,
      alertType: 'frost',
      severity: 'high',
      message: `Prakiraan suhu rendah (≤2°C) dalam ${frostDays.length} hari ke depan.`,
      recommendations: [
        'Siapkan pelindung tanaman sebelum malam hari',
        'Pertimbangkan panen dini untuk komoditas sensitif',
      ],
    };
  }

  // --- Heavy Rain Check ---
  const heavyRainDays = forecast.filter((d) => d.rainSum > 50);
  const moderateRainDays = forecast.filter(
    (d) => d.rainSum > 20 && d.precipitationProbability > 70
  );

  if (heavyRainDays.length >= 2 || current.rainfall > 50) {
    return {
      hasRisk: true,
      alertType: 'heavy_rain',
      severity: heavyRainDays.length >= 3 ? 'critical' : 'high',
      message: `Hujan lebat diprediksi: ${heavyRainDays.length} hari dengan curah hujan >50mm.`,
      recommendations: [
        'Perbaiki sistem drainase lahan',
        'Tunda kegiatan pemupukan',
        'Percepat panen untuk komoditas yang sudah siap',
        'Amankan peralatan dan infrastruktur pertanian',
      ],
    };
  }

  if (moderateRainDays.length >= 3) {
    return {
      hasRisk: true,
      alertType: 'heavy_rain',
      severity: 'medium',
      message: `Hujan sedang-lebat diprediksi selama ${moderateRainDays.length} hari ke depan.`,
      recommendations: [
        'Pastikan drainase berfungsi baik',
        'Monitor kelembapan tanah secara berkala',
      ],
    };
  }

  // --- Drought Check ---
  const totalForecastRain = forecast.reduce((sum, d) => sum + d.rainSum, 0);
  const avgET = forecast.length > 0
    ? forecast.reduce((sum, d) => sum + d.evapotranspiration, 0) / forecast.length
    : 0;

  if (current.soilMoisture < 0.15 && totalForecastRain < 5 && avgET > 5) {
    return {
      hasRisk: true,
      alertType: 'drought',
      severity: current.soilMoisture < 0.08 ? 'critical' : 'high',
      message: `Kondisi kering terdeteksi. Kelembapan tanah: ${(current.soilMoisture * 100).toFixed(1)}%, curah hujan prakiraan sangat rendah.`,
      recommendations: [
        'Aktifkan sistem irigasi atau penyiraman manual',
        'Aplikasikan mulsa untuk mengurangi evaporasi',
        'Prioritaskan penyiraman untuk tanaman bernilai tinggi',
      ],
    };
  }

  // --- Early Harvest Advisory ---
  // Trigger if multiple moderate risks are present in the forecast
  const riskyDays = forecast.filter(
    (d) => d.rainSum > 30 || d.temperatureMin < 5 || d.temperatureMax > 40
  );

  if (riskyDays.length >= 3) {
    return {
      hasRisk: true,
      alertType: 'early_harvest',
      severity: 'medium',
      message: 'Kondisi cuaca buruk diprediksi. Pertimbangkan panen dini.',
      recommendations: [
        'Evaluasi kesiapan panen komoditas utama',
        'Koordinasikan dengan pembeli untuk penjadwalan ulang',
        'Siapkan fasilitas penyimpanan pasca-panen',
      ],
    };
  }

  // --- No significant risk ---
  return {
    hasRisk: false,
    alertType: null,
    severity: 'low',
    message: 'Kondisi cuaca normal. Tidak ada risiko signifikan terdeteksi.',
    recommendations: [
      'Lanjutkan kegiatan pertanian seperti biasa',
      'Tetap pantau prakiraan cuaca secara berkala',
    ],
  };
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/**
 * Generate a human-readable weather description in Indonesian.
 */
function generateWeatherDescription(
  temperature: number,
  humidity: number,
  rainfall: number
): string {
  if (rainfall > 10) return 'Hujan lebat';
  if (rainfall > 2) return 'Hujan ringan';
  if (rainfall > 0) return 'Gerimis';
  if (humidity > 85) return 'Berawan dan lembap';
  if (humidity > 60) return 'Berawan sebagian';
  if (temperature > 35) return 'Cerah dan panas';
  if (temperature > 25) return 'Cerah';
  if (temperature < 15) return 'Dingin';
  return 'Cerah berawan';
}
