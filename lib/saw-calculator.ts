export interface Alternative {
  id: number;
  namaPerumahan: string;
  lokasi: string;
  harga: number;
  jarak: number;
  fasilitas: number;
  transportasi: number;
}

export interface Criteria {
  id: number;
  nama: string;
  bobot: number;
  tipe: 'benefit' | 'cost';
}

export interface NormalizedAlternative extends Alternative {
  normalizedHarga: number;
  normalizedJarak: number;
  normalizedFasilitas: number;
  normalizedTransportasi: number;
  finalScore: number;
  ranking: number;
}

export interface SAWResult {
  normalizedAlternatives: NormalizedAlternative[];
  bestAlternative: NormalizedAlternative;
  criterias: Criteria[];
}

export class SAWCalculator {
  private alternatives: Alternative[];
  private criterias: Criteria[];

  constructor(alternatives: Alternative[], criterias: Criteria[]) {
    this.alternatives = alternatives;
    this.criterias = criterias;
  }

  // Normalisasi untuk kriteria benefit (semakin besar semakin baik)
  private normalizeBenefit(value: number, maxValue: number): number {
    return value / maxValue;
  }

  // Normalisasi untuk kriteria cost (semakin kecil semakin baik)
  private normalizeCost(value: number, minValue: number): number {
    return minValue / value;
  }

  // Hitung normalisasi untuk semua alternatif
  private normalizeAlternatives(): NormalizedAlternative[] {
    const hargaValues = this.alternatives.map(alt => alt.harga);
    const jarakValues = this.alternatives.map(alt => alt.jarak);
    const fasilitasValues = this.alternatives.map(alt => alt.fasilitas);
    const transportasiValues = this.alternatives.map(alt => alt.transportasi);

    const minHarga = Math.min(...hargaValues);
    const minJarak = Math.min(...jarakValues);
    const maxFasilitas = Math.max(...fasilitasValues);
    const maxTransportasi = Math.max(...transportasiValues);

    return this.alternatives.map(alt => ({
      ...alt,
      normalizedHarga: this.normalizeCost(alt.harga, minHarga),
      normalizedJarak: this.normalizeCost(alt.jarak, minJarak),
      normalizedFasilitas: this.normalizeBenefit(alt.fasilitas, maxFasilitas),
      normalizedTransportasi: this.normalizeBenefit(alt.transportasi, maxTransportasi),
      finalScore: 0,
      ranking: 0
    }));
  }

  // Hitung skor akhir dengan metode SAW
  private calculateFinalScores(normalizedAlts: NormalizedAlternative[]): NormalizedAlternative[] {
    const weightHarga = this.criterias.find(c => c.nama === 'Harga')?.bobot || 25;
    const weightJarak = this.criterias.find(c => c.nama === 'Jarak')?.bobot || 25;
    const weightFasilitas = this.criterias.find(c => c.nama === 'Fasilitas')?.bobot || 25;
    const weightTransportasi = this.criterias.find(c => c.nama === 'Transportasi')?.bobot || 25;

    // Konversi bobot dari persen ke desimal
    const wHarga = weightHarga / 100;
    const wJarak = weightJarak / 100;
    const wFasilitas = weightFasilitas / 100;
    const wTransportasi = weightTransportasi / 100;

    return normalizedAlts.map(alt => ({
      ...alt,
      finalScore: 
        (alt.normalizedHarga * wHarga) +
        (alt.normalizedJarak * wJarak) +
        (alt.normalizedFasilitas * wFasilitas) +
        (alt.normalizedTransportasi * wTransportasi)
    }));
  }

  // Assign ranking berdasarkan skor akhir
  private assignRanking(scoredAlts: NormalizedAlternative[]): NormalizedAlternative[] {
    const sorted = scoredAlts.sort((a, b) => b.finalScore - a.finalScore);
    
    return sorted.map((alt, index) => ({
      ...alt,
      ranking: index + 1
    }));
  }

  // Fungsi utama untuk menjalankan perhitungan SAW
  public calculate(): SAWResult {
    // Validasi bobot kriteria harus total 100%
    const totalBobot = this.criterias.reduce((sum, criteria) => sum + criteria.bobot, 0);
    if (Math.abs(totalBobot - 100) > 0.01) {
      throw new Error(`Total bobot kriteria harus 100%, saat ini: ${totalBobot}%`);
    }

    // Proses perhitungan
    const normalizedAlts = this.normalizeAlternatives();
    const scoredAlts = this.calculateFinalScores(normalizedAlts);
    const rankedAlts = this.assignRanking(scoredAlts);

    return {
      normalizedAlternatives: rankedAlts,
      bestAlternative: rankedAlts[0], // Ranking 1 adalah yang terbaik
      criterias: this.criterias
    };
  }
}

// Utility function untuk format angka
export function formatNumber(num: number, decimals: number = 4): string {
  return num.toFixed(decimals);
}

// Utility function untuk format currency (Rupiah)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
