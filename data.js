// ===== Edit data portofolio di sini =====
const DATA = {
  nama: "Muhamad Rafi Zaki",
  githubUser: "RafiZaki1",
  linkedin: "https://www.linkedin.com/in/rafi-zaki-29a823441",
  instagram: "https://instagram.com/rrfi_z",
  email: "rafizaki745@gmail.com",
  telepon: "0857-3050-2173",
  lokasi: "Mojokerto, Jawa Timur",

  // Kalimat yang berganti-ganti pada efek mengetik di bagian atas
  peran: ["Backend Developer", "Laravel & Spring Boot", "RESTful API", "Belajar TypeScript & React"],
  // Hobi, tampil di bagian Tentang (opsional)
  hobi: ["Badminton", "Berenang", "Lari"],
  // Repo yang ingin ditampilkan paling atas (nama repo). Sisanya urut update terbaru.
  repoUnggulan: [],

  // Karya pilihan: tampil besar dengan gambar. Yang pertama tampil paling lebar.
  karya: [
    {
      judul: "Cekrek",
      jenis: "Photobooth online",
      gambar: "assets/karya-cekrek.jpg",
      deskripsi:
        "Photobooth di browser: ambil 4 pose, pilih frame (koran, musik, film, Y2K, dan lainnya), lalu unduh strip fotonya. Ada mode Bilik Foto LDR untuk berfoto berdua dari tempat berbeda secara langsung, dan bisa dipasang sebagai aplikasi di HP.",
      teknologi: ["JavaScript", "Vite", "PHP", "PeerJS", "PWA"],
      demo: "https://www.rafiz.my.id",
      kode: "https://github.com/RafiZaki1/Phootobooth",
    },
    {
      judul: "Portal Web SMKN 2 Mojokerto",
      jenis: "Website sekolah",
      gambar: "assets/karya-jhic.jpg",
      deskripsi:
        "Portal sekolah dengan frontend Next.js dan backend REST API Laravel. Berisi profil jurusan, kuis pemilihan jurusan, informasi PPDB, loker & BKK, chatbot, serta pilihan bahasa dan tema.",
      teknologi: ["Laravel 13", "REST API", "Next.js", "React", "MySQL"],
      demo: "",
      kode: "https://github.com/RafiZaki1/Web-School-Smk-2-Mojokerto",
    },
    {
      judul: "Peta 3D Denah Sekolah",
      jenis: "Fitur di portal SMKN 2",
      gambar: "assets/karya-denah3d.jpg",
      deskripsi:
        "Denah sekolah dalam bentuk 3D yang bisa dijelajahi dengan karakter, mode drone, dan minimap. Rute antarruangan dihitung di backend dengan algoritma Dijkstra mengikuti jalur koridor.",
      teknologi: ["Three.js", "React Three Fiber", "Laravel", "Dijkstra"],
      demo: "",
      kode: "https://github.com/RafiZaki1/Web-School-Smk-2-Mojokerto",
    },
  ],

  // Repo yang disembunyikan dari daftar "Repo lain di GitHub" (nama repo)
  repoSembunyi: ["Phootobooth", "Web-School-Smk-2-Mojokerto"],

  skill: [
    { grup: "Backend", item: ["PHP (Laravel)", "Java (Spring Boot)", "RESTful API", "MySQL"] },
    { grup: "Frontend", item: ["TypeScript", "React", "JavaScript", "HTML", "CSS"] },
    { grup: "Tools", item: ["Git & GitLab", "GitHub", "Laragon"] },
    { grup: "Soft skill", item: ["Kerja tim", "Komunikasi", "Problem solving", "Mau belajar hal baru"] },
  ],

  pengalaman: [
    {
      posisi: "Intern Backend & Frontend Developer",
      instansi: "PT Humma Teknologi Indonesia",
      periode: "Apr 2026 – Okt 2026",
      poin: [
        "Mengembangkan aplikasi web di sisi backend dan frontend pada project GetSkill.",
        "Membangun dan mengelola REST API dengan Laravel (PHP) dan Spring Boot (Java).",
        "Mengelola database MySQL, membuat query, dan menjaga integritas serta keamanan data.",
        "Mengintegrasikan frontend dan backend agar fitur berjalan sesuai kebutuhan.",
        "Melakukan pengujian, debugging, dan perbaikan fitur maupun API.",
        "Memakai Git/GitLab untuk version control dan kolaborasi tim.",
      ],
    },
  ],

  pendidikan: [
    { nama: "SMKN 2 Mojokerto", detail: "Rekayasa Perangkat Lunak (RPL), kelas 12", periode: "2024 – 2027" },
    { nama: "SMPN 4 Mojokerto", detail: "", periode: "2021 – 2024" },
    { nama: "MI Nurul Huda 2", detail: "", periode: "2014 – 2021" },
  ],

  // tahun & link boleh dikosongkan; isi link dengan URL gambar/PDF sertifikat
  sertifikat: [
    { judul: "Pelatihan Laravel", penerbit: "Minarsih Tech", tahun: "", link: "" },
    { judul: "Magang Backend Developer, 6 bulan", penerbit: "PT Humma Teknologi Indonesia", tahun: "2026", link: "" },
  ],

  // Isi sendiri. Entri yang judulnya diawali "Nama ..." tidak ditampilkan.
  prestasi: [
    { judul: "Nama Prestasi / Lomba", detail: "Juara / peran, penyelenggara", tahun: "2026" },
  ],
};
