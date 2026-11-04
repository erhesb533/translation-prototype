export type Lang = 'mn' | 'ko' | 'zh' | 'en' | 'ru' | 'ja'

export const LANG_NAMES: Record<Lang, string> = {
  mn: 'Монгол',
  ko: 'Солонгос',
  zh: 'Хятад',
  en: 'Англи',
  ru: 'Орос',
  ja: 'Япон',
}

export interface LangPair {
  from: Lang
  to: Lang
  primary?: boolean
}

/** Гол чиглэл: солонгос, хятад ↔ монгол */
export const LANG_PAIRS: LangPair[] = [
  { from: 'ko', to: 'mn', primary: true },
  { from: 'mn', to: 'ko', primary: true },
  { from: 'zh', to: 'mn', primary: true },
  { from: 'mn', to: 'zh', primary: true },
  { from: 'en', to: 'mn' },
  { from: 'mn', to: 'en' },
  { from: 'ru', to: 'mn' },
  { from: 'ja', to: 'mn' },
]

export const pairKey = (p: LangPair) => `${p.from}-${p.to}`
export const pairLabel = (p: LangPair) => `${LANG_NAMES[p.from]} → ${LANG_NAMES[p.to]}`
export const findPair = (key: string): LangPair =>
  LANG_PAIRS.find((p) => pairKey(p) === key) ?? LANG_PAIRS[0]
