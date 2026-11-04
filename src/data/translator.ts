import type { Tier } from '../pricing'

/** Зохиомол орчуулагч — бодит хүн биш. */
export const TRANSLATOR = {
  name: 'Орчуулагч Б.',
  langs: 'Солонгос ↔ Монгол, Англи → Монгол',
  rating: 4.8,
}

export interface Job {
  id: string
  fileName: string
  docType: string
  pair: string
  tier: Tier
  words: number
  /** Хүлээлгэн өгөх хүртэл үлдсэн цаг */
  hoursLeft: number
}

export const JOB_SEED: Job[] = [
  { id: 'J-501', fileName: 'visa_invitation.pdf', docType: 'Визний бичиг', pair: 'ko-mn', tier: 'mtpe', words: 380, hoursLeft: 30 },
  { id: 'J-502', fileName: 'university_transcript.pdf', docType: 'Диплом / дүнгийн хуудас', pair: 'mn-ko', tier: 'notarized', words: 720, hoursLeft: 96 },
  { id: 'J-503', fileName: 'lease_agreement.docx', docType: 'Гэрээ', pair: 'ko-mn', tier: 'human', words: 2100, hoursLeft: 52 },
  { id: 'J-504', fileName: 'product_manual_ch3.pdf', docType: 'Бусад', pair: 'en-mn', tier: 'mtpe', words: 4600, hoursLeft: 110 },
]

/** Энэ сард аль хэдийн дуусгасан ажлын орлого (зохиомол) */
export const EARNED_THIS_MONTH = 486000
export const COMPLETED_THIS_MONTH = 9
