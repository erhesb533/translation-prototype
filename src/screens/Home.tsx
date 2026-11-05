import { LANG_PAIRS, pairLabel } from '../languages'
import { DEADLINES, TIERS, TIER_RATES, formatMNT } from '../pricing'
import { href } from '../router'

const VALUE_POINTS = [
  { icon: '⚡', title: 'Шуурхай үнэ', text: 'Файлаа оруулаад үнийн саналаа шууд хар.' },
  { icon: '🛡️', title: 'Баталгаат орчуулагч', text: 'Зөвхөн Монголын татварын резидент, шалгагдсан орчуулагч.' },
  { icon: '📍', title: 'Явцаа хянана', text: 'Захиалга хаана явааг алхам бүрээр харна.' },
  { icon: '🏢', title: 'Компанид', text: 'Сарын нэхэмжлэх, нэр томьёоны жагсаалт, олон захиалга.' },
]

export function Home() {
  return (
    <div>
      <section className="hero card">
        <span className="badge">Солонгос · Хятад ↔ Монгол</span>
        <h1>Баримт бичгээ онлайнаар орчуулуул</h1>
        <p className="muted">
          Визний бичиг, диплом, гэрээ — файлаа оруулаад үнийн саналаа шууд аваарай. Машин орчуулга +
          хүний засвараас эхлээд нотариатын баталгаатай орчуулга хүртэл.
        </p>
        <div className="row">
          <a className="btn btn-primary" href={href({ name: 'order' })}>
            Захиалга өгөх
          </a>
          <a className="btn" href={href({ name: 'business' })}>
            Компанид зориулсан
          </a>
        </div>
      </section>

      <section className="grid grid-2" aria-label="Давуу тал">
        {VALUE_POINTS.map((v) => (
          <div key={v.title} className="card value">
            <div className="value-icon" aria-hidden>
              {v.icon}
            </div>
            <div>
              <h3>{v.title}</h3>
              <p className="muted small">{v.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Үйлчилгээний түвшин</h2>
        <div className="grid grid-3">
          {TIERS.map((t) => (
            <div key={t.id} className="tier">
              <div className="tier-title">{t.label}</div>
              <div className="tier-price">
                {formatMNT(TIER_RATES[t.id])}
                <span className="muted small"> / үг</span>
              </div>
              <p className="muted small">{t.description}</p>
            </div>
          ))}
        </div>
        <p className="muted small">
          Хугацаа:{' '}
          {Object.values(DEADLINES)
            .map((d) => `${d.label} — ${d.days} хоног${d.multiplier > 1 ? ` (+${Math.round((d.multiplier - 1) * 100)}%)` : ''}`)
            .join(' · ')}
        </p>
      </section>

      <section className="card">
        <h2>Хэлний хос</h2>
        <div className="row">
          {LANG_PAIRS.map((p) => (
            <span key={`${p.from}-${p.to}`} className={p.primary ? 'badge' : 'badge badge-muted'}>
              {pairLabel(p)}
            </span>
          ))}
        </div>
      </section>

      <section className="card how">
        <h2>Хэрхэн ажилладаг вэ?</h2>
        <ol>
          <li>Файлаа оруулж, хэл ба түвшнээ сонго.</li>
          <li>Үнийн саналаа шууд харж, баталгаажуул.</li>
          <li>Орчуулагч ажиллаж, өөр хүн хянана.</li>
          <li>Бэлэн болмогц татаж ав.</li>
        </ol>
        <a className="btn btn-primary btn-block" href={href({ name: 'order' })}>
          Үнийн санал авах
        </a>
      </section>
    </div>
  )
}
