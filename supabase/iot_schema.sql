-- ============================================================
-- BATUR TANI - IoT Telemetry Extension Schema
-- Run this SQL in your Supabase SQL Editor to add IoT tables
-- ============================================================

-- Table to store real-time sensor data from ESP32
CREATE TABLE sensor_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  temperature DOUBLE PRECISION NOT NULL,       -- From DHT11
  humidity DOUBLE PRECISION NOT NULL,          -- From DHT11
  soil_moisture DOUBLE PRECISION NOT NULL,     -- From Analog Soil Moisture (Percentage 0-100)
  light_intensity DOUBLE PRECISION NOT NULL,   -- From LDR (Percentage 0-100)
  is_raining BOOLEAN NOT NULL DEFAULT FALSE,   -- From Rain Sensor
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Index for faster querying
CREATE INDEX idx_telemetry_farmer_time ON sensor_telemetry(farmer_id, created_at DESC);

-- Enable RLS
ALTER TABLE sensor_telemetry ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Farmers can read own telemetry"
  ON sensor_telemetry FOR SELECT
  USING (auth.uid() = farmer_id);

-- System/Edge Function can insert telemetry (service role key will bypass RLS, but we can also add this policy just in case)
CREATE POLICY "System can insert telemetry"
  ON sensor_telemetry FOR INSERT
  WITH CHECK (true);
