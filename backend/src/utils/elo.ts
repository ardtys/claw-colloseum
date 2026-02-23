/**
 * ELO Rating System
 * Proper implementation with dynamic K-factor and expected score calculation
 */

export interface EloConfig {
  baseK: number;
  newPlayerK: number;
  establishedK: number;
  newPlayerThreshold: number;
  establishedThreshold: number;
  minRating: number;
}

const DEFAULT_CONFIG: EloConfig = {
  baseK: 32,
  newPlayerK: 40,
  establishedK: 24,
  newPlayerThreshold: 30,
  establishedThreshold: 100,
  minRating: 100,
};

export class EloSystem {
  private config: EloConfig;

  constructor(config: Partial<EloConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate expected score (probability of winning)
   * Based on the standard ELO formula
   */
  expectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  /**
   * Get K-factor based on player experience
   * New players have higher K for faster calibration
   */
  getKFactor(totalGames: number, currentRating: number): number {
    // New players - faster rating adjustment
    if (totalGames < this.config.newPlayerThreshold) {
      return this.config.newPlayerK;
    }

    // High-rated established players - more stable ratings
    if (totalGames >= this.config.establishedThreshold && currentRating >= 2000) {
      return this.config.establishedK;
    }

    // Standard K-factor
    return this.config.baseK;
  }

  /**
   * Calculate new ratings after a match
   * Returns rating changes for both players
   */
  calculateNewRatings(
    ratingA: number,
    ratingB: number,
    gamesA: number,
    gamesB: number,
    winner: 'A' | 'B' | 'DRAW'
  ): { newRatingA: number; newRatingB: number; changeA: number; changeB: number } {
    const expectedA = this.expectedScore(ratingA, ratingB);
    const expectedB = this.expectedScore(ratingB, ratingA);

    const kA = this.getKFactor(gamesA, ratingA);
    const kB = this.getKFactor(gamesB, ratingB);

    let scoreA: number;
    let scoreB: number;

    switch (winner) {
      case 'A':
        scoreA = 1;
        scoreB = 0;
        break;
      case 'B':
        scoreA = 0;
        scoreB = 1;
        break;
      case 'DRAW':
        scoreA = 0.5;
        scoreB = 0.5;
        break;
    }

    const changeA = Math.round(kA * (scoreA - expectedA));
    const changeB = Math.round(kB * (scoreB - expectedB));

    const newRatingA = Math.max(this.config.minRating, ratingA + changeA);
    const newRatingB = Math.max(this.config.minRating, ratingB + changeB);

    return {
      newRatingA,
      newRatingB,
      changeA,
      changeB,
    };
  }

  /**
   * Calculate upset bonus for defeating higher-rated opponent
   */
  calculateUpsetBonus(winnerRating: number, loserRating: number): number {
    const ratingDiff = loserRating - winnerRating;
    if (ratingDiff <= 0) return 0;

    // Bonus scales with rating difference (max 10 points)
    return Math.min(10, Math.floor(ratingDiff / 50));
  }

  /**
   * Get rank tier based on rating
   */
  static getRankTier(rating: number): { tier: string; name: string; minRating: number } {
    const tiers = [
      { tier: 'S', name: 'Grandmaster', minRating: 2400 },
      { tier: 'A', name: 'Master', minRating: 2000 },
      { tier: 'B', name: 'Expert', minRating: 1700 },
      { tier: 'C', name: 'Skilled', minRating: 1400 },
      { tier: 'D', name: 'Intermediate', minRating: 1200 },
      { tier: 'E', name: 'Beginner', minRating: 1000 },
      { tier: 'F', name: 'Novice', minRating: 0 },
    ];

    for (const tier of tiers) {
      if (rating >= tier.minRating) {
        return tier;
      }
    }

    return tiers[tiers.length - 1];
  }
}

// Singleton instance
export const eloSystem = new EloSystem();
