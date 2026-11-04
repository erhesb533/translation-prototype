import { describe, expect, it } from 'vitest'
import {
  B2B_DISCOUNT,
  DEADLINES,
  MINIMUM_ORDER,
  NOTARY_FEE_PER_DOCUMENT,
  TIER_RATES,
  calculateQuote,
  formatMNT,
} from './pricing'

describe('calculateQuote', () => {
  it('үгийн тоо × түвшний үнэ', () => {
    const q = calculateQuote({ words: 1000, tier: 'human', deadline: 'standard' })
    expect(q.base).toBe(1000 * TIER_RATES.human)
    expect(q.rushFee).toBe(0)
    expect(q.total).toBe(1000 * TIER_RATES.human)
  })

  it('яаралтай нэмэгдэл үржүүлэгчээр нэмэгдэнэ', () => {
    const q = calculateQuote({ words: 1000, tier: 'mtpe', deadline: 'urgent' })
    const base = 1000 * TIER_RATES.mtpe
    expect(q.rushFee).toBe(Math.round(base * (DEADLINES.urgent.multiplier - 1)))
    expect(q.total).toBe(Math.round((base * DEADLINES.urgent.multiplier) / 100) * 100)
  })

  it('нотариатын төлбөр баримт тутамд', () => {
    const q = calculateQuote({ words: 500, tier: 'notarized', deadline: 'standard', documents: 2 })
    expect(q.notaryFee).toBe(2 * NOTARY_FEE_PER_DOCUMENT)
  })

  it('хамгийн бага дүн ба компанийн хөнгөлөлт', () => {
    expect(calculateQuote({ words: 10, tier: 'mtpe', deadline: 'standard' }).total).toBe(MINIMUM_ORDER)
    const q = calculateQuote({ words: 1000, tier: 'human', deadline: 'standard', business: true })
    expect(q.discount).toBe(Math.round(1000 * TIER_RATES.human * B2B_DISCOUNT))
  })

  it('0 үгэнд 0 үнэ', () => {
    expect(calculateQuote({ words: 0, tier: 'mtpe', deadline: 'standard' }).total).toBe(0)
  })

  it('мөнгө форматлах', () => {
    expect(formatMNT(345600)).toBe('345 600₮')
  })
})
