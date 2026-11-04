import { findPair, pairLabel } from '../languages'
import {
  ORDER_STAGES,
  STAGE_LABELS,
  dueDate,
  formatDate,
  nextStage,
  useOrders,
} from '../orders'
import type { Order } from '../orders'
import { DEADLINES, TIERS, formatMNT } from '../pricing'
import { href } from '../router'
import { downloadFile } from '../storage'

const STAGE_HINTS: Record<Order['stage'], string> = {
  received: 'Захиалгыг хүлээн авч, орчуулагч хуваарилж байна.',
  translating: 'Орчуулагч ажиллаж байна.',
  reviewing: 'Хоёр дахь хүн чанарыг хянаж байна.',
  ready: 'Орчуулга бэлэн боллоо. Татаж авна уу.',
}

function downloadMock(order: Order) {
  const text = [
    'ПРОТОТИП — жишээ файл. Бодит орчуулга биш.',
    '',
    `Захиалга: ${order.id}`,
    `Эх файл: ${order.fileName}`,
    `Хэлний хос: ${pairLabel(findPair(order.pair))}`,
    `Түвшин: ${TIERS.find((t) => t.id === order.tier)?.label}`,
  ].join('\n')
  downloadFile(`${order.id}_orchuulga.txt`, text, 'text/plain;charset=utf-8')
}

export function StatusScreen({ id }: { id?: string }) {
  const [orders, setOrders] = useOrders()
  const order = id ? orders.find((o) => o.id === id) : orders[0]

  if (!order) {
    return (
      <div>
        <h1>Захиалгын төлөв</h1>
        <div className="card empty">
          <p>{id ? `${id} дугаартай захиалга олдсонгүй.` : 'Одоогоор захиалга алга.'}</p>
          <a className="btn btn-primary" href={href({ name: 'order' })}>
            Захиалга өгөх
          </a>
        </div>
      </div>
    )
  }

  const current = ORDER_STAGES.indexOf(order.stage)
  const advance = () =>
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, stage: nextStage(o.stage) } : o)))

  return (
    <div>
      <h1>Захиалгын төлөв</h1>

      <div className="card">
        <div className="spread">
          <div>
            <div className="muted small">Захиалгын дугаар</div>
            <div className="stat">{order.id}</div>
          </div>
          <span className={order.stage === 'ready' ? 'badge badge-accent' : 'badge'} data-testid="stage">
            {STAGE_LABELS[order.stage]}
          </span>
        </div>

        <ol className="stepper" aria-label="Явц">
          {ORDER_STAGES.map((s, i) => (
            <li key={s} className={i < current ? 'done' : i === current ? 'current' : ''}>
              <span className="dot" aria-hidden>
                {i < current ? '✓' : i + 1}
              </span>
              <span>
                <strong>{STAGE_LABELS[s]}</strong>
                {i === current && <span className="muted small block">{STAGE_HINTS[s]}</span>}
              </span>
            </li>
          ))}
        </ol>

        {order.stage === 'ready' ? (
          <button className="btn btn-accent btn-block" onClick={() => downloadMock(order)}>
            ⬇ Орчуулгыг татах
          </button>
        ) : (
          <button className="btn btn-block demo-btn" onClick={advance}>
            Дараагийн шат руу (демо)
          </button>
        )}
      </div>

      <div className="card">
        <h2>Дэлгэрэнгүй</h2>
        <table>
          <tbody>
            <tr>
              <th>Файл</th>
              <td>{order.fileName}</td>
            </tr>
            <tr>
              <th>Төрөл</th>
              <td>{order.docType}</td>
            </tr>
            <tr>
              <th>Хэлний хос</th>
              <td>{pairLabel(findPair(order.pair))}</td>
            </tr>
            <tr>
              <th>Түвшин</th>
              <td>{TIERS.find((t) => t.id === order.tier)?.label}</td>
            </tr>
            <tr>
              <th>Үгийн тоо</th>
              <td>{order.words.toLocaleString('en-US')}</td>
            </tr>
            <tr>
              <th>Хугацаа</th>
              <td>
                {DEADLINES[order.deadline].label} · {formatDate(dueDate(order))}-нд
              </td>
            </tr>
            <tr>
              <th>Дүн</th>
              <td>
                <strong>{formatMNT(order.total)}</strong> <span className="muted small">(жишээ)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {orders.length > 1 && (
        <div className="card">
          <h2>Миний захиалгууд</h2>
          <ul className="list">
            {orders.map((o) => (
              <li key={o.id} className="spread">
                <a href={href({ name: 'status', id: o.id })}>
                  {o.id} · {o.fileName}
                </a>
                <span className="badge">{STAGE_LABELS[o.stage]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
