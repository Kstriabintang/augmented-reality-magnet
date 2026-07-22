// Sumber tunggal soal & diagram Magnet & Listrik — dipakai kuis (/js/kuis.js) & admin.
export const FIG = {
  garisGaya: `<svg viewBox="0 0 340 200" role="img" aria-label="Garis gaya magnet batang dengan arah A B C D">
    <g fill="none" stroke="#8aa0bd" stroke-width="1.5" stroke-dasharray="4 4">
      <path d="M150 100 C 120 46, 220 46, 190 100"/><path d="M150 100 C 100 26, 240 26, 190 100"/>
      <path d="M150 100 C 120 154, 220 154, 190 100"/><path d="M150 100 C 100 174, 240 174, 190 100"/></g>
    <rect x="150" y="86" width="40" height="28" fill="#e23c3c"/><rect x="190" y="86" width="40" height="28" fill="#2f6fd0"/>
    <text x="170" y="105" font-size="15" fill="#fff" text-anchor="middle" font-weight="800" font-family="sans-serif">U</text>
    <text x="210" y="105" font-size="15" fill="#fff" text-anchor="middle" font-weight="800" font-family="sans-serif">S</text>
    <!-- A (atas, benar: U->S) --><g stroke="#1f9c4d" stroke-width="3" fill="#1f9c4d">
      <line x1="150" y1="52" x2="186" y2="52"/><polygon points="186,46 186,58 198,52"/></g>
    <text x="150" y="42" font-size="14" fill="#1f7a3d" font-weight="800" font-family="sans-serif">A</text>
    <!-- B (bawah, benar: U->S) --><g stroke="#1f9c4d" stroke-width="3" fill="#1f9c4d">
      <line x1="150" y1="150" x2="186" y2="150"/><polygon points="186,144 186,156 198,150"/></g>
    <text x="150" y="170" font-size="14" fill="#1f7a3d" font-weight="800" font-family="sans-serif">B</text>
    <!-- C (kanan, salah: menjauh S) --><g stroke="#c05" stroke-width="3" fill="#c05">
      <line x1="248" y1="70" x2="284" y2="70"/><polygon points="284,64 284,76 296,70"/></g>
    <text x="300" y="66" font-size="14" fill="#b03060" font-weight="800" font-family="sans-serif">C</text>
    <!-- D (kanan bawah, salah) --><g stroke="#c05" stroke-width="3" fill="#c05">
      <line x1="248" y1="140" x2="284" y2="140"/><polygon points="284,134 284,146 296,140"/></g>
    <text x="300" y="150" font-size="14" fill="#b03060" font-weight="800" font-family="sans-serif">D</text></svg>`,
  kekuatan: `<svg viewBox="0 0 340 180" role="img" aria-label="Titik kekuatan magnet A B C D">
    <g fill="none" stroke="#8aa0bd" stroke-width="1.4" stroke-dasharray="4 4">
      <path d="M150 90 C 120 40, 220 40, 190 90"/><path d="M150 90 C 100 20, 240 20, 190 90"/>
      <path d="M150 90 C 120 140, 220 140, 190 90"/><path d="M150 90 C 100 160, 240 160, 190 90"/></g>
    <rect x="150" y="76" width="40" height="28" fill="#e23c3c"/><rect x="190" y="76" width="40" height="28" fill="#2f6fd0"/>
    <text x="170" y="95" font-size="15" fill="#fff" text-anchor="middle" font-weight="800" font-family="sans-serif">U</text>
    <text x="210" y="95" font-size="15" fill="#fff" text-anchor="middle" font-weight="800" font-family="sans-serif">S</text>
    <!-- A: dekat kutub U (rapat=kuat) --><circle cx="142" cy="90" r="6" fill="#ff8c1a"/><text x="128" y="95" font-size="14" fill="#a9600a" font-weight="800" font-family="sans-serif">A</text>
    <!-- D: dekat kutub S (rapat=kuat) --><circle cx="238" cy="90" r="6" fill="#ff8c1a"/><text x="246" y="95" font-size="14" fill="#a9600a" font-weight="800" font-family="sans-serif">D</text>
    <!-- B & C: jauh (renggang=lemah) --><circle cx="190" cy="30" r="6" fill="#8aa0bd"/><text x="196" y="30" font-size="14" fill="#5a6b82" font-weight="800" font-family="sans-serif">B</text>
    <circle cx="190" cy="150" r="6" fill="#8aa0bd"/><text x="196" y="155" font-size="14" fill="#5a6b82" font-weight="800" font-family="sans-serif">C</text></svg>`,
  rangkaian: `<svg viewBox="0 0 340 170" role="img" aria-label="Dua rangkaian listrik A menyala B mati">
    <!-- Rangkaian A: tertutup, lampu menyala -->
    <g stroke="#22c55e" stroke-width="4" fill="none" stroke-linecap="round"><rect x="24" y="40" width="120" height="80" rx="4"/></g>
    <circle cx="84" cy="40" r="15" fill="#fff2a8" stroke="#c9a94a" stroke-width="2"/>
    <g stroke="#ffd54a" stroke-width="2.4" stroke-linecap="round" opacity=".85"><path d="M84 16 V6"/><path d="M66 26 L58 18"/><path d="M102 26 L110 18"/></g>
    <rect x="66" y="112" width="36" height="14" rx="2" fill="#2b3040"/><rect x="72" y="110" width="5" height="18" fill="#e23c3c"/><rect x="90" y="112" width="5" height="14" fill="#ffb14d"/>
    <text x="84" y="150" font-size="12" fill="#1f7a3d" text-anchor="middle" font-weight="800" font-family="sans-serif">A · menyala</text>
    <!-- Rangkaian B: putus, lampu mati -->
    <g stroke="#94a3b8" stroke-width="4" fill="none" stroke-linecap="round"><path d="M196 40 H316 V120 H255"/><path d="M235 120 H196 V40"/></g>
    <circle cx="256" cy="40" r="15" fill="#3a4358" stroke="#5a6577" stroke-width="2"/>
    <line x1="235" y1="120" x2="245" y2="112" stroke="#e23c3c" stroke-width="3" stroke-linecap="round"/>
    <rect x="238" y="112" width="36" height="14" rx="2" fill="#2b3040"/>
    <text x="256" y="150" font-size="12" fill="#b03060" text-anchor="middle" font-weight="800" font-family="sans-serif">B · mati (putus)</text></svg>`,
};

// ---------- 20 soal (kisi-kisi Magnet & Listrik) ----------
export const QUESTIONS = [
  { t:"Pengertian magnet", q:"Kemampuan suatu benda untuk menarik benda tertentu disebut…", opts:["Magnet","Listrik","Gaya gravitasi","Gaya gesek"], correct:0, pembahasan:"Magnet adalah benda yang memiliki kemampuan menarik benda tertentu seperti besi dan baja." },
  { t:"Kekuatan magnet", q:"Setiap magnet memiliki kemampuan untuk menarik benda tertentu seperti paku dan besi. Kemampuan magnet untuk menarik benda disebut…", opts:["Gaya gesek","Kekuatan magnet","Gaya tarik","Gaya dorong"], correct:1, pembahasan:"Kekuatan magnet adalah kemampuan magnet dalam menarik benda-benda magnetis." },
  { t:"Energi listrik", q:"Energi listrik merupakan energi yang dihasilkan dari adanya…", opts:["Gerakan air","Aliran muatan listrik","Cahaya matahari","Hembusan angin"], correct:1, pembahasan:"Energi listrik berasal dari aliran muatan listrik melalui penghantar." },
  { t:"Sifat kemagnetan hilang", q:"Sebuah magnet digunakan terus-menerus dan sering terkena benturan keras sehingga tidak dapat menarik benda. Sifat kemagnetan suatu benda dapat hilang jika benda tersebut…", opts:["Direndam air","Dipukul-pukul","Dilapisi kain","Dibakar"], correct:1, pembahasan:"Benturan keras dapat mengacak susunan partikel (magnet elementer) sehingga sifat kemagnetannya berkurang atau hilang." },
  { t:"Benda magnetis", q:"Perhatikan benda-benda berikut: (1) Paku (2) Kayu (3) Besi (4) Plastik. Benda yang dapat ditarik oleh magnet ditunjukkan oleh nomor…", opts:["1 dan 4","1 dan 3","2 dan 3","2 dan 4"], correct:1, pembahasan:"Paku dan besi termasuk benda magnetis yang dapat ditarik magnet, sedangkan kayu dan plastik tidak." },
  { t:"Faktor kekuatan magnet", q:"Magnet A dapat menarik lebih banyak paku dibandingkan magnet B. Hal tersebut menunjukkan bahwa kekuatan magnet dapat dipengaruhi oleh…", opts:["Besar kecilnya gaya magnet","Warna magnet","Bentuk benda yang ditarik","Jumlah garis pada magnet"], correct:0, pembahasan:"Semakin besar gaya magnet, semakin banyak benda yang dapat ditarik." },
  { t:"Komponen rangkaian", q:"Perhatikan komponen berikut: (1) Baterai (2) Kabel (3) Lampu (4) Besi kecil. Komponen penyusun rangkaian listrik sederhana ditunjukkan oleh nomor…", opts:["1, 3, dan 4","4, 3, dan 2","1, 2, dan 4","1, 2, dan 3"], correct:3, pembahasan:"Rangkaian listrik sederhana terdiri atas sumber listrik (baterai), kabel, dan beban seperti lampu." },
  { t:"Interaksi kutub", q:"Sebuah magnet batang dengan kutub utara didekatkan dengan kutub selatan magnet lain. Apa yang akan terjadi?", opts:["Kedua magnet tolak-menolak","Magnet dengan kutub utara menarik yang selatan","Magnet dengan kutub selatan menarik yang utara","Kedua magnet saling tarik-menarik"], correct:3, pembahasan:"Kutub utara dan kutub selatan merupakan kutub berbeda sehingga saling tarik-menarik." },
  { t:"Pemanfaatan magnet", q:"Roni ingin membuat penutup kotak pensil yang dapat menutup rapat dan mudah dibuka tanpa kunci. Bahan yang paling tepat digunakan bersama magnet adalah…", opts:["Magnet dan plastik","Magnet dan besi","Magnet dan kardus","Magnet dan kayu"], correct:1, pembahasan:"Besi merupakan bahan yang dapat ditarik magnet sehingga penutup dapat menempel dengan baik." },
  { t:"Rangkaian tertutup", q:"Rani membuat rangkaian listrik sederhana, namun lampu tidak menyala karena salah satu kabel terlepas. Agar lampu menyala kembali maka harus…", opts:["Mengganti lampu dengan kipas","Memutus semua kabel","Menyambung kembali kabel yang terlepas","Menambah lampu lagi pada rangkaian"], correct:2, pembahasan:"Lampu hanya menyala jika rangkaian listrik tertutup sehingga arus dapat mengalir." },
  { t:"Arah garis gaya", q:"Perhatikan gambar garis gaya magnet berikut. Arah garis gaya yang tepat ditunjukkan oleh…", fig:"garisGaya", opts:["A dan B","B dan C","C dan D","A dan D"], correct:0, pembahasan:"Garis gaya magnet selalu keluar dari kutub utara (U) menuju kutub selatan (S) di luar magnet. Panah A dan B mengikuti arah tersebut." },
  { t:"Letak kekuatan magnet", q:"Perhatikan gambar garis gaya magnet berikut. Titik yang menunjukkan kekuatan magnet paling kuat adalah…", fig:"kekuatan", opts:["A dan B","A dan D","B dan C","D dan C"], correct:1, pembahasan:"Kekuatan magnet paling besar berada di sekitar kedua kutub (titik A dan D) karena di sana garis gayanya paling rapat." },
  { t:"Aliran listrik", q:"Perhatikan dua rangkaian berikut. Rangkaian A tersambung sempurna sehingga lampu menyala; rangkaian B kabelnya putus sehingga lampu mati. Perbedaan aliran energi listriknya adalah…", fig:"rangkaian", opts:["Rangkaian A dan B sama-sama tidak memiliki aliran listrik","Energi listrik hanya mengalir pada rangkaian tertutup","Energi listrik hanya mengalir pada rangkaian terbuka","Semua rangkaian dapat mengalirkan listrik"], correct:1, pembahasan:"Arus listrik hanya dapat mengalir jika jalur rangkaian tersambung sempurna (tertutup)." },
  { t:"Pengertian rangkaian", q:"Senter dapat menyala karena di dalamnya terdapat baterai, lampu, sakelar, dan kabel yang saling terhubung sehingga arus dapat mengalir. Berdasarkan ilustrasi tersebut, rangkaian listrik adalah…", opts:["Alat yang digunakan untuk menghasilkan cahaya","Susunan beberapa komponen listrik yang saling dihubungkan sehingga arus listrik dapat mengalir","Energi yang dihasilkan oleh baterai","Benda yang dapat menghantarkan panas"], correct:1, pembahasan:"Rangkaian listrik adalah susunan komponen (baterai, lampu, sakelar, kabel) yang saling terhubung sehingga arus listrik dapat mengalir." },
  { t:"Konsep kutub sama", q:"Perhatikan pernyataan: \"Kutub magnet yang sama akan saling tarik-menarik karena garis gaya magnetnya bertemu.\" Tanggapan yang tepat adalah…", opts:["Benar, karena kutub yang sama akan tarik-menarik","Benar, karena kutub berbeda akan tolak-menolak","Salah, karena kutub yang sama akan tolak-menolak","Salah, karena kutub yang sama akan tarik-menarik"], correct:2, pembahasan:"Kutub magnet yang sama saling tolak-menolak, sedangkan kutub berbeda saling tarik-menarik." },
  { t:"Sifat magnet", q:"Seorang siswa mengambil benda dari kotak berisi campuran pasir, paku, dan potongan plastik. Ia mengatakan semua benda dalam kotak dapat ditarik magnet. Tanggapan yang tepat adalah…", opts:["Benar, karena magnet dapat menarik semua benda","Benar, karena pasir dan magnet adalah benda magnetis","Salah, karena magnet hanya dapat menarik benda tertentu seperti paku","Salah, karena magnet hanya menarik benda cair"], correct:2, pembahasan:"Magnet hanya menarik benda magnetis seperti besi, baja, nikel, dan kobalt — bukan semua benda." },
  { t:"Hemat listrik", q:"Edo menyalakan televisi sepanjang hari meskipun tidak ditonton. Bagaimana tindakan Edo tersebut?", opts:["Tepat, karena televisi harus selalu menyala","Tepat, karena energi listrik tidak akan habis","Kurang tepat, karena tidak membutuhkan banyak listrik","Kurang tepat, karena menyebabkan pemborosan energi listrik"], correct:3, pembahasan:"Peralatan listrik yang tidak digunakan sebaiknya dimatikan agar energi tidak terbuang (hemat energi)." },
  { t:"Penerapan magnet", q:"Rina ingin membuat tempelan catatan pada pintu kulkas menggunakan magnet. Benda yang paling tepat digunakan bersama magnet agar catatan menempel baik adalah…", opts:["Kayu","Kertas","Plastik","Besi"], correct:3, pembahasan:"Besi merupakan bahan magnetis sehingga dapat menempel kuat pada magnet." },
  { t:"Memisahkan benda", q:"Dito ingin memisahkan campuran: pasir, paku, potongan kayu, dan serbuk kayu. Rancangan penggunaan magnet yang paling tepat adalah…", opts:["Magnet digerakkan untuk menarik semua benda","Magnet digunakan untuk memisahkan paku dari benda lain","Magnet digunakan untuk menarik pasir dan serbuk kayu","Magnet ditempelkan pada kertas"], correct:1, pembahasan:"Magnet hanya menarik paku (benda magnetis) sehingga dapat memisahkannya dari pasir dan kayu." },
  { t:"Merancang rangkaian", q:"Dika punya baterai, lampu kecil, kabel, dan saklar. Rancangan yang paling tepat agar lampu menyala adalah…", opts:["Baterai disambungkan ke lampu menggunakan kabel membentuk rangkaian tertutup","Baterai dihubungkan ke baterai tanpa kabel","Baterai diletakkan dekat lampu tanpa disambungkan","Kabel hanya disambungkan ke sakelar tanpa lampu"], correct:0, pembahasan:"Rangkaian tertutup memungkinkan arus listrik mengalir sehingga lampu dapat menyala." },
];
