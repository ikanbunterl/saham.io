'use strict';
// Terminal Sudirman — data.js (konten & copy; objek gaya strict-JSON)
const DATA = {
 "initialCapital": 100000000,
 "feeRate": 0.0015,
 "sectorColors": {"Perbankan":"#4FC3F7","Tambang":"#FFB74D","Energi":"#FF8A65","Telko":"#BA68C8","Konsumer":"#81C784","Teknologi":"#F06292","Infrastruktur":"#90A4AE","Properti":"#A1887F"},
 "sectors": ["Perbankan","Tambang","Energi","Telko","Konsumer","Teknologi","Infrastruktur","Properti"],
 "stocks": [
  {"code":"BCAX","name":"Bank Central Asia","sector":"Perbankan","basePrice":9500,"volatility":0.003,"icon":"BB"},
  {"code":"BRIA","name":"Bank Rakyat Indonesia","sector":"Perbankan","basePrice":4850,"volatility":0.003,"icon":"BR"},
  {"code":"BMRI","name":"Bank Mandiri","sector":"Perbankan","basePrice":6200,"volatility":0.003,"icon":"BM"},
  {"code":"BBNI","name":"Bank Negara Indonesia","sector":"Perbankan","basePrice":5400,"volatility":0.003,"icon":"BN"},
  {"code":"ARTO","name":"Bank Jago","sector":"Perbankan","basePrice":2750,"volatility":0.012,"icon":"AR"},
  {"code":"ANTM","name":"Aneka Tambang","sector":"Tambang","basePrice":1680,"volatility":0.008,"icon":"AN"},
  {"code":"PTBA","name":"Bukit Asam","sector":"Tambang","basePrice":2950,"volatility":0.007,"icon":"PB"},
  {"code":"INCO","name":"Vale Indonesia","sector":"Tambang","basePrice":4100,"volatility":0.008,"icon":"IN"},
  {"code":"MDKA","name":"Merdeka Copper Gold","sector":"Tambang","basePrice":2340,"volatility":0.012,"icon":"MD"},
  {"code":"ADRO","name":"Alamtri Resources","sector":"Energi","basePrice":2450,"volatility":0.009,"icon":"AD"},
  {"code":"PGAS","name":"Perusahaan Gas Negara","sector":"Energi","basePrice":1545,"volatility":0.006,"icon":"PG"},
  {"code":"AKRA","name":"AKR Corporindo","sector":"Energi","basePrice":1420,"volatility":0.007,"icon":"AK"},
  {"code":"MEDC","name":"Medco Energi","sector":"Energi","basePrice":1250,"volatility":0.011,"icon":"ME"},
  {"code":"TLKM","name":"Telkom Indonesia","sector":"Telko","basePrice":3870,"volatility":0.003,"icon":"TL"},
  {"code":"ISAT","name":"Indosat Ooredoo","sector":"Telko","basePrice":9800,"volatility":0.006,"icon":"IS"},
  {"code":"EXCL","name":"XL Axiata","sector":"Telko","basePrice":2250,"volatility":0.007,"icon":"EX"},
  {"code":"UNVR","name":"Unilever Indonesia","sector":"Konsumer","basePrice":2500,"volatility":0.004,"icon":"UN"},
  {"code":"ICBP","name":"Indofood CBP","sector":"Konsumer","basePrice":11200,"volatility":0.004,"icon":"IC"},
  {"code":"INDF","name":"Indofood Sukses Makmur","sector":"Konsumer","basePrice":7850,"volatility":0.005,"icon":"ID"},
  {"code":"GOTO","name":"GoTo Gojek Tokopedia","sector":"Teknologi","basePrice":68,"volatility":0.020,"icon":"GT"},
  {"code":"BUKA","name":"Bukalapak","sector":"Teknologi","basePrice":145,"volatility":0.018,"icon":"BK"},
  {"code":"EMTK","name":"Elang Mahkota Teknologi","sector":"Teknologi","basePrice":420,"volatility":0.015,"icon":"EM"},
  {"code":"JSMR","name":"Jasa Marga","sector":"Infrastruktur","basePrice":4750,"volatility":0.005,"icon":"JS"},
  {"code":"WSKT","name":"Waskita Karya","sector":"Infrastruktur","basePrice":285,"volatility":0.016,"icon":"WS"},
  {"code":"BSDE","name":"Bumi Serpong Damai","sector":"Properti","basePrice":1050,"volatility":0.008,"icon":"BS"}
 ],
 "news": [
  {"id":"news-01","sentiment":"bullish","category":"Sektor","targets":["Perbankan"],"impactPct":0.025,"durationSec":14400,"decay":"linear","title":"Kredit Perbankan Tumbuh 12% YoY di Kuartal III","summary":"Penyaluran kredit sektor perbankan tercatat tumbuh dua digit, ditopang kredit modal kerja dan konsumsi.","body":"Otoritas mencatat penyaluran kredit perbankan tumbuh 12% dibanding tahun lalu pada kuartal III. Pertumbuhan ditopang kredit modal kerja industri pengolahan serta kredit konsumsi yang stabil. Analis menilai margin bunga bersih masih terjaga, meski biaya dana mulai naik. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-02","sentiment":"bearish","category":"Sektor","targets":["Perbankan"],"impactPct":-0.018,"durationSec":10800,"decay":"linear","title":"NPL Bank Menengah Naik, OJK Minta Perhatian","summary":"Rasio kredit bermasalah bank kelas menengah meningkat; pengawas meminta penguatan pencadangan.","body":"Rasio NPL bank menengah dilaporkan naik tipis akibat pelemahan segmen UMKM. Regulator meminta perbankan menambah cadangan kerugian penurunan nilai dan selektif menyalurkan kredit baru. Pelaku pasar khawatir tekanan pencadangan menggerus laba kuartal berjalan. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-03","sentiment":"bullish","category":"Emiten","targets":["ANTM"],"impactPct":0.04,"durationSec":21600,"decay":"linear","title":"Harga Nikel Global Cetak Rekor Baru","summary":"Lonjakan permintaan bahan baku baterai mendorong harga nikel ke level tertinggi baru.","body":"Harga nikel dunia mencetak rekor baru seiring permintaan bahan baku baterai kendaraan listrik. Produsen dengan cadangan besar diproyeksikan menikmati kenaikan margin. ANTM disebut analis paling diuntungkan karena porsi nikel dalam portofolio produknya. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-04","sentiment":"bearish","category":"Sektor","targets":["Tambang"],"impactPct":-0.032,"durationSec":18000,"decay":"step","title":"Ekspor Mineral Mentah Diperketat Mulai Bulan Depan","summary":"Aturan baru membatasi ekspor mineral mentah; smelter yang belum siap terancam kehilangan volume.","body":"Pemerintah dalam skenario simulasi ini memperketat ekspor mineral mentah mulai bulan depan. Emiten tambang tanpa smelter siap operasi diperkirakan kehilangan volume penjualan jangka pendek. Pasar merespons negatif sambil menunggu kejelasan petunjuk teknis. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-05","sentiment":"bullish","category":"Sektor","targets":["Energi"],"impactPct":0.022,"durationSec":14400,"decay":"linear","title":"Harga Minyak Dunia Naik 3% Malam Ini","summary":"Gangguan pasokan dan permintaan musim dingin mengangkat harga minyak mentah.","body":"Harga minyak mentah acuan naik 3% dalam semalam akibat gangguan pasokan dan ekspektasi permintaan musim dingin. Emiten energi dengan eksposur hulu diproyeksikan membukukan kenaikan realisasi harga jual. Efek ke emiten batu bara bersifat tidak langsung melalui sentimen energi. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-06","sentiment":"bearish","category":"Emiten","targets":["ADRO"],"impactPct":-0.025,"durationSec":10800,"decay":"linear","title":"Produksi Batubara ADRO Turun Akibat Cuaca","summary":"Curah hujan tinggi mengganggu operasional tambang dan menurunkan target produksi kuartal ini.","body":"Curah hujan ekstrem mengganggu pengupasan tanah penutup dan pengangkutan batubara. Manajemen dalam skenario ini memangkas target produksi kuartal berjalan. Analis menurunkan estimasi volume penjualan, meski harga jual acuan relatif stabil. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-07","sentiment":"bullish","category":"Emiten","targets":["TLKM"],"impactPct":0.015,"durationSec":14400,"decay":"linear","title":"TLKM Umumkan Dividen Rp180/Saham","summary":"Rapat umum pemegang saham menyetujui dividen tunai Rp180 per saham untuk tahun buku terakhir.","body":"RUPS menyetujui pembagian dividen tunai Rp180 per saham. Yield menarik dibanding deposito membuat saham ini diburu investor pemburu dividen. Cum date dijadwalkan dua pekan ke depan dalam skenario simulasi ini. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-08","sentiment":"bearish","category":"Sektor","targets":["Telko"],"impactPct":-0.012,"durationSec":10800,"decay":"linear","title":"Regulator Dorong Penurunan Tarif Data 20%","summary":"Wacana penurunan tarif data menekan proyeksi pendapatan operator seluler.","body":"Regulator dalam skenario ini mendorong penurunan tarif data rata-rata 20% untuk memperluas akses internet. Operator khawatir average revenue per user turun sementara trafik belum tentu mengimbangi. Saham operator melemah serentak merespons wacana tersebut. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-09","sentiment":"bullish","category":"Sektor","targets":["Konsumer"],"impactPct":0.018,"durationSec":18000,"decay":"linear","title":"Penjualan Ritel Naik Signifikan Jelang Akhir Tahun","summary":"Survei penjualan ritel menunjukkan akselerasi belanja rumah tangga jelang musim liburan.","body":"Survei penjualan riil menunjukkan akselerasi belanja rumah tangga jelang akhir tahun, terutama kategori makanan-minuman dan perawatan rumah. Emiten konsumer diperkirakan menikmati volume penjualan lebih tinggi dengan biaya promosi terkendali. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-10","sentiment":"bearish","category":"Emiten","targets":["UNVR"],"impactPct":-0.02,"durationSec":14400,"decay":"linear","title":"UNVR Laporkan Penurunan Laba Bersih 8%","summary":"Kenaikan biaya bahan baku dan pelemahan daya beli menekan laba bersih kuartal berjalan.","body":"Laba bersih kuartal berjalan turun 8% dibanding periode sama tahun lalu. Kenaikan harga bahan baku dan kompetisi merek lokal menekan margin. Manajemen menyiapkan efisiensi, namun analis memangkas target harga wajar. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-11","sentiment":"bullish","category":"Emiten","targets":["GOTO"],"impactPct":0.05,"durationSec":28800,"decay":"step","title":"GOTO Cetak Laba Operasional Pertama","summary":"Untuk pertama kalinya sejak IPO, perseroan mencatat laba operasional kuartalan.","body":"Perseroan melaporkan laba operasional kuartalan pertama sejak IPO, didorong efisiensi insentif dan pertumbuhan pendapatan iklan. Sebagian analis skeptis keberlanjutannya dan menunggu konfirmasi kuartal berikutnya. Volatilitas tinggi mewarnai perdagangan. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-12","sentiment":"bearish","category":"Sektor","targets":["Teknologi"],"impactPct":-0.035,"durationSec":21600,"decay":"linear","title":"Suku Bunga Global Tinggi, Tekanan pada Tech","summary":"Suku bunga acuan global bertahan tinggi; valuasi saham teknologi tertekan.","body":"Bank sentral utama mempertahankan suku bunga tinggi lebih lama dari ekspektasi. Diskonto arus kas masa depan membuat valuasi emiten teknologi tertekan. Arus dana asing keluar dari saham growth menuju aset berbunga tetap. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-13","sentiment":"bullish","category":"Emiten","targets":["JSMR"],"impactPct":0.012,"durationSec":14400,"decay":"linear","title":"Tol Trans Jawa Catat Rekor Volume Kendaraan","summary":"Volume kendaraan harian ruas tol utama mencetak rekor baru saat musim libur panjang.","body":"Volume kendaraan harian di ruas tol utama mencetak rekor saat libur panjang. Pendapatan tol kuartal berjalan diproyeksikan di atas konsensus. Beban bunga perseroan yang menurun menambah ruang perbaikan laba. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-14","sentiment":"bearish","category":"Emiten","targets":["WSKT"],"impactPct":-0.045,"durationSec":21600,"decay":"step","title":"WSKT Gagal Bayar Obligasi, Sanksi BEI Menanti","summary":"Perseroan gagal membayar kupon obligasi jatuh tempo; bursa menyiapkan sanksi bertahap.","body":"Perseroan gagal membayar kupon obligasi yang jatuh tempo dan mengajukan restrukturisasi. Bursa menyiapkan sanksi bertahap hingga potensi suspensi. Investor ritel diimbau mencermati risiko likuiditas dan ekuitas negatif. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"news-15","sentiment":"neutral","category":"Ekonomi","targets":[],"impactPct":0.0,"durationSec":7200,"decay":"linear","title":"IHSG Dibuka Mixed, Pelaku Pasar Tunggu Data Inflasi","summary":"Indeks dibuka bervariasi; investor menunggu rilis data inflasi dan arah kebijakan suku bunga.","body":"Indeks dibuka bervariasi dengan volume tipis. Pelaku pasar menunggu data inflasi pekan ini sebagai petunjuk arah suku bunga. Sektor perbankan dan konsumer bergerak tipis, sementara teknologi lebih volatil. Skenario ini fiksi untuk simulasi edukasi."}
 ],
 "event": {
  "id":"event-reshuffle","title":"Reshuffle Kabinet — Kursi Menkeu",
  "phases":[
   {"at":0,"label":"Rumor","impact":{"Perbankan":-0.010},"durationSec":21600,"newsId":"ev-reshuffle-1","volatilityMult":2.0},
   {"at":86400,"label":"Konfirmasi","impact":{"Perbankan":-0.030},"durationSec":28800,"newsId":"ev-reshuffle-2","volatilityMult":1.5},
   {"at":172800,"label":"Resolusi","impact":{"Perbankan":0.020,"Infrastruktur":0.010},"durationSec":43200,"newsId":"ev-reshuffle-3","volatilityMult":1.0}
  ],
  "badgeOnSurvive":"event-survivor"
 },
 "eventNews":[
  {"id":"ev-reshuffle-1","sentiment":"bearish","category":"Event Khusus","targets":["Perbankan"],"impactPct":-0.010,"durationSec":21600,"decay":"linear","title":"Rumor Reshuffle: Kursi Menkeu Digoyang","summary":"Isu perombakan kabinet menyasar posisi Menteri Keuangan; pasar keuangan gelisah.","body":"Beredar rumor perombakan kabinet yang menyasar kursi Menteri Keuangan. Pelaku pasar khawatir arah kebijakan fiskal dan disiplin anggaran berubah. Volatilitas sektor perbankan meningkat dua kali lipat dalam fase rumor. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"ev-reshuffle-2","sentiment":"bearish","category":"Event Khusus","targets":["Perbankan"],"impactPct":-0.030,"durationSec":28800,"decay":"linear","title":"Konfirmasi Reshuffle: Menkeu Diganti","summary":"Perombakan kabinet resmi diumumkan; Menteri Keuangan baru berasal dari luar birokrasi ekonomi.","body":"Istana mengonfirmasi perombakan kabinet. Menteri Keuangan baru berlatar belakang non-teknokrat, memicu kekhawatiran soal kesinambungan kebijakan utang dan pajak. Perbankan tertekan paling dalam; investor asing tercatat arus keluar bersih dalam skenario ini. Skenario ini fiksi untuk simulasi edukasi."},
  {"id":"ev-reshuffle-3","sentiment":"bullish","category":"Event Khusus","targets":["Perbankan","Infrastruktur"],"impactPct":0.020,"durationSec":43200,"decay":"linear","title":"Menkeu Baru Jamin Kontinuitas Fiskal, Pasar Lega","summary":"Pidato perdana Menteri Keuangan baru menegaskan disiplin anggaran dan percepatan proyek infrastruktur.","body":"Dalam pidato perdana, Menteri Keuangan baru menjamin kontinuitas disiplin fiskal dan mempercepat pencairan proyek infrastruktur. Pasar lega; perbankan rebound dan sektor infrastruktur ikut menguat. Fase resolusi menandai pemulihan bertahap. Skenario ini fiksi untuk simulasi edukasi."}
 ],
 "dailyPool":[
  {"id":"read-3-news","desc":"Baca 3 berita pasar","target":3,"xp":50,"metric":"newsReadToday"},
  {"id":"buy-1-stock","desc":"Beli 1 emiten apa saja","target":1,"xp":75,"metric":"buyCountToday"},
  {"id":"hold-3-sectors","desc":"Miliki saham dari 3 sektor","target":3,"xp":100,"metric":"uniqueSectors"},
  {"id":"check-market","desc":"Buka layar Pasar 3×","target":3,"xp":30,"metric":"marketViewCount"},
  {"id":"profit-500k","desc":"Realisasi profit Rp500.000","target":500000,"xp":150,"metric":"realizedPLToday"}
 ],
 "weeklyPool":[
  {"id":"weekly-daily-10","desc":"Selesaikan 10 misi harian","target":10,"xp":200,"metric":"weeklyDaily"},
  {"id":"weekly-equity","desc":"Capai ekuitas Rp110.000.000","target":110000000,"xp":250,"metric":"weeklyEquity"},
  {"id":"weekly-badges","desc":"Buka 2 badge baru minggu ini","target":2,"xp":200,"metric":"weeklyBadges"}
 ],
 "levels":[
  {"xp":0,"title":"Investor Ritel Pemula"},{"xp":250,"title":"Pengamat Ticker"},{"xp":500,"title":"Pemburu Dividen"},
  {"xp":750,"title":"Swing Trader Muda"},{"xp":1000,"title":"Analis Teknikal Harian"},{"xp":1250,"title":"Spesialis Blue Chip"},
  {"xp":1500,"title":"Navigator Sentimen"},{"xp":1750,"title":"Manajer Portofolio"},{"xp":2000,"title":"Strategis Pasar Modal"},
  {"xp":2250,"title":"Bandar Sudirman"}
 ],
 "badges":[
  {"id":"first-buy","name":"Order Pertama","desc":"Beli saham pertama kali","xp":100},
  {"id":"first-profit","name":"Cuan Perdana","desc":"Jual dengan realized P/L > 0","xp":100},
  {"id":"news-junkie","name":"Pembaca Berita","desc":"Baca 10 berita","xp":100},
  {"id":"diversified","name":"Anti Satu Keranjang","desc":"Miliki saham dari 4 sektor berbeda","xp":150},
  {"id":"bank-collector","name":"Kolektor Big Banks","desc":"Miliki BCAX + BRIA + BMRI sekaligus","xp":150},
  {"id":"whale-order","name":"Transaksi Kakap","desc":"Order tunggal di atas Rp25.000.000","xp":150},
  {"id":"diamond-hands","name":"Tangan Berlian","desc":"Unrealized profit minimal +15%","xp":200},
  {"id":"weekend-warrior","name":"Strategi Akhir Pekan","desc":"Eksekusi order saat akhir pekan","xp":100},
  {"id":"event-survivor","name":"Tahan Banting Reshuffle","desc":"Lewati event reshuffle dengan ekuitas di atas modal awal","xp":200},
  {"id":"mission-master","name":"Disiplin Harian","desc":"Selesaikan 15 misi harian total","xp":200},
  {"id":"portfolio-120m","name":"Ekuitas 120 Juta","desc":"Total aset minimal Rp120.000.000","xp":200},
  {"id":"sudirman-legend","name":"Legenda Sudirman","desc":"Level 10 dan 10 badge lain terbuka","xp":250}
 ],
 "faq":[
  {"q":"Apakah ini game trading sungguhan?","a":"Bukan. Terminal Sudirman adalah simulator edukasi 100% virtual, tanpa uang nyata dan tanpa koneksi ke broker mana pun."},
  {"q":"Apakah harga real-time dari BEI?","a":"Tidak. Semua harga dihasilkan mesin simulasi internal (price engine) yang berjalan di browser kamu."},
  {"q":"Bisa deposit/withdraw uang?","a":"Tidak. Saldo awal Rp100.000.000 adalah uang virtual dan tidak bisa diuangkan atau ditransfer ke mana pun."},
  {"q":"Apakah data saya aman?","a":"Tidak ada data yang dikirim ke server. Semua progres tersimpan di localStorage browser kamu sendiri."},
  {"q":"Apakah game ini gratis?","a":"Ya, gratis dan berjalan offline setelah file dimuat. Tidak ada iklan, analytics, atau tracking."},
  {"q":"Mengapa order saya ditolak?","a":"Cek fase bursa: sesi pra-pembukaan (07:00–08:59 WIB) menolak order. Cek juga kecukupan kas atau jumlah lot yang kamu miliki."},
  {"q":"Bagaimana cara menghitung fee?","a":"Fee 0,15% dari nilai pokok transaksi: ditambahkan ke total saat beli, dan dipotong dari hasil saat jual."},
  {"q":"Apa itu tombol MAX?","a":"Saat beli: jumlah lot maksimal yang terbeli dengan kas kamu (termasuk fee). Saat jual: seluruh lot yang kamu miliki untuk emiten itu."},
  {"q":"Mengapa harga tidak bergerak?","a":"Harga hanya bergerak saat sesi buka (09:00–15:59 WIB, Senin–Jumat). Di luar itu harga membeku di nilai penutupan terakhir."},
  {"q":"Apa efek berita terhadap harga?","a":"Berita menggeser nilai wajar (fairValue) emiten/sektor selama durasi tertentu. Efek bisa memudar perlahan (linear) atau hilang mendadak (step)."},
  {"q":"Bagaimana naik level?","a":"Kumpulkan XP: baca berita (+10), eksekusi order (+5, maks 50/hari), klaim misi, dan buka badge. Setiap level butuh 250 XP."},
  {"q":"Bagaimana dapat badge?","a":"Badge terbuka otomatis saat syaratnya terpenuhi — beli pertama, profit pertama, baca 10 berita, dan lainnya. Daftar lengkap ada di Profil."},
  {"q":"Progres hilang jika tutup browser?","a":"Tidak, selama localStorage tidak dihapus. Menghapus data situs/cache browser akan menghapus progres."},
  {"q":"Cara reset simulasi?","a":"Profil → Reset Simulasi → konfirmasi dua langkah dengan mengetik RESET. Saldo kembali ke Rp100.000.000."},
  {"q":"Cara hapus semua data saya?","a":"Profil → Hapus Data Simulasi → konfirmasi. Seluruh data localStorage game dihapus permanen dan game kembali ke tampilan awal."}
 ],
 "legal":{
  "disclaimer":"Terminal Sudirman adalah simulator edukasi, bukan platform trading. Seluruh aset, saldo, dan harga di dalam game adalah virtual dan tidak memiliki nilai uang nyata. Tidak ada koneksi ke broker, bank, atau API pasar riil. Konten di sini bukan nasihat keuangan, legal, atau investasi. Kinerja di simulasi tidak menjamin hasil di pasar nyata. Kamu bertanggung jawab penuh atas keputusan keuanganmu sendiri.",
  "privacy":[
   {"h":"1. Data yang disimpan","p":"Nama pemain (opsional), status persetujuan, status usia, portofolio virtual, kas, XP, level, badge, misi, berita terbaca, watchlist, riwayat transaksi virtual, dan timestamp sesi."},
   {"h":"2. Lokasi penyimpanan","p":"Seluruh data disimpan secara lokal di localStorage browser kamu (key: terminal-sudirman-save-v1 beserta slot backup). Tidak ada server, tidak ada pengiriman data keluar."},
   {"h":"3. Tujuan pemrosesan","p":"Semata-mata untuk melanjutkan sesi permainan: memulihkan progres, menghitung progres offline, dan menampilkan statistik pribadi kamu."},
   {"h":"4. Retensi","p":"Data disimpan sampai kamu menghapusnya sendiri lewat tombol Hapus Data Simulasi, atau sampai browser menghapus localStorage (mis. hapus data situs)."},
   {"h":"5. Hak pengguna","p":"Hak akses: tombol Lihat Data Saya mengunduh seluruh data sebagai JSON. Hak hapus: tombol Hapus Data Simulasi. Hak koreksi: nama pemain bisa diubah kapan saja di Profil."},
   {"h":"6. Kontak & keamanan","p":"Data hanya tersimpan di browser kamu. Kehilangan data bisa terjadi jika kamu menghapus cache/localStorage. Karena tidak ada server, tidak ada risiko kebocoran data terpusat dan tidak ada kewajiban notifikasi breach 3x24 jam. Pertanyaan privasi dapat disampaikan ke pengembang melalui kanal distribusi game ini."}
  ],
  "tos":[
   {"h":"Pasal 1 — Nature of Service","p":"Terminal Sudirman adalah simulasi edukasi. Semua aset bersifat virtual dan tidak terhubung ke broker, bank, atau pasar riil mana pun."},
   {"h":"Pasal 2 — No Investment Advice","p":"Konten game bukan nasihat keuangan, investasi, pajak, atau hukum. Pengembang bukan penasihat investasi berlisensi."},
   {"h":"Pasal 3 — Limitation of Liability","p":"Pengembang tidak bertanggung jawab atas kerugian nyata apa pun yang timbul dari keputusan keuangan pengguna, termasuk keputusan yang terinspirasi simulasi ini."},
   {"h":"Pasal 4 — Accuracy of Data","p":"Seluruh harga, berita, dan event adalah fiksi simulasi tanpa jaminan akurasi terhadap kondisi pasar sebenarnya."},
   {"h":"Pasal 5 — Intellectual Property","p":"Seluruh kode, desain, dan konten game milik pengembang. Aset visual dibuat sendiri sebagai SVG inline."},
   {"h":"Pasal 6 — Modifications","p":"Ketentuan ini dapat berubah sewaktu-waktu. Penggunaan berkelanjutan setelah perubahan dianggap sebagai persetujuan."}
  ],
  "breach":"Data hanya tersimpan di browser kamu. Kehilangan data bisa terjadi jika kamu menghapus cache/localStorage."
 },
 "copy":{
  "nav":["Beranda","Pasar","Berita","Portofolio","Profil"],
  "phase":{"open":"BURSA BUKA • LIVE","preMarket":"PRA-PEMBUKAAN","closed":"PASAR TUTUP","weekend":"AKHIR PEKAN • TERKUNCI"},
  "toast":{
   "buySuccess":"Beli {lots} Lot {code} @ Rp{price} — Total Rp{total}",
   "sellSuccess":"Jual {lots} Lot {code} @ Rp{price} — Diterima Rp{total}",
   "levelUp":"Naik ke Level {level} — {rank}!",
   "badgeUnlock":"Lencana terbuka: {name} (+{xp} XP)",
   "missionClaim":"Misi selesai: +{xp} XP",
   "marketClosed":"Bursa belum buka — antrian order mulai 09:00 WIB",
   "insufficientCash":"Kas tidak cukup untuk order ini",
   "insufficientLots":"Lot melebihi kepemilikan kamu",
   "watchlistFull":"Watchlist maksimal 6 emiten",
   "offlineProgress":"Pasar bergerak selama kamu pergi. Ekuitas: {delta}",
   "resetSuccess":"Simulasi direset. Modal kembali Rp100.000.000.",
   "dataCleared":"Semua data simulasi dihapus.",
   "newsReadXP":"Berita dibaca: +10 XP",
   "watchlistAdded":"{code} ditambahkan ke watchlist",
   "watchlistRemoved":"{code} dihapus dari watchlist",
   "nameSaved":"Nama tersimpan.",
   "exportDone":"Data diekspor sebagai JSON.",
   "saveQuota":"Penyimpanan penuh. Hapus data lama?",
   "ledgerTrimmed":"Riwayat transaksi dipangkas agar hemat ruang.",
   "restoreFail":"Backup tidak ditemukan atau ikut rusak.",
   "eventStarted":"Event dimulai: {title}",
   "eventMinor":"Mode Muda: event volatil dinonaktifkan.",
   "eventPhase":"Fase event: {label}",
   "trimLedger":"Hapus Riwayat"
  },
  "confirm":{
   "reset1":"Reset simulasi? Semua progres hilang.","reset1Yes":"Ya, reset",
   "reset2":"Ketik RESET untuk konfirmasi:","reset2Btn":"Konfirmasi",
   "clear":"Hapus semua data simulasi secara permanen?","clearYes":"Hapus","cancel":"Batal"
  },
  "empty":{
   "watchlist":"Belum ada emiten dipantau. Tambahkan dari Pasar.",
   "holdings":"Portofolio masih kosong. Mulai dari satu emiten?",
   "ledger":"Belum ada transaksi tercatat.",
   "news":"Belum ada berita baru hari ini.",
   "search":"Tidak ada emiten cocok filter.",
   "badges":"Selesaikan misi pertama untuk membuka badge."
  },
  "reason":{
   "INVALID_LOT":"Lot minimal 1 (bilangan bulat)",
   "INSUFFICIENT_CASH":"Kas tidak cukup untuk order ini",
   "INSUFFICIENT_LOTS":"Lot melebihi kepemilikan kamu",
   "MARKET_CLOSED":"Bursa belum buka — antrian order mulai 09:00 WIB"
  },
  "banner":{
   "preMarket":"Baca berita pagi sebelum bel pembukaan 09:00 WIB",
   "weekend":"Transaksi aktif di harga Jumat. Gap Senin 09:00 WIB",
   "storage":"Browser kamu memblokir localStorage. Progres tidak akan tersimpan.",
   "dataDelayed":"Data tertunda",
   "event":"EVENT BERLANGSUNG"
  },
  "label":{
   "heroTitle":"TOTAL NILAI PORTOFOLIO (IDR)","totalReturn":"Imbal Hasil Total","cash":"Daya Beli (Kas)","quickCash":"KAS",
   "watchlist":"Pantauan Cepat","dailyMissions":"Misi Harian","missions":"Misi","claim":"Klaim +XP","claimReady":"Klaim","claimed":"Selesai","running":"Berjalan",
   "allocation":"Peta Alokasi Aset","holdings":"Kepemilikan","ledger":"Riwayat Transaksi","avgBuy":"Avg Buy","nowPrice":"Harga Kini","marketValue":"Nilai Pasar","unrealized":"Unrealized P/L",
   "buyShort":"+ Beli","sellShort":"- Jual","buyTab":"BELI SAHAM","sellTab":"JUAL SAHAM","principal":"Nilai Pokok","fee":"Biaya Transaksi BEI (0,15%)","totalDebit":"Total Debet Kas","totalCredit":"Total Kredit Kas","cashAfter":"Sisa Kas Setelah Order","execBuy":"EKSEKUSI BELI","execSell":"EKSEKUSI JUAL",
   "position":"Posisi Anda","lot":"Lot","shares":"lbr","max":"MAX","high":"H","low":"L","xp":"XP","level":"Level","rank":"Pangkat Trader","badges":"Lencana (12)","daily":"Harian","weekly":"Mingguan",
   "simPanel":"Panel Simulasi","ujiEvent":"Simulasikan Event: Reshuffle Menkeu","ujiEventDesc":"Menjalankan event 3 fase (Rumor → Konfirmasi → Resolusi) berbasis jam simulasi.",
   "resetSim":"Reset Simulasi","resetSimDesc":"Kembalikan modal ke Rp100.000.000. Perlu konfirmasi dua langkah.",
   "exportData":"Lihat Data Saya","exportDesc":"Unduh seluruh data simulasi kamu sebagai file JSON.",
   "clearData":"Hapus Data Simulasi","clearDesc":"Hapus permanen semua data dari localStorage browser ini.",
   "ageStatus":"Status Usia","adult":"Terverifikasi 17+ — Mode Normal","minor":"Mode Muda — volatilitas kalem, event volatil nonaktif",
   "faqLink":"Buka FAQ (15 pertanyaan)","nameEdit":"Ubah","nameSave":"Simpan","nameLabel":"Nama Trader",
   "searchPlaceholder":"Cari kode atau nama emiten... [/]","resetFilter":"Reset Filter","explore":"Jelajahi Pasar Saham","exploreShort":"Jelajahi Pasar","reload":"Muat Ulang",
   "simNews":"Simulasi — bukan berita asli","newsFooter":"Seluruh skenario berita adalah fiksi untuk tujuan edukasi. Kemiripan dengan peristiwa nyata bersifat kebetulan.",
   "meterTitle":"DAMPAK PASAR (BERITA METER)","atRelease":"Harga Saat Rilis","now":"Harga Sekarang","remaining":"Sisa","effectDone":"Efek selesai","noEffect":"Tanpa efek harga",
   "sortDefault":"Default","sortGain":"Top Gainer (%)","sortLose":"Top Loser (%)","sortPrice":"Harga Tertinggi","all":"Semua","eventCat":"Event Khusus",
   "affected":"Sektor terdampak","left":"tersisa","detail":"Detail Saham","order":"Order","sharesPerLot":"1 Lot = 100 lbr","watchAdd":"Tambah {code} ke watchlist","watchRemove":"Hapus {code} dari watchlist",
   "close":"Tutup","back":"Kembali","screenerTitle":"IDX Screener","newsTitle":"Sentiment & Berita","profileTitle":"Karir Trader","faqTitle":"Pertanyaan yang Sering Diajukan","feeShort":"Fee 0,15%","qty":"lot × harga","time":"Waktu","xpMax":"MAKS"
  },
  "sentiment":{"bullish":"BULLISH","bearish":"BEARISH","neutral":"NETRAL"},
  "side":{"buy":"Beli","sell":"Jual","BUY":"BELI","SELL":"JUAL"},
  "boot":{
   "corruptTitle":"Save tidak terbaca","corruptBody":"Data progres rusak atau tidak kompatibel. Kamu bisa mulai baru atau mencoba memulihkan dari slot backup.","reset":"Reset","restore":"Coba Pulihkan",
   "consentTitle":"Izin Penyimpanan Lokal","consentBody":"Game ini menyimpan progres di browser kamu (localStorage). Tidak ada data yang dikirim ke server.","consentOk":"Mengerti","consentLearn":"Pelajari",
   "ageTitle":"Verifikasi Usia","ageBody":"Apakah kamu sudah 17 tahun ke atas?","ageYes":"Ya, saya 17+","ageNo":"Belum","ageMinorNote":"Mode Muda aktif: volatilitas lebih kalem dan event volatil dinonaktifkan.",
   "onbSkip":"Lewati","onbNext":"Lanjut","onbStart":"Mulai Trading",
   "errorTitle":"Simulasi tidak bisa dimuat.","errorBody":"Mesin simulasi gagal dimulai. Coba muat ulang halaman."
  },
  "onboarding":[
   {"t":"Selamat datang di Terminal Sudirman.","b":"Kamu mulai dengan modal virtual Rp100.000.000. Tidak ada uang nyata di sini."},
   {"t":"Cara main.","b":"Baca berita → prediksi dampak → beli/jual di layar Pasar → klaim misi & badge di Profil."},
   {"t":"Ingat.","b":"Ini simulasi edukasi. Bukan nasihat keuangan. Semua harga fiktif."}
  ],
  "announce":{
   "open":"Bursa buka. Live trading dimulai.","preMarket":"Sesi pra-pembukaan dimulai.","closed":"Bursa tutup. Harga membeku di nilai penutupan.","weekend":"Akhir pekan. Pasar terkunci hingga Senin.",
   "order":"Order berhasil: {side} {lots} Lot {code}, total {total}","levelUp":"Naik level. Sekarang Level {level}, {rank}.","badge":"Lencana terbuka: {name}. Plus {xp} XP.","mission":"Misi selesai: {desc}. Klaim {xp} XP.","corrupt":"Penyimpanan tidak terbaca. Pilih reset atau pulihkan."
  },
  "legalTitle":{"privacy":"Privacy Notice","tos":"Terms of Service","disclaimer":"Disclaimer"},
  "misc":{"wib":"WIB","of":"dari","progress":"Progres","target":"Target","reward":"Hadiah","locked":"Terkunci","unlocked":"Terbuka","read":"Dibaca","unread":"Baru","justNow":"baru saja"}
 }
};