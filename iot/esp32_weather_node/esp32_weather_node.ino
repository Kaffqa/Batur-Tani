#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ==========================================
// KONFIGURASI WI-FI & SUPABASE (Ubah Ini)
// ==========================================
const char* WIFI_SSID = "NAMA_WIFI_ANDA";
const char* WIFI_PASSWORD = "PASSWORD_WIFI_ANDA";

// URL Edge Function Supabase Anda (Sudah otomatis disesuaikan dengan Cloud Anda)
const char* SUPABASE_URL = "https://gmwfgwwuaebvneqkvxeo.supabase.co/functions/v1/ingest-telemetry";
// Ganti dengan UUID Farmer dari database Anda
const char* FARMER_ID = "MASUKKAN_FARMER_ID_ANDA_DISINI";

// ==========================================
// KONFIGURASI PIN SENSOR (Sesuaikan dengan wiring)
// ==========================================
#define DHTPIN 4          // Pin Digital untuk DHT11
#define DHTTYPE DHT11     // Tipe sensor DHT11
DHT dht(DHTPIN, DHTTYPE);

#define SOIL_PIN 34       // Pin Analog ADC untuk Soil Moisture
#define LDR_PIN 35        // Pin Analog ADC untuk LDR (Cahaya)
#define RAIN_PIN 32       // Pin Digital (atau Analog) untuk Rain Sensor

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Inisialisasi Sensor
  dht.begin();
  pinMode(RAIN_PIN, INPUT);

  // Mulai koneksi Wi-Fi
  Serial.println("\n--- Batur Tani IoT Node Memulai ---");
  Serial.print("Menghubungkan ke Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nBerhasil terhubung ke Wi-Fi!");
  Serial.print("Alamat IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n-----------------------------------");
    Serial.println("Membaca Sensor...");

    // 1. Baca Suhu dan Kelembapan (DHT11)
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Gagal membaca sensor DHT11! Memakai nilai aman untuk testing.");
      temperature = 25.0;
      humidity = 60.0;
    }

    // 2. Baca Kelembapan Tanah (Nilai ADC ESP32: 0-4095)
    // Sensor Capacitive: Semakin basah, semakin rendah nilainya. Kita konversi ke persentase.
    int rawSoil = analogRead(SOIL_PIN);
    float soil_moisture = map(rawSoil, 4095, 0, 0, 100);
    if (soil_moisture < 0) soil_moisture = 0;
    if (soil_moisture > 100) soil_moisture = 100;

    // 3. Baca LDR (Intensitas Cahaya)
    // Modul LDR standar: Terang = Resistance rendah = Voltage tinggi (pada modul tertentu bisa kebalik)
    int rawLdr = analogRead(LDR_PIN);
    float light_intensity = map(rawLdr, 0, 4095, 0, 100);

    // 4. Baca Sensor Hujan
    // Modul sensor hujan standar biasanya bernilai LOW (0) jika terdeteksi air di atas platnya.
    int rainValue = digitalRead(RAIN_PIN);
    bool is_raining = (rainValue == LOW) ? true : false;

    // Tampilkan di Serial Monitor
    Serial.printf("Suhu: %.1f C | Kelembapan Udara: %.1f %%\n", temperature, humidity);
    Serial.printf("Kelembapan Tanah: %.1f %%\n", soil_moisture);
    Serial.printf("Cahaya LDR: %.1f %%\n", light_intensity);
    Serial.printf("Status Hujan: %s\n", is_raining ? "YA (Terdeteksi Air)" : "TIDAK (Kering)");

    // =====================================
    // KEMAS DATA KE JSON
    // =====================================
    // Pastikan Anda menginstall library ArduinoJson dari Library Manager
    StaticJsonDocument<256> doc;
    doc["farmer_id"] = FARMER_ID;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["soil_moisture"] = soil_moisture;
    doc["light_intensity"] = light_intensity;
    doc["is_raining"] = is_raining;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    // =====================================
    // KIRIM KE SUPABASE EDGE FUNCTION
    // =====================================
    Serial.println("Mengirim data ke Supabase...");
    
    HTTPClient http;
    http.begin(SUPABASE_URL);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.print("Error saat mengirim HTTP POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("Koneksi Wi-Fi terputus!");
  }

  // Jeda 15 detik sebelum pengiriman berikutnya
  // Untuk simulasi laptop 15 detik sangat cocok. 
  // Untuk di ladang, ganti delay dengan ESP.deepSleep() agar baterai awet.
  delay(15000); 
}
