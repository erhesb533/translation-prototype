import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { DOC_TYPES, SAMPLE_FILES, estimateWords } from '../data/samples'
import { LANG_PAIRS, pairKey, pairLabel } from '../languages'
import { newOrderId, nowISO, useOrders } from '../orders'
import type { Order } from '../orders'
import { navigate } from '../router'
import {
  DEADLINES,
  NOTARY_FEE_PER_DOCUMENT,
  TIERS,
  TIER_RATES,
  B2B_DISCOUNT,
  calculateQuote,
  formatMNT,
} from '../pricing'
import type { Deadline, Tier } from '../pricing'

export function OrderScreen() {
  const [orders, setOrders] = useOrders()
  const [customer, setCustomer] = useState<'person' | 'business'>('person')
  const [fileName, setFileName] = useState('')
  const [docType, setDocType] = useState<string>(DOC_TYPES[0])
  const [words, setWords] = useState(0)
  const [pair, setPair] = useState(pairKey(LANG_PAIRS[0]))
  const [tier, setTier] = useState<Tier>('mtpe')
  const [deadline, setDeadline] = useState<Deadline>('standard')

  const quote = calculateQuote({ words, tier, deadline, business: customer === 'business' })
  const canSubmit = fileName !== '' && words > 0

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    // Прототип: файлын агуулгыг уншихгүй, зөвхөн нэр ба хэмжээг ашиглана.
    setFileName(f.name)
    setWords(estimateWords(f.size))
  }

  function pickSample(i: number) {
    const s = SAMPLE_FILES[i]
    setFileName(s.name)
    setDocType(s.docType)
    setWords(s.words)
    setPair(s.pair)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const order: Order = {
      id: newOrderId(orders),
      createdAt: nowISO(),
      customer,
      fileName,
      docType,
      words,
      pair,
      tier,
      deadline,
      total: quote.total,
      stage: 'received',
    }
    setOrders((prev) => [order, ...prev])
    navigate({ name: 'status', id: order.id })
  }

  return (
    <form onSubmit={submit} aria-label="Захиалгын маягт">
      <h1>Захиалга өгөх</h1>

      <div className="card">
        <div className="segmented" role="radiogroup" aria-label="Захиалагч">
          <label>
            <input
              type="radio"
              name="customer"
              checked={customer === 'person'}
              onChange={() => setCustomer('person')}
            />
            <span>Хувь хүн</span>
          </label>
          <label>
            <input
              type="radio"
              name="customer"
              checked={customer === 'business'}
              onChange={() => setCustomer('business')}
            />
            <span>Компани</span>
          </label>
        </div>
        {customer === 'business' && (
          <p className="muted small" style={{ marginTop: 8 }}>
            Компанийн данс: сарын эцэст нэг нэхэмжлэх, {Math.round(B2B_DISCOUNT * 100)}% хөнгөлөлт.
          </p>
        )}
      </div>

      <div className="card">
        <h2>1. Файл</h2>
        <label className="dropzone">
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={onFile} aria-label="Файл сонгох" />
          <span className="dropzone-icon" aria-hidden>
            📄
          </span>
          {fileName ? (
            <span>
              <strong>{fileName}</strong>
              <br />
              <span className="muted small">Файл "оруулсан" (прототип — файл илгээгдэхгүй)</span>
            </span>
          ) : (
            <span>
              <strong>Файл сонгох</strong>
              <br />
              <span className="muted small">PDF, Word, зураг</span>
            </span>
          )}
        </label>
        <p className="muted small">Эсвэл жишээ файл:</p>
        <div className="row">
          {SAMPLE_FILES.map((s, i) => (
            <button key={s.name} type="button" className="btn btn-sm" onClick={() => pickSample(i)}>
              {s.docType}
            </button>
          ))}
        </div>

        <div className="grid grid-2" style={{ marginTop: 14 }}>
          <label className="field">
            <span className="field-label">Баримтын төрөл</span>
            <select value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Үгийн тоо</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={words || ''}
              placeholder="Автоматаар тоологдоно"
              onChange={(e) => setWords(Math.max(0, Number(e.target.value)))}
            />
          </label>
        </div>
      </div>

      <div className="card">
        <h2>2. Хэлний хос</h2>
        <label className="field">
          <span className="field-label">Эх хэл → Орчуулах хэл</span>
          <select value={pair} onChange={(e) => setPair(e.target.value)} aria-label="Хэлний хос">
            {LANG_PAIRS.map((p) => (
              <option key={pairKey(p)} value={pairKey(p)}>
                {pairLabel(p)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="card">
        <h2>3. Үйлчилгээний түвшин</h2>
        <div className="choices">
          {TIERS.map((t) => (
            <label key={t.id} className="choice">
              <input type="radio" name="tier" checked={tier === t.id} onChange={() => setTier(t.id)} />
              <span>
                <span className="choice-title">{t.label}</span>{' '}
                <span className="muted small">{formatMNT(TIER_RATES[t.id])}/үг</span>
                <br />
                <span className="muted small">{t.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>4. Хугацаа</h2>
        <div className="choices">
          {(Object.keys(DEADLINES) as Deadline[]).map((k) => {
            const d = DEADLINES[k]
            return (
              <label key={k} className="choice">
                <input type="radio" name="deadline" checked={deadline === k} onChange={() => setDeadline(k)} />
                <span>
                  <span className="choice-title">{d.label}</span>{' '}
                  <span className="muted small">
                    {d.days} хоног{d.multiplier > 1 ? ` · +${Math.round((d.multiplier - 1) * 100)}%` : ''}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </div>

      <div className="card quote" aria-live="polite" aria-label="Үнийн санал">
        <div className="spread">
          <h2>Үнийн санал</h2>
          <span className="badge badge-warn">Жишээ үнэ</span>
        </div>
        {words > 0 ? (
          <table>
            <tbody>
              <tr>
                <td>
                  {words.toLocaleString('en-US')} үг × {formatMNT(quote.ratePerWord)}
                </td>
                <td className="num">{formatMNT(quote.base)}</td>
              </tr>
              {quote.rushFee > 0 && (
                <tr>
                  <td>Яаралтай нэмэгдэл</td>
                  <td className="num">+{formatMNT(quote.rushFee)}</td>
                </tr>
              )}
              {quote.notaryFee > 0 && (
                <tr>
                  <td>Нотариат ({formatMNT(NOTARY_FEE_PER_DOCUMENT)}/баримт)</td>
                  <td className="num">+{formatMNT(quote.notaryFee)}</td>
                </tr>
              )}
              {quote.discount > 0 && (
                <tr>
                  <td>Компанийн хөнгөлөлт</td>
                  <td className="num">−{formatMNT(quote.discount)}</td>
                </tr>
              )}
              {quote.minimumApplied && (
                <tr>
                  <td colSpan={2} className="muted small">
                    Хамгийн бага захиалгын дүн хэрэглэгдсэн.
                  </td>
                </tr>
              )}
              <tr className="total-row">
                <td>Нийт</td>
                <td className="num" data-testid="quote-total">
                  {formatMNT(quote.total)}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="muted">Файл оруулбал үнэ шууд гарна.</p>
        )}
        <p className="muted small">Хугацаа: {DEADLINES[deadline].days} хоногт бэлэн.</p>
        <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit}>
          Захиалга баталгаажуулах
        </button>
        <p className="muted small" style={{ marginTop: 8, marginBottom: 0 }}>
          Прототип: бодит төлбөр авахгүй.
        </p>
      </div>
    </form>
  )
}
