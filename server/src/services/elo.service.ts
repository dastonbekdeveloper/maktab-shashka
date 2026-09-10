export type GameOutcome = 'WIN' | 'LOSS' | 'DRAW';

export interface EloPlayer {
  currentRating: number;
  gamesPlayed: number;
}

export interface EloCalculationResult {
  newRatingA: number;
  newRatingB: number;
  changeA: number;
  changeB: number;
}

export class EloRatingService {
  /**
   * K-faktorni dinamik hisoblash
   */
  public static getKFactor(gamesPlayed: number, rating: number): number {
    if (gamesPlayed < 20) return 32;       // Yangi o'yinchi - tez ko'tarilish/tushish
    if (rating >= 2000) return 16;         // Yuqori master darajasi - barqarorlik
    return 24;                             // Standart
  }

  /**
   * Ikkala o'yinchi uchun yangi Elo ballarini hisoblash
   * @param playerA Oqlar
   * @param playerB Qoralar
   * @param outcomeA Oqlar natijasi ('WIN', 'LOSS', 'DRAW')
   */
  public static calculate(
    playerA: EloPlayer,
    playerB: EloPlayer,
    outcomeA: GameOutcome
  ): EloCalculationResult {
    const RA = playerA.currentRating;
    const RB = playerB.currentRating;

    // 1. Kutilgan ehtimolliklar
    const expectedA = 1 / (1 + Math.pow(10, (RB - RA) / 400));
    const expectedB = 1 - expectedA;

    // 2. Haqiqiy natija koeffitsienti
    let scoreA: number;
    let scoreB: number;

    if (outcomeA === 'WIN') {
      scoreA = 1.0;
      scoreB = 0.0;
    } else if (outcomeA === 'LOSS') {
      scoreA = 0.0;
      scoreB = 1.0;
    } else {
      scoreA = 0.5;
      scoreB = 0.5;
    }

    // 3. K-faktor
    const kA = this.getKFactor(playerA.gamesPlayed, RA);
    const kB = this.getKFactor(playerB.gamesPlayed, RB);

    // 4. O'zgarishlar
    const changeA = Math.round(kA * (scoreA - expectedA));
    const changeB = Math.round(kB * (scoreB - expectedB));

    const newRatingA = Math.max(100, RA + changeA);
    const newRatingB = Math.max(100, RB + changeB);

    return {
      newRatingA,
      newRatingB,
      changeA,
      changeB,
    };
  }
}
