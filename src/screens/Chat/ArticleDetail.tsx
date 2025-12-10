import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import BottomTabsBar from '../../components/BottomTabsBar';

export default function ArticleDetail({ navigation, route }: { navigation: any; route: any }) {
  const { article } = route?.params || {};

  // Default article data jika tidak ada dari route params
  const articleData = article || {
    title: 'Tips Merawat Anjing di Rumah',
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
      <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <ScrollView
        style={{ marginTop: normalize(30) }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: normalize(100) }}
      >
        <View style={{ marginBottom: normalize(20) }}>
          <Text
            style={{
              fontSize: normalize(24),
              fontWeight: '600',
              color: COLORS.black,
              marginBottom: normalize(15),
            }}
          >
            {articleData.title}
          </Text>
        </View>

        <View
          style={{
            padding: normalize(20),
            backgroundColor: COLORS.white,
            borderRadius: normalize(10),
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
              fontSize: normalize(16),
              color: COLORS.black,
              lineHeight: normalize(24),
            }}
          >
            {articleData.content}
          </Text>
        </View>
      </ScrollView>
      <BottomTabsBar />
    </View>
  );
}
