import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { B2B_ORDERS, COMPANY, GLOSSARY_SEED } from '../data/business'
import type { GlossaryTerm } from '../data/business'
import { LANG_PAIRS, findPair, pairKey, pairLabel } from '../languages'
import { STAGE_LABELS, formatDate, useOrders } from '../orders'
import { TIERS, VAT_RATE, calculateQuote, formatMNT } from '../pricing'
import { href } from '../router'
import { downloadFile, useStored } from '../storage'

const DAY = 24 * 60 * 60 * 1000

function useCompanyOrders() {
  const [own] = useOrders()
  const [now] = useState(() => Date.now())
  return useMemo(() => {
    const seeded = B2B_ORDERS.map(({ daysAgo, requester, ...o }) => ({
      ...o,
      requester,
      createdAt: new Date(now - daysAgo * DAY).toISOString(),
      total: calculateQuote({ words: o.words, tier: o.tier, deadline: o.deadline, business: true }).total,
    }))
    const mine = own
      .filter((o) => o.customer === 'business')
      .map((o) => ({ ...o, requester: 'Та' }))
    return { orders: [...mine, ...seeded], now }
  }, [own, now])
}

const tierShort = (id: string) => TIERS.find((t) => t.id === id)?.label ?? id

export function BusinessScreen() {
  const { orders, now } = useCompanyOrders()
  const [glossary, setGlossary] = useStored<GlossaryTerm[]>('tp.glossary', GLOSSARY_SEED)
  const [draft, setDraft] = useState({ source: '', target: '', pair: pairKey(LANG_PAIRS[0]) })

  const thisMonth = new Date(now)
  const monthOrders = orders.filter((o) => {
    const d = new Date(o.createdAt)
    return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear()
  })
  const subtotal = monthOrders.reduce((s, o) => s + o.total, 0)
  const vat = Math.round(subtotal * VAT_RATE)
  const words = monthOrders.reduce((s, o) => s + o.words, 0)
  const active = orders.filter((o) => o.stage !== 'ready').length
  const monthLabel = `${thisMonth.getFullYear()} оны ${thisMonth.getMonth() + 1}-р сар`

  function addTerm(e: FormEvent) {
    e.preventDefault()
    if (!draft.source.trim() || !draft.target.trim()) return
    setGlossary((g) => [
      ...g,
      { id: `g${g.length + 1}-${draft.source}`, source: draft.source.trim(), target: draft.target.trim(), pair: draft.pair },
    ])
    setDraft((d) => ({ ...d, source: '', target: '' }))
  }

  function downloadInvoice() {
    const lines = [
      'ПРОТОТИП — жишээ нэхэмжлэх. Бодит төлбөрийн баримт биш.',
      `${COMPANY.name} · ${monthLabel}`,
      '',
      ...monthOrders.map((o) => `${o.id}\t${o.fileName}\t${o.words} үг\t${formatMNT(o.total)}`),
      '',
      `Дүн: ${formatMNT(subtotal)}`,
      `НӨАТ: ${formatMNT(vat)}`,
      `Нийт: ${formatMNT(subtotal + vat)}`,
    ]
    downloadFile('nehemjleh_jishee.txt', lines.join('\n'), 'text/plain;charset=utf-8')
  }

  return (
    <div>
      <div className="spread">
        <div>
          <h1>Компанийн самбар</h1>
          <p className="muted small">
            {COMPANY.name} <span className="badge badge-muted">зохиомол</span>
          </p>
        </div>
        <a className="btn btn-primary btn-sm" href={href({ name: 'order' })}>
          + Шинэ захиалга
        </a>
      </div>

      <div className="grid grid-3 stats">
        <div className="card">
          <div className="stat-label">Идэвхтэй захиалга</div>
          <div className="stat">{active}</div>
        </div>
        <div className="card">
          <div className="stat-label">Энэ сарын үг</div>
          <div className="stat">{words.toLocaleString('en-US')}</div>
        </div>
        <div className="card">
          <div className="stat-label">Энэ сарын зардал</div>
          <div className="stat">{formatMNT(subtotal)}</div>
        </div>
      </div>

      <div className="card">
        <h2>Захиалгууд</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Дугаар / файл</th>
                <th>Хэл · түвшин</th>
                <th>Төлөв</th>
                <th className="num">Дүн</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.id}</strong>
                    <div className="muted small">{o.fileName}</div>
                    <div className="muted small">
                      {formatDate(o.createdAt)} · {o.requester}
                    </div>
                  </td>
                  <td className="small">
                    {pairLabel(findPair(o.pair))}
                    <div className="muted">{tierShort(o.tier)}</div>
                  </td>
                  <td>
                    <span className={o.stage === 'ready' ? 'badge badge-accent' : 'badge'}>
                      {STAGE_LABELS[o.stage]}
                    </span>
                  </td>
                  <td className="num">{formatMNT(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="spread">
          <h2>Сарын нэхэмжлэх</h2>
          <span className="badge badge-warn">Жишээ</span>
        </div>
        <p className="muted small">
          {monthLabel} · {monthOrders.length} захиалга · сарын эцэст нэг нэхэмжлэх
        </p>
        <table>
          <tbody>
            <tr>
              <td>Дүн</td>
              <td className="num">{formatMNT(subtotal)}</td>
            </tr>
            <tr>
              <td>НӨАТ ({Math.round(VAT_RATE * 100)}%)</td>
              <td className="num">{formatMNT(vat)}</td>
            </tr>
            <tr className="total-row">
              <td>Төлөх</td>
              <td className="num">{formatMNT(subtotal + vat)}</td>
            </tr>
          </tbody>
        </table>
        <button className="btn btn-block" onClick={downloadInvoice}>
          ⬇ Нэхэмжлэх татах
        </button>
      </div>

      <div className="card">
        <h2>Нэр томьёоны жагсаалт</h2>
        <p className="muted small">
          Орчуулагч бүр танай компанийн нэр томьёог ижил орчуулна.
        </p>
        <ul className="list">
          {glossary.map((g) => (
            <li key={g.id} className="glossary-item">
              <div>
                <strong>{g.source}</strong> → {g.target}
                {g.note && <div className="muted small">{g.note}</div>}
              </div>
              <span className="badge badge-muted">{pairLabel(findPair(g.pair))}</span>
            </li>
          ))}
        </ul>
        <form className="glossary-form" onSubmit={addTerm} aria-label="Нэр томьёо нэмэх">
          <input
            type="text"
            placeholder="Эх үг"
            aria-label="Эх үг"
            value={draft.source}
            onChange={(e) => setDraft({ ...draft, source: e.target.value })}
          />
          <input
            type="text"
            placeholder="Орчуулга"
            aria-label="Орчуулга"
            value={draft.target}
            onChange={(e) => setDraft({ ...draft, target: e.target.value })}
          />
          <select
            aria-label="Хэлний хос"
            value={draft.pair}
            onChange={(e) => setDraft({ ...draft, pair: e.target.value })}
          >
            {LANG_PAIRS.map((p) => (
              <option key={pairKey(p)} value={pairKey(p)}>
                {pairLabel(p)}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="submit">
            Нэмэх
          </button>
        </form>
      </div>
    </div>
  )
}
