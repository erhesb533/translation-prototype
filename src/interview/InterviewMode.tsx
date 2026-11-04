import { useState } from 'react'
import type { Route, ScreenId } from '../router'
import { SCREEN_IDS, SCREEN_LABELS } from '../router'
import { downloadFile, useStored } from '../storage'
import {
  EMPTY_STORE,
  INTERVIEWS_KEY,
  LOI_LABELS,
  SEGMENTS,
  buildExport,
  createSession,
} from './interviews'
import type { InterviewSession, InterviewStore, LoiInterest, Segment } from './interviews'

const RATING_HINTS = ['', 'Хэрэггүй', 'Бага', 'Дунд', 'Хэрэгтэй', 'Маш хэрэгтэй']

export function InterviewMode({ route }: { route: Route }) {
  const [open, setOpen] = useState(false)
  const [store, setStore] = useStored<InterviewStore>(INTERVIEWS_KEY, EMPTY_STORE)
  const [code, setCode] = useState('')
  const [segment, setSegment] = useState<Segment>('B2C')
  // Сонгосон дэлгэц нь зөвхөн тухайн хуудсан дээр хүчинтэй; хуудас солигдоход одоогийн дэлгэц рүү буцна.
  const [picked, setPickedState] = useState<{ on: ScreenId; id: ScreenId } | null>(null)
  const setPicked = (id: ScreenId) => setPickedState({ on: route.name, id })

  const active = store.sessions.find((s) => s.id === store.activeId) ?? null
  const screen: ScreenId = picked && picked.on === route.name ? picked.id : route.name

  function update(patch: Partial<InterviewSession>) {
    if (!active) return
    setStore((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === active.id ? { ...x, ...patch } : x)),
    }))
  }

  function start() {
    setStore((s) => {
      const session = createSession(code, segment, s.sessions.length, new Date())
      return { activeId: session.id, sessions: [...s.sessions, session] }
    })
    setCode('')
  }

  function finish() {
    if (active) update({ endedAt: new Date().toISOString() })
    setStore((s) => ({ ...s, activeId: null }))
  }

  function exportJson() {
    const now = new Date()
    const stamp = now.toISOString().slice(0, 16).replace(/[:T]/g, '-')
    downloadFile(`yariltslaga_${stamp}.json`, JSON.stringify(buildExport(store, now), null, 2))
  }

  function clearAll() {
    if (window.confirm('Бүх ярилцлагын тэмдэглэлийг устгах уу? Эхлээд JSON татсан эсэхээ шалгаарай.')) {
      setStore(EMPTY_STORE)
    }
  }

  return (
    <>
      <button
        className={active ? 'interview-fab active' : 'interview-fab'}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="interview-panel"
      >
        🎤 {active ? active.code : 'Ярилцлага'}
      </button>

      {open && (
        <section id="interview-panel" className="interview-panel" aria-label="Ярилцлагын горим">
          <div className="spread">
            <h2>Ярилцлагын горим</h2>
            <button className="btn btn-sm" onClick={() => setOpen(false)} aria-label="Хаах">
              ✕
            </button>
          </div>

          {!active ? (
            <div>
              <p className="muted small">
                Ярилцагчийн кодыг бич (бодит нэр бүү бич). Тэмдэглэл зөвхөн энэ төхөөрөмжийн
                localStorage-д хадгалагдана.
              </p>
              <label className="field">
                <span className="field-label">Ярилцагчийн код</span>
                <input
                  type="text"
                  value={code}
                  placeholder={`Х-${String(store.sessions.length + 1).padStart(2, '0')}`}
                  onChange={(e) => setCode(e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Сегмент</span>
                <select value={segment} onChange={(e) => setSegment(e.target.value as Segment)}>
                  {SEGMENTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <button className="btn btn-primary btn-block" onClick={start}>
                Ярилцлага эхлэх
              </button>
            </div>
          ) : (
            <div>
              <p className="muted small">
                {active.code} · {active.segment}
              </p>

              <div className="screen-pills" role="tablist" aria-label="Дэлгэц">
                {SCREEN_IDS.map((id) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={id === screen}
                    className={id === screen ? 'pill selected' : 'pill'}
                    onClick={() => setPicked(id)}
                  >
                    {SCREEN_LABELS[id]}
                    {active.ratings[id] ? <b> {active.ratings[id]}</b> : null}
                  </button>
                ))}
              </div>

              <div className="field-label">"{SCREEN_LABELS[screen]}" хэр хэрэгтэй вэ?</div>
              <div className="rating" role="radiogroup" aria-label="Үнэлгээ 1–5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    role="radio"
                    aria-checked={active.ratings[screen] === n}
                    title={RATING_HINTS[n]}
                    className={active.ratings[screen] === n ? 'rate selected' : 'rate'}
                    onClick={() => update({ ratings: { ...active.ratings, [screen]: n } })}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="muted small rating-hint">
                <span>1 — Хэрэггүй</span>
                <span>5 — Маш хэрэгтэй</span>
              </div>
              <label className="field">
                <span className="field-label">Тэмдэглэл</span>
                <textarea
                  value={active.notes[screen] ?? ''}
                  placeholder="Юу гэж хэлсэн, юуг ойлгоогүй, юу дутуу байна…"
                  onChange={(e) => update({ notes: { ...active.notes, [screen]: e.target.value } })}
                />
              </label>

              <div className="field-label">LOI-д гарын үсэг зурах сонирхолтой юу?</div>
              <div className="rating" role="radiogroup" aria-label="LOI сонирхол">
                {(Object.keys(LOI_LABELS) as LoiInterest[]).map((k) => (
                  <button
                    key={k}
                    role="radio"
                    aria-checked={active.loi === k}
                    className={active.loi === k ? `rate wide selected loi-${k}` : 'rate wide'}
                    onClick={() => update({ loi: k })}
                  >
                    {LOI_LABELS[k]}
                  </button>
                ))}
              </div>
              <label className="field" style={{ marginTop: 10 }}>
                <span className="field-label">LOI / ерөнхий тэмдэглэл</span>
                <textarea
                  value={active.generalNote}
                  placeholder="Хэдэн төгрөг төлөхөд бэлэн, хэзээ хэрэгтэй, дараагийн алхам…"
                  onChange={(e) => update({ generalNote: e.target.value })}
                />
              </label>

              <button className="btn btn-primary btn-block" onClick={finish}>
                Ярилцлага дуусгах
              </button>
            </div>
          )}

          <hr />
          <div className="spread">
            <span className="muted small">
              Нийт {store.sessions.length} ярилцлага · LOI "Тийм":{' '}
              {store.sessions.filter((s) => s.loi === 'yes').length}
            </span>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn btn-sm" onClick={exportJson} disabled={store.sessions.length === 0}>
              ⬇ JSON татах
            </button>
            <button className="btn btn-sm" onClick={clearAll} disabled={store.sessions.length === 0}>
              Устгах
            </button>
          </div>
        </section>
      )}
    </>
  )
}
