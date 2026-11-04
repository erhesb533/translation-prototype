import { describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { calculateQuote, formatMNT } from './pricing'
import { SAMPLE_FILES } from './data/samples'

async function goTo(hash: string) {
  await act(async () => {
    window.location.hash = hash
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

describe('Үндсэн урсгал: захиалга → үнийн санал → төлөв', () => {
  it('нүүрнээс захиалга өгч, үнийн санал харж, төлөвийг бэлэн хүртэл ахиулна', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Нүүр
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Баримт бичгээ онлайнаар')
    expect(screen.getByRole('note')).toHaveTextContent('Прототип — үнэ жишээ')
    await user.click(screen.getAllByRole('link', { name: 'Захиалга өгөх' })[0])
    await goTo('#/order')

    // Захиалга: файлгүй үед илгээх боломжгүй
    const submit = screen.getByRole('button', { name: 'Захиалга баталгаажуулах' })
    expect(submit).toBeDisabled()

    // Жишээ "Гэрээ" файл (2400 үг, хятад→монгол), хүний орчуулга, яаралтай
    await user.click(screen.getByRole('button', { name: 'Гэрээ' }))
    await user.click(screen.getByRole('radio', { name: /^Хүний орчуулга/ }))
    await user.click(screen.getByRole('radio', { name: /Яаралтай/ }))

    const sample = SAMPLE_FILES[2]
    const expected = calculateQuote({ words: sample.words, tier: 'human', deadline: 'urgent' })
    expect(screen.getByTestId('quote-total')).toHaveTextContent(formatMNT(expected.total))
    expect(screen.getByText('Яаралтай нэмэгдэл')).toBeInTheDocument()

    // Компани сонговол хөнгөлөлт гарна
    await user.click(screen.getByRole('radio', { name: 'Компани' }))
    expect(screen.getByText('Компанийн хөнгөлөлт')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Хувь хүн' }))

    await user.click(submit)
    expect(window.location.hash).toBe('#/status/ORD-1001')
    await goTo('#/status/ORD-1001')

    // Төлөв
    expect(screen.getByText('ORD-1001')).toBeInTheDocument()
    expect(screen.getByTestId('stage')).toHaveTextContent('Хүлээн авсан')
    expect(screen.getByText(formatMNT(expected.total))).toBeInTheDocument()

    const next = () => screen.getByRole('button', { name: /Дараагийн шат/ })
    await user.click(next())
    expect(screen.getByTestId('stage')).toHaveTextContent('Орчуулж байна')
    await user.click(next())
    expect(screen.getByTestId('stage')).toHaveTextContent('Хянаж байна')
    await user.click(next())
    expect(screen.getByTestId('stage')).toHaveTextContent('Бэлэн')
    expect(screen.getByRole('button', { name: /Орчуулгыг татах/ })).toBeInTheDocument()

    // localStorage-д хадгалагдсан
    const stored = JSON.parse(localStorage.getItem('tp.orders') ?? '[]')
    expect(stored[0]).toMatchObject({ id: 'ORD-1001', stage: 'ready', total: expected.total })
  })

  it('орчуулагч ажлыг хүлээн авахад захиалгын төлөв "Орчуулж байна" болно', async () => {
    const user = userEvent.setup()
    render(<App />)
    await goTo('#/order')
    await user.click(screen.getByRole('button', { name: 'Визний бичиг' }))
    await user.click(screen.getByRole('button', { name: 'Захиалга баталгаажуулах' }))

    await goTo('#/translator')
    const incoming = screen.getByRole('heading', { name: /Ирсэн ажил/ }).closest('.card') as HTMLElement
    await user.click(within(incoming).getAllByRole('button', { name: 'Хүлээн авах' })[0])

    await goTo('#/status/ORD-1001')
    expect(screen.getByTestId('stage')).toHaveTextContent('Орчуулж байна')
  })
})

describe('Ярилцлагын горим', () => {
  it('үнэлгээ, LOI хадгалагдаж JSON экспортод орно', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Ярилцлага/ }))
    await user.type(screen.getByLabelText('Ярилцагчийн код'), 'Х-07')
    await user.click(screen.getByRole('button', { name: 'Ярилцлага эхлэх' }))
    await user.click(screen.getByRole('radio', { name: '5' }))
    await user.click(screen.getByRole('radio', { name: 'Тийм' }))

    const store = JSON.parse(localStorage.getItem('tp.interviews') ?? '{}')
    expect(store.sessions[0]).toMatchObject({ code: 'Х-07', loi: 'yes', ratings: { home: 5 } })

    const { buildExport } = await import('./interview/interviews')
    const out = buildExport(store, new Date())
    expect(out.summary).toMatchObject({ interviews: 1, loiYes: 1 })
    expect(out.summary.averageRatings.home).toBe(5)
    expect(out.pricingShown.TIER_RATES).toBeDefined()
  })
})
