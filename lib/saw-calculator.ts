export interface AlternativeValue {
  id: number;
  nilai: number;
  criteriaId: number;
  criteria: {
    id: number;
    nama: string;
    bobot: number;
    tipe: 'benefit' | 'cost';
  };
}

export interface Alternative {
  id: number;
  nama: string;
  lokasi: string;
  gambar?: string;
  values: AlternativeValue[];
}

export interface Criteria {
  id: number;
  nama: string;
  bobot: number;
  tipe: 'benefit' | 'cost';
}

export interface NormalizedAlternative {
  id: number;
  nama: string;
  lokasi: string;
  gambar?: string;
  normalizedValues: { [criteriaId: number]: number };
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
    const normalizedAlternatives = this.alternatives.map(alt => {
      const normalizedValues: { [criteriaId: number]: number } = {};
      let finalScore = 0;

      // Normalisasi setiap kriteria
      this.criterias.forEach(criteria => {
        const criteriaValues = this.alternatives.map(a => {
          const value = a.values.find(v => v.criteriaId === criteria.id);
          return value ? value.nilai : 0;
        });

        const currentValue = alt.values.find(v => v.criteriaId === criteria.id);
        const currentNilai = currentValue ? currentValue.nilai : 0;

        let normalizedValue = 0;
        if (criteria.tipe === 'benefit') {
          const maxValue = Math.max(...criteriaValues);
          normalizedValue = maxValue > 0 ? this.normalizeBenefit(currentNilai, maxValue) : 0;
        } else {
          const minValue = Math.min(...criteriaValues);
          normalizedValue = minValue > 0 ? this.normalizeCost(currentNilai, minValue) : 0;
        }

        normalizedValues[criteria.id] = normalizedValue;
        finalScore += normalizedValue * (criteria.bobot / 100);
      });

      return {
        id: alt.id,
        nama: alt.nama,
        lokasi: alt.lokasi,
        gambar: alt.gambar,
        normalizedValues,
        finalScore,
        ranking: 0
      };
    });

    return normalizedAlternatives;
  }

  // Hitung skor akhir dengan metode SAW
  private calculateFinalScores(normalizedAlts: NormalizedAlternative[]): NormalizedAlternative[] {
    // Skor sudah dihitung di normalizeAlternatives
    return normalizedAlts;
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
