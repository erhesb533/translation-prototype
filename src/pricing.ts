/**
 * ҮНИЙН ТОХИРГОО — ярилцлагын үеэр энд л өөрчилнө.
 *
 * Бүх тоо бол ЖИШЭЭ. Санхүүгийн загвартай тулгаагүй.
 * `npm run dev` ажиллаж байхад энэ файлыг хадгалахад хөтөч шууд шинэчлэгдэнэ.
 */

/** Мөнгөн тэмдэгт */
export const CURRENCY = '₮'

/** Үйлчилгээний түвшин бүрийн нэг үгийн үнэ (₮) */
export const TIER_RATES = {
  mtpe: 90, // Машин орчуулга + хүний засвар
  human: 150, // Бүрэн хүний орчуулга
  notarized: 150, // Нотариатын баталгаатай (хүний орчуулга + нотариат)
} as const

/** Нотариатын баталгаажуулалтын нэмэлт төлбөр — нэг баримт тутамд (₮) */
export const NOTARY_FEE_PER_DOCUMENT = 15000

/** Хугацааны сонголт: хоног ба үнийн үржүүлэгч (яаралтай нэмэгдэл) */
export const DEADLINES = {
  standard: { label: 'Энгийн', days: 5, multiplier: 1.0 },
  express: { label: 'Түргэн', days: 2, multiplier: 1.3 },
  urgent: { label: 'Яаралтай (24 цаг)', days: 1, multiplier: 1.6 },
} as const

/** Хамгийн бага захиалгын дүн (₮) */
export const MINIMUM_ORDER = 10000

/** Нийт дүнг энэ тоо руу бөөрөнхийлнө (₮) */
export const ROUND_TO = 100

/** НӨАТ (B2B нэхэмжлэхэд харуулна) */
export const VAT_RATE = 0.1

/** Орчуулагчид олгох нэг үгийн хөлс (₮) — орчуулагчийн самбарт орлого тооцоход */
export const TRANSLATOR_PAY_PER_WORD = {
  mtpe: 55,
  human: 105,
  notarized: 105,
} as const

/** Компанийн (B2B) хөнгөлөлт — сарын нэхэмжлэхээр төлөх үед */
export const B2B_DISCOUNT = 0.1

// ---------------------------------------------------------------------------
// Доорх хэсгийг ихэвчлэн өөрчлөх шаардлагагүй.
// ---------------------------------------------------------------------------

export type Tier = keyof typeof TIER_RATES
export type Deadline = keyof typeof DEADLINES

export const TIERS: { id: Tier; label: string; description: string }[] = [
  {
    id: 'mtpe',
    label: 'Машин + хүний засвар',
    description: 'Машин орчуулгыг мэргэжлийн орчуулагч засна. Хурдан, хямд.',
  },
  {
    id: 'human',
    label: 'Хүний орчуулга',
    description: 'Орчуулагч эхнээс нь орчуулж, өөр хүн хянана.',
  },
  {
    id: 'notarized',
    label: 'Нотариатын баталгаатай',
    description: 'Хүний орчуулга + нотариатын тамга. Виз, диплом, гэрээнд.',
  },
]

export interface QuoteInput {
  words: number
  tier: Tier
  deadline: Deadline
  documents?: number
  business?: boolean
}

export interface Quote {
  words: number
  ratePerWord: number
  base: number
  rushFee: number
  notaryFee: number
  discount: number
  minimumApplied: boolean
  total: number
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step

export function calculateQuote(input: QuoteInput): Quote {
  const words = Math.max(0, Math.floor(input.words || 0))
  const ratePerWord = TIER_RATES[input.tier]
  const base = words * ratePerWord
  const rushFee = base * (DEADLINES[input.deadline].multiplier - 1)
  const notaryFee =
    input.tier === 'notarized' ? NOTARY_FEE_PER_DOCUMENT * Math.max(1, input.documents ?? 1) : 0
  const subtotal = base + rushFee + notaryFee
  const discount = input.business ? subtotal * B2B_DISCOUNT : 0
  const raw = subtotal - discount
  const minimumApplied = words > 0 && raw < MINIMUM_ORDER
  const total = words === 0 ? 0 : roundTo(Math.max(raw, MINIMUM_ORDER), ROUND_TO)
  return {
    words,
    ratePerWord,
    base: Math.round(base),
    rushFee: Math.round(rushFee),
    notaryFee,
    discount: Math.round(discount),
    minimumApplied,
    total,
  }
}

export function translatorPay(words: number, tier: Tier): number {
  return Math.round(words * TRANSLATOR_PAY_PER_WORD[tier])
}

export function formatMNT(n: number): string {
  return `${Math.round(n).toLocaleString('en-US').replace(/,/g, ' ')}${CURRENCY}`
}
