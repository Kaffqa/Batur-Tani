import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // SUPABASE_URL is automatically provided by the Edge Function environment.
    // We use a custom secret named SERVICE_ROLE_KEY to bypass RLS.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    const { farmer_id, temperature, humidity, soil_moisture, light_intensity, is_raining } = await req.json();

    if (!farmer_id) throw new Error("farmer_id is required in JSON payload");

    // 1. Insert telemetry data into the new sensor_telemetry table
    const { data: telemetryData, error: telemetryError } = await supabaseClient
      .from('sensor_telemetry')
      .insert([
        {
          farmer_id,
          temperature,
          humidity,
          soil_moisture,
          light_intensity,
          is_raining
        }
      ])
      .select()
      .single();

    if (telemetryError) throw telemetryError;

    // 2. Analyze IoT data to create real-time weather alerts
    const alertsToCreate = [];

    // Frost Alert (Cold temperature)
    // For prototyping/testing indoor, we use <= 15 instead of 2 so it's easier to simulate with an AC or ice.
    if (temperature <= 15) { 
      alertsToCreate.push({
        farmer_id,
        alert_type: 'frost',
        severity: temperature <= 10 ? 'critical' : 'high',
        message: `Suhu rendah terdeteksi oleh Sensor IoT: ${temperature}°C. Risiko embun beku!`,
        weather_data: { source: 'iot_sensor', temperature, humidity }
      });
    }

    // Heavy Rain Alert (Raining + Dark)
    if (is_raining && light_intensity < 30) {
      alertsToCreate.push({
        farmer_id,
        alert_type: 'heavy_rain',
        severity: 'high',
        message: `Hujan dan cuaca gelap terdeteksi oleh Sensor IoT. Waspada genangan air di lahan.`,
        weather_data: { source: 'iot_sensor', is_raining, light_intensity }
      });
    }

    // Drought Alert (Dry soil and hot)
    if (soil_moisture < 20 && temperature > 30) {
      alertsToCreate.push({
        farmer_id,
        alert_type: 'drought',
        severity: 'high',
        message: `Tanah kering terdeteksi oleh Sensor IoT (Kelembapan: ${soil_moisture}%). Segera lakukan penyiraman!`,
        weather_data: { source: 'iot_sensor', soil_moisture, temperature }
      });
    }

    // Insert alerts into database if any triggered
    if (alertsToCreate.length > 0) {
      const { error: alertError } = await supabaseClient.from('weather_alerts').insert(alertsToCreate);
      if (alertError) console.error("Error creating alerts:", alertError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Telemetry received successfully", data: telemetryData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
