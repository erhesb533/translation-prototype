/** Mock "файл"-ууд — бодит файл боловсруулахгүй, үгийн тоо нь зохиомол. */
export interface SampleFile {
  name: string
  docType: string
  words: number
  pair: string
}

export const DOC_TYPES = ['Визний бичиг', 'Диплом / дүнгийн хуудас', 'Гэрээ', 'Иргэний бичиг', 'Бусад'] as const

export const SAMPLE_FILES: SampleFile[] = [
  { name: 'viz_ajliin_gereenii_zahidal.pdf', docType: 'Визний бичиг', words: 420, pair: 'ko-mn' },
  { name: 'diplom_havsralt.pdf', docType: 'Диплом / дүнгийн хуудас', words: 650, pair: 'mn-ko' },
  { name: 'niiluulaltiin_geree.docx', docType: 'Гэрээ', words: 2400, pair: 'zh-mn' },
]

/** Файлын хэмжээнээс үгийн тоог "тооцоолох" (mock): ойролцоогоор 1 үг ≈ 30 байт PDF/DOCX-д. */
export function estimateWords(sizeBytes: number): number {
  return Math.min(20000, Math.max(80, Math.round(sizeBytes / 30 / 10) * 10))
}
