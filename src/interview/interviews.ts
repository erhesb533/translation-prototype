import * as pricing from '../pricing'
import type { ScreenId } from '../router'
import { SCREEN_IDS } from '../router'

export type Segment = 'B2C' | 'B2B' | 'Орчуулагч' | 'Бусад'
export type LoiInterest = 'yes' | 'maybe' | 'no'

export const SEGMENTS: Segment[] = ['B2C', 'B2B', 'Орчуулагч', 'Бусад']
export const LOI_LABELS: Record<LoiInterest, string> = {
  yes: 'Тийм',
  maybe: 'Магадгүй',
  no: 'Үгүй',
}

export interface InterviewSession {
  id: string
  startedAt: string
  endedAt?: string
  /** Ярилцагчийн код (жишээ нь Х-07). Бодит нэр бүү бич. */
  code: string
  segment: Segment
  ratings: Partial<Record<ScreenId, number>>
  notes: Partial<Record<ScreenId, string>>
  generalNote: string
  loi: LoiInterest | null
  loiNote: string
}

export interface InterviewStore {
  activeId: string | null
  sessions: InterviewSession[]
}

export const INTERVIEWS_KEY = 'tp.interviews'
export const EMPTY_STORE: InterviewStore = { activeId: null, sessions: [] }

export function createSession(code: string, segment: Segment, index: number, now: Date): InterviewSession {
  return {
    id: `S-${String(index + 1).padStart(3, '0')}-${now.getTime().toString(36)}`,
    startedAt: now.toISOString(),
    code: code.trim() || `Х-${String(index + 1).padStart(2, '0')}`,
    segment,
    ratings: {},
    notes: {},
    generalNote: '',
    loi: null,
    loiNote: '',
  }
}

/** JSON экспорт: ярилцлагын үеийн үнийн тохиргоог хамт хадгална (аль үнийг үзүүлснийг мэдэхийн тулд). */
export function buildExport(store: InterviewStore, now: Date) {
  const sessions = store.sessions
  const loiYes = sessions.filter((s) => s.loi === 'yes').length
  const avg: Partial<Record<ScreenId, number | null>> = {}
  for (const id of SCREEN_IDS) {
    const vals = sessions.map((s) => s.ratings[id]).filter((v): v is number => typeof v === 'number')
    avg[id] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null
  }
  return {
    exportedAt: now.toISOString(),
    summary: {
      interviews: sessions.length,
      loiYes,
      loiMaybe: sessions.filter((s) => s.loi === 'maybe').length,
      averageRatings: avg,
    },
    pricingShown: {
      TIER_RATES: pricing.TIER_RATES,
      NOTARY_FEE_PER_DOCUMENT: pricing.NOTARY_FEE_PER_DOCUMENT,
      DEADLINES: pricing.DEADLINES,
      MINIMUM_ORDER: pricing.MINIMUM_ORDER,
      B2B_DISCOUNT: pricing.B2B_DISCOUNT,
    },
    sessions,
  }
}
