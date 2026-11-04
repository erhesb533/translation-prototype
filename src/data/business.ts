import type { Order } from '../orders'

/** Зохиомол компани — бодит байгууллага биш. */
export const COMPANY = {
  name: 'Жишээ Трейд ХХК',
  contact: 'Худалдан авалтын менежер',
}

/** Зохиомол B2B захиалгууд (огноо нь өнөөдрөөс хэдэн хоногийн өмнө гэж тооцогдоно). */
export const B2B_ORDERS: (Omit<Order, 'createdAt' | 'total'> & { daysAgo: number; requester: string })[] = [
  { id: 'B-2041', daysAgo: 1, requester: 'Борлуулалт', customer: 'business', fileName: 'supplier_contract_v3.docx', docType: 'Гэрээ', words: 3800, pair: 'zh-mn', tier: 'human', deadline: 'express', stage: 'translating' },
  { id: 'B-2040', daysAgo: 3, requester: 'Хүний нөөц', customer: 'business', fileName: 'ajiltnii_visa_10.pdf', docType: 'Визний бичиг', words: 1200, pair: 'mn-ko', tier: 'notarized', deadline: 'standard', stage: 'reviewing' },
  { id: 'B-2038', daysAgo: 6, requester: 'Маркетинг', customer: 'business', fileName: 'product_catalog_2026.pdf', docType: 'Бусад', words: 5200, pair: 'ko-mn', tier: 'mtpe', deadline: 'standard', stage: 'ready' },
  { id: 'B-2035', daysAgo: 11, requester: 'Хууль', customer: 'business', fileName: 'nda_template.docx', docType: 'Гэрээ', words: 900, pair: 'mn-zh', tier: 'human', deadline: 'urgent', stage: 'ready' },
  { id: 'B-2031', daysAgo: 17, requester: 'Борлуулалт', customer: 'business', fileName: 'tender_barimt.pdf', docType: 'Бусад', words: 7400, pair: 'zh-mn', tier: 'mtpe', deadline: 'express', stage: 'ready' },
  { id: 'B-2027', daysAgo: 38, requester: 'Хүний нөөц', customer: 'business', fileName: 'diplom_3_ajiltan.pdf', docType: 'Диплом / дүнгийн хуудас', words: 1500, pair: 'mn-ko', tier: 'notarized', deadline: 'standard', stage: 'ready' },
  { id: 'B-2022', daysAgo: 45, requester: 'Маркетинг', customer: 'business', fileName: 'brand_guide.pdf', docType: 'Бусад', words: 4100, pair: 'ko-mn', tier: 'mtpe', deadline: 'standard', stage: 'ready' },
]

export interface GlossaryTerm {
  id: string
  source: string
  target: string
  pair: string
  note?: string
}

export const GLOSSARY_SEED: GlossaryTerm[] = [
  { id: 'g1', source: '공급업체', target: 'Нийлүүлэгч', pair: 'ko-mn' },
  { id: 'g2', source: '계약서', target: 'Гэрээ', pair: 'ko-mn' },
  { id: 'g3', source: '供应商', target: 'Нийлүүлэгч', pair: 'zh-mn' },
  { id: 'g4', source: '交货期', target: 'Нийлүүлэх хугацаа', pair: 'zh-mn', note: '"Хүргэлтийн хугацаа" биш' },
  { id: 'g5', source: 'Жишээ Трейд', target: '지셰 트레이드', pair: 'mn-ko', note: 'Компанийн нэрийг орчуулахгүй' },
]
