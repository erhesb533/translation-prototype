import { JOB_SEED, TRANSLATOR, EARNED_THIS_MONTH, COMPLETED_THIS_MONTH } from '../data/translator'
import type { Job } from '../data/translator'
import { findPair, pairLabel } from '../languages'
import { DEADLINES, TIERS, formatMNT, translatorPay } from '../pricing'
import { useOrders } from '../orders'
import { useStored } from '../storage'

type JobState = 'new' | 'accepted' | 'declined' | 'submitted'

function formatLeft(hours: number): string {
  const d = Math.floor(hours / 24)
  const h = hours % 24
  return d > 0 ? `${d} хоног ${h} цаг` : `${h} цаг`
}

export function TranslatorScreen() {
  const [orders, setOrders] = useOrders()
  const [states, setStates] = useStored<Record<string, JobState>>('tp.jobs', {})

  // Хэрэглэгчийн өөрөө өгсөн захиалгууд мөн ирсэн ажил болж харагдана — урсгалыг холбоно.
  const fromOrders: Job[] = orders
    .filter((o) => o.stage === 'received' || o.stage === 'translating')
    .map((o) => ({
      id: o.id,
      fileName: o.fileName,
      docType: o.docType,
      pair: o.pair,
      tier: o.tier,
      words: o.words,
      hoursLeft: DEADLINES[o.deadline].days * 24 - 2,
    }))
  const jobs = [...fromOrders, ...JOB_SEED]
  const stateOf = (j: Job): JobState => {
    const order = orders.find((o) => o.id === j.id)
    if (order) return order.stage === 'translating' ? 'accepted' : (states[j.id] ?? 'new')
    return states[j.id] ?? 'new'
  }

  const incoming = jobs.filter((j) => stateOf(j) === 'new')
  const active = jobs.filter((j) => stateOf(j) === 'accepted')
  const submitted = jobs.filter((j) => stateOf(j) === 'submitted')

  const pending = active.reduce((s, j) => s + translatorPay(j.words, j.tier), 0)
  const earned = EARNED_THIS_MONTH + submitted.reduce((s, j) => s + translatorPay(j.words, j.tier), 0)

  function setJob(j: Job, state: JobState) {
    setStates((s) => ({ ...s, [j.id]: state }))
    const order = orders.find((o) => o.id === j.id)
    if (order) {
      const stage = state === 'accepted' ? 'translating' : state === 'submitted' ? 'reviewing' : order.stage
      setOrders((prev) => prev.map((o) => (o.id === j.id ? { ...o, stage } : o)))
    }
  }

  const tierLabel = (id: string) => TIERS.find((t) => t.id === id)?.label

  const jobMeta = (j: Job) => (
    <div className="muted small">
      {pairLabel(findPair(j.pair))} · {tierLabel(j.tier)} · {j.words.toLocaleString('en-US')} үг
    </div>
  )

  return (
    <div>
      <h1>Орчуулагчийн самбар</h1>
      <p className="muted small">
        {TRANSLATOR.name} <span className="badge badge-muted">зохиомол</span> ·{' '}
        <span className="badge badge-accent">✓ Татварын резидент</span> · ★ {TRANSLATOR.rating}
      </p>

      <div className="grid grid-3 stats">
        <div className="card">
          <div className="stat-label">Энэ сарын орлого</div>
          <div className="stat" data-testid="earned">
            {formatMNT(earned)}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Хүлээгдэж буй</div>
          <div className="stat">{formatMNT(pending)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Дуусгасан ажил</div>
          <div className="stat">{COMPLETED_THIS_MONTH + submitted.length}</div>
        </div>
      </div>

      <div className="card">
        <h2>Ирсэн ажил ({incoming.length})</h2>
        {incoming.length === 0 && <p className="empty">Шинэ ажил алга.</p>}
        <ul className="list">
          {incoming.map((j) => (
            <li key={j.id}>
              <div className="spread">
                <strong>{j.docType}</strong>
                <span className="pay">{formatMNT(translatorPay(j.words, j.tier))}</span>
              </div>
              {jobMeta(j)}
              <div className="muted small">⏱ Хугацаа: {formatLeft(j.hoursLeft)}</div>
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setJob(j, 'accepted')}>
                  Хүлээн авах
                </button>
                <button className="btn btn-sm" onClick={() => setJob(j, 'declined')}>
                  Татгалзах
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Миний ажил ({active.length})</h2>
        {active.length === 0 && <p className="empty">Хүлээн авсан ажил алга.</p>}
        <ul className="list">
          {active.map((j) => (
            <li key={j.id}>
              <div className="spread">
                <strong>{j.fileName}</strong>
                <span className={j.hoursLeft < 36 ? 'badge badge-warn' : 'badge'}>
                  {formatLeft(j.hoursLeft)} үлдсэн
                </span>
              </div>
              {jobMeta(j)}
              <div className="progress" aria-hidden>
                <span style={{ width: '35%' }} />
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn btn-accent btn-sm" onClick={() => setJob(j, 'submitted')}>
                  Хянуулахаар илгээх
                </button>
                <span className="muted small">Орлого: {formatMNT(translatorPay(j.words, j.tier))}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {submitted.length > 0 && (
        <div className="card">
          <h2>Илгээсэн</h2>
          <ul className="list">
            {submitted.map((j) => (
              <li key={j.id} className="spread">
                <span>
                  {j.fileName}
                  {jobMeta(j)}
                </span>
                <span className="badge badge-accent">+{formatMNT(translatorPay(j.words, j.tier))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="muted small">Орлого = үгийн тоо × түвшний хөлс (pricing.ts). Жишээ тоо.</p>
    </div>
  )
}
