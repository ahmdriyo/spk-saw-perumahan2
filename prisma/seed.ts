import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.history.deleteMany();
  await prisma.alternative.deleteMany();
  await prisma.criteria.deleteMany();

  // Create default criterias
  const criterias = await prisma.criteria.createMany({
    data: [
      { nama: 'Harga', bobot: 25, tipe: 'cost' },
      { nama: 'Jarak', bobot: 25, tipe: 'cost' },
      { nama: 'Fasilitas', bobot: 25, tipe: 'benefit' },
      { nama: 'Transportasi', bobot: 25, tipe: 'benefit' },
    ]
  });

  // Create sample alternatives
  const alternatives = await prisma.alternative.createMany({
    data: [
      {
        namaPerumahan: 'Perumahan Griya Asri',
        lokasi: 'Bandung, Jawa Barat',
        harga: 500000000,
        jarak: 5.2,
        fasilitas: 8,
        transportasi: 7
      },
      {
        namaPerumahan: 'Taman Sari Residence',
        lokasi: 'Jakarta Selatan, DKI Jakarta',
        harga: 750000000,
        jarak: 3.1,
        fasilitas: 9,
        transportasi: 9
      },
      {
        namaPerumahan: 'Citra Garden City',
        lokasi: 'Malang, Jawa Timur',
        harga: 350000000,
        jarak: 8.5,
        fasilitas: 6,
        transportasi: 5
      },
      {
        namaPerumahan: 'Grand Wisata',
        lokasi: 'Bekasi, Jawa Barat',
        harga: 450000000,
        jarak: 12.0,
        fasilitas: 7,
        transportasi: 6
      },
      {
        namaPerumahan: 'Permata Hijau Residence',
        lokasi: 'Yogyakarta, DIY',
        harga: 600000000,
        jarak: 4.8,
        fasilitas: 8,
        transportasi: 8
      }
    ]
  });

  console.log('✅ Seeded database with:');
  console.log(`   - ${criterias.count} criterias`);
  console.log(`   - ${alternatives.count} alternatives`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
