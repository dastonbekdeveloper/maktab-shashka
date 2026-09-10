import { CheckersEngine, PieceType } from '../engine/checkers';
import { EloRatingService } from '../services/elo.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('=== RUNNING RUSSIAN CHECKERS ENGINE TESTS ===\n');

// 1. Initial Setup
const engine = new CheckersEngine();
const initialCounts = engine.getPieceCounts();
assert(initialCounts.white === 12, 'Oqlar 12 ta tosh bilan boshlashi kerak');
assert(initialCounts.black === 12, 'Qoralar 12 ta tosh bilan boshlashi kerak');
assert(initialCounts.whiteKings === 0 && initialCounts.blackKings === 0, 'Boshida damkalar bo\'lmasligi kerak');

// 2. Simple moves for White
const whiteSimpleMoves = engine.getAvailableSimpleMoves('WHITE');
assert(whiteSimpleMoves.length === 7, `Oqlar birinchi yurishda 7 ta harakatga ega bo'lishi kerak (amalda: ${whiteSimpleMoves.length})`);

// Oq toshni 40 dan 33 ga suramiz (row 5 col 0 dan row 4 col 1 ga)
const move1 = engine.makeMove(40, 33, 'WHITE');
assert(move1.isValid, 'Oddiy oldinga yurish to\'g\'ri ishlashi kerak');
assert(engine.getBoard()[40] === PieceType.EMPTY, 'Oldingi katak bo\'shashi kerak');
assert(engine.getBoard()[33] === PieceType.WHITE_MAN, 'Yangi katakka oq tosh o\'tishi kerak');

// 3. Majburiy urish (Mandatory Capture) testi
// Maxsus doska quramiz: Oq tosh 33 da, Qora tosh 26 da, 19 bo'sh
const customBoard = new Array(64).fill(PieceType.EMPTY);
customBoard[33] = PieceType.WHITE_MAN; // row 4, col 1
customBoard[26] = PieceType.BLACK_MAN; // row 3, col 2
customBoard[57] = PieceType.WHITE_MAN; // boshqa oq tosh

const captureEngine = new CheckersEngine(customBoard);
const captures = captureEngine.getAvailableCaptures('WHITE');
assert(captures.length === 1, 'Majburiy urish topilishi kerak');
assert(captures[0].from === 33 && captures[0].to === 19 && captures[0].captured === 26, 'Urish trayektoriyasi to\'g\'ri aniqlanishi kerak');

// Boshqa oddiy tosh (57) bilan yurishga uringanda rad etilishi kerak
const illegalMove = captureEngine.makeMove(57, 50, 'WHITE');
assert(!illegalMove.isValid, 'Urish imkoni bo\'lganda oddiy yurish rad etilishi shart (majburiy urish)');

// To'g'ri urish
const legalCapture = captureEngine.makeMove(33, 19, 'WHITE');
assert(legalCapture.isValid, 'Toshni urish muvaffaqiyatli bajarilishi kerak');
assert(captureEngine.getBoard()[26] === PieceType.EMPTY, 'Urilgan qora tosh doskadan yo\'qolishi kerak');
assert(captureEngine.getBoard()[19] === PieceType.WHITE_MAN, 'Oq tosh 19 ga o\'tishi kerak');

// 4. Rus shashkasida oddiy toshning ORQAGA qarab urishi
const backwardBoard = new Array(64).fill(PieceType.EMPTY);
backwardBoard[19] = PieceType.WHITE_MAN; // row 2, col 3
backwardBoard[26] = PieceType.BLACK_MAN; // row 3, col 2 (oq toshning orqasida)
const backEngine = new CheckersEngine(backwardBoard);
const backCaptures = backEngine.getAvailableCaptures('WHITE');
assert(backCaptures.length === 1 && backCaptures[0].to === 33, 'Rus shashkasida oddiy tosh ORQAGA ham ura olishi shart');

// 5. Damkaga chiqish (Promotion)
const promoBoard = new Array(64).fill(PieceType.EMPTY);
promoBoard[9] = PieceType.WHITE_MAN; // row 1, col 1
const promoEngine = new CheckersEngine(promoBoard);
const promoMove = promoEngine.makeMove(9, 2, 'WHITE');
assert(Boolean(promoMove.isValid && promoMove.promotedToKing), '0-qatorga yetgan tosh Damka bo\'lishi kerak');
assert(promoEngine.getBoard()[2] === PieceType.WHITE_KING, 'Katakda WHITE_KING bo\'lishi shart');

// 6. Uchuvchi Damka (Flying King) harakati
const kingBoard = new Array(64).fill(PieceType.EMPTY);
kingBoard[0] = PieceType.WHITE_KING; // row 0, col 0 (damka)
const kingEngine = new CheckersEngine(kingBoard);
const kingMoves = kingEngine.getAvailableSimpleMoves('WHITE');
// (0,0) dan diagonal: (1,1)[9], (2,2)[18], (3,3)[27], (4,4)[36], (5,5)[45], (6,6)[54], (7,7)[63] = 7 ta katak
assert(kingMoves.length === 7, `Uchuvchi damka diagonal bo'ylab butun doskaga yura olishi kerak (amalda: ${kingMoves.length})`);

// 7. Elo reytingi testi
console.log('\n=== RUNNING ELO RATING TESTS ===\n');
const res1 = EloRatingService.calculate(
  { currentRating: 1200, gamesPlayed: 5 },
  { currentRating: 1200, gamesPlayed: 5 },
  'WIN'
);
assert(res1.changeA === 16 && res1.changeB === -16, 'Teng kuchli yangi o\'yinchilar g\'alabasida K=32 bilan +16 / -16 bo\'lishi kerak');

const res2 = EloRatingService.calculate(
  { currentRating: 1200, gamesPlayed: 30 },
  { currentRating: 1600, gamesPlayed: 30 },
  'WIN'
);
assert(res2.changeA > 20, `Kuchliroq raqib ustidan g'alabada ball ko'proq oshishi kerak (+${res2.changeA})`);

console.log('\n🎉 BARCHA ALGORITM TESTLARI MUVAFFAQIShLI O\'TDI!\n');
