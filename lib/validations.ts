import { z } from 'zod';

export const alternativeSchema = z.object({
  namaPerumahan: z.string().min(1, 'Nama perumahan harus diisi'),
  lokasi: z.string().min(1, 'Lokasi harus diisi'),
  harga: z.number().positive('Harga harus lebih dari 0'),
  jarak: z.number().positive('Jarak harus lebih dari 0'),
  fasilitas: z.number().int().min(1, 'Skor fasilitas minimal 1').max(10, 'Skor fasilitas maksimal 10'),
  transportasi: z.number().int().min(1, 'Skor transportasi minimal 1').max(10, 'Skor transportasi maksimal 10'),
});

export const criteriaSchema = z.object({
  criterias: z.array(z.object({
    id: z.number(),
    nama: z.string(),
    bobot: z.number().min(0).max(100),
    tipe: z.enum(['benefit', 'cost'])
  })).refine((criterias) => {
    const totalBobot = criterias.reduce((sum, criteria) => sum + criteria.bobot, 0);
    return Math.abs(totalBobot - 100) < 0.01;
  }, {
    message: 'Total bobot kriteria harus tepat 100%'
  })
});

export const sawCalculationSchema = z.object({
  alternatives: z.array(z.object({
    id: z.number(),
    namaPerumahan: z.string(),
    lokasi: z.string(),
    harga: z.number(),
    jarak: z.number(),
    fasilitas: z.number(),
    transportasi: z.number(),
  })),
  criterias: z.array(z.object({
    id: z.number(),
    nama: z.string(),
    bobot: z.number(),
    tipe: z.enum(['benefit', 'cost'])
  }))
});

export type AlternativeInput = z.infer<typeof alternativeSchema>;
export type CriteriaInput = z.infer<typeof criteriaSchema>;
export type SAWCalculationInput = z.infer<typeof sawCalculationSchema>;
