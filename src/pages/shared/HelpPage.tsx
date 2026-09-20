import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sprout, 
  CloudRain, 
  ShieldCheck, 
  Wallet, 
  Search, 
  ShoppingCart,
  CheckCircle 
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

export default function HelpPage() {
  const { profile } = useAuth();
  const isFarmer = profile?.role === 'farmer';
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const farmerFAQs: FAQItem[] = [
    {
      question: "Bagaimana cara membaca grafik Telemetri IoT?",
      answer: "Grafik di menu Overview menampilkan data langsung dari lahan Anda. Suhu (T) menunjukkan temperatur udara, Kelembapan Tanah menunjukkan persentase kadar air (usahakan di atas 40%), dan intensitas cahaya membantu Anda mengetahui durasi penyinaran.",
      icon: <Sprout className="w-5 h-5 text-emerald-400" />
    },
    {
      question: "Apa yang harus dilakukan jika ada Peringatan Embun Upas?",
      answer: "Jika sistem mendeteksi risiko Embun Upas (Frost) tinggi, segera siapkan langkah mitigasi seperti memasang paranet, melakukan pengasapan ringan di sekitar lahan, atau menyiram tanaman pada pagi buta untuk meluruhkan es.",
      icon: <CloudRain className="w-5 h-5 text-blue-400" />
    },
    {
      question: "Kapan dana dari pembeli bisa saya cairkan?",
      answer: "Dana pesanan ditahan dengan aman di sistem Escrow. Setelah Anda mengirim sayuran dan pembeli menekan tombol 'Terima Barang' (E-QC disetujui), dana akan otomatis masuk ke saldo Anda dan bisa ditarik ke rekening bank.",
      icon: <Wallet className="w-5 h-5 text-amber-400" />
    }
  ];

  const buyerFAQs: FAQItem[] = [
    {
      question: "Bagaimana cara mencari komoditas segar?",
      answer: "Buka menu Marketplace. Anda bisa melihat daftar sayuran yang langsung ditawarkan oleh petani. Perhatikan 'Estimasi Panen' jika Anda ingin melakukan Pre-Order untuk pasokan masa depan.",
      icon: <Search className="w-5 h-5 text-blue-400" />
    },
    {
      question: "Apakah uang saya aman saat melakukan Pre-Order?",
      answer: "Sangat aman. Pembayaran Anda via Midtrans tidak langsung diberikan ke petani. Dana ditahan di rekening bersama (Escrow Batur Tani) sampai sayuran tiba di lokasi Anda sesuai dengan standar kualitas yang dijanjikan.",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    },
    {
      question: "Apa itu E-QC (Electronic Quality Control)?",
      answer: "Saat barang datang, Anda wajib memeriksa kondisinya. Jika sesuai, Anda klik 'Terima' di menu Pesanan Saya. Jika kualitas buruk, Anda bisa melampirkan foto untuk proses retur atau penahanan dana.",
      icon: <CheckCircle className="w-5 h-5 text-amber-400" />
    }
  ];

  const faqs = isFarmer ? farmerFAQs : buyerFAQs;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-emerald-400" />
            Pusat Bantuan & Panduan
          </h1>
          <p className="text-slate-400 mt-2">
            Pelajari cara memaksimalkan platform Batur Tani untuk bisnis Anda.
          </p>
        </div>

        {/* Visual Workflow (How it works) */}
        <div className="glass rounded-3xl p-6 md:p-10 border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-100 mb-3">
              Cara Kerja {isFarmer ? 'Platform Batur Tani' : 'Transaksi Aman Batur Tani'}
            </h2>
            <p className="text-slate-400">
              {isFarmer 
                ? 'Integrasi mulus antara sensor ladang IoT, Marketplace, dan sistem pembayaran.' 
                : 'Pesan komoditas dataran tinggi dengan jaminan kualitas dan keamanan dana 100%.'}
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-12 right-12 h-1 bg-gradient-to-r from-slate-700 via-emerald-500/50 to-slate-700 rounded-full" />

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
                  {isFarmer ? <Sprout className="w-10 h-10 text-emerald-400" /> : <Search className="w-10 h-10 text-blue-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">
                    1. {isFarmer ? 'Pantau & Tanam' : 'Pilih Komoditas'}
                  </h3>
                  <p className="text-sm text-slate-400 px-4">
                    {isFarmer 
                      ? 'Gunakan sensor IoT untuk memantau kelembapan dan ancaman embun upas secara real-time.' 
                      : 'Cari sayuran segar berkualitas dari daftar komoditas yang ditanam langsung oleh petani lokal.'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform">
                  <ShieldCheck className="w-10 h-10 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">
                    2. {isFarmer ? 'Terima Pesanan' : 'Pembayaran Escrow'}
                  </h3>
                  <p className="text-sm text-slate-400 px-4">
                    {isFarmer 
                      ? 'Pembeli melakukan pre-order. Dana ditahan oleh sistem Escrow, menjamin Anda pasti dibayar.' 
                      : 'Bayar via Midtrans. Dana ditahan dengan aman oleh sistem Escrow, tidak langsung diserahkan ke petani.'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
                  {isFarmer ? <Wallet className="w-10 h-10 text-cyan-400" /> : <CheckCircle className="w-10 h-10 text-cyan-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">
                    3. {isFarmer ? 'Kirim & Cairkan' : 'E-QC & Selesai'}
                  </h3>
                  <p className="text-sm text-slate-400 px-4">
                    {isFarmer 
                      ? 'Kirim komoditas. Setelah pembeli menekan tombol terima (E-QC), dana otomatis cair ke saldo Anda.' 
                      : 'Sayuran tiba, Anda periksa kualitasnya (E-QC). Jika sesuai, klik terima dan dana diteruskan ke petani.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Guides (Role Specific) */}
        {isFarmer ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Panduan Detail: Perangkat IoT & Smart Farming</h2>
            <div className="grid md:grid-cols-2 gap-4">
              
              <div className="glass rounded-2xl p-6 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-200">Instalasi Fisik Perangkat IoT di Lahan</h3>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li><strong>Posisi Modul:</strong> Pasang kotak modul pada tiang setinggi ±1.5 meter. Pastikan tidak terendam air jika hujan lebat.</li>
                  <li><strong>Probe Tanah:</strong> Tancapkan garpu sensor kelembapan tanah sedalam 10-15 cm di dekat area akar tanaman utama, bukan di jaluran air.</li>
                  <li><strong>Sensor Hujan:</strong> Pasang papan sensor hujan dengan posisi agak miring (±30 derajat) agar air hujan bisa mengalir jatuh dan tidak menggenang.</li>
                  <li><strong>LDR (Cahaya):</strong> Pastikan sensor cahaya mengarah ke langit dan tidak tertutup oleh bayangan pohon/bangunan.</li>
                </ul>
              </div>

              <div className="glass rounded-2xl p-6 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <CloudRain className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-200">Cara Kerja Daya & Koneksi WiFi</h3>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li><strong>Penting:</strong> Gunakan port <strong>Micro USB</strong> yang menempel langsung pada modul inti ESP32 untuk menyalakan perangkat (port USB-C di papan bawah hanya pembagi daya, terkadang kurang stabil).</li>
                  <li>Modul membutuhkan WiFi terus-menerus. Jika Anda menggunakan HP, hidupkan fitur *Mobile Hotspot* dengan nama (SSID) <code>redmi</code> dan password yang sudah disetel di dalam modul.</li>
                  <li>Jika layar LCD hanya menampilkan titik-titik <code>....</code>, berarti perangkat gagal menyambung ke internet. Pastikan hotspot menggunakan pita <strong>2.4GHz</strong>, bukan 5GHz.</li>
                </ul>
              </div>

              <div className="glass rounded-2xl p-6 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <CloudRain className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-200">Suhu & Cuaca Satelit (Open-Meteo)</h3>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li>Selain menggunakan alat fisik (IoT) di lahan, menu <strong>Cuaca</strong> juga menarik data satelit <em>Open-Meteo</em>.</li>
                  <li>Ini berguna untuk melihat prakiraan kecepatan angin dan radiasi matahari skala regional yang melengkapi data lokal ladang Anda.</li>
                  <li>Jika sensor IoT mendeteksi suhu di bawah 15°C, peringatan embun upas (Frost) akan berkedip merah. Segera lakukan penyiraman pagi buta.</li>
                </ul>
              </div>

              <div className="glass rounded-2xl p-6 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-200">Manajemen Kelembapan Tanah</h3>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li>Sensor tanah mengukur kadar air (0-100%). Tanah yang sehat untuk sayuran dataran tinggi berkisar di <strong>40% - 70%</strong>.</li>
                  <li>Jika persentase menunjukkan di bawah 30%, tanah terlalu kering. Segera hidupkan pompa irigasi/sprinkler.</li>
                </ul>
              </div>

              <div className="glass rounded-2xl p-6 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-200">Komoditas & Manajemen Pesanan</h3>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li>Buka menu <strong>Komoditas</strong> untuk menambah sayuran. Masukkan "Estimasi Panen" agar pembeli B2B bisa memborong sebelum panen tiba (Sistem Pre-Order).</li>
                  <li>Saat ada pesanan masuk, pantau di menu <strong>Pesanan</strong>. Ubah statusnya menjadi "Dalam Pengiriman" ketika kurir mengambil barang.</li>
                </ul>
              </div>

              <div className="glass rounded-2xl p-6 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-200">Menu Keuangan (Escrow)</h3>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li>Menu <strong>Keuangan</strong> membedakan antara "Total Pendapatan" (Uang yang sudah cair) dan "Dana Escrow Tertahan" (Uang pesanan yang masih dikirim).</li>
                  <li>Anda tidak perlu menagih pembeli secara manual. Setelah pembeli klik "Terima Barang" di aplikasi mereka (Lolos E-QC), dana Escrow otomatis pindah ke saldo Anda dan siap ditarik ke rekening.</li>
                </ul>
              </div>

            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Panduan Detail: Transaksi B2B Aman</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-6 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-200">Keamanan Dana (Sistem Escrow)</h3>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li>Setiap pembayaran yang Anda lakukan via Midtrans akan ditahan di rekening bersama Batur Tani (Sistem Escrow).</li>
                  <li>Uang <strong>TIDAK</strong> akan diteruskan ke petani sampai komoditas fisik Anda terima dan periksa kualitasnya.</li>
                  <li>Jika komoditas tidak pernah dikirim dalam batas waktu, dana akan dikembalikan penuh ke akun Anda.</li>
                </ul>
              </div>
              <div className="glass rounded-2xl p-6 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-200">Proses E-QC (Quality Control)</h3>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li>Saat truk/kurir tiba membawa sayuran pesanan Anda, cek fisik barang tersebut.</li>
                  <li>Masuk ke menu <strong>Pesanan Saya</strong>, lalu klik pesanan terkait.</li>
                  <li>Jika barang dalam kondisi segar dan timbangannya pas, tekan <strong>Terima Barang</strong>. Jika ada yang busuk, Anda bisa mengajukan komplain/retur melalui sistem kami dengan menyertakan bukti foto.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`glass rounded-2xl border transition-colors duration-300 overflow-hidden ${
                  openFaq === index ? 'border-emerald-500/50 bg-slate-800/80' : 'border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-900/50 rounded-xl shrink-0">
                      {faq.icon}
                    </div>
                    <h3 className="font-semibold text-slate-200">{faq.question}</h3>
                  </div>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                
                <div 
                  className={`px-6 pb-5 text-slate-400 leading-relaxed overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'block' : 'hidden'
                  }`}
                >
                  <div className="pl-14">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
