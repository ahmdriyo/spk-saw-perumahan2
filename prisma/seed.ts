import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.alternativeValue.deleteMany();
  await prisma.alternative.deleteMany();
  await prisma.criteria.deleteMany();
  await prisma.history.deleteMany();

  // Create default criterias
  const harga = await prisma.criteria.create({
    data: { nama: 'Harga', bobot: 25, tipe: 'cost' }
  });
  
  const jarak = await prisma.criteria.create({
    data: { nama: 'Jarak', bobot: 25, tipe: 'cost' }
  });
  
  const fasilitas = await prisma.criteria.create({
    data: { nama: 'Fasilitas', bobot: 25, tipe: 'benefit' }
  });
  
  const transportasi = await prisma.criteria.create({
    data: { nama: 'Transportasi', bobot: 25, tipe: 'benefit' }
  });

  // Create sample alternatives with values
  const alternatives = [
    {
      nama: 'Perumahan Griya Asri',
      lokasi: 'Bandung, Jawa Barat',
      values: {
        [harga.id]: 500000000,
        [jarak.id]: 5.2,
        [fasilitas.id]: 8,
        [transportasi.id]: 7
      }
    },
    {
      nama: 'Taman Sari Residence',
      lokasi: 'Jakarta Selatan, DKI Jakarta',
      values: {
        [harga.id]: 750000000,
        [jarak.id]: 3.1,
        [fasilitas.id]: 9,
        [transportasi.id]: 9
      }
    },
    {
      nama: 'Citra Garden City',
      lokasi: 'Malang, Jawa Timur',
      values: {
        [harga.id]: 350000000,
        [jarak.id]: 8.5,
        [fasilitas.id]: 6,
        [transportasi.id]: 5
      }
    },
    {
      nama: 'Grand Wisata',
      lokasi: 'Bekasi, Jawa Barat',
      values: {
        [harga.id]: 450000000,
        [jarak.id]: 12.0,
        [fasilitas.id]: 7,
        [transportasi.id]: 6
      }
    },
    {
      nama: 'Permata Hijau Residence',
      lokasi: 'Yogyakarta, DIY',
      values: {
        [harga.id]: 600000000,
        [jarak.id]: 4.8,
        [fasilitas.id]: 8,
        [transportasi.id]: 8
      }
    }
  ];

  let alternativeCount = 0;
  let valueCount = 0;

  for (const altData of alternatives) {
    const alternative = await prisma.alternative.create({
      data: {
        nama: altData.nama,
        lokasi: altData.lokasi,
      }
    });

    // Create values for each criteria
    for (const [criteriaId, nilai] of Object.entries(altData.values)) {
      await prisma.alternativeValue.create({
        data: {
          alternativeId: alternative.id,
          criteriaId: Number(criteriaId),
          nilai: Number(nilai)
        }
      });
      valueCount++;
    }
    
    alternativeCount++;
  }

  console.log('✅ Seeded database with:');
  console.log(`   - 4 criterias`);
  console.log(`   - ${alternativeCount} alternatives`);
  console.log(`   - ${valueCount} alternative values`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
