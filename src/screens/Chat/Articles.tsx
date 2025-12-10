import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../config/color';

const articlesData = [
  {
    id: '1',
    title: 'Tips Merawat Anjing di Rumah',
    description: 'Pelajari cara merawat anjing dengan baik di rumah, mulai dari pemberian makan, olahraga, hingga perawatan kesehatan...',
    content: `Merawat anjing di rumah memerlukan perhatian dan komitmen yang konsisten. Berikut adalah beberapa tips penting untuk memastikan hewan peliharaan Anda tetap sehat dan bahagia:

1. Pemberian Makan yang Teratur
   - Berikan makanan berkualitas tinggi sesuai dengan usia dan ukuran anjing
   - Jadwalkan waktu makan yang konsisten (2-3 kali sehari untuk dewasa)
   - Selalu sediakan air bersih yang cukup
   - Hindari memberikan makanan manusia yang berbahaya

2. Olahraga dan Aktivitas Fisik
   - Ajak anjing berjalan-jalan minimal 30 menit setiap hari
   - Berikan mainan interaktif untuk stimulasi mental
   - Sesuaikan intensitas olahraga dengan usia dan breed anjing
   - Pertimbangkan aktivitas seperti fetch, berenang, atau agility training

3. Perawatan Kesehatan
   - Lakukan vaksinasi rutin sesuai jadwal yang direkomendasikan dokter hewan
   - Berikan obat cacing secara berkala
   - Periksa kesehatan gigi dan mulut secara rutin
   - Perhatikan tanda-tanda penyakit seperti perubahan nafsu makan, perilaku, atau kondisi fisik

4. Perawatan Fisik
   - Sikat bulu anjing secara teratur (frekuensi tergantung jenis bulu)
   - Potong kuku secara berkala
   - Bersihkan telinga dan mata dengan lembut
   - Mandikan anjing sesuai kebutuhan (biasanya 1-2 kali per bulan)

5. Pelatihan dan Sosialisasi
   - Mulai pelatihan sejak dini dengan metode positive reinforcement
   - Ajarkan perintah dasar seperti duduk, diam, dan datang
   - Sosialisasikan anjing dengan manusia dan hewan lain
   - Konsisten dalam aturan dan batasan

6. Lingkungan yang Aman
   - Pastikan rumah dan halaman aman untuk anjing
   - Simpan bahan berbahaya di tempat yang tidak terjangkau
   - Berikan tempat tidur yang nyaman dan aman
   - Pertimbangkan penggunaan crate training untuk keamanan

7. Perhatian dan Kasih Sayang
   - Luangkan waktu berkualitas dengan anjing setiap hari
   - Berikan pujian dan hadiah untuk perilaku baik
   - Perhatikan kebutuhan emosional anjing
   - Bangun ikatan yang kuat melalui interaksi positif

Dengan mengikuti tips-tips ini, Anda dapat memastikan bahwa anjing peliharaan Anda hidup bahagia, sehat, dan sejahtera di rumah.`,
  },
  {
    id: '2',
    title: 'Panduan Vaksinasi untuk Kucing',
    description: 'Informasi lengkap tentang jadwal vaksinasi kucing dan pentingnya menjaga kesehatan hewan peliharaan...',
    content: `Vaksinasi adalah salah satu cara terpenting untuk melindungi kucing Anda dari berbagai penyakit berbahaya. Berikut adalah panduan lengkap tentang vaksinasi kucing:

1. Pentingnya Vaksinasi
   - Vaksinasi membantu mencegah penyakit serius yang dapat mengancam nyawa
   - Melindungi kucing dari virus dan bakteri yang umum ditemukan
   - Meningkatkan sistem kekebalan tubuh kucing
   - Mengurangi risiko penularan penyakit ke kucing lain

2. Jenis Vaksin untuk Kucing
   - FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia): Vaksin inti yang wajib
   - Rabies: Wajib di banyak negara dan daerah
   - FeLV (Feline Leukemia Virus): Direkomendasikan untuk kucing yang berinteraksi dengan kucing lain
   - FIP (Feline Infectious Peritonitis): Opsional, konsultasikan dengan dokter hewan

3. Jadwal Vaksinasi
   - Usia 6-8 minggu: Vaksin FVRCP pertama
   - Usia 10-12 minggu: Vaksin FVRCP kedua dan FeLV pertama
   - Usia 14-16 minggu: Vaksin FVRCP ketiga, FeLV kedua, dan Rabies pertama
   - Setelah 1 tahun: Booster untuk semua vaksin
   - Setiap 1-3 tahun: Booster sesuai rekomendasi dokter hewan

4. Sebelum Vaksinasi
   - Pastikan kucing dalam kondisi sehat
   - Bawa ke dokter hewan untuk pemeriksaan fisik
   - Diskusikan riwayat kesehatan kucing
   - Tanyakan tentang efek samping yang mungkin terjadi

5. Setelah Vaksinasi
   - Pantau kucing selama 24-48 jam pertama
   - Perhatikan tanda-tanda reaksi alergi
   - Berikan istirahat yang cukup
   - Jaga kucing tetap hangat dan nyaman

6. Efek Samping
   - Reaksi ringan: Lesu, kehilangan nafsu makan sementara, demam ringan
   - Reaksi sedang: Pembengkakan di area suntikan, muntah ringan
   - Reaksi serius (jarang): Anafilaksis, kesulitan bernapas - segera hubungi dokter hewan

7. Kapan Harus Menunda Vaksinasi
   - Kucing sedang sakit atau demam
   - Baru saja menjalani operasi
   - Sedang hamil (konsultasikan dengan dokter hewan)
   - Memiliki riwayat reaksi alergi terhadap vaksin sebelumnya

Konsultasikan selalu dengan dokter hewan untuk jadwal vaksinasi yang tepat sesuai dengan kondisi dan kebutuhan kucing Anda.`,
  },
  {
    id: '3',
    title: 'Nutrisi Seimbang untuk Hewan Peliharaan',
    description: 'Pelajari tentang kebutuhan nutrisi yang tepat untuk hewan peliharaan Anda agar tetap sehat dan aktif...',
    content: `Memberikan nutrisi yang seimbang adalah kunci untuk menjaga kesehatan dan kesejahteraan hewan peliharaan Anda. Berikut adalah panduan lengkap tentang nutrisi untuk hewan peliharaan:

1. Komponen Nutrisi Penting
   - Protein: Penting untuk pertumbuhan, perbaikan jaringan, dan fungsi tubuh
   - Karbohidrat: Sumber energi utama
   - Lemak: Sumber energi dan membantu penyerapan vitamin
   - Vitamin: Penting untuk berbagai fungsi metabolik
   - Mineral: Diperlukan untuk kesehatan tulang, gigi, dan fungsi tubuh lainnya
   - Air: Komponen terpenting, hewan peliharaan membutuhkan akses air bersih setiap saat

2. Kebutuhan Nutrisi Berdasarkan Usia
   - Anak (0-12 bulan): Makanan tinggi protein dan kalori untuk pertumbuhan
   - Dewasa (1-7 tahun): Makanan seimbang untuk pemeliharaan
   - Senior (7+ tahun): Makanan dengan nutrisi khusus untuk kesehatan jangka panjang
   - Perhatikan juga ukuran breed yang mempengaruhi kebutuhan nutrisi

3. Memilih Makanan yang Tepat
   - Baca label nutrisi dengan teliti
   - Pilih makanan dengan protein berkualitas tinggi sebagai bahan utama
   - Hindari makanan dengan banyak pengawet buatan
   - Pertimbangkan makanan organik atau natural
   - Konsultasikan dengan dokter hewan untuk rekomendasi khusus

4. Jadwal Makan
   - Anjing dewasa: 2-3 kali sehari
   - Kucing dewasa: 2-3 kali sehari atau free-feeding (tergantung preferensi)
   - Anak hewan: 3-4 kali sehari dalam porsi kecil
   - Konsistensi jadwal membantu pencernaan dan kontrol berat badan

5. Porsi Makanan
   - Ikuti panduan pada kemasan makanan
   - Sesuaikan dengan tingkat aktivitas hewan peliharaan
   - Pantau berat badan dan sesuaikan porsi jika diperlukan
   - Hindari overfeeding yang dapat menyebabkan obesitas

6. Makanan yang Harus Dihindari
   - Cokelat (beracun untuk anjing dan kucing)
   - Bawang dan bawang putih
   - Anggur dan kismis
   - Alpukat
   - Xylitol (pemanis buatan)
   - Alkohol
   - Kafein
   - Tulang yang dimasak (dapat pecah dan melukai)

7. Suplemen
   - Konsultasikan dengan dokter hewan sebelum memberikan suplemen
   - Omega-3 dapat membantu kesehatan kulit dan bulu
   - Probiotik dapat membantu kesehatan pencernaan
   - Vitamin tambahan biasanya tidak diperlukan jika makanan sudah seimbang

8. Tanda Nutrisi yang Baik
   - Berat badan ideal
   - Bulu yang berkilau dan sehat
   - Energi yang baik
   - Pencernaan yang normal
   - Gigi dan gusi yang sehat

9. Masalah Kesehatan Terkait Nutrisi
   - Obesitas: Terlalu banyak kalori atau kurang aktivitas
   - Alergi makanan: Reaksi terhadap bahan tertentu
   - Masalah pencernaan: Makanan tidak sesuai atau perubahan mendadak
   - Masalah gigi: Makanan yang tidak tepat atau kurang perawatan

10. Tips Praktis
    - Lakukan transisi makanan secara bertahap (selama 7-10 hari)
    - Simpan makanan dengan benar (tempat sejuk dan kering)
    - Periksa tanggal kedaluwarsa
    - Gunakan wadah makanan dan air yang bersih
    - Pantau kebiasaan makan hewan peliharaan Anda

Ingatlah bahwa setiap hewan peliharaan memiliki kebutuhan nutrisi yang unik. Konsultasikan dengan dokter hewan untuk membuat rencana nutrisi yang tepat untuk hewan peliharaan Anda.`,
  },
];

export default function Articles() {
  const navigation = useNavigation<any>();

  const handleArticlePress = (article: any) => {
    // Navigate to article detail screen
    const rootNavigation = navigation.getParent() || navigation;
    rootNavigation.navigate('ArticleDetail', {
      article: article,
    });
  };

  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
        padding: normalize(20),
      }}
    >
      <ScrollView
        style={{ marginTop: normalize(20) }}
        showsVerticalScrollIndicator={false}
      >
        {articlesData.map((article) => (
          <TouchableOpacity
            key={article.id}
            onPress={() => handleArticlePress(article)}
            activeOpacity={0.7}
            style={{
              padding: normalize(20),
              backgroundColor: COLORS.white,
              borderRadius: normalize(10),
              marginBottom: normalize(15),
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: normalize(18),
                fontWeight: '600',
                color: COLORS.black,
                marginBottom: normalize(10),
              }}
            >
              {article.title}
            </Text>
            <Text
              style={{
                fontSize: normalize(14),
                color: COLORS.gray,
                lineHeight: normalize(20),
              }}
            >
              {article.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
